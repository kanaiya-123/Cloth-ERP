// CLOTHERP - Product Exchange Management Service
import { exchangeStore, EXCHANGE_STORAGE_KEYS } from './exchangeStore.js';
import { salesService } from './salesService.js';
import { inventoryService } from './inventoryService.js';
import { stockMovementService } from './stockMovementService.js';

class ExchangeService {
    /**
     * Get Filtered & Paginated Product Exchanges
     */
    async getExchanges({
        page = 1,
        pageSize = 10,
        search = '',
        status = '',
        sortBy = 'newest'
    } = {}) {
        await this._delay(150);
        let items = exchangeStore.get(EXCHANGE_STORAGE_KEYS.EXCHANGES);

        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter(e => 
                (e.exchangeNumber && e.exchangeNumber.toLowerCase().includes(q)) ||
                (e.saleNumber && e.saleNumber.toLowerCase().includes(q)) ||
                (e.customerName && e.customerName.toLowerCase().includes(q)) ||
                (e.returnedItem && e.returnedItem.sku && e.returnedItem.sku.toLowerCase().includes(q)) ||
                (e.replacementItem && e.replacementItem.sku && e.replacementItem.sku.toLowerCase().includes(q))
            );
        }

        if (status) items = items.filter(e => e.status === status);

        if (sortBy === 'newest') {
            items.sort((a, b) => new Date(b.exchangeDate || 0) - new Date(a.exchangeDate || 0));
        } else if (sortBy === 'oldest') {
            items.sort((a, b) => new Date(a.exchangeDate || 0) - new Date(b.exchangeDate || 0));
        } else if (sortBy === 'highest_amount') {
            items.sort((a, b) => (b.replacementValue || 0) - (a.replacementValue || 0));
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        const all = exchangeStore.get(EXCHANGE_STORAGE_KEYS.EXCHANGES);
        const pendingApproval = all.filter(e => e.status === 'Requested' || e.status === 'Draft').length;
        const completed = all.filter(e => e.status === 'Completed').length;

        return {
            items: paginated,
            pagination: { page, pageSize, totalItems, totalPages },
            summary: {
                totalExchanges: all.length,
                pendingApproval,
                completed
            }
        };
    }

    /**
     * Get Single Exchange by ID
     */
    async getExchangeById(id) {
        await this._delay(100);
        const items = exchangeStore.get(EXCHANGE_STORAGE_KEYS.EXCHANGES);
        return items.find(e => e.id === id || e.exchangeNumber === id) || null;
    }

    /**
     * Create Product Exchange Request
     */
    async createExchange(data, user = 'Sales Staff') {
        await this._delay(200);
        const exchanges = exchangeStore.get(EXCHANGE_STORAGE_KEYS.EXCHANGES);

        const sale = await salesService.getSaleById(data.saleId);
        if (!sale) return { success: false, message: 'Original sale order not found.' };

        // Validate Replacement Stock Availability
        const invSummary = await inventoryService.getInventoryOverview({ search: data.replacementItem.sku });
        const targetInv = (invSummary.items || []).find(i => i.productVariantId === data.replacementItem.productVariantId);
        const availableStock = targetInv ? (targetInv.currentStock || 0) : 0;

        const reqReplacementQty = parseInt(data.replacementItem.quantity) || 1;
        if (availableStock < reqReplacementQty) {
            return {
                success: false,
                message: `Insufficient stock: Only ${availableStock} units available for replacement item (${data.replacementItem.variantName}).`
            };
        }

        // Calculate Price Difference
        const returnVal = parseFloat(data.returnValue) || 0;
        const replacementVal = parseFloat(data.replacementValue) || 0;
        const diff = replacementVal - returnVal;

        const newId = `exc_${Date.now()}`;
        const newNumber = `EXC-${String(exchanges.length + 1).padStart(6, '0')}`;

        let adjType = 'Even Exchange';
        if (diff > 0) adjType = 'Customer Paid';
        else if (diff < 0) adjType = 'Customer Refund';

        const newExchange = {
            id: newId,
            exchangeNumber: newNumber,
            saleId: sale.id,
            saleNumber: sale.saleNumber,
            invoiceNumber: sale.invoiceNumber || '',
            customerId: sale.customerId,
            customerName: sale.customerName,
            customerMobile: sale.customerMobile,
            customerGstin: sale.customerGstin || '',
            exchangeDate: data.exchangeDate || new Date().toISOString().split('T')[0],
            status: data.completeNow ? 'Completed' : 'Requested',
            inventoryProcessed: false,
            reason: data.reason || 'Wrong Size / Fit',
            notes: data.notes || '',

            returnedItem: data.returnedItem,
            replacementItem: data.replacementItem,

            returnValue: returnVal,
            replacementValue: replacementVal,
            priceDifference: Math.abs(diff),
            priceDifferenceRaw: diff,
            paymentAdjustmentType: adjType,
            paymentMethod: data.paymentMethod || 'UPI',
            paymentReference: data.paymentReference || '',
            paymentStatus: data.completeNow ? 'Settled' : 'Pending',

            trackingTimeline: [
                {
                    date: data.exchangeDate || new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    user: user,
                    status: 'Requested',
                    title: 'Exchange Order Initiated',
                    notes: `Exchange requested: ${data.returnedItem.variantName} -> ${data.replacementItem.variantName}.`
                }
            ],

            activity: [
                {
                    time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    user: user,
                    action: `Created Exchange ${newNumber} for ${sale.saleNumber}`
                }
            ]
        };

        if (data.completeNow) {
            // Process Dual Inventory Movements immediately
            await this._processExchangeInventory(newExchange, user);
        }

        exchanges.unshift(newExchange);
        exchangeStore.set(EXCHANGE_STORAGE_KEYS.EXCHANGES, exchanges);

        return { success: true, exchange: newExchange };
    }

    /**
     * Complete Exchange and Execute Dual Inventory Movements
     */
    async completeExchange(id, user = 'Manager') {
        await this._delay(200);
        const exchanges = exchangeStore.get(EXCHANGE_STORAGE_KEYS.EXCHANGES);
        const target = exchanges.find(e => e.id === id);

        if (!target) return { success: false, message: 'Exchange record not found.' };
        if (target.inventoryProcessed) return { success: false, message: 'Exchange inventory has already been processed.' };

        const invResult = await this._processExchangeInventory(target, user);
        if (!invResult.success) return invResult;

        target.status = 'Completed';
        target.paymentStatus = 'Settled';

        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Completed',
            title: 'Exchange Completed & Stock Adjusted',
            notes: 'Restored returned unit (IN) and dispatched replacement unit (OUT).'
        });

        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Completed Exchange ${target.exchangeNumber}`
        });

        exchangeStore.set(EXCHANGE_STORAGE_KEYS.EXCHANGES, exchanges);
        return { success: true, exchange: target };
    }

    async _processExchangeInventory(exchange, user) {
        if (exchange.inventoryProcessed) return { success: true };

        // 1. Validate Replacement Stock
        const invSummary = await inventoryService.getInventoryOverview({ search: exchange.replacementItem.sku });
        const targetInv = (invSummary.items || []).find(i => i.productVariantId === exchange.replacementItem.productVariantId);
        const stock = targetInv ? (targetInv.currentStock || 0) : 0;

        if (stock < exchange.replacementItem.quantity) {
            return {
                success: false,
                message: `Cannot complete exchange: Only ${stock} units available for replacement item ${exchange.replacementItem.productName}.`
            };
        }

        // 2. Movement IN for Returned Item (if Resalable)
        if (exchange.returnedItem.condition === 'Resalable') {
            await stockMovementService.recordStockIn({
                productVariantId: exchange.returnedItem.productVariantId,
                quantity: exchange.returnedItem.quantity,
                referenceId: exchange.exchangeNumber,
                reason: `Exchange Return (${exchange.exchangeNumber})`,
                notes: `Restored returned item from ${exchange.customerName}`,
                user: user
            });
        }

        // 3. Movement OUT for Replacement Item
        await stockMovementService.recordStockOut({
            productVariantId: exchange.replacementItem.productVariantId,
            quantity: exchange.replacementItem.quantity,
            referenceId: exchange.exchangeNumber,
            reason: `Exchange Replacement Dispatched (${exchange.exchangeNumber})`,
            notes: `Dispatched replacement item for ${exchange.customerName}`,
            user: user
        });

        exchange.inventoryProcessed = true;
        return { success: true };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const exchangeService = new ExchangeService();
