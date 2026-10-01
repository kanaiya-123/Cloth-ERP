// CLOTHERP - Centralized Purchase Returns & Supplier Debit Notes Data Store
export const PURCHASE_RETURN_STORAGE_KEYS = {
    PURCHASE_RETURNS: 'clotherp_purchase_returns',
    DEBIT_NOTES: 'clotherp_debit_notes'
};

const INITIAL_PURCHASE_RETURNS = [
    {
        id: 'pret_701',
        purchaseReturnNumber: 'PRET-000001',
        purchaseId: 'po_101',
        purchaseNumber: 'PO-000001',
        supplierId: 'sup_1',
        supplierName: 'Vardhman Textiles Ltd.',
        supplierContact: 'Ramesh Sharma (+91 98111 22334)',
        supplierGstin: '03AAACV1234F1Z2',
        supplierState: 'Punjab',
        returnDate: '2026-08-27',
        status: 'Completed',
        inventoryDeducted: true,
        reason: 'Defective Fabric / Weave Flaw',
        notes: 'Returned 5 rolls/units due to color streaking defect from mill batch.',

        items: [
            {
                id: 'pritem_701_1',
                purchaseItemId: 'pitem_101_1',
                productId: 'prod_1',
                productName: 'Royal Oxford Cotton Shirt',
                productVariantId: 'var_1_1',
                variantName: 'Navy Blue / M',
                color: 'Navy Blue',
                size: 'M',
                sku: 'SHIRT-OXF-NVY-M',
                receivedQuantity: 30,
                returnQuantity: 5,
                purchaseRate: 550,
                discountVal: 0,
                taxableAmount: 2750,
                gstRate: 5,
                cgstAmount: 0,
                sgstAmount: 0,
                igstAmount: 137.5,
                totalAmount: 2887.5
            }
        ],

        subtotalTaxable: 2750,
        cgstTotal: 0,
        sgstTotal: 0,
        igstTotal: 137.5,
        totalTax: 137.5,
        grandTotal: 2887.5,
        totalQuantity: 5,

        financialAdjustment: {
            method: 'Debit Note',
            debitNoteNumber: 'DN-000001',
            amount: 2887.5,
            status: 'Issued'
        },

        shipment: {
            transportName: 'VRL Logistics Express',
            lrNumber: 'LR-PUN-88912',
            vehicleNumber: 'MH-04-AZ-4421',
            driverName: 'Sanjay Yadav',
            dispatchDate: '2026-08-27',
            expectedReceiptDate: '2026-08-29',
            notes: 'Consigned back to Ludhiana spinning mill.'
        },

        trackingTimeline: [
            {
                date: '2026-08-27',
                time: '10:00 AM',
                user: 'Purchase Staff',
                status: 'Requested',
                title: 'Purchase Return Initiated',
                notes: 'Return requested for 5 pcs with weave defects.'
            },
            {
                date: '2026-08-27',
                time: '11:30 AM',
                user: 'Manager',
                status: 'Approved',
                title: 'Mill Return Approved',
                notes: 'Vendor accepted debit return claim.'
            },
            {
                date: '2026-08-27',
                time: '03:00 PM',
                user: 'Logistics Desk',
                status: 'Dispatched',
                title: 'Dispatched via VRL Logistics (Stock Deducted)',
                notes: 'LR-PUN-88912 issued. Deducted 5 units from inventory.'
            },
            {
                date: '2026-08-27',
                time: '04:00 PM',
                user: 'Purchase Staff',
                status: 'Completed',
                title: 'Debit Note DN-000001 Issued',
                notes: 'Supplier balance adjusted for ₹2,887.50.'
            }
        ],

        activity: [
            {
                time: '27/08/2026 10:00 AM',
                user: 'Purchase Staff',
                action: 'Created Purchase Return PRET-000001 for PO-000001'
            },
            {
                time: '27/08/2026 03:00 PM',
                user: 'Logistics Desk',
                action: 'Dispatched consignment and deducted 5 units (Movement PURCHASE_RETURN)'
            }
        ]
    }
];

const INITIAL_DEBIT_NOTES = [
    {
        id: 'dn_801',
        debitNoteNumber: 'DN-000001',
        purchaseReturnId: 'pret_701',
        purchaseReturnNumber: 'PRET-000001',
        purchaseNumber: 'PO-000001',
        supplierId: 'sup_1',
        supplierName: 'Vardhman Textiles Ltd.',
        supplierGstin: '03AAACV1234F1Z2',
        amount: 2887.5,
        taxAdjustment: 137.5,
        reason: 'Purchase Return: Defective Fabric (PRET-000001)',
        status: 'Issued',
        issueDate: '2026-08-27',
        createdBy: 'Purchase Staff'
    }
];

class PurchaseReturnStore {
    constructor() {
        this._initStore();
    }

    _initStore() {
        if (!localStorage.getItem(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS)) {
            localStorage.setItem(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS, JSON.stringify(INITIAL_PURCHASE_RETURNS));
        }
        if (!localStorage.getItem(PURCHASE_RETURN_STORAGE_KEYS.DEBIT_NOTES)) {
            localStorage.setItem(PURCHASE_RETURN_STORAGE_KEYS.DEBIT_NOTES, JSON.stringify(INITIAL_DEBIT_NOTES));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[PurchaseReturnStore] Error loading key: ${key}`, e);
            return [];
        }
    }

    set(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(`[PurchaseReturnStore] Error saving key: ${key}`, e);
        }
    }

    resetToDefault() {
        localStorage.setItem(PURCHASE_RETURN_STORAGE_KEYS.PURCHASE_RETURNS, JSON.stringify(INITIAL_PURCHASE_RETURNS));
        localStorage.setItem(PURCHASE_RETURN_STORAGE_KEYS.DEBIT_NOTES, JSON.stringify(INITIAL_DEBIT_NOTES));
    }
}

export const purchaseReturnStore = new PurchaseReturnStore();
