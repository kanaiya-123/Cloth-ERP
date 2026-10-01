// CLOTHERP - Purchase Orders Management Service
import { purchaseStore, PURCHASE_STORAGE_KEYS } from './purchaseStore.js';
import { taxService } from './taxService.js';
import { supplierService } from './supplierService.js';

class PurchaseService {
    /**
     * Get Filtered, Searched & Paginated Purchase Orders
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/purchases?${params}`);
     * return await res.json();
     */
    async getPurchases({
        page = 1,
        pageSize = 10,
        search = '',
        supplierId = '',
        status = '',
        paymentStatus = '',
        shipmentStatus = '',
        sortBy = 'newest'
    } = {}) {
        await this._delay(150);
        let items = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);

        // Search Filter (Purchase Number, Supplier Name, LR Number, Reference Number, Transport Name)
        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            items = items.filter(p => 
                (p.purchaseNumber && p.purchaseNumber.toLowerCase().includes(query)) ||
                (p.supplierName && p.supplierName.toLowerCase().includes(query)) ||
                (p.referenceNumber && p.referenceNumber.toLowerCase().includes(query)) ||
                (p.shipment && p.shipment.lrNumber && p.shipment.lrNumber.toLowerCase().includes(query)) ||
                (p.shipment && p.shipment.transportName && p.shipment.transportName.toLowerCase().includes(query))
            );
        }

        if (supplierId) items = items.filter(p => p.supplierId === supplierId);
        if (status) items = items.filter(p => p.status === status);
        if (paymentStatus) items = items.filter(p => p.paymentStatus === paymentStatus);
        if (shipmentStatus) items = items.filter(p => p.shipmentStatus === shipmentStatus);

        // Sorting
        if (sortBy === 'newest') {
            items.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));
        } else if (sortBy === 'oldest') {
            items.sort((a, b) => new Date(a.purchaseDate || 0) - new Date(b.purchaseDate || 0));
        } else if (sortBy === 'highest_amount') {
            items.sort((a, b) => (b.grandTotal || 0) - (a.grandTotal || 0));
        } else if (sortBy === 'lowest_amount') {
            items.sort((a, b) => (a.grandTotal || 0) - (b.grandTotal || 0));
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        // Calculate KPI Summary
        const allItems = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const draftCount = allItems.filter(p => p.status === 'Draft').length;
        const inTransitCount = allItems.filter(p => p.shipmentStatus === 'In Transit' || p.status === 'In Transit').length;
        const pendingPaymentTotal = allItems.filter(p => p.paymentStatus !== 'Paid').reduce((acc, p) => acc + (p.balanceAmount || 0), 0);
        const receivedCount = allItems.filter(p => p.status === 'Received').length;

        return {
            items: paginated,
            pagination: { page, pageSize, totalItems, totalPages },
            summary: {
                totalPurchases: allItems.length,
                draftCount,
                inTransitCount,
                pendingPaymentTotal,
                pendingPaymentFormatted: `₹${pendingPaymentTotal.toLocaleString('en-IN')}`,
                receivedCount
            }
        };
    }

    /**
     * Get Single Purchase by ID or Purchase Number
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/purchases/${id}`);
     * return await res.json();
     */
    async getPurchaseById(id) {
        await this._delay(100);
        const items = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        return items.find(p => p.id === id || p.purchaseNumber === id) || null;
    }

    /**
     * Create New Purchase Order
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/purchases', { method: 'POST', body: JSON.stringify(data) });
     */
    async createPurchase(data, user = 'Admin') {
        await this._delay(200);
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);

        if (!data.supplierId) {
            return { success: false, message: 'Please select a supplier.' };
        }
        if (!data.items || data.items.length === 0) {
            return { success: false, message: 'Purchase must contain at least one product variant item.' };
        }

        const supplier = await supplierService.getSupplierById(data.supplierId);
        if (!supplier) {
            return { success: false, message: 'Selected supplier not found.' };
        }

        // Calculate Totals and Taxes
        const totals = taxService.calculatePurchaseTotals({
            items: data.items,
            overallDiscountType: data.overallDiscountType || 'percent',
            overallDiscountVal: data.overallDiscountVal || 0,
            supplierState: supplier.state
        });

        const newId = `pur_${Date.now()}`;
        const newNumber = `PUR-${String(purchases.length + 1).padStart(6, '0')}`;
        const initialStatus = data.confirmNow ? 'Confirmed' : 'Draft';
        const paidAmount = parseFloat(data.initialPaymentAmount) || 0;
        const balanceAmount = Math.max(0, totals.grandTotal - paidAmount);
        
        let paymentStatus = 'Unpaid';
        if (paidAmount >= totals.grandTotal && totals.grandTotal > 0) {
            paymentStatus = 'Paid';
        } else if (paidAmount > 0) {
            paymentStatus = 'Partial';
        }

        const paymentsList = [];
        if (paidAmount > 0) {
            paymentsList.push({
                id: `pay_${Date.now()}`,
                paymentDate: data.purchaseDate || new Date().toISOString().split('T')[0],
                amount: paidAmount,
                paymentMethod: data.initialPaymentMethod || 'Bank Transfer',
                referenceNumber: data.initialPaymentRef || 'ADV-001',
                recordedBy: user,
                notes: 'Initial booking payment'
            });
        }

        const newPurchase = {
            id: newId,
            purchaseNumber: newNumber,
            referenceNumber: data.referenceNumber || '',
            supplierId: supplier.id,
            supplierName: supplier.name,
            supplierGstin: supplier.gstin,
            supplierState: supplier.state,
            purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
            expectedDeliveryDate: data.expectedDeliveryDate || '',
            status: initialStatus,
            paymentStatus: paymentStatus,
            shipmentStatus: 'Not Shipped',
            notes: data.notes || '',

            items: totals.items.map((item, idx) => ({
                id: `pitem_${newId}_${idx + 1}`,
                productId: item.productId,
                productName: item.productName,
                productVariantId: item.productVariantId || item.id,
                variantName: item.variantName || `${item.color} / ${item.size}`,
                color: item.color,
                size: item.size,
                sku: item.sku,
                barcode: item.barcode,
                quantity: item.quantity,
                purchaseRate: item.purchaseRate || item.rate,
                discountType: item.discountType,
                discountVal: item.discountVal,
                discountAmount: item.discountAmount,
                taxableAmount: item.taxableAmount,
                gstRate: item.gstRate,
                cgstRate: item.cgstRate,
                cgstAmount: item.cgstAmount,
                sgstRate: item.sgstRate,
                sgstAmount: item.sgstAmount,
                igstRate: item.igstRate,
                igstAmount: item.igstAmount,
                totalAmount: item.totalAmount,
                receivedQuantity: 0
            })),

            isSameState: totals.isSameState,
            totalGross: totals.totalGross,
            totalItemDiscount: totals.totalItemDiscount,
            subtotalTaxable: totals.subtotalTaxable,
            overallDiscountType: totals.overallDiscountType,
            overallDiscountVal: totals.overallDiscountVal,
            overallDiscountAmount: totals.overallDiscountAmount,
            finalTaxableAmount: totals.finalTaxableAmount,
            cgstTotal: totals.cgstTotal,
            sgstTotal: totals.sgstTotal,
            igstTotal: totals.igstTotal,
            totalTax: totals.totalTax,
            grandTotal: totals.grandTotal,
            paidAmount: paidAmount,
            balanceAmount: balanceAmount,
            totalQuantity: totals.totalQuantity,
            totalReceivedQuantity: 0,

            shipment: {
                transportName: data.transportName || '',
                lrNumber: data.lrNumber || '',
                vehicleNumber: data.vehicleNumber || '',
                driverName: data.driverName || '',
                driverMobile: data.driverMobile || '',
                dispatchDate: data.dispatchDate || '',
                expectedDeliveryDate: data.expectedDeliveryDate || '',
                notes: data.shipmentNotes || ''
            },

            trackingTimeline: [
                {
                    date: data.purchaseDate || new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    user: user,
                    status: initialStatus,
                    title: `Purchase Order Created (${initialStatus})`,
                    notes: `Created with ${totals.items.length} garment variants.`
                }
            ],

            payments: paymentsList,

            activity: [
                {
                    time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    user: user,
                    action: `Created Purchase Order ${newNumber}`
                }
            ]
        };

        purchases.unshift(newPurchase);
        purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);

        return { success: true, purchase: newPurchase };
    }

    /**
     * Confirm a Draft Purchase Order
     */
    async confirmPurchase(id, user = 'Admin') {
        await this._delay(150);
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const target = purchases.find(p => p.id === id);

        if (!target) return { success: false, message: 'Purchase not found.' };
        if (target.status !== 'Draft') return { success: false, message: 'Only Draft POs can be confirmed.' };

        target.status = 'Confirmed';
        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Confirmed',
            title: 'Purchase Order Confirmed',
            notes: 'Order released to supplier for production & packing.'
        });
        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Confirmed Purchase Order ${target.purchaseNumber}`
        });

        purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);
        return { success: true, purchase: target };
    }

    /**
     * Cancel a Purchase Order
     */
    async cancelPurchase(id, reason = '', user = 'Admin') {
        await this._delay(150);
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const target = purchases.find(p => p.id === id);

        if (!target) return { success: false, message: 'Purchase not found.' };
        if (target.status === 'Received' || target.status === 'Partially Received') {
            return { success: false, message: 'Cannot cancel purchase with received goods. Use Purchase Return instead.' };
        }

        target.status = 'Cancelled';
        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Cancelled',
            title: 'Purchase Order Cancelled',
            notes: reason || 'Cancelled by manager'
        });
        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Cancelled Purchase Order ${target.purchaseNumber}: ${reason}`
        });

        purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);
        return { success: true, purchase: target };
    }

    /**
     * Update Shipment Details & Assign LR Number
     */
    async updateShipment(id, shipmentData, user = 'Admin') {
        await this._delay(150);
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const target = purchases.find(p => p.id === id);

        if (!target) return { success: false, message: 'Purchase not found.' };

        target.shipment = {
            ...target.shipment,
            ...shipmentData
        };

        if (shipmentData.shipmentStatus) {
            target.shipmentStatus = shipmentData.shipmentStatus;
            if (shipmentData.shipmentStatus === 'In Transit' && target.status !== 'Received' && target.status !== 'Partially Received') {
                target.status = 'In Transit';
            }
        }

        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: target.shipmentStatus,
            title: `Shipment Updated: ${target.shipmentStatus}`,
            notes: shipmentData.lrNumber ? `LR: ${shipmentData.lrNumber} via ${shipmentData.transportName || 'Transport'}` : 'Shipment updated'
        });

        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Updated Shipment & LR Number for ${target.purchaseNumber}`
        });

        purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);
        return { success: true, purchase: target };
    }

    /**
     * Record Payment for a Purchase
     */
    async recordPayment(id, { amount, paymentMethod = 'Bank Transfer', referenceNumber = '', notes = '' }, user = 'Admin') {
        await this._delay(150);
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const target = purchases.find(p => p.id === id);

        if (!target) return { success: false, message: 'Purchase not found.' };

        const payVal = parseFloat(amount) || 0;
        if (payVal <= 0) return { success: false, message: 'Payment amount must be greater than zero.' };

        const newPaid = target.paidAmount + payVal;
        const newBalance = Math.max(0, target.grandTotal - newPaid);

        target.paidAmount = newPaid;
        target.balanceAmount = newBalance;
        target.paymentStatus = newPaid >= target.grandTotal ? 'Paid' : 'Partial';

        const paymentRecord = {
            id: `pay_${Date.now()}`,
            paymentDate: new Date().toISOString().split('T')[0],
            amount: payVal,
            paymentMethod,
            referenceNumber,
            recordedBy: user,
            notes
        };

        target.payments = target.payments || [];
        target.payments.unshift(paymentRecord);

        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Recorded payment of ₹${payVal.toLocaleString('en-IN')} (${paymentMethod})`
        });

        purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);
        return { success: true, purchase: target, payment: paymentRecord };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const purchaseService = new PurchaseService();
