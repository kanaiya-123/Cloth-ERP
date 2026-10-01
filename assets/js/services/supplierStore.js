// CLOTHERP - Centralized Persistent Supplier Data Store

const SUPPLIER_STORAGE_KEYS = {
    SUPPLIERS: 'clotherp_suppliers_db'
};

const DEFAULT_SUPPLIERS = [
    {
        id: 'sup_101',
        code: 'SUP-001',
        name: 'Surat Silk & Rayon Mills Ltd.',
        contactPerson: 'Rajesh Shah',
        mobile: '+91 98251 23456',
        email: 'sales@suratsilk.example.com',
        gstin: '24AAACS1234F1Z5',
        pan: 'AAACS1234F',
        addressLine1: 'Plot 45, GIDC Industrial Estate, Sachin',
        addressLine2: 'Ring Road Textile Hub',
        city: 'Surat',
        state: 'Gujarat',
        country: 'India',
        pincode: '394230',
        paymentTerms: 'Net 30 Days',
        creditDays: 30,
        defaultPaymentMethod: 'Bank Transfer',
        bankDetails: 'HDFC Bank - A/C 50200012345678 - IFSC HDFC0000123',
        status: 'Active',
        createdOn: '2026-08-01',
        notes: 'Primary fabric supplier for Kurtis & Traditional wear'
    },
    {
        id: 'sup_102',
        code: 'SUP-002',
        name: 'Loom & Thread Garment Mills',
        contactPerson: 'Vikram Joshi',
        mobile: '+91 98200 45678',
        email: 'orders@loomthread.example.com',
        gstin: '27AABCL5678R1ZX',
        pan: 'AABCL5678R',
        addressLine1: 'Unit 12, Lower Parel Mill Compound',
        addressLine2: 'Senapati Bapat Marg',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400013',
        paymentTerms: 'Net 15 Days',
        creditDays: 15,
        defaultPaymentMethod: 'Bank Transfer',
        bankDetails: 'ICICI Bank - A/C 001105001234 - IFSC ICIC0000011',
        status: 'Active',
        createdOn: '2026-08-05',
        notes: 'Manufacturer of Oxford Shirts & Linen Garments'
    },
    {
        id: 'sup_103',
        code: 'SUP-003',
        name: 'Tirupur Knitwear & Cotton Corp',
        contactPerson: 'K. Murugan',
        mobile: '+91 94433 78901',
        email: 'murugan@tirupurknit.example.com',
        gstin: '33AABCT9988P1Z0',
        pan: 'AABCT9988P',
        addressLine1: '104, Avinashi Road, Cotton Market',
        addressLine2: 'Opposite New Bus Stand',
        city: 'Tirupur',
        state: 'Tamil Nadu',
        country: 'India',
        pincode: '641602',
        paymentTerms: 'Net 45 Days',
        creditDays: 45,
        defaultPaymentMethod: 'UPI',
        bankDetails: 'Axis Bank - A/C 912020001122 - IFSC UTIB0000456',
        status: 'Active',
        createdOn: '2026-08-10',
        notes: 'Polo pique and cotton t-shirts manufacturing supplier'
    },
    {
        id: 'sup_104',
        code: 'SUP-004',
        name: 'Ahmedabad Denim Works',
        contactPerson: 'Pankaj Patel',
        mobile: '+91 98980 11223',
        email: 'pankaj@ahmedabaddenim.example.com',
        gstin: '24AABCA4433K1ZQ',
        pan: 'AABCA4433K',
        addressLine1: 'Block C, Narol Textile Park',
        addressLine2: 'NH 8 Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        pincode: '382405',
        paymentTerms: 'Net 30 Days',
        creditDays: 30,
        defaultPaymentMethod: 'Bank Transfer',
        bankDetails: 'State Bank of India - A/C 30123456789 - IFSC SBIN0001234',
        status: 'Active',
        createdOn: '2026-08-15',
        notes: 'Stretch and raw selvedge denim supplier'
    }
];

class SupplierStore {
    constructor() {
        this._initStore();
    }

    _initStore() {
        if (!localStorage.getItem(SUPPLIER_STORAGE_KEYS.SUPPLIERS)) {
            localStorage.setItem(SUPPLIER_STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SUPPLIERS));
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

export const supplierStore = new SupplierStore();
export { SUPPLIER_STORAGE_KEYS };
