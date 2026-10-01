// CLOTHERP - Purchase Returns to Supplier & Debit Notes Management Service
import { purchaseReturnStore, PURCHASE_RETURN_STORAGE_KEYS } from './purchaseReturnStore.js';
import { purchaseService } from './purchaseService.js';
import { inventoryService } from './inventoryService.js';
import { stockMovementService } from './stockMovementService.js';

class PurchaseReturnService {
    /**
     * Get Filtered, Searched & Paginated Purchase Returns
     */
    async getPurchaseReturns({
        page = 1,
        pageSize = 10,
        search = '',
        status = '',
        sortBy = 'newest'
    } = {}) {
        await this._delay(150);
        let items = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS);

        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter(r => 
                (r.purchaseReturnNumber && r.purchaseReturnNumber.toLowerCase().includes(q)) ||
                (r.purchaseNumber && r.purchaseNumber.toLowerCase().includes(q)) ||
                (r.supplierName && r.supplierName.toLowerCase().includes(q)) ||
                (r.shipment && r.shipment.lrNumber && r.shipment.lrNumber.toLowerCase().includes(q)) ||
                (r.items && r.items.some(i => i.sku && i.sku.toLowerCase().includes(q)))
            );
        }

        if (status) items = items.filter(r => r.status === status);

        if (sortBy === 'newest') {
            items.sort((a, b) => new Date(b.returnDate || 0) - new Date(a.returnDate || 0));
        } else if (sortBy === 'oldest') {
            items.sort((a, b) => new Date(a.returnDate || 0) - new Date(b.returnDate || 0));
        } else if (sortBy === 'highest_amount') {
            items.sort((a, b) => (b.grandTotal || 0) - (a.grandTotal || 0));
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        const all = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS);
        const pendingApproval = all.filter(r => r.status === 'Requested' || r.status === 'Draft').length;
        const readyToDispatch = all.filter(r => r.status === 'Approved' || r.status === 'Ready to Dispatch').length;
        const completed = all.filter(r => r.status === 'Completed').length;

        return {
            items: paginated,
            pagination: { page, pageSize, totalItems, totalPages },
            summary: {
                totalReturns: all.length,
                pendingApproval,
                readyToDispatch,
                completed
            }
        };
    }

    /**
     * Get Single Purchase Return by ID
     */
    async getPurchaseReturnById(id) {
        await this._delay(100);
        const items = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS);
        return items.find(r => r.id === id || r.purchaseReturnNumber === id) || null;
    }

    /**
     * Get Returnable Items for a PO
     */
    async getPurchaseReturnableItems(purchaseId) {
        const po = await purchaseService.getPurchaseById(purchaseId);
        if (!po) return [];

        const allReturns = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS).filter(
            r => (r.purchaseId === purchaseId || r.purchaseNumber === po.purchaseNumber) && r.status !== 'Cancelled'
        );

        return (po.items || []).map(pItem => {
            let alreadyReturned = 0;
            allReturns.forEach(ret => {
                (ret.items || []).forEach(rItem => {
                    if (rItem.productVariantId === pItem.productVariantId || rItem.purchaseItemId === pItem.id) {
                        alreadyReturned += (rItem.returnQuantity || 0);
                    }
                });
            });

            const returnableQuantity = Math.max(0, (pItem.receivedQuantity || pItem.quantity) - alreadyReturned);

            return {
                ...pItem,
                purchasedQuantity: pItem.quantity,
                receivedQuantity: pItem.receivedQuantity || pItem.quantity,
                alreadyReturned,
                returnableQuantity
            };
        });
    }

    /**
     * Create Purchase Return Request
     */
    async createPurchaseReturn(data, user = 'Purchase Staff') {
        await this._delay(200);
        const returns = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS);

        const po = await purchaseService.getPurchaseById(data.purchaseId);
        if (!po) return { success: false, message: 'Original Purchase Order not found.' };

        if (!data.items || data.items.length === 0) {
            return { success: false, message: 'Please select at least one item to return to supplier.' };
        }

        const returnableItems = await this.getPurchaseReturnableItems(po.id);
        const processedItems = [];
        let subtotalTaxable = 0;
        let cgstTotal = 0;
        let sgstTotal = 0;
        let igstTotal = 0;
        let totalUnits = 0;

        for (const reqItem of data.items) {
            const origItem = returnableItems.find(i => i.productVariantId === reqItem.productVariantId || i.id === reqItem.purchaseItemId);
            if (!origItem) continue;

            const qty = parseInt(reqItem.returnQuantity) || 0;
            if (qty <= 0) continue;

            if (qty > origItem.returnableQuantity) {
                return {
                    success: false,
                    message: `Return quantity (${qty}) exceeds maximum returnable quantity (${origItem.returnableQuantity}) for ${origItem.productName}.`
                };
            }

            const lineGross = origItem.rate * qty;
            const lineTaxable = lineGross;
            const gstRate = origItem.gstRate || 5;

            let lineCGST = 0;
            let lineSGST = 0;
            let lineIGST = 0;

            if (po.isSameState) {
                lineCGST = (lineTaxable * (gstRate / 2)) / 100;
                lineSGST = (lineTaxable * (gstRate / 2)) / 100;
            } else {
                lineIGST = (lineTaxable * gstRate) / 100;
            }

            const lineTotal = lineTaxable + lineCGST + lineSGST + lineIGST;

            subtotalTaxable += lineTaxable;
            cgstTotal += lineCGST;
            sgstTotal += lineSGST;
            igstTotal += lineIGST;
            totalUnits += qty;

            processedItems.push({
                id: `pritem_${Date.now()}_${processedItems.length + 1}`,
                purchaseItemId: origItem.id,
                productId: origItem.productId,
                productName: origItem.productName,
                productVariantId: origItem.productVariantId,
                variantName: origItem.variantName,
                color: origItem.color,
                size: origItem.size,
                sku: origItem.sku,
                receivedQuantity: origItem.receivedQuantity,
                returnQuantity: qty,
                purchaseRate: origItem.rate,
                taxableAmount: lineTaxable,
                gstRate: gstRate,
                cgstAmount: lineCGST,
                sgstAmount: lineSGST,
                igstAmount: lineIGST,
                totalAmount: lineTotal
            });
        }

        if (processedItems.length === 0) {
            return { success: false, message: 'Please specify a return quantity greater than zero.' };
        }

        const totalTax = cgstTotal + sgstTotal + igstTotal;
        const grandTotal = subtotalTaxable + totalTax;

        const newId = `pret_${Date.now()}`;
        const newNumber = `PRET-${String(returns.length + 1).padStart(6, '0')}`;

        const newReturn = {
            id: newId,
            purchaseReturnNumber: newNumber,
            purchaseId: po.id,
            purchaseNumber: po.purchaseNumber,
            supplierId: po.supplierId,
            supplierName: po.supplierName,
            supplierContact: po.supplierContactPerson ? `${po.supplierContactPerson} (${po.supplierMobile || ''})` : po.supplierName,
            supplierGstin: po.supplierGstin || '',
            supplierState: po.supplierState || 'Maharashtra',
            returnDate: data.returnDate || new Date().toISOString().split('T')[0],
            status: 'Requested',
            inventoryDeducted: false,
            reason: data.reason || 'Defective Fabric / Weave Flaw',
            notes: data.notes || '',

            items: processedItems,
            subtotalTaxable,
            cgstTotal,
            sgstTotal,
            igstTotal,
            totalTax,
            grandTotal,
            totalQuantity: totalUnits,

            financialAdjustment: {
                method: data.financialMethod || 'Debit Note',
                debitNoteNumber: '',
                amount: grandTotal,
                status: 'Pending'
            },

            shipment: {
                transportName: data.transportName || '',
                lrNumber: data.lrNumber || '',
                vehicleNumber: data.vehicleNumber || '',
                driverName: data.driverName || '',
                dispatchDate: data.dispatchDate || '',
                expectedReceiptDate: data.expectedReceiptDate || '',
                notes: data.shipmentNotes || ''
            },

            trackingTimeline: [
                {
                    date: data.returnDate || new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    user: user,
                    status: 'Requested',
                    title: 'Purchase Return Request Created',
                    notes: `Initiated return for ${totalUnits} units back to ${po.supplierName}.`
                }
            ],

            activity: [
                {
                    time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    user: user,
                    action: `Created Purchase Return ${newNumber} for ${po.purchaseNumber}`
                }
            ]
        };

        returns.unshift(newReturn);
        purchaseReturnStore.set(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS, returns);

        return { success: true, purchaseReturn: newReturn };
    }

    /**
     * Dispatch Purchase Return to Supplier (Deducts Stock at Dispatch)
     * Strictly verifies live available stock before deduction to prevent negative inventory.
     */
    async dispatchPurchaseReturn(id, shipmentData, user = 'Logistics Desk') {
        await this._delay(200);
        const returns = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS);
        const target = returns.find(r => r.id === id);

        if (!target) return { success: false, message: 'Purchase return not found.' };
        if (target.inventoryDeducted) {
            return { success: false, message: 'Inventory has already been deducted for this purchase return.' };
        }

        // 1. Live Stock Validation Before Dispatch
        for (const item of target.items) {
            const invSummary = await inventoryService.getInventoryOverview({ search: item.sku });
            const targetInv = (invSummary.items || []).find(i => i.productVariantId === item.productVariantId);
            const stock = targetInv ? (targetInv.currentStock || 0) : 0;

            if (stock < item.returnQuantity) {
                return {
                    success: false,
                    message: `Cannot dispatch: Available warehouse stock (${stock}) is less than return quantity (${item.returnQuantity}) for ${item.productName} (${item.variantName}).`
                };
            }
        }

        // 2. Deduct Inventory
        for (const item of target.items) {
            await stockMovementService.recordStockOut({
                productVariantId: item.productVariantId,
                quantity: item.returnQuantity,
                referenceId: target.purchaseReturnNumber,
                reason: `Purchase Return to Supplier (${target.purchaseReturnNumber})`,
                notes: `Consigned back to ${target.supplierName}`,
                user: user
            });
        }

        target.inventoryDeducted = true;
        target.status = 'Dispatched';

        if (shipmentData) {
            target.shipment = {
                ...target.shipment,
                ...shipmentData,
                dispatchDate: shipmentData.dispatchDate || new Date().toISOString().split('T')[0]
            };
        }

        // 3. Issue Supplier Debit Note if configured
        if (target.financialAdjustment.method === 'Debit Note' && !target.financialAdjustment.debitNoteNumber) {
            const debitNotes = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.DEBIT_NOTES);
            const dnNumber = `DN-${String(debitNotes.length + 1).padStart(6, '0')}`;

            debitNotes.unshift({
                id: `dn_${Date.now()}`,
                debitNoteNumber: dnNumber,
                purchaseReturnId: target.id,
                purchaseReturnNumber: target.purchaseReturnNumber,
                purchaseNumber: target.purchaseNumber,
                supplierId: target.supplierId,
                supplierName: target.supplierName,
                supplierGstin: target.supplierGstin,
                amount: target.grandTotal,
                taxAdjustment: target.totalTax,
                reason: `Purchase Return ${target.purchaseReturnNumber} (${target.reason})`,
                status: 'Issued',
                issueDate: new Date().toISOString().split('T')[0],
                createdBy: user
            });

            purchaseReturnStore.set(PURCHASE_RETURN_STORAGE_KEYS.DEBIT_NOTES, debitNotes);
            target.financialAdjustment.debitNoteNumber = dnNumber;
            target.financialAdjustment.status = 'Issued';
        }

        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Dispatched',
            title: `Consignment Dispatched (Stock Deducted)`,
            notes: target.shipment.lrNumber ? `LR Number: ${target.shipment.lrNumber} via ${target.shipment.transportName || 'Logistics'}.` : 'Dispatched back to supplier.'
        });

        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Dispatched ${target.totalQuantity} units & generated Debit Note ${target.financialAdjustment.debitNoteNumber || ''}`
        });

        purchaseReturnStore.set(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS, returns);
        return { success: true, purchaseReturn: target };
    }

    /**
     * Mark Purchase Return as Completed
     */
    async completePurchaseReturn(id, user = 'Manager') {
        await this._delay(150);
        const returns = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS);
        const target = returns.find(r => r.id === id);

        if (!target) return { success: false, message: 'Purchase return not found.' };

        target.status = 'Completed';
        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Completed',
            title: 'Purchase Return Completed',
            notes: 'Supplier acknowledged return consignment.'
        });

        purchaseReturnStore.set(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS, returns);
        return { success: true, purchaseReturn: target };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const purchaseReturnService = new PurchaseReturnService();
