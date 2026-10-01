// CLOTHERP - Sales Returns, Inspection, Refunds & Credit Notes Service
import { returnStore, RETURN_STORAGE_KEYS } from './returnStore.js';
import { salesService } from './salesService.js';
import { stockMovementService } from './stockMovementService.js';

class SalesReturnService {
    /**
     * Get Filtered, Searched & Paginated Sales Returns
     */
    async getSalesReturns({
        page = 1,
        pageSize = 10,
        search = '',
        status = '',
        refundStatus = '',
        reason = '',
        sortBy = 'newest'
    } = {}) {
        await this._delay(150);
        let items = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);

        // Search (Return No, Sale No, Invoice No, Customer Name, Mobile, SKU)
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter(r => 
                (r.returnNumber && r.returnNumber.toLowerCase().includes(q)) ||
                (r.saleNumber && r.saleNumber.toLowerCase().includes(q)) ||
                (r.invoiceNumber && r.invoiceNumber.toLowerCase().includes(q)) ||
                (r.customerName && r.customerName.toLowerCase().includes(q)) ||
                (r.customerMobile && r.customerMobile.toLowerCase().includes(q)) ||
                (r.items && r.items.some(i => i.sku && i.sku.toLowerCase().includes(q)))
            );
        }

        if (status) items = items.filter(r => r.status === status);
        if (refundStatus) items = items.filter(r => r.refundStatus === refundStatus);
        if (reason) items = items.filter(r => r.reason === reason);

        // Sorting
        if (sortBy === 'newest') {
            items.sort((a, b) => new Date(b.returnDate || 0) - new Date(a.returnDate || 0));
        } else if (sortBy === 'oldest') {
            items.sort((a, b) => new Date(a.returnDate || 0) - new Date(b.returnDate || 0));
        } else if (sortBy === 'highest_amount') {
            items.sort((a, b) => (b.grandTotal || 0) - (a.grandTotal || 0));
        } else if (sortBy === 'lowest_amount') {
            items.sort((a, b) => (a.grandTotal || 0) - (b.grandTotal || 0));
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        // KPI Summary
        const all = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);
        const pendingApproval = all.filter(r => r.status === 'Requested' || r.status === 'Draft').length;
        const itemsReceived = all.filter(r => r.status === 'Item Received' || r.status === 'Inspected').length;
        const refundPending = all.filter(r => r.refundStatus === 'Pending' || r.refundStatus === 'Partial').length;
        const completed = all.filter(r => r.status === 'Completed').length;

        return {
            items: paginated,
            pagination: { page, pageSize, totalItems, totalPages },
            summary: {
                totalReturns: all.length,
                pendingApproval,
                itemsReceived,
                refundPending,
                completed
            }
        };
    }

    /**
     * Get Single Sales Return by ID or Return Number
     */
    async getSalesReturnById(id) {
        await this._delay(100);
        const items = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);
        return items.find(r => r.id === id || r.returnNumber === id) || null;
    }

    /**
     * Calculate Maximum Returnable Quantities for a Sale
     */
    async getSaleReturnableItems(saleId) {
        const sale = await salesService.getSaleById(saleId);
        if (!sale) return [];

        const allReturns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS).filter(
            r => (r.saleId === saleId || r.saleNumber === sale.saleNumber) && r.status !== 'Cancelled' && r.status !== 'Rejected'
        );

        return (sale.items || []).map(saleItem => {
            let alreadyReturned = 0;
            allReturns.forEach(ret => {
                (ret.items || []).forEach(rItem => {
                    if (rItem.productVariantId === saleItem.productVariantId || rItem.saleItemId === saleItem.id) {
                        alreadyReturned += (rItem.returnQuantity || 0);
                    }
                });
            });

            const returnableQuantity = Math.max(0, saleItem.quantity - alreadyReturned);

            return {
                ...saleItem,
                soldQuantity: saleItem.quantity,
                alreadyReturned,
                returnableQuantity
            };
        });
    }

    /**
     * Create Sales Return Request
     */
    async createSalesReturn(data, user = 'Sales Staff') {
        await this._delay(200);
        const returns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);

        const sale = await salesService.getSaleById(data.saleId);
        if (!sale) {
            return { success: false, message: 'Original sale order not found.' };
        }

        if (!data.items || data.items.length === 0) {
            return { success: false, message: 'Please select at least one item to return.' };
        }

        // Validate Returnable Quantities
        const returnableItems = await this.getSaleReturnableItems(sale.id);
        const processedItems = [];
        let totalReturnGross = 0;
        let totalReturnDiscount = 0;
        let subtotalTaxable = 0;
        let cgstTotal = 0;
        let sgstTotal = 0;
        let igstTotal = 0;
        let totalUnits = 0;

        for (const reqItem of data.items) {
            const origItem = returnableItems.find(i => i.productVariantId === reqItem.productVariantId || i.id === reqItem.saleItemId);
            if (!origItem) continue;

            const qty = parseInt(reqItem.returnQuantity) || 0;
            if (qty <= 0) continue;

            if (qty > origItem.returnableQuantity) {
                return {
                    success: false,
                    message: `Return quantity (${qty}) exceeds remaining returnable quantity (${origItem.returnableQuantity}) for ${origItem.productName}.`
                };
            }

            // Calculate Original Financials & Tax Reversal
            const unitGross = origItem.sellingRate;
            const lineGross = unitGross * qty;
            const unitDiscount = (origItem.discountAmount || 0) / (origItem.soldQuantity || 1);
            const lineDiscount = unitDiscount * qty;
            const lineTaxable = lineGross - lineDiscount;

            const gstRate = origItem.gstRate || 5;
            let lineCGST = 0;
            let lineSGST = 0;
            let lineIGST = 0;

            if (sale.isSameState) {
                lineCGST = (lineTaxable * (gstRate / 2)) / 100;
                lineSGST = (lineTaxable * (gstRate / 2)) / 100;
            } else {
                lineIGST = (lineTaxable * gstRate) / 100;
            }

            const lineTotal = lineTaxable + lineCGST + lineSGST + lineIGST;

            totalReturnGross += lineGross;
            totalReturnDiscount += lineDiscount;
            subtotalTaxable += lineTaxable;
            cgstTotal += lineCGST;
            sgstTotal += lineSGST;
            igstTotal += lineIGST;
            totalUnits += qty;

            processedItems.push({
                id: `ritem_${Date.now()}_${processedItems.length + 1}`,
                saleItemId: origItem.id,
                productId: origItem.productId,
                productName: origItem.productName,
                productVariantId: origItem.productVariantId,
                variantName: origItem.variantName,
                color: origItem.color,
                size: origItem.size,
                sku: origItem.sku,
                soldQuantity: origItem.soldQuantity,
                returnQuantity: qty,
                sellingRate: origItem.sellingRate,
                discountVal: origItem.discountVal || 0,
                taxableAmount: lineTaxable,
                gstRate: gstRate,
                cgstAmount: lineCGST,
                sgstAmount: lineSGST,
                igstAmount: lineIGST,
                totalAmount: lineTotal,
                condition: reqItem.condition || 'Resalable',
                receivedQuantity: 0,
                inspectionStatus: 'Pending'
            });
        }

        if (processedItems.length === 0) {
            return { success: false, message: 'Please enter a valid return quantity greater than zero.' };
        }

        const totalTax = cgstTotal + sgstTotal + igstTotal;
        const grandTotal = subtotalTaxable + totalTax;

        const newId = `ret_${Date.now()}`;
        const newNumber = `RET-${String(returns.length + 1).padStart(6, '0')}`;

        const newReturn = {
            id: newId,
            returnNumber: newNumber,
            saleId: sale.id,
            saleNumber: sale.saleNumber,
            invoiceNumber: sale.invoiceNumber || '',
            customerId: sale.customerId,
            customerName: sale.customerName,
            customerMobile: sale.customerMobile,
            customerGstin: sale.customerGstin || '',
            customerState: sale.customerState || 'Maharashtra',
            returnDate: data.returnDate || new Date().toISOString().split('T')[0],
            returnType: totalUnits >= sale.totalQuantity ? 'Full Return' : 'Partial Return',
            status: 'Requested',
            refundStatus: 'Pending',
            inventoryProcessed: false,
            isSameState: sale.isSameState,
            reason: data.reason || 'Wrong Size',
            notes: data.notes || '',

            items: processedItems,
            totalReturnGross,
            totalReturnDiscount,
            subtotalTaxable,
            cgstTotal,
            sgstTotal,
            igstTotal,
            totalTax,
            grandTotal,
            refundedAmount: 0,
            refundBalance: grandTotal,
            totalQuantity: totalUnits,

            inspection: {
                status: 'Pending',
                result: 'Unknown',
                inspectedBy: '',
                inspectionDate: '',
                notes: ''
            },

            refund: {
                status: 'Pending',
                method: data.preferredRefundMethod || 'Credit Note',
                creditNoteNumber: '',
                amount: 0,
                processedDate: '',
                processedBy: ''
            },

            trackingTimeline: [
                {
                    date: data.returnDate || new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    user: user,
                    status: 'Requested',
                    title: 'Sales Return Requested',
                    notes: `Initiated return for ${totalUnits} units (${data.reason || 'Return'}).`
                }
            ],

            activity: [
                {
                    time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    user: user,
                    action: `Created Sales Return ${newNumber} for ${sale.saleNumber}`
                }
            ]
        };

        returns.unshift(newReturn);
        returnStore.set(RETURN_STORAGE_KEYS.RETURNS, returns);

        return { success: true, returnRecord: newReturn };
    }

    /**
     * Approve Sales Return Request
     */
    async approveSalesReturn(id, user = 'Manager') {
        await this._delay(150);
        const returns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);
        const target = returns.find(r => r.id === id);

        if (!target) return { success: false, message: 'Return record not found.' };
        if (target.status !== 'Requested' && target.status !== 'Draft') {
            return { success: false, message: 'Only Requested returns can be approved.' };
        }

        target.status = 'Approved';
        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Approved',
            title: 'Return Request Approved',
            notes: 'Approved for physical item intake and quality inspection.'
        });
        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Approved Sales Return ${target.returnNumber}`
        });

        returnStore.set(RETURN_STORAGE_KEYS.RETURNS, returns);
        return { success: true, returnRecord: target };
    }

    /**
     * Receive & Inspect Physical Returned Items (Condition-Based Stock Processing)
     * Strictly prevents duplicate stock processing.
     */
    async receiveAndInspectItems(id, { condition = 'Resalable', notes = '' }, user = 'Warehouse Exec') {
        await this._delay(200);
        const returns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);
        const target = returns.find(r => r.id === id);

        if (!target) return { success: false, message: 'Return record not found.' };

        // Duplicate Inventory Processing Guard
        if (target.inventoryProcessed) {
            return { success: false, message: 'Inventory has already been processed for this return.' };
        }

        target.status = 'Inspected';
        target.inspection = {
            status: 'Approved',
            result: condition,
            inspectedBy: user,
            inspectionDate: new Date().toISOString().split('T')[0],
            notes: notes || `Inspected as ${condition}`
        };

        // Inventory Stock IN Rule:
        // Only if condition is Resalable do we restore available sellable stock!
        let stockRestoredCount = 0;
        for (const item of target.items) {
            item.condition = condition;
            item.receivedQuantity = item.returnQuantity;
            item.inspectionStatus = 'Approved';

            if (condition === 'Resalable') {
                await stockMovementService.recordStockIn({
                    productVariantId: item.productVariantId,
                    quantity: item.returnQuantity,
                    referenceId: target.returnNumber,
                    reason: `Sales Return Resalable (${target.returnNumber})`,
                    notes: `Restored to sellable stock from ${target.customerName}`,
                    user: user
                });
                stockRestoredCount += item.returnQuantity;
            } else {
                // Non-sellable / Damaged Stock log
                await stockMovementService.recordStockIn({
                    productVariantId: item.productVariantId,
                    quantity: item.returnQuantity,
                    referenceId: target.returnNumber,
                    reason: `Damaged Return Quarantine (${target.returnNumber}): ${condition}`,
                    notes: `Non-sellable return stock from ${target.customerName}`,
                    user: user
                });
            }
        }

        target.inventoryProcessed = true;

        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Inspected',
            title: `Items Received & Inspected (${condition})`,
            notes: condition === 'Resalable' 
                ? `Restored ${stockRestoredCount} units back to sellable warehouse inventory.`
                : `Logged ${target.totalQuantity} units as damaged/quarantine non-sellable stock.`
        });

        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Inspected return items as ${condition} (Processed ${target.totalQuantity} units)`
        });

        returnStore.set(RETURN_STORAGE_KEYS.RETURNS, returns);
        return { success: true, returnRecord: target };
    }

    /**
     * Process Refund or Issue Credit Note
     */
    async processRefund(id, { amount, method = 'Credit Note', referenceNumber = '', notes = '' }, user = 'Sales Staff') {
        await this._delay(200);
        const returns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);
        const target = returns.find(r => r.id === id);

        if (!target) return { success: false, message: 'Return record not found.' };

        const refundVal = parseFloat(amount) || 0;
        if (refundVal <= 0) return { success: false, message: 'Refund amount must be greater than zero.' };

        const newRefunded = (target.refundedAmount || 0) + refundVal;
        const newBalance = Math.max(0, target.grandTotal - newRefunded);

        target.refundedAmount = newRefunded;
        target.refundBalance = newBalance;
        target.refundStatus = newRefunded >= target.grandTotal ? 'Completed' : 'Partial';

        let creditNoteNumber = '';
        if (method === 'Credit Note') {
            const creditNotes = returnStore.get(RETURN_STORAGE_KEYS.CREDIT_NOTES);
            creditNoteNumber = `CN-${String(creditNotes.length + 1).padStart(6, '0')}`;

            const newCN = {
                id: `cn_${Date.now()}`,
                creditNoteNumber,
                returnId: target.id,
                returnNumber: target.returnNumber,
                saleNumber: target.saleNumber,
                customerId: target.customerId,
                customerName: target.customerName,
                customerGstin: target.customerGstin,
                amount: refundVal,
                taxAdjustment: target.totalTax,
                reason: `Sales Return ${target.returnNumber} (${target.reason})`,
                status: 'Issued',
                issueDate: new Date().toISOString().split('T')[0],
                createdBy: user
            };

            creditNotes.unshift(newCN);
            returnStore.set(RETURN_STORAGE_KEYS.CREDIT_NOTES, creditNotes);
            target.refund.creditNoteNumber = creditNoteNumber;
        }

        // Record in refunds ledger
        const refundsList = returnStore.get(RETURN_STORAGE_KEYS.REFUNDS);
        refundsList.unshift({
            id: `ref_${Date.now()}`,
            returnId: target.id,
            returnNumber: target.returnNumber,
            saleNumber: target.saleNumber,
            customerId: target.customerId,
            customerName: target.customerName,
            amount: refundVal,
            method,
            referenceNumber: referenceNumber || creditNoteNumber,
            processedDate: new Date().toISOString().split('T')[0],
            processedBy: user,
            notes
        });
        returnStore.set(RETURN_STORAGE_KEYS.REFUNDS, refundsList);

        if (target.refundStatus === 'Completed' && target.inventoryProcessed) {
            target.status = 'Completed';
        }

        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: target.status,
            title: `Refund Processed: ₹${refundVal.toLocaleString('en-IN')} (${method})`,
            notes: creditNoteNumber ? `Credit Note ${creditNoteNumber} issued.` : `Settled via ${method} (${referenceNumber || 'Direct'}).`
        });

        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Processed refund of ₹${refundVal.toLocaleString('en-IN')} via ${method}`
        });

        returnStore.set(RETURN_STORAGE_KEYS.RETURNS, returns);
        return { success: true, returnRecord: target, creditNoteNumber };
    }

    /**
     * Cancel a Sales Return
     */
    async cancelSalesReturn(id, reason = '', user = 'Manager') {
        await this._delay(150);
        const returns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);
        const target = returns.find(r => r.id === id);

        if (!target) return { success: false, message: 'Return record not found.' };
        if (target.status === 'Completed') {
            return { success: false, message: 'Completed returns cannot be cancelled.' };
        }

        target.status = 'Cancelled';
        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Cancelled',
            title: 'Sales Return Cancelled',
            notes: reason || 'Cancelled by manager'
        });

        returnStore.set(RETURN_STORAGE_KEYS.RETURNS, returns);
        return { success: true, returnRecord: target };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const salesReturnService = new SalesReturnService();
