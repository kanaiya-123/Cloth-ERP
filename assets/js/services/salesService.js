// CLOTHERP - Sales Orders & Invoices Management Service
import { salesStore, SALES_STORAGE_KEYS } from './salesStore.js';
import { customerService } from './customerService.js';
import { taxService } from './taxService.js';
import { salesInventoryIntegrationService } from './salesInventoryIntegrationService.js';

class SalesService {
    /**
     * Get Filtered, Searched & Paginated Sales Orders
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/sales?${params}`);
     * return await res.json();
     */
    async getSales({
        page = 1,
        pageSize = 10,
        search = '',
        customerId = '',
        status = '',
        paymentStatus = '',
        customerType = '',
        sortBy = 'newest'
    } = {}) {
        await this._delay(150);
        let items = salesStore.get(SALES_STORAGE_KEYS.SALES);

        // Search Filter (Sale No, Invoice No, Customer Name, Mobile, SKU, Ref No)
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter(s => 
                (s.saleNumber && s.saleNumber.toLowerCase().includes(q)) ||
                (s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(q)) ||
                (s.customerName && s.customerName.toLowerCase().includes(q)) ||
                (s.customerMobile && s.customerMobile.toLowerCase().includes(q)) ||
                (s.referenceNumber && s.referenceNumber.toLowerCase().includes(q)) ||
                (s.delivery && s.delivery.trackingReference && s.delivery.trackingReference.toLowerCase().includes(q)) ||
                (s.items && s.items.some(i => i.sku && i.sku.toLowerCase().includes(q)))
            );
        }

        if (customerId) items = items.filter(s => s.customerId === customerId);
        if (status) items = items.filter(s => s.status === status);
        if (paymentStatus) items = items.filter(s => s.paymentStatus === paymentStatus);
        if (customerType) items = items.filter(s => s.customerType === customerType);

        // Sorting
        if (sortBy === 'newest') {
            items.sort((a, b) => new Date(b.saleDate || 0) - new Date(a.saleDate || 0));
        } else if (sortBy === 'oldest') {
            items.sort((a, b) => new Date(a.saleDate || 0) - new Date(b.saleDate || 0));
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
        const allItems = salesStore.get(SALES_STORAGE_KEYS.SALES);
        const totalSalesRevenue = allItems.filter(s => s.status !== 'Cancelled').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySalesTotal = allItems.filter(s => s.saleDate === todayStr && s.status !== 'Cancelled').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
        const pendingOrdersCount = allItems.filter(s => ['Draft', 'Confirmed', 'Processing', 'Ready for Dispatch', 'Dispatched', 'In Transit', 'Out for Delivery'].includes(s.status)).length;
        const pendingPaymentsTotal = allItems.filter(s => s.status !== 'Cancelled').reduce((acc, s) => acc + (s.balanceAmount || 0), 0);
        const deliveredCount = allItems.filter(s => s.status === 'Delivered').length;

        return {
            items: paginated,
            pagination: { page, pageSize, totalItems, totalPages },
            summary: {
                totalSalesCount: allItems.length,
                totalSalesRevenue,
                totalSalesRevenueFormatted: `₹${totalSalesRevenue.toLocaleString('en-IN')}`,
                todaySalesTotal,
                todaySalesFormatted: `₹${todaySalesTotal.toLocaleString('en-IN')}`,
                pendingOrdersCount,
                pendingPaymentsTotal,
                pendingPaymentsFormatted: `₹${pendingPaymentsTotal.toLocaleString('en-IN')}`,
                deliveredCount
            }
        };
    }

    /**
     * Get Single Sale by ID, Sale Number, or Invoice Number
     */
    async getSaleById(id) {
        await this._delay(100);
        const sales = salesStore.get(SALES_STORAGE_KEYS.SALES);
        return sales.find(s => s.id === id || s.saleNumber === id || s.invoiceNumber === id) || null;
    }

    /**
     * Create New Sale Order
     */
    async createSale(data, user = 'Sales Staff') {
        await this._delay(200);
        const sales = salesStore.get(SALES_STORAGE_KEYS.SALES);

        if (!data.customerId) {
            return { success: false, message: 'Please select a customer.' };
        }
        if (!data.items || data.items.length === 0) {
            return { success: false, message: 'Sale must contain at least one product variant item.' };
        }

        const customer = await customerService.getCustomerById(data.customerId);
        if (!customer) {
            return { success: false, message: 'Selected customer not found.' };
        }

        // Determine destination state for GST (from shipping address or billing address)
        const customerState = (data.shippingState || (customer.shippingAddress && customer.shippingAddress.state) || (customer.billingAddress && customer.billingAddress.state) || 'Maharashtra');

        // Centralized GST Calculation
        const totals = taxService.calculatePurchaseTotals({
            items: data.items.map(item => ({
                ...item,
                rate: item.sellingRate || item.rate || 0
            })),
            overallDiscountType: data.overallDiscountType || 'percent',
            overallDiscountVal: data.overallDiscountVal || 0,
            supplierState: customerState // Uses customer state for intra/interstate check
        });

        const newId = `sal_${Date.now()}`;
        const newNumber = `SAL-${String(sales.length + 1).padStart(6, '0')}`;
        const newInvoice = `INV-${String(sales.length + 1).padStart(6, '0')}`;
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
                id: `spay_${Date.now()}`,
                paymentDate: data.saleDate || new Date().toISOString().split('T')[0],
                amount: paidAmount,
                paymentMethod: data.initialPaymentMethod || 'Cash',
                referenceNumber: data.initialPaymentRef || 'INIT-001',
                recordedBy: user,
                notes: 'Initial booking payment'
            });
        }

        const newSale = {
            id: newId,
            saleNumber: newNumber,
            invoiceNumber: newInvoice,
            referenceNumber: data.referenceNumber || '',
            customerId: customer.id,
            customerName: customer.name,
            customerType: customer.customerType || 'Retail',
            customerMobile: customer.mobile,
            customerGstin: customer.gstin || '',
            customerState: customerState,
            saleDate: data.saleDate || new Date().toISOString().split('T')[0],
            expectedDeliveryDate: data.expectedDeliveryDate || '',
            status: initialStatus,
            paymentStatus: paymentStatus,
            inventoryDeducted: false,
            notes: data.notes || '',

            items: totals.items.map((item, idx) => ({
                id: `sitem_${newId}_${idx + 1}`,
                productId: item.productId,
                productName: item.productName,
                productVariantId: item.productVariantId || item.id,
                variantName: item.variantName || `${item.color} / ${item.size}`,
                color: item.color,
                size: item.size,
                sku: item.sku,
                barcode: item.barcode,
                quantity: item.quantity,
                sellingRate: item.purchaseRate || item.rate,
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
                totalAmount: item.totalAmount
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

            delivery: {
                method: data.deliveryMethod || 'Local Delivery',
                contactPerson: data.deliveryContactPerson || customer.contactPerson || customer.name,
                contactMobile: data.deliveryContactMobile || customer.mobile,
                shippingAddress: {
                    addressLine1: data.shippingAddressLine1 || (customer.shippingAddress && customer.shippingAddress.addressLine1) || '',
                    addressLine2: data.shippingAddressLine2 || (customer.shippingAddress && customer.shippingAddress.addressLine2) || '',
                    city: data.shippingCity || (customer.shippingAddress && customer.shippingAddress.city) || '',
                    state: customerState,
                    pincode: data.shippingPincode || (customer.shippingAddress && customer.shippingAddress.pincode) || ''
                },
                trackingReference: data.trackingReference || '',
                notes: data.deliveryNotes || ''
            },

            payments: paymentsList,

            trackingTimeline: [
                {
                    date: data.saleDate || new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    user: user,
                    status: initialStatus,
                    title: `Sale Order Created (${initialStatus})`,
                    notes: `Created with ${totals.items.length} garment variant lines.`
                }
            ],

            activity: [
                {
                    time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    user: user,
                    action: `Created Sale Order ${newNumber} (Invoice ${newInvoice})`
                }
            ]
        };

        // If user chose to confirm immediately, trigger stock deduction
        if (data.confirmNow) {
            const deductRes = await salesInventoryIntegrationService.deductStockForSale(newSale, user);
            if (!deductRes.success) {
                return { success: false, message: `Could not confirm sale: ${deductRes.message}` };
            }
            newSale.trackingTimeline.push({
                date: newSale.saleDate,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                user: user,
                status: 'Confirmed',
                title: 'Order Confirmed & Stock Deducted',
                notes: `Deducted ${newSale.totalQuantity} units from warehouse inventory.`
            });
        }

        sales.unshift(newSale);
        salesStore.set(SALES_STORAGE_KEYS.SALES, sales);

        return { success: true, sale: newSale };
    }

    /**
     * Confirm a Draft Sale Order & Deduct Inventory Stock OUT
     */
    async confirmSale(id, user = 'Sales Staff') {
        await this._delay(150);
        const sales = salesStore.get(SALES_STORAGE_KEYS.SALES);
        const target = sales.find(s => s.id === id);

        if (!target) return { success: false, message: 'Sale order not found.' };
        if (target.status !== 'Draft') return { success: false, message: 'Only Draft sales can be confirmed.' };

        // 1. Centralized Stock Deduction
        const deductRes = await salesInventoryIntegrationService.deductStockForSale(target, user);
        if (!deductRes.success) {
            return { success: false, message: deductRes.message };
        }

        target.status = 'Confirmed';
        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Confirmed',
            title: 'Order Confirmed & Stock Deducted',
            notes: `Inventory deducted: ${target.totalQuantity} units.`
        });
        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Confirmed Sale Order ${target.saleNumber} and deducted stock.`
        });

        salesStore.set(SALES_STORAGE_KEYS.SALES, sales);
        return { success: true, sale: target };
    }

    /**
     * Update Order Status Lifecycle (Processing -> Dispatched -> Delivered)
     */
    async updateSaleStatus(id, newStatus, notes = '', location = '', user = 'Sales Staff') {
        await this._delay(150);
        const sales = salesStore.get(SALES_STORAGE_KEYS.SALES);
        const target = sales.find(s => s.id === id);

        if (!target) return { success: false, message: 'Sale order not found.' };
        if (target.status === 'Cancelled') return { success: false, message: 'Cannot update status of a cancelled order.' };

        const prevStatus = target.status;
        target.status = newStatus;

        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: newStatus,
            previousStatus: prevStatus,
            title: `Order Status: ${newStatus}`,
            notes: notes || (location ? `Location: ${location}` : `Status transitioned from ${prevStatus} to ${newStatus}.`)
        });

        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Updated order status to ${newStatus}`
        });

        salesStore.set(SALES_STORAGE_KEYS.SALES, sales);
        return { success: true, sale: target };
    }

    /**
     * Cancel a Sale Order & Automatically Restore Inventory if Deducted
     */
    async cancelSale(id, reason = '', user = 'Sales Staff') {
        await this._delay(150);
        const sales = salesStore.get(SALES_STORAGE_KEYS.SALES);
        const target = sales.find(s => s.id === id);

        if (!target) return { success: false, message: 'Sale order not found.' };
        if (target.status === 'Delivered') {
            return { success: false, message: 'Delivered orders cannot be cancelled directly. Use Customer Return in future phase.' };
        }
        if (target.status === 'Cancelled') {
            return { success: false, message: 'Order is already cancelled.' };
        }

        // Automatic Stock Reversal if inventory was deducted
        if (target.inventoryDeducted) {
            const reverseRes = await salesInventoryIntegrationService.reverseStockForSale(target, user, reason);
            if (!reverseRes.success) {
                return { success: false, message: `Failed to reverse inventory: ${reverseRes.message}` };
            }
        }

        target.status = 'Cancelled';
        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: 'Cancelled',
            title: 'Sale Order Cancelled',
            notes: reason || 'Cancelled by manager'
        });
        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Cancelled Sale Order ${target.saleNumber}: ${reason}`
        });

        salesStore.set(SALES_STORAGE_KEYS.SALES, sales);
        return { success: true, sale: target };
    }

    /**
     * Record Payment for a Sale Order
     */
    async recordPayment(id, { amount, paymentMethod = 'UPI', referenceNumber = '', notes = '' }, user = 'Sales Staff') {
        await this._delay(150);
        const sales = salesStore.get(SALES_STORAGE_KEYS.SALES);
        const target = sales.find(s => s.id === id);

        if (!target) return { success: false, message: 'Sale order not found.' };

        const payVal = parseFloat(amount) || 0;
        if (payVal <= 0) return { success: false, message: 'Payment amount must be greater than zero.' };

        const newPaid = target.paidAmount + payVal;
        const newBalance = Math.max(0, target.grandTotal - newPaid);

        target.paidAmount = newPaid;
        target.balanceAmount = newBalance;
        target.paymentStatus = newPaid >= target.grandTotal ? 'Paid' : 'Partial';

        const paymentRecord = {
            id: `spay_${Date.now()}`,
            paymentDate: new Date().toISOString().split('T')[0],
            amount: payVal,
            paymentMethod,
            referenceNumber,
            recordedBy: user,
            notes
        };

        target.payments = target.payments || [];
        target.payments.unshift(paymentRecord);

        target.trackingTimeline.push({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: user,
            status: target.status,
            title: `Payment Recorded: ₹${payVal.toLocaleString('en-IN')}`,
            notes: `Paid via ${paymentMethod} (${referenceNumber || 'Direct'}). Remaining: ₹${newBalance.toLocaleString('en-IN')}`
        });

        target.activity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: user,
            action: `Recorded customer payment of ₹${payVal.toLocaleString('en-IN')} (${paymentMethod})`
        });

        salesStore.set(SALES_STORAGE_KEYS.SALES, sales);
        return { success: true, sale: target, payment: paymentRecord };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const salesService = new SalesService();
