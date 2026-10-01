// CLOTHERP - Centralized Reporting & Business Intelligence Analytics Service
import { ReportFilterService } from './reportFilterService.js';
import { salesStore, SALES_STORAGE_KEYS } from '../salesStore.js';
import { purchaseStore, PURCHASE_STORAGE_KEYS } from '../purchaseStore.js';
import { inventoryStore, INVENTORY_STORAGE_KEYS } from '../inventoryStore.js';
import { returnStore, RETURN_STORAGE_KEYS } from '../returnStore.js';
import { exchangeStore, EXCHANGE_STORAGE_KEYS } from '../exchangeStore.js';
import { purchaseReturnStore, PURCHASE_RETURN_STORAGE_KEYS } from '../purchaseReturnStore.js';
import { customerStore, CUSTOMER_STORAGE_KEYS } from '../customerStore.js';
import { supplierStore, SUPPLIER_STORAGE_KEYS } from '../supplierStore.js';
import { productStore, STORAGE_KEYS as PROD_KEYS } from '../productStore.js';

class ReportingService {
    /**
     * Executive Management BI Analytics Dashboard Dataset
     */
    async getExecutiveDashboardMetrics({ preset = 'this_month', customStart = '', customEnd = '' } = {}) {
        await this._delay(150);
        const { startDate, endDate } = ReportFilterService.getDateRangeBounds(preset, customStart, customEnd);

        const allSales = salesStore.get(SALES_STORAGE_KEYS.SALES);
        const allPurchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const allInventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const allMovements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);
        const allReturns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS);
        const allExchanges = exchangeStore.get(EXCHANGE_STORAGE_KEYS.EXCHANGES);
        const allPurchaseReturns = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS);

        // Filter valid non-cancelled records in date range
        const filteredSales = allSales.filter(s => s.status !== 'Cancelled' && ReportFilterService.isDateInRange(s.saleDate, startDate, endDate));
        const filteredPurchases = allPurchases.filter(p => p.status !== 'Cancelled' && ReportFilterService.isDateInRange(p.orderDate || p.createdAt, startDate, endDate));
        const filteredReturns = allReturns.filter(r => r.status !== 'Cancelled' && ReportFilterService.isDateInRange(r.returnDate, startDate, endDate));
        const filteredPurchaseReturns = allPurchaseReturns.filter(r => r.status !== 'Cancelled' && ReportFilterService.isDateInRange(r.returnDate, startDate, endDate));
        const filteredExchanges = allExchanges.filter(e => e.status !== 'Cancelled' && ReportFilterService.isDateInRange(e.exchangeDate, startDate, endDate));

        // 1. Core KPIs
        const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
        const totalPurchasesCost = filteredPurchases.reduce((acc, p) => acc + (p.grandTotal || 0), 0);
        const totalReturnsValue = filteredReturns.reduce((acc, r) => acc + (r.grandTotal || 0), 0);
        const totalPurchaseReturnsValue = filteredPurchaseReturns.reduce((acc, r) => acc + (r.grandTotal || 0), 0);

        const netSalesRevenue = Math.max(0, totalSalesRevenue - totalReturnsValue);

        // Estimated Gross Profit & Margin
        // Revenue - Estimated COGS (approx 50% based on garment master cost rates)
        const estimatedCogs = filteredSales.reduce((acc, s) => {
            const saleCogs = (s.items || []).reduce((iAcc, item) => iAcc + ((item.purchaseRate || item.sellingRate * 0.5) * item.quantity), 0);
            return acc + saleCogs;
        }, 0);

        const grossProfit = Math.max(0, netSalesRevenue - estimatedCogs);
        const grossMarginPercent = netSalesRevenue > 0 ? ((grossProfit / netSalesRevenue) * 100).toFixed(1) : '0.0';

        // Lifetime Receivables & Payables across all active orders
        const allActiveSales = allSales.filter(s => s.status !== 'Cancelled');
        const outstandingReceivables = allActiveSales.reduce((acc, s) => acc + (s.balanceAmount || 0), 0);

        const allActivePurchases = allPurchases.filter(p => p.status !== 'Cancelled');
        const outstandingPayables = allActivePurchases.reduce((acc, p) => acc + (p.balanceAmount || 0), 0);

        // Inventory Stock Valuation
        const inventoryValuation = allInventory.reduce((acc, i) => acc + ((i.currentStock || 0) * (i.baseCostPrice || 500)), 0);
        const totalStockUnits = allInventory.reduce((acc, i) => acc + (i.currentStock || 0), 0);
        const lowStockCount = allInventory.filter(i => (i.currentStock || 0) <= (i.reorderLevel || 10) && (i.currentStock || 0) > 0).length;
        const outOfStockCount = allInventory.filter(i => (i.currentStock || 0) <= 0).length;

        // GST Output vs Input
        const gstCollected = filteredSales.reduce((acc, s) => acc + (s.cgstTotal || 0) + (s.sgstTotal || 0) + (s.igstTotal || 0), 0);
        const gstPaid = filteredPurchases.reduce((acc, p) => acc + (p.cgstTotal || 0) + (p.sgstTotal || 0) + (p.igstTotal || 0), 0);
        const netGstLiability = gstCollected - gstPaid;

        // 2. Sales vs Purchase Trend (Line Chart Series)
        const trendMap = {};
        filteredSales.forEach(s => {
            const date = s.saleDate || '2026-08-28';
            if (!trendMap[date]) trendMap[date] = { sales: 0, purchases: 0 };
            trendMap[date].sales += s.grandTotal || 0;
        });
        filteredPurchases.forEach(p => {
            const date = (p.orderDate || '2026-08-28').split('T')[0];
            if (!trendMap[date]) trendMap[date] = { sales: 0, purchases: 0 };
            trendMap[date].purchases += p.grandTotal || 0;
        });

        const sortedDates = Object.keys(trendMap).sort();
        const trendLabels = sortedDates.length > 0 ? sortedDates.map(d => ReportFilterService.formatDisplayDate(d)) : ['No Data'];
        const trendSalesData = sortedDates.length > 0 ? sortedDates.map(d => trendMap[d].sales) : [0];
        const trendPurchasesData = sortedDates.length > 0 ? sortedDates.map(d => trendMap[d].purchases) : [0];

        // 3. Variant / Color / Size Performance
        const colorMap = {};
        const sizeMap = {};
        const productMap = {};

        filteredSales.forEach(s => {
            (s.items || []).forEach(item => {
                const color = item.color || 'Standard';
                const size = item.size || 'M';
                const prodName = item.productName || 'Garment';

                colorMap[color] = (colorMap[color] || 0) + (item.quantity || 1);
                sizeMap[size] = (sizeMap[size] || 0) + (item.quantity || 1);
                
                if (!productMap[prodName]) productMap[prodName] = { quantity: 0, revenue: 0 };
                productMap[prodName].quantity += (item.quantity || 1);
                productMap[prodName].revenue += (item.totalAmount || item.sellingRate * item.quantity);
            });
        });

        // 4. Order Status Distribution
        const orderStatusMap = {};
        filteredSales.forEach(s => {
            orderStatusMap[s.status] = (orderStatusMap[s.status] || 0) + 1;
        });

        // 5. Payment Methods Distribution
        const paymentMethodMap = {};
        filteredSales.forEach(s => {
            (s.payments || []).forEach(p => {
                paymentMethodMap[p.paymentMethod] = (paymentMethodMap[p.paymentMethod] || 0) + (p.amount || 0);
            });
        });

        return {
            filters: { preset, startDate, endDate, displayRange: `${ReportFilterService.formatDisplayDate(startDate)} — ${ReportFilterService.formatDisplayDate(endDate)}` },
            kpis: {
                totalSalesRevenue,
                totalSalesFormatted: `₹${totalSalesRevenue.toLocaleString('en-IN')}`,
                totalPurchasesCost,
                totalPurchasesFormatted: `₹${totalPurchasesCost.toLocaleString('en-IN')}`,
                grossProfit,
                grossProfitFormatted: `₹${grossProfit.toLocaleString('en-IN')}`,
                grossMarginPercent: `${grossMarginPercent}%`,
                inventoryValuation,
                inventoryValuationFormatted: `₹${inventoryValuation.toLocaleString('en-IN')}`,
                totalStockUnits,
                lowStockCount,
                outOfStockCount,
                outstandingReceivables,
                outstandingReceivablesFormatted: `₹${outstandingReceivables.toLocaleString('en-IN')}`,
                outstandingPayables,
                outstandingPayablesFormatted: `₹${outstandingPayables.toLocaleString('en-IN')}`,
                totalReturnsValue,
                totalReturnsFormatted: `₹${totalReturnsValue.toLocaleString('en-IN')}`,
                netGstLiability,
                netGstLiabilityFormatted: `₹${Math.abs(netGstLiability).toLocaleString('en-IN')} (${netGstLiability >= 0 ? 'Payable' : 'Credit Balance'})`
            },
            charts: {
                trend: { labels: trendLabels, sales: trendSalesData, purchases: trendPurchasesData },
                colorDistribution: { labels: Object.keys(colorMap), data: Object.values(colorMap) },
                sizeDistribution: { labels: Object.keys(sizeMap), data: Object.values(sizeMap) },
                orderStatus: { labels: Object.keys(orderStatusMap), data: Object.values(orderStatusMap) },
                paymentMethods: { labels: Object.keys(paymentMethodMap), data: Object.values(paymentMethodMap) },
                topProducts: Object.keys(productMap).map(k => ({ name: k, ...productMap[k] })).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
            }
        };
    }

    /**
     * Detailed Sales Report Dataset
     */
    async getSalesReport({ preset = 'this_month', customStart = '', customEnd = '', customerId = '', sortBy = 'newest' } = {}) {
        await this._delay(150);
        const { startDate, endDate } = ReportFilterService.getDateRangeBounds(preset, customStart, customEnd);
        const allSales = salesStore.get(SALES_STORAGE_KEYS.SALES);

        let filtered = allSales.filter(s => s.status !== 'Cancelled' && ReportFilterService.isDateInRange(s.saleDate, startDate, endDate));
        if (customerId) filtered = filtered.filter(s => s.customerId === customerId);

        // Sorting
        if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
        else if (sortBy === 'oldest') filtered.sort((a, b) => new Date(a.saleDate) - new Date(b.saleDate));
        else if (sortBy === 'highest_amount') filtered.sort((a, b) => b.grandTotal - a.grandTotal);

        const totalRevenue = filtered.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
        const totalUnits = filtered.reduce((acc, s) => acc + (s.totalQuantity || 0), 0);
        const totalDiscounts = filtered.reduce((acc, s) => acc + (s.totalItemDiscount || 0) + (s.overallDiscountAmount || 0), 0);
        const totalTax = filtered.reduce((acc, s) => acc + (s.cgstTotal || 0) + (s.sgstTotal || 0) + (s.igstTotal || 0), 0);
        const totalPaid = filtered.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
        const totalBalance = filtered.reduce((acc, s) => acc + (s.balanceAmount || 0), 0);
        const aov = filtered.length > 0 ? (totalRevenue / filtered.length).toFixed(2) : 0;

        // Variant Level Performance Breakdown
        const variantAgg = {};
        filtered.forEach(s => {
            (s.items || []).forEach(item => {
                const k = item.sku || `${item.productName}_${item.color}_${item.size}`;
                if (!variantAgg[k]) {
                    variantAgg[k] = {
                        sku: item.sku || 'SKU-GEN',
                        productName: item.productName,
                        color: item.color,
                        size: item.size,
                        quantitySold: 0,
                        totalRevenue: 0,
                        avgRate: item.sellingRate
                    };
                }
                variantAgg[k].quantitySold += (item.quantity || 1);
                variantAgg[k].totalRevenue += (item.totalAmount || item.sellingRate * item.quantity);
            });
        });

        const variantRows = Object.values(variantAgg).sort((a, b) => b.totalRevenue - a.totalRevenue);

        return {
            filters: { preset, startDate, endDate, displayRange: `${ReportFilterService.formatDisplayDate(startDate)} — ${ReportFilterService.formatDisplayDate(endDate)}` },
            summary: {
                totalRevenue,
                totalRevenueFormatted: `₹${totalRevenue.toLocaleString('en-IN')}`,
                totalOrders: filtered.length,
                totalUnits,
                totalDiscountsFormatted: `₹${totalDiscounts.toLocaleString('en-IN')}`,
                totalTaxFormatted: `₹${totalTax.toLocaleString('en-IN')}`,
                totalPaidFormatted: `₹${totalPaid.toLocaleString('en-IN')}`,
                totalBalanceFormatted: `₹${totalBalance.toLocaleString('en-IN')}`,
                aovFormatted: `₹${parseFloat(aov).toLocaleString('en-IN')}`
            },
            orders: filtered,
            variantPerformance: variantRows
        };
    }

    /**
     * Detailed Purchase Report Dataset
     */
    async getPurchaseReport({ preset = 'this_month', customStart = '', customEnd = '', supplierId = '' } = {}) {
        await this._delay(150);
        const { startDate, endDate } = ReportFilterService.getDateRangeBounds(preset, customStart, customEnd);
        const allPurchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);

        let filtered = allPurchases.filter(p => p.status !== 'Cancelled' && ReportFilterService.isDateInRange((p.orderDate || p.createdAt || '').split('T')[0], startDate, endDate));
        if (supplierId) filtered = filtered.filter(p => p.supplierId === supplierId);

        const totalCost = filtered.reduce((acc, p) => acc + (p.grandTotal || 0), 0);
        const totalUnits = filtered.reduce((acc, p) => acc + (p.totalQuantity || 0), 0);
        const totalTax = filtered.reduce((acc, p) => acc + (p.cgstTotal || 0) + (p.sgstTotal || 0) + (p.igstTotal || 0), 0);
        const totalPaid = filtered.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
        const totalBalance = filtered.reduce((acc, p) => acc + (p.balanceAmount || 0), 0);

        // Supplier ranking
        const supAgg = {};
        filtered.forEach(p => {
            const name = p.supplierName || 'Vendor';
            if (!supAgg[name]) supAgg[name] = { count: 0, totalAmount: 0, paid: 0, balance: 0 };
            supAgg[name].count += 1;
            supAgg[name].totalAmount += (p.grandTotal || 0);
            supAgg[name].paid += (p.paidAmount || 0);
            supAgg[name].balance += (p.balanceAmount || 0);
        });

        const supplierRows = Object.keys(supAgg).map(k => ({ supplierName: k, ...supAgg[k] }));

        return {
            filters: { preset, startDate, endDate, displayRange: `${ReportFilterService.formatDisplayDate(startDate)} — ${ReportFilterService.formatDisplayDate(endDate)}` },
            summary: {
                totalCost,
                totalCostFormatted: `₹${totalCost.toLocaleString('en-IN')}`,
                totalOrders: filtered.length,
                totalUnits,
                totalTaxFormatted: `₹${totalTax.toLocaleString('en-IN')}`,
                totalPaidFormatted: `₹${totalPaid.toLocaleString('en-IN')}`,
                totalBalanceFormatted: `₹${totalBalance.toLocaleString('en-IN')}`
            },
            purchases: filtered,
            supplierSummary: supplierRows
        };
    }

    /**
     * Inventory Valuation & Movement Report Dataset
     */
    async getInventoryReport() {
        await this._delay(150);
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const movements = inventoryStore.get(INVENTORY_STORAGE_KEYS.MOVEMENTS);

        const totalStockUnits = inventory.reduce((acc, i) => acc + (i.currentStock || 0), 0);
        const totalValuation = inventory.reduce((acc, i) => acc + ((i.currentStock || 0) * (i.baseCostPrice || 500)), 0);
        const lowStockItems = inventory.filter(i => (i.currentStock || 0) <= (i.reorderLevel || 10) && (i.currentStock || 0) > 0);
        const outOfStockItems = inventory.filter(i => (i.currentStock || 0) <= 0);

        return {
            summary: {
                totalProductsCount: inventory.length,
                totalStockUnits,
                totalValuationFormatted: `₹${totalValuation.toLocaleString('en-IN')}`,
                lowStockCount: lowStockItems.length,
                outOfStockCount: outOfStockItems.length
            },
            inventory,
            lowStockItems,
            recentMovements: movements.slice(0, 50)
        };
    }

    /**
     * GST Tax Liability & Reversal Report Dataset
     */
    async getGstReport({ preset = 'this_month', customStart = '', customEnd = '' } = {}) {
        await this._delay(150);
        const { startDate, endDate } = ReportFilterService.getDateRangeBounds(preset, customStart, customEnd);

        const sales = salesStore.get(SALES_STORAGE_KEYS.SALES).filter(s => s.status !== 'Cancelled' && ReportFilterService.isDateInRange(s.saleDate, startDate, endDate));
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES).filter(p => p.status !== 'Cancelled' && ReportFilterService.isDateInRange((p.orderDate || p.createdAt || '').split('T')[0], startDate, endDate));
        const returns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS).filter(r => r.status !== 'Cancelled' && ReportFilterService.isDateInRange(r.returnDate, startDate, endDate));

        // Output GST (Sales)
        const salesTaxable = sales.reduce((acc, s) => acc + (s.finalTaxableAmount || 0), 0);
        const outputCGST = sales.reduce((acc, s) => acc + (s.cgstTotal || 0), 0);
        const outputSGST = sales.reduce((acc, s) => acc + (s.sgstTotal || 0), 0);
        const outputIGST = sales.reduce((acc, s) => acc + (s.igstTotal || 0), 0);
        const totalOutputGst = outputCGST + outputSGST + outputIGST;

        // Input GST (Purchases)
        const purchaseTaxable = purchases.reduce((acc, p) => acc + (p.finalTaxableAmount || 0), 0);
        const inputCGST = purchases.reduce((acc, p) => acc + (p.cgstTotal || 0), 0);
        const inputSGST = purchases.reduce((acc, p) => acc + (p.sgstTotal || 0), 0);
        const inputIGST = purchases.reduce((acc, p) => acc + (p.igstTotal || 0), 0);
        const totalInputGst = inputCGST + inputSGST + inputIGST;

        // GST Reversal from Returns
        const returnTaxable = returns.reduce((acc, r) => acc + (r.subtotalTaxable || 0), 0);
        const returnGstReversal = returns.reduce((acc, r) => acc + (r.totalTax || 0), 0);

        const netGstPayable = (totalOutputGst - returnGstReversal) - totalInputGst;

        return {
            filters: { preset, startDate, endDate, displayRange: `${ReportFilterService.formatDisplayDate(startDate)} — ${ReportFilterService.formatDisplayDate(endDate)}` },
            summary: {
                salesTaxable: `₹${salesTaxable.toLocaleString('en-IN')}`,
                outputCGST: `₹${outputCGST.toLocaleString('en-IN')}`,
                outputSGST: `₹${outputSGST.toLocaleString('en-IN')}`,
                outputIGST: `₹${outputIGST.toLocaleString('en-IN')}`,
                totalOutputGst: `₹${totalOutputGst.toLocaleString('en-IN')}`,

                purchaseTaxable: `₹${purchaseTaxable.toLocaleString('en-IN')}`,
                inputCGST: `₹${inputCGST.toLocaleString('en-IN')}`,
                inputSGST: `₹${inputSGST.toLocaleString('en-IN')}`,
                inputIGST: `₹${inputIGST.toLocaleString('en-IN')}`,
                totalInputGst: `₹${totalInputGst.toLocaleString('en-IN')}`,

                returnTaxable: `₹${returnTaxable.toLocaleString('en-IN')}`,
                returnGstReversal: `₹${returnGstReversal.toLocaleString('en-IN')}`,

                netGstPayableFormatted: `₹${Math.abs(netGstPayable).toLocaleString('en-IN')} (${netGstPayable >= 0 ? 'Payable' : 'Input Credit'})`
            },
            salesTransactions: sales,
            purchaseTransactions: purchases
        };
    }

    /**
     * Customer Outstanding Receivables Report Dataset
     */
    async getCustomerReport() {
        await this._delay(150);
        const customers = customerStore.get(CUSTOMER_STORAGE_KEYS.CUSTOMERS);
        const sales = salesStore.get(SALES_STORAGE_KEYS.SALES).filter(s => s.status !== 'Cancelled');

        const rows = customers.map(cust => {
            const custSales = sales.filter(s => s.customerId === cust.id);
            const totalInvoiced = custSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
            const totalPaid = custSales.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
            const balanceDue = custSales.reduce((acc, s) => acc + (s.balanceAmount || 0), 0);

            return {
                id: cust.id,
                customerCode: cust.customerCode,
                name: cust.name,
                customerType: cust.customerType,
                mobile: cust.mobile,
                gstin: cust.gstin || 'Unregistered',
                ordersCount: custSales.length,
                totalInvoiced,
                totalPaid,
                balanceDue,
                creditLimit: cust.creditLimit || 100000,
                creditDays: cust.creditDays || 30
            };
        });

        rows.sort((a, b) => b.balanceDue - a.balanceDue);

        return {
            totalReceivables: rows.reduce((acc, r) => acc + r.balanceDue, 0),
            customers: rows
        };
    }

    /**
     * Returns, Exchanges & Refunds Report Dataset
     */
    async getReturnsReport({ preset = 'this_month', customStart = '', customEnd = '' } = {}) {
        await this._delay(150);
        const { startDate, endDate } = ReportFilterService.getDateRangeBounds(preset, customStart, customEnd);

        const salesReturns = returnStore.get(RETURN_STORAGE_KEYS.RETURNS).filter(r => r.status !== 'Cancelled' && ReportFilterService.isDateInRange(r.returnDate, startDate, endDate));
        const purchaseReturns = purchaseReturnStore.get(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS).filter(r => r.status !== 'Cancelled' && ReportFilterService.isDateInRange(r.returnDate, startDate, endDate));
        const exchanges = exchangeStore.get(EXCHANGE_STORAGE_KEYS.EXCHANGES).filter(e => e.status !== 'Cancelled' && ReportFilterService.isDateInRange(e.exchangeDate, startDate, endDate));

        const totalSalesReturnsValue = salesReturns.reduce((acc, r) => acc + (r.grandTotal || 0), 0);
        const totalPurchaseReturnsValue = purchaseReturns.reduce((acc, r) => acc + (r.grandTotal || 0), 0);
        const totalRefunded = salesReturns.reduce((acc, r) => acc + (r.refundedAmount || 0), 0);

        // Return Reason Distribution
        const reasonMap = {};
        salesReturns.forEach(r => {
            const reason = r.reason || 'Other';
            reasonMap[reason] = (reasonMap[reason] || 0) + 1;
        });

        return {
            filters: { preset, startDate, endDate, displayRange: `${ReportFilterService.formatDisplayDate(startDate)} — ${ReportFilterService.formatDisplayDate(endDate)}` },
            summary: {
                totalSalesReturns: salesReturns.length,
                totalSalesReturnsValueFormatted: `₹${totalSalesReturnsValue.toLocaleString('en-IN')}`,
                totalPurchaseReturns: purchaseReturns.length,
                totalPurchaseReturnsValueFormatted: `₹${totalPurchaseReturnsValue.toLocaleString('en-IN')}`,
                totalExchanges: exchanges.length,
                totalRefundedFormatted: `₹${totalRefunded.toLocaleString('en-IN')}`
            },
            reasonChart: {
                labels: Object.keys(reasonMap),
                data: Object.values(reasonMap)
            },
            salesReturns,
            purchaseReturns,
            exchanges
        };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const reportingService = new ReportingService();
