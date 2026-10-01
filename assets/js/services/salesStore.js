// CLOTHERP - Centralized Sales Orders & Invoices Data Store & Initial Seeds
export const SALES_STORAGE_KEYS = {
    SALES: 'clotherp_sales'
};

const INITIAL_SALES = [
    {
        id: 'sal_301',
        saleNumber: 'SAL-000001',
        invoiceNumber: 'INV-000001',
        referenceNumber: 'SO-MUM-881',
        customerId: 'cust_201',
        customerName: 'Royal Fashion Boutique',
        customerType: 'Retail',
        customerMobile: '+91 98200 11223',
        customerGstin: '27AABCR1234F1Z6',
        customerState: 'Maharashtra',
        saleDate: '2026-08-26',
        expectedDeliveryDate: '2026-08-28',
        status: 'Delivered',
        paymentStatus: 'Paid',
        inventoryDeducted: true,
        isSameState: true,
        notes: 'Priority express delivery to Bandra store.',

        items: [
            {
                id: 'sitem_301_1',
                productId: 'prod_1',
                productName: 'Royal Oxford Cotton Shirt',
                productVariantId: 'var_1_1',
                variantName: 'Navy Blue / M',
                color: 'Navy Blue',
                size: 'M',
                sku: 'SHIRT-OXF-NVY-M',
                barcode: '8901234500011',
                quantity: 15,
                sellingRate: 1499,
                discountType: 'percent',
                discountVal: 5,
                discountAmount: 1124.25,
                taxableAmount: 21360.75,
                gstRate: 5,
                cgstRate: 2.5,
                cgstAmount: 534.02,
                sgstRate: 2.5,
                sgstAmount: 534.02,
                igstRate: 0,
                igstAmount: 0,
                totalAmount: 22428.79
            },
            {
                id: 'sitem_301_2',
                productId: 'prod_2',
                productName: 'Raw Silk Festive Kurti',
                productVariantId: 'var_2_1',
                variantName: 'Mustard Gold / S',
                color: 'Mustard Gold',
                size: 'S',
                sku: 'KURTI-SLK-MST-S',
                barcode: '8901234500021',
                quantity: 10,
                sellingRate: 2299,
                discountType: 'percent',
                discountVal: 0,
                discountAmount: 0,
                taxableAmount: 22990,
                gstRate: 12,
                cgstRate: 6,
                cgstAmount: 1379.4,
                sgstRate: 6,
                sgstAmount: 1379.4,
                igstRate: 0,
                igstAmount: 0,
                totalAmount: 25748.8
            }
        ],

        totalGross: 45475,
        totalItemDiscount: 1124.25,
        subtotalTaxable: 44350.75,
        overallDiscountType: 'percent',
        overallDiscountVal: 0,
        overallDiscountAmount: 0,
        finalTaxableAmount: 44350.75,
        cgstTotal: 1913.42,
        sgstTotal: 1913.42,
        igstTotal: 0,
        totalTax: 3826.84,
        grandTotal: 48177.59,
        paidAmount: 48177.59,
        balanceAmount: 0,
        totalQuantity: 25,

        delivery: {
            method: 'Local Delivery',
            contactPerson: 'Anjali Sharma',
            contactMobile: '+91 98200 11223',
            shippingAddress: {
                addressLine1: 'Shop 14, Oberoi Shopping Arcade, Linking Road',
                addressLine2: 'Bandra West',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400050'
            },
            trackingReference: 'DEL-MUM-9921',
            notes: 'Handed over directly to store manager.'
        },

        payments: [
            {
                id: 'spay_1',
                paymentDate: '2026-08-26',
                amount: 48177.59,
                paymentMethod: 'UPI',
                referenceNumber: 'UPI-982347102',
                recordedBy: 'Sales Staff',
                notes: 'Full payment cleared via QR code'
            }
        ],

        trackingTimeline: [
            {
                date: '2026-08-26',
                time: '10:00 AM',
                user: 'Sales Staff',
                status: 'Draft',
                title: 'Sale Order Draft Created',
                notes: 'Order initiated for 25 units.'
            },
            {
                date: '2026-08-26',
                time: '10:15 AM',
                user: 'Sales Staff',
                status: 'Confirmed',
                title: 'Order Confirmed & Stock Deducted',
                notes: 'Inventory deducted automatically from central warehouse.'
            },
            {
                date: '2026-08-26',
                time: '01:30 PM',
                user: 'Manager',
                status: 'Processing',
                title: 'Order Picked & Quality Checked',
                notes: 'Garment tags verified.'
            },
            {
                date: '2026-08-27',
                time: '10:00 AM',
                user: 'Manager',
                status: 'Dispatched',
                title: 'Dispatched via City Van',
                notes: 'Ref: DEL-MUM-9921'
            },
            {
                date: '2026-08-27',
                time: '03:45 PM',
                user: 'Delivery Exec',
                status: 'Delivered',
                title: 'Delivered to Boutique',
                notes: 'Signature received from Anjali Sharma.'
            }
        ],

        activity: [
            {
                time: '26/08/2026 10:00 AM',
                user: 'Sales Staff',
                action: 'Created Sale Order SAL-000001 (INV-000001)'
            },
            {
                time: '26/08/2026 10:15 AM',
                user: 'Sales Staff',
                action: 'Confirmed order and deducted 25 units from warehouse'
            },
            {
                time: '27/08/2026 03:45 PM',
                user: 'Delivery Exec',
                action: 'Marked order as Delivered'
            }
        ]
    },
    {
        id: 'sal_302',
        saleNumber: 'SAL-000002',
        invoiceNumber: 'INV-000002',
        referenceNumber: 'VT-PO-2026-99',
        customerId: 'cust_202',
        customerName: 'Vibrant Threads Wholesale',
        customerType: 'Wholesale',
        customerMobile: '+91 98110 44556',
        customerGstin: '07AAACV9876E1Z2',
        customerState: 'Delhi',
        saleDate: '2026-08-28',
        expectedDeliveryDate: '2026-09-02',
        status: 'In Transit',
        paymentStatus: 'Partial',
        inventoryDeducted: true,
        isSameState: false, // Inter-state IGST
        notes: 'Bulk consignment for Delhi North wholesale hub.',

        items: [
            {
                id: 'sitem_302_1',
                productId: 'prod_3',
                productName: 'Denim Indigo Slim Stretch Jeans',
                productVariantId: 'var_3_2',
                variantName: 'Indigo / 32',
                color: 'Indigo',
                size: '32',
                sku: 'JEAN-DNM-IND-32',
                barcode: '8901234500032',
                quantity: 20,
                sellingRate: 1899,
                discountType: 'percent',
                discountVal: 10,
                discountAmount: 3798,
                taxableAmount: 34182,
                gstRate: 5,
                cgstRate: 0,
                cgstAmount: 0,
                sgstRate: 0,
                sgstAmount: 0,
                igstRate: 5,
                igstAmount: 1709.1,
                totalAmount: 35891.1
            }
        ],

        totalGross: 37980,
        totalItemDiscount: 3798,
        subtotalTaxable: 34182,
        overallDiscountType: 'percent',
        overallDiscountVal: 0,
        overallDiscountAmount: 0,
        finalTaxableAmount: 34182,
        cgstTotal: 0,
        sgstTotal: 0,
        igstTotal: 1709.1,
        totalTax: 1709.1,
        grandTotal: 35891.1,
        paidAmount: 15000,
        balanceAmount: 20891.1,
        totalQuantity: 20,

        delivery: {
            method: 'Transport',
            contactPerson: 'Karan Mehra',
            contactMobile: '+91 98110 44556',
            shippingAddress: {
                addressLine1: '45/B, Gandhi Nagar Garment Hub',
                addressLine2: 'Main Market',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110031'
            },
            trackingReference: 'LR-DEL-44119',
            notes: 'Dispatch via Navkar Roadlines.'
        },

        payments: [
            {
                id: 'spay_2',
                paymentDate: '2026-08-28',
                amount: 15000,
                paymentMethod: 'Bank Transfer',
                referenceNumber: 'NEFT-88992200',
                recordedBy: 'Sales Staff',
                notes: 'Advance booking deposit'
            }
        ],

        trackingTimeline: [
            {
                date: '2026-08-28',
                time: '11:00 AM',
                user: 'Sales Staff',
                status: 'Confirmed',
                title: 'Wholesale Order Confirmed',
                notes: 'Inventory deducted: 20 pcs Denim Indigo 32.'
            },
            {
                date: '2026-08-28',
                time: '04:00 PM',
                user: 'Manager',
                status: 'Dispatched',
                title: 'Dispatched via Navkar Express',
                notes: 'LR: LR-DEL-44119'
            },
            {
                date: '2026-08-29',
                time: '08:30 AM',
                user: 'Transport Desk',
                status: 'In Transit',
                title: 'In Transit to Delhi NCR Hub',
                notes: 'Vehicle en route on Western Highway.'
            }
        ],

        activity: [
            {
                time: '28/08/2026 11:00 AM',
                user: 'Sales Staff',
                action: 'Created and Confirmed Sale SAL-000002 for Vibrant Threads Wholesale'
            },
            {
                time: '28/08/2026 11:15 AM',
                user: 'Sales Staff',
                action: 'Recorded advance payment of ₹15,000 via Bank Transfer'
            }
        ]
    }
];

class SalesStore {
    constructor() {
        this._initStore();
    }

    _initStore() {
        if (!localStorage.getItem(SALES_STORAGE_KEYS.SALES)) {
            localStorage.setItem(SALES_STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[SalesStore] Error loading key: ${key}`, e);
            return [];
        }
    }

    set(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(`[SalesStore] Error saving key: ${key}`, e);
        }
    }

    resetToDefault() {
        localStorage.setItem(SALES_STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    }
}

export const salesStore = new SalesStore();
