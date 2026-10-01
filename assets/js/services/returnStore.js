// CLOTHERP - Centralized Sales Returns, Refunds & Credit Notes Data Store
export const RETURN_STORAGE_KEYS = {
    RETURNS: 'clotherp_sales_returns',
    REFUNDS: 'clotherp_refunds',
    CREDIT_NOTES: 'clotherp_credit_notes'
};

const INITIAL_RETURNS = [
    {
        id: 'ret_401',
        returnNumber: 'RET-000001',
        saleId: 'sal_301',
        saleNumber: 'SAL-000001',
        invoiceNumber: 'INV-000001',
        customerId: 'cust_201',
        customerName: 'Royal Fashion Boutique',
        customerMobile: '+91 98200 11223',
        customerGstin: '27AABCR1234F1Z6',
        customerState: 'Maharashtra',
        returnDate: '2026-08-28',
        returnType: 'Partial Return',
        status: 'Completed',
        refundStatus: 'Completed',
        inventoryProcessed: true,
        isSameState: true,
        reason: 'Wrong Size',
        notes: 'Customer ordered size M instead of L.',

        items: [
            {
                id: 'ritem_401_1',
                saleItemId: 'sitem_301_1',
                productId: 'prod_1',
                productName: 'Royal Oxford Cotton Shirt',
                productVariantId: 'var_1_1',
                variantName: 'Navy Blue / M',
                color: 'Navy Blue',
                size: 'M',
                sku: 'SHIRT-OXF-NVY-M',
                soldQuantity: 15,
                returnQuantity: 2,
                sellingRate: 1499,
                discountVal: 5,
                taxableAmount: 2848.1,
                gstRate: 5,
                cgstAmount: 71.2,
                sgstAmount: 71.2,
                igstAmount: 0,
                totalAmount: 2990.5,
                condition: 'Resalable',
                receivedQuantity: 2,
                inspectionStatus: 'Approved'
            }
        ],

        totalReturnGross: 2998,
        totalReturnDiscount: 149.9,
        subtotalTaxable: 2848.1,
        cgstTotal: 71.2,
        sgstTotal: 71.2,
        igstTotal: 0,
        totalTax: 142.4,
        grandTotal: 2990.5,
        refundedAmount: 2990.5,
        refundBalance: 0,
        totalQuantity: 2,

        inspection: {
            status: 'Approved',
            result: 'Resalable',
            inspectedBy: 'Quality Desk',
            inspectionDate: '2026-08-28',
            notes: 'Unworn, original tag and fold packaging intact.'
        },

        refund: {
            status: 'Completed',
            method: 'Credit Note',
            creditNoteNumber: 'CN-000001',
            amount: 2990.5,
            processedDate: '2026-08-28',
            processedBy: 'Sales Staff'
        },

        trackingTimeline: [
            {
                date: '2026-08-28',
                time: '11:00 AM',
                user: 'Sales Staff',
                status: 'Requested',
                title: 'Sales Return Requested',
                notes: 'Return requested for 2 pcs Oxford Shirt (Size M).'
            },
            {
                date: '2026-08-28',
                time: '11:30 AM',
                user: 'Manager',
                status: 'Approved',
                title: 'Return Request Approved',
                notes: 'Approved return for in-store physical drop.'
            },
            {
                date: '2026-08-28',
                time: '02:00 PM',
                user: 'Store Exec',
                status: 'Item Received',
                title: 'Garments Received at Counter',
                notes: 'Received 2 units in pristine condition.'
            },
            {
                date: '2026-08-28',
                time: '02:15 PM',
                user: 'Warehouse Desk',
                status: 'Inspected',
                title: 'Inspection Completed (Resalable)',
                notes: 'Restored 2 units back to available sellable inventory.'
            },
            {
                date: '2026-08-28',
                time: '02:30 PM',
                user: 'Sales Staff',
                status: 'Completed',
                title: 'Credit Note CN-000001 Issued',
                notes: 'Settled full return amount of ₹2,990.50 via Credit Note.'
            }
        ],

        activity: [
            {
                time: '28/08/2026 11:00 AM',
                user: 'Sales Staff',
                action: 'Initiated Return RET-000001 for SAL-000001'
            },
            {
                time: '28/08/2026 02:15 PM',
                user: 'Warehouse Desk',
                action: 'Restored 2 pcs into sellable stock (Movement SALE_RETURN)'
            },
            {
                time: '28/08/2026 02:30 PM',
                user: 'Sales Staff',
                action: 'Generated Credit Note CN-000001'
            }
        ]
    }
];

const INITIAL_CREDIT_NOTES = [
    {
        id: 'cn_501',
        creditNoteNumber: 'CN-000001',
        returnId: 'ret_401',
        returnNumber: 'RET-000001',
        saleNumber: 'SAL-000001',
        customerId: 'cust_201',
        customerName: 'Royal Fashion Boutique',
        customerGstin: '27AABCR1234F1Z6',
        amount: 2990.5,
        taxAdjustment: 142.4,
        reason: 'Sales Return: Wrong Size (RET-000001)',
        status: 'Issued',
        issueDate: '2026-08-28',
        createdBy: 'Sales Staff'
    }
];

class ReturnStore {
    constructor() {
        this._initStore();
    }

    _initStore() {
        if (!localStorage.getItem(RETURN_STORAGE_KEYS.RETURNS)) {
            localStorage.setItem(RETURN_STORAGE_KEYS.RETURNS, JSON.stringify(INITIAL_RETURNS));
        }
        if (!localStorage.getItem(RETURN_STORAGE_KEYS.CREDIT_NOTES)) {
            localStorage.setItem(RETURN_STORAGE_KEYS.CREDIT_NOTES, JSON.stringify(INITIAL_CREDIT_NOTES));
        }
        if (!localStorage.getItem(RETURN_STORAGE_KEYS.REFUNDS)) {
            localStorage.setItem(RETURN_STORAGE_KEYS.REFUNDS, JSON.stringify([]));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[ReturnStore] Error loading key: ${key}`, e);
            return [];
        }
    }

    set(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(`[ReturnStore] Error saving key: ${key}`, e);
        }
    }

    resetToDefault() {
        localStorage.setItem(RETURN_STORAGE_KEYS.RETURNS, JSON.stringify(INITIAL_RETURNS));
        localStorage.setItem(RETURN_STORAGE_KEYS.CREDIT_NOTES, JSON.stringify(INITIAL_CREDIT_NOTES));
        localStorage.setItem(RETURN_STORAGE_KEYS.REFUNDS, JSON.stringify([]));
    }
}

export const returnStore = new ReturnStore();
