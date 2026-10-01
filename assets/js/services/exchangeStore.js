// CLOTHERP - Centralized Product Exchanges Data Store
export const EXCHANGE_STORAGE_KEYS = {
    EXCHANGES: 'clotherp_exchanges'
};

const INITIAL_EXCHANGES = [
    {
        id: 'exc_601',
        exchangeNumber: 'EXC-000001',
        saleId: 'sal_301',
        saleNumber: 'SAL-000001',
        invoiceNumber: 'INV-000001',
        customerId: 'cust_201',
        customerName: 'Royal Fashion Boutique',
        customerMobile: '+91 98200 11223',
        customerGstin: '27AABCR1234F1Z6',
        exchangeDate: '2026-08-28',
        status: 'Completed',
        inventoryProcessed: true,
        reason: 'Wrong Color / Preference',
        notes: 'Customer exchanged 1 Navy Blue shirt for 1 Classic White shirt in size L.',

        returnedItem: {
            productId: 'prod_1',
            productName: 'Royal Oxford Cotton Shirt',
            productVariantId: 'var_1_1',
            variantName: 'Navy Blue / M',
            color: 'Navy Blue',
            size: 'M',
            sku: 'SHIRT-OXF-NVY-M',
            quantity: 1,
            originalRate: 1499,
            discountVal: 5,
            unitValue: 1495.25,
            condition: 'Resalable'
        },

        replacementItem: {
            productId: 'prod_1',
            productName: 'Royal Oxford Cotton Shirt',
            productVariantId: 'var_1_3',
            variantName: 'Classic White / L',
            color: 'Classic White',
            size: 'L',
            sku: 'SHIRT-OXF-WHT-L',
            quantity: 1,
            sellingRate: 1499,
            discountVal: 0,
            unitValue: 1573.95
        },

        returnValue: 1495.25,
        replacementValue: 1573.95,
        priceDifference: 78.7,
        paymentAdjustmentType: 'Customer Paid',
        paymentMethod: 'UPI',
        paymentReference: 'UPI-EXC-9921',
        paymentStatus: 'Paid',

        trackingTimeline: [
            {
                date: '2026-08-28',
                time: '03:00 PM',
                user: 'Sales Staff',
                status: 'Requested',
                title: 'Exchange Order Initiated',
                notes: 'Exchange requested: Navy M -> White L.'
            },
            {
                date: '2026-08-28',
                time: '03:15 PM',
                user: 'Manager',
                status: 'Approved',
                title: 'Exchange Approved',
                notes: 'Stock verified for Classic White / L.'
            },
            {
                date: '2026-08-28',
                time: '03:30 PM',
                user: 'Warehouse Desk',
                status: 'Completed',
                title: 'Dual Stock Movements Recorded',
                notes: 'Restored 1 Navy M (IN) and dispatched 1 White L (OUT).'
            }
        ],

        activity: [
            {
                time: '28/08/2026 03:00 PM',
                user: 'Sales Staff',
                action: 'Created Exchange EXC-000001'
            },
            {
                time: '28/08/2026 03:30 PM',
                user: 'Warehouse Desk',
                action: 'Executed Exchange Inventory Movements (IN + OUT)'
            }
        ]
    }
];

class ExchangeStore {
    constructor() {
        this._initStore();
    }

    _initStore() {
        if (!localStorage.getItem(EXCHANGE_STORAGE_KEYS.EXCHANGES)) {
            localStorage.setItem(EXCHANGE_STORAGE_KEYS.EXCHANGES, JSON.stringify(INITIAL_EXCHANGES));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[ExchangeStore] Error loading key: ${key}`, e);
            return [];
        }
    }

    set(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(`[ExchangeStore] Error saving key: ${key}`, e);
        }
    }

    resetToDefault() {
        localStorage.setItem(EXCHANGE_STORAGE_KEYS.EXCHANGES, JSON.stringify(INITIAL_EXCHANGES));
    }
}

export const exchangeStore = new ExchangeStore();
