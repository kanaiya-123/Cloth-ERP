// CLOTHERP - Centralized Dashboard Data Service
// Prepares structured mock data for Phase 3 and documents future ASP.NET Core API endpoints.
import { inventoryService } from './inventoryService.js';
import { purchaseService } from './purchaseService.js';
import { salesService } from './salesService.js';

class DashboardService {
    /**
     * Get Primary & Secondary Dashboard KPI Summary
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch('/api/dashboard/summary');
     * return await response.json();
     */
    async getDashboardSummary() {
        await this._simulateDelay(200);
        const [invMetrics, purRes, salesRes] = await Promise.all([
            inventoryService.getSummaryMetrics(),
            purchaseService.getPurchases({ pageSize: 100 }),
            salesService.getSales({ pageSize: 100 })
        ]);

        const allPurchases = purRes.items || [];
        const todayPurchasesTotal = allPurchases.reduce((acc, p) => acc + (p.grandTotal || 0), 0);
        const totalPendingPayable = allPurchases.reduce((acc, p) => acc + (p.balanceAmount || 0), 0);

        const allSales = salesRes.items || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySalesTotal = allSales.filter(s => s.saleDate === todayStr && s.status !== 'Cancelled').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
        const totalPendingReceivable = allSales.filter(s => s.status !== 'Cancelled').reduce((acc, s) => acc + (s.balanceAmount || 0), 0);

        return {
            primary: {
                todaySales: {
                    value: todaySalesTotal || 84068,
                    formatted: `₹${(todaySalesTotal || 84068).toLocaleString('en-IN')}`,
                    change: '+14.2%',
                    trend: 'up',
                    label: `${allSales.length} Active Sales Orders`
                },
                todayPurchase: {
                    value: todayPurchasesTotal,
                    formatted: `₹${todayPurchasesTotal.toLocaleString('en-IN')}`,
                    subtext: `${allPurchases.length} Purchase Orders recorded`,
                    trend: 'neutral'
                },
                totalStock: {
                    value: invMetrics.totalStockUnits,
                    formatted: invMetrics.totalStockFormatted,
                    subtext: 'Real-time variant balance',
                    trend: 'up'
                },
                todayProfit: {
                    value: 32500,
                    formatted: '₹32,500',
                    change: '+8.2%',
                    subtext: '26% Gross margin',
                    trend: 'up'
                }
            },
            secondary: {
                totalReceivable: {
                    value: totalPendingReceivable,
                    formatted: `₹${totalPendingReceivable.toLocaleString('en-IN')}`,
                    label: 'Outstanding from wholesale/retail'
                },
                totalPayable: {
                    value: totalPendingPayable,
                    formatted: `₹${totalPendingPayable.toLocaleString('en-IN')}`,
                    label: 'Payable to fabric mills'
                },
                lowStockCount: {
                    value: invMetrics.lowStockCount,
                    formatted: invMetrics.lowStockFormatted,
                    label: 'Requires reordering'
                },
                outOfStockCount: {
                    value: invMetrics.outOfStockCount,
                    formatted: invMetrics.outOfStockFormatted,
                    label: 'POs pending fulfillment'
                }
            }
        };
    }

    /**
     * Get Sales Overview Chart Data for different timeframes
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch(`/api/dashboard/sales-overview?period=${period}`);
     * return await response.json();
     * 
     * @param {'7D'|'30D'|'3M'|'1Y'} period 
     */
    async getSalesOverview(period = '7D') {
        await this._simulateDelay(200);

        const dataSets = {
            '7D': {
                labels: ['Mon (23 Aug)', 'Tue (24 Aug)', 'Wed (25 Aug)', 'Thu (26 Aug)', 'Fri (27 Aug)', 'Sat (28 Aug)', 'Sun (29 Aug)'],
                sales: [84000, 92000, 78000, 110000, 134000, 148000, 125000],
                target: [90000, 90000, 90000, 90000, 120000, 120000, 100000]
            },
            '30D': {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                sales: [540000, 680000, 720000, 890000],
                target: [600000, 650000, 700000, 750000]
            },
            '3M': {
                labels: ['June 2026', 'July 2026', 'August 2026'],
                sales: [2450000, 2890000, 3120000],
                target: [2500000, 2700000, 3000000]
            },
            '1Y': {
                labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                sales: [820000, 940000, 1110000, 1080000, 1250000, 1420000, 1680000, 1950000, 1820000, 1500000, 1640000, 2100000],
                target: [800000, 900000, 1000000, 1050000, 1150000, 1300000, 1500000, 1700000, 1700000, 1400000, 1500000, 1900000]
            }
        };

        return dataSets[period] || dataSets['7D'];
    }

    /**
     * Get Sales vs Purchase Comparison Data
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch('/api/dashboard/sales-vs-purchase');
     * return await response.json();
     */
    async getSalesVsPurchase() {
        await this._simulateDelay(200);
        return {
            labels: ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'],
            sales: [28.7, 37.5, 54.5, 52.4],
            purchases: [19.2, 24.8, 36.0, 33.1]
        };
    }

    /**
     * Get Top Selling Clothing Products
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch('/api/dashboard/top-products');
     * return await response.json();
     */
    async getTopProducts() {
        await this._simulateDelay(200);
        return [
            {
                id: 'prod_001',
                name: "Men's Cotton Oxford Shirt",
                variant: 'Black / M',
                sku: 'SH-BLK-M',
                unitsSold: 145,
                revenue: '₹1,16,000',
                growth: '+28%'
            },
            {
                id: 'prod_002',
                name: "Women's Embroidered Kurti",
                variant: 'Red / L',
                sku: 'KT-RED-L',
                unitsSold: 120,
                revenue: '₹96,000',
                growth: '+18%'
            },
            {
                id: 'prod_003',
                name: 'Slim Fit Stretch Jeans',
                variant: 'Blue / 32',
                sku: 'JN-BLU-32',
                unitsSold: 95,
                revenue: '₹1,42,500',
                growth: '+14%'
            },
            {
                id: 'prod_004',
                name: 'Printed Silk Saree',
                variant: 'Emerald Gold',
                sku: 'SR-EMR-01',
                unitsSold: 64,
                revenue: '₹1,28,000',
                growth: '+32%'
            }
        ];
    }

    /**
     * Get Low Stock & Critical Inventory Alerts
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch('/api/dashboard/low-stock');
     * return await response.json();
     */
    async getLowStockItems() {
        await this._simulateDelay(150);
        const res = await inventoryService.getLowStockItems({ page: 1, pageSize: 4 });
        if (res.items && res.items.length > 0) {
            return res.items.map(item => ({
                id: item.id,
                name: item.productName,
                variant: `${item.color} / ${item.size}`,
                sku: item.sku,
                currentStock: item.currentStock,
                reorderLevel: item.lowStockLevel,
                status: item.status,
                severity: item.status === 'Out of Stock' ? 'danger' : item.currentStock <= 2 ? 'danger' : 'warning'
            }));
        }
        return [];
    }

    /**
     * Get Recent Invoices & Counter Sales
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch('/api/dashboard/recent-sales');
     * return await response.json();
     */
    async getRecentSales() {
        await this._simulateDelay(200);
        return [
            {
                invoiceNumber: 'INV-00125',
                customerName: 'Rahul Patel',
                customerType: 'Retail POS',
                amount: '₹2,730',
                status: 'Paid',
                paymentMode: 'UPI',
                time: '10 mins ago'
            },
            {
                invoiceNumber: 'INV-00124',
                customerName: 'Amit Shah Textiles',
                customerType: 'Wholesale B2B',
                amount: '₹5,450',
                status: 'Partial',
                paymentMode: 'Credit',
                time: '35 mins ago'
            },
            {
                invoiceNumber: 'INV-00123',
                customerName: 'Priya Patel',
                customerType: 'Retail POS',
                amount: '₹1,800',
                status: 'Paid',
                paymentMode: 'Card',
                time: '1 hour ago'
            },
            {
                invoiceNumber: 'INV-00122',
                customerName: 'Surat Garment Hub',
                customerType: 'Wholesale B2B',
                amount: '₹24,500',
                status: 'Credit',
                paymentMode: '30-Day Terms',
                time: '2 hours ago'
            }
        ];
    }

    /**
     * Get Freight Shipment Status Overview & Active Consignments
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch('/api/dashboard/shipments');
     * return await response.json();
     */
    async getShipmentOverview() {
        await this._simulateDelay(200);
        return {
            counters: {
                ordered: 8,
                packed: 12,
                dispatched: 15,
                inTransit: 7,
                delivered: 45
            },
            activeShipment: {
                consignmentNumber: 'PUR-00125',
                transporter: 'Shree Transport',
                lrNumber: 'LR123456',
                vehicleNumber: 'GJ01AB1234',
                origin: 'Arvind Mills (Ahmedabad)',
                destination: 'Central Store Hub',
                expectedDate: '30 Aug 2026',
                status: 'In Transit',
                progressPercent: 65
            }
        };
    }

    /**
     * Get Recent Audit & Business Activity Log
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const response = await fetch('/api/dashboard/activity');
     * return await response.json();
     */
    async getRecentActivity() {
        await this._simulateDelay(200);
        return [
            {
                time: '09:15 AM',
                person: 'Amit Patel',
                role: 'Purchase Staff',
                action: 'Created new purchase consignment PUR-00125 from Arvind Mills',
                type: 'purchase'
            },
            {
                time: '11:30 AM',
                person: 'Rakesh Verma',
                role: 'Warehouse Exec',
                action: 'Updated shipment status to Packed & verified 140 pcs Oxford Shirts',
                type: 'inventory'
            },
            {
                time: '02:10 PM',
                person: 'Suresh Singhania',
                role: 'Sales Lead',
                action: 'Created tax invoice INV-00125 with 5% GST split (₹2,730)',
                type: 'sales'
            },
            {
                time: '04:45 PM',
                person: 'Admin',
                role: 'Administrator',
                action: 'Updated GST slab settings for Autumn apparel collection',
                type: 'system'
            }
        ];
    }

    /**
     * Get Notifications List
     */
    async getNotifications() {
        await this._simulateDelay(150);
        return [
            {
                id: 'notif_1',
                title: 'Low Stock Alert',
                message: 'Black Shirt — Size M is running low (3 units remaining).',
                time: '15m ago',
                read: false,
                type: 'warning'
            },
            {
                id: 'notif_2',
                title: 'Payment Due',
                message: '₹5,000 payment is pending from Amit Shah Textiles.',
                time: '1h ago',
                read: false,
                type: 'danger'
            },
            {
                id: 'notif_3',
                title: 'Shipment In Transit',
                message: 'Purchase shipment PUR-00125 dispatched via Shree Transport.',
                time: '3h ago',
                read: true,
                type: 'info'
            }
        ];
    }

    /**
     * Helper to simulate network latency
     * @private
     */
    _simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const dashboardService = new DashboardService();
