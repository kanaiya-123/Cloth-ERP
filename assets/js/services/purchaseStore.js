// CLOTHERP - Centralized Persistent Purchase Orders Data Store

const PURCHASE_STORAGE_KEYS = {
    PURCHASES: 'clotherp_purchases_db',
    PAYMENTS: 'clotherp_purchase_payments_db',
    SHIPMENTS: 'clotherp_purchase_shipments_db',
    RECEIPTS: 'clotherp_purchase_receipts_db'
};

const DEFAULT_PURCHASES = [
    {
        id: 'pur_1001',
        purchaseNumber: 'PUR-000001',
        referenceNumber: 'PO/SUR/2026/89',
        supplierId: 'sup_101',
        supplierName: 'Surat Silk & Rayon Mills Ltd.',
        supplierGstin: '24AAACS1234F1Z5',
        supplierState: 'Gujarat',
        purchaseDate: '2026-08-18',
        expectedDeliveryDate: '2026-08-25',
        status: 'Received', // Draft | Confirmed | Ordered | Packed | Dispatched | In Transit | Partially Received | Received | Cancelled
        paymentStatus: 'Paid', // Unpaid | Partial | Paid | Overdue
        shipmentStatus: 'Delivered', // Not Shipped | Packed | Dispatched | In Transit | Partially Received | Delivered
        notes: 'Pre-festive season delivery batch',
        
        // Items Array
        items: [
            {
                id: 'pitem_1',
                productId: 'prod_103',
                productName: "Women's Embroidered Silk Kurti",
                productVariantId: 'var_103_1',
                variantName: 'Mustard Yellow / S',
                color: 'Mustard Yellow',
                size: 'S',
                sku: 'KT-SLK-MST-S',
                barcode: '89010301',
                quantity: 40,
                purchaseRate: 950,
                discountType: 'percent',
                discountVal: 5,
                discountAmount: 1900,
                taxableAmount: 36100,
                gstRate: 5,
                cgstRate: 0,
                cgstAmount: 0,
                sgstRate: 0,
                sgstAmount: 0,
                igstRate: 5,
                igstAmount: 1805,
                totalAmount: 37905,
                receivedQuantity: 40
            },
            {
                id: 'pitem_2',
                productId: 'prod_103',
                productName: "Women's Embroidered Silk Kurti",
                productVariantId: 'var_103_2',
                variantName: 'Mustard Yellow / M',
                color: 'Mustard Yellow',
                size: 'M',
                sku: 'KT-SLK-MST-M',
                barcode: '89010302',
                quantity: 50,
                purchaseRate: 950,
                discountType: 'percent',
                discountVal: 5,
                discountAmount: 2375,
                taxableAmount: 45125,
                gstRate: 5,
                cgstRate: 0,
                cgstAmount: 0,
                sgstRate: 0,
                sgstAmount: 0,
                igstRate: 5,
                igstAmount: 2256.25,
                totalAmount: 47381.25,
                receivedQuantity: 50
            }
        ],

        // Financial & GST Totals
        isSameState: false, // Gujarat vs Maharashtra -> IGST
        totalGross: 85500,
        totalItemDiscount: 4275,
        subtotalTaxable: 81225,
        overallDiscountType: 'amount',
        overallDiscountVal: 1225,
        overallDiscountAmount: 1225,
        finalTaxableAmount: 80000,
        cgstTotal: 0,
        sgstTotal: 0,
        igstTotal: 4000,
        totalTax: 4000,
        grandTotal: 84000,
        paidAmount: 84000,
        balanceAmount: 0,
        totalQuantity: 90,
        totalReceivedQuantity: 90,

        // Shipment Details
        shipment: {
            transportName: 'Navkar Roadlines Express',
            lrNumber: 'LR-987456',
            vehicleNumber: 'GJ-05-BX-4321',
            driverName: 'Suresh Parmar',
            driverMobile: '+91 98790 65432',
            dispatchDate: '2026-08-20',
            expectedDeliveryDate: '2026-08-24',
            deliveryDate: '2026-08-24',
            notes: 'Unloaded at Central Bay 1'
        },

        // Tracking Timeline
        trackingTimeline: [
            { date: '2026-08-18', time: '10:00 AM', user: 'Admin', status: 'Draft', title: 'Purchase Created', notes: 'PO generated' },
            { date: '2026-08-18', time: '02:30 PM', user: 'Store Manager', status: 'Confirmed', title: 'Order Confirmed', notes: 'Supplier accepted pricing' },
            { date: '2026-08-19', time: '04:00 PM', user: 'Surat Silk Dispatch', status: 'Packed', title: 'Consignment Packed', notes: 'Bales tagged' },
            { date: '2026-08-20', time: '11:00 AM', user: 'Purchase Staff', status: 'Dispatched', title: 'Dispatched from Surat', notes: 'LR-987456 assigned with Navkar Roadlines' },
            { date: '2026-08-22', time: '06:00 PM', user: 'Purchase Staff', status: 'In Transit', title: 'In Transit via Vapi Hub', notes: 'Crossing toll check' },
            { date: '2026-08-24', time: '02:15 PM', user: 'Store Manager', status: 'Received', title: 'Goods Received & Stock Added', notes: '90 garments inspected & accepted' }
        ],

        // Payments History
        payments: [
            {
                id: 'pay_101',
                paymentDate: '2026-08-24',
                amount: 84000,
                paymentMethod: 'Bank Transfer',
                referenceNumber: 'NEFT-88992211',
                recordedBy: 'Admin',
                notes: 'Full payment cleared post inspection'
            }
        ],

        // Audit Activity
        activity: [
            { time: '2026-08-18 10:00 AM', user: 'Admin', action: 'Created Purchase Order PUR-000001' },
            { time: '2026-08-20 11:00 AM', user: 'Purchase Staff', action: 'Updated LR Number LR-987456' },
            { time: '2026-08-24 02:15 PM', user: 'Store Manager', action: 'Recorded Full Goods Receipt (90 units)' }
        ]
    },
    {
        id: 'pur_1002',
        purchaseNumber: 'PUR-000002',
        referenceNumber: 'PO/LTM/2026/112',
        supplierId: 'sup_102',
        supplierName: 'Loom & Thread Garment Mills',
        supplierGstin: '27AABCL5678R1ZX',
        supplierState: 'Maharashtra', // Intra-state -> CGST + SGST
        purchaseDate: '2026-08-26',
        expectedDeliveryDate: '2026-08-31',
        status: 'In Transit',
        paymentStatus: 'Partial',
        shipmentStatus: 'In Transit',
        notes: 'Men Oxford Shirts restock',
        
        items: [
            {
                id: 'pitem_3',
                productId: 'prod_101',
                productName: "Men's Cotton Oxford Shirt",
                productVariantId: 'var_101_1',
                variantName: 'Black / M',
                color: 'Black',
                size: 'M',
                sku: 'SH-OXF-BLK-M',
                barcode: '89010101',
                quantity: 50,
                purchaseRate: 650,
                discountType: 'percent',
                discountVal: 0,
                discountAmount: 0,
                taxableAmount: 32500,
                gstRate: 5,
                cgstRate: 2.5,
                cgstAmount: 812.5,
                sgstRate: 2.5,
                sgstAmount: 812.5,
                igstRate: 0,
                igstAmount: 0,
                totalAmount: 34125,
                receivedQuantity: 0
            },
            {
                id: 'pitem_4',
                productId: 'prod_101',
                productName: "Men's Cotton Oxford Shirt",
                productVariantId: 'var_101_2',
                variantName: 'Black / L',
                color: 'Black',
                size: 'L',
                sku: 'SH-OXF-BLK-L',
                barcode: '89010102',
                quantity: 40,
                purchaseRate: 650,
                discountType: 'percent',
                discountVal: 0,
                discountAmount: 0,
                taxableAmount: 26000,
                gstRate: 5,
                cgstRate: 2.5,
                cgstAmount: 650,
                sgstRate: 2.5,
                sgstAmount: 650,
                igstRate: 0,
                igstAmount: 0,
                totalAmount: 27300,
                receivedQuantity: 0
            }
        ],

        isSameState: true,
        totalGross: 58500,
        totalItemDiscount: 0,
        subtotalTaxable: 58500,
        overallDiscountType: 'percent',
        overallDiscountVal: 0,
        overallDiscountAmount: 0,
        finalTaxableAmount: 58500,
        cgstTotal: 1462.5,
        sgstTotal: 1462.5,
        igstTotal: 0,
        totalTax: 2925,
        grandTotal: 61425,
        paidAmount: 25000,
        balanceAmount: 36425,
        totalQuantity: 90,
        totalReceivedQuantity: 0,

        shipment: {
            transportName: 'Mahalaxmi Freight Movers',
            lrNumber: 'LR-789012',
            vehicleNumber: 'MH-04-AB-9876',
            driverName: 'Ramesh Sawant',
            driverMobile: '+91 98200 99887',
            dispatchDate: '2026-08-27',
            expectedDeliveryDate: '2026-08-31',
            notes: 'En route to Thane distribution center'
        },

        trackingTimeline: [
            { date: '2026-08-26', time: '09:15 AM', user: 'Purchase Staff', status: 'Draft', title: 'Purchase Created' },
            { date: '2026-08-26', time: '11:30 AM', user: 'Store Manager', status: 'Confirmed', title: 'Order Confirmed' },
            { date: '2026-08-27', time: '10:00 AM', user: 'Purchase Staff', status: 'Dispatched', title: 'Dispatched from Lower Parel', notes: 'LR-789012 with Mahalaxmi Freight' },
            { date: '2026-08-28', time: '03:00 PM', user: 'Purchase Staff', status: 'In Transit', title: 'In Transit', notes: 'Delivery scheduled for tomorrow' }
        ],

        payments: [
            {
                id: 'pay_102',
                paymentDate: '2026-08-26',
                amount: 25000,
                paymentMethod: 'Bank Transfer',
                referenceNumber: 'TXN-55443322',
                recordedBy: 'Store Manager',
                notes: 'Advance booking payment'
            }
        ],

        activity: [
            { time: '2026-08-26 09:15 AM', user: 'Purchase Staff', action: 'Created Purchase Order PUR-000002' },
            { time: '2026-08-26 02:00 PM', user: 'Store Manager', action: 'Recorded partial advance payment of ₹25,000' },
            { time: '2026-08-27 10:00 AM', user: 'Purchase Staff', action: 'Updated consignment status to In Transit (LR-789012)' }
        ]
    },
    {
        id: 'pur_1003',
        purchaseNumber: 'PUR-000003',
        referenceNumber: 'PO/TKC/2026/044',
        supplierId: 'sup_103',
        supplierName: 'Tirupur Knitwear & Cotton Corp',
        supplierGstin: '33AABCT9988P1Z0',
        supplierState: 'Tamil Nadu',
        purchaseDate: '2026-08-28',
        expectedDeliveryDate: '2026-09-04',
        status: 'Confirmed',
        paymentStatus: 'Unpaid',
        shipmentStatus: 'Not Shipped',
        notes: 'Classic Polo pique consignment',
        
        items: [
            {
                id: 'pitem_5',
                productId: 'prod_104',
                productName: 'Classic Polo Pique T-Shirt',
                productVariantId: 'var_104_1',
                variantName: 'Emerald Green / M',
                color: 'Emerald Green',
                size: 'M',
                sku: 'TS-POL-GRN-M',
                barcode: '89010401',
                quantity: 60,
                purchaseRate: 380,
                discountType: 'percent',
                discountVal: 0,
                discountAmount: 0,
                taxableAmount: 22800,
                gstRate: 5,
                cgstRate: 0,
                cgstAmount: 0,
                sgstRate: 0,
                sgstAmount: 0,
                igstRate: 5,
                igstAmount: 1140,
                totalAmount: 23940,
                receivedQuantity: 0
            }
        ],

        isSameState: false,
        totalGross: 22800,
        totalItemDiscount: 0,
        subtotalTaxable: 22800,
        overallDiscountType: 'percent',
        overallDiscountVal: 0,
        overallDiscountAmount: 0,
        finalTaxableAmount: 22800,
        cgstTotal: 0,
        sgstTotal: 0,
        igstTotal: 1140,
        totalTax: 1140,
        grandTotal: 23940,
        paidAmount: 0,
        balanceAmount: 23940,
        totalQuantity: 60,
        totalReceivedQuantity: 0,

        shipment: {
            transportName: '',
            lrNumber: '',
            vehicleNumber: '',
            driverName: '',
            driverMobile: '',
            dispatchDate: '',
            expectedDeliveryDate: '2026-09-04',
            notes: 'Awaiting packing at mill'
        },

        trackingTimeline: [
            { date: '2026-08-28', time: '11:00 AM', user: 'Purchase Staff', status: 'Draft', title: 'Purchase Created' },
            { date: '2026-08-28', time: '03:30 PM', user: 'Admin', status: 'Confirmed', title: 'Order Confirmed' }
        ],

        payments: [],
        activity: [
            { time: '2026-08-28 11:00 AM', user: 'Purchase Staff', action: 'Created Purchase Order PUR-000003' },
            { time: '2026-08-28 03:30 PM', user: 'Admin', action: 'Approved and Confirmed PO' }
        ]
    }
];

class PurchaseStore {
    constructor() {
        this._initStore();
    }

    _initStore() {
        if (!localStorage.getItem(PURCHASE_STORAGE_KEYS.PURCHASES)) {
            localStorage.setItem(PURCHASE_STORAGE_KEYS.PURCHASES, JSON.stringify(DEFAULT_PURCHASES));
        }
    }

    get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error(`Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving ${key}:`, e);
        }
    }
}

export const purchaseStore = new PurchaseStore();
export { PURCHASE_STORAGE_KEYS };
