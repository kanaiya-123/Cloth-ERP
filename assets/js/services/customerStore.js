// CLOTHERP - Centralized Customer Data Store & Initial Seeds
export const CUSTOMER_STORAGE_KEYS = {
    CUSTOMERS: 'clotherp_customers'
};

const INITIAL_CUSTOMERS = [
    {
        id: 'cust_201',
        customerCode: 'CUST-0001',
        name: 'Royal Fashion Boutique',
        contactPerson: 'Anjali Sharma',
        mobile: '+91 98200 11223',
        email: 'royalfashion.mum@example.com',
        gstin: '27AABCR1234F1Z6',
        pan: 'AABCR1234F',
        customerType: 'Retail',
        status: 'Active',
        paymentTerms: 'Net 15 Days',
        creditLimit: 150000,
        creditDays: 15,
        defaultPaymentMethod: 'UPI',
        billingAddress: {
            addressLine1: 'Shop 14, Oberoi Shopping Arcade, Linking Road',
            addressLine2: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincode: '400050'
        },
        shippingAddress: {
            sameAsBilling: true,
            addressLine1: 'Shop 14, Oberoi Shopping Arcade, Linking Road',
            addressLine2: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincode: '400050'
        },
        createdOn: '2026-08-01',
        notes: 'High volume designer boutique in Mumbai.'
    },
    {
        id: 'cust_202',
        customerCode: 'CUST-0002',
        name: 'Vibrant Threads Wholesale',
        contactPerson: 'Karan Mehra',
        mobile: '+91 98110 44556',
        email: 'orders@vibrantthreads.example.com',
        gstin: '07AAACV9876E1Z2',
        pan: 'AAACV9876E',
        customerType: 'Wholesale',
        status: 'Active',
        paymentTerms: 'Net 30 Days',
        creditLimit: 500000,
        creditDays: 30,
        defaultPaymentMethod: 'Bank Transfer',
        billingAddress: {
            addressLine1: '45/B, Gandhi Nagar Garment Hub',
            addressLine2: 'Main Market',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            pincode: '110031'
        },
        shippingAddress: {
            sameAsBilling: true,
            addressLine1: '45/B, Gandhi Nagar Garment Hub',
            addressLine2: 'Main Market',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            pincode: '110031'
        },
        createdOn: '2026-08-05',
        notes: 'Inter-state wholesale distributor for North India (IGST).'
    },
    {
        id: 'cust_203',
        customerCode: 'CUST-0003',
        name: 'Priya Sarees & Ethnic Hub',
        contactPerson: 'Priya Sundaram',
        mobile: '+91 94440 77889',
        email: 'priya.sarees@example.com',
        gstin: '33AABCP5678D1Z9',
        pan: 'AABCP5678D',
        customerType: 'Business',
        status: 'Active',
        paymentTerms: 'Net 30 Days',
        creditLimit: 300000,
        creditDays: 30,
        defaultPaymentMethod: 'Bank Transfer',
        billingAddress: {
            addressLine1: '78, Ranganathan Street, T. Nagar',
            addressLine2: 'Near Bus Stand',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600017'
        },
        shippingAddress: {
            sameAsBilling: true,
            addressLine1: '78, Ranganathan Street, T. Nagar',
            addressLine2: 'Near Bus Stand',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600017'
        },
        createdOn: '2026-08-10',
        notes: 'South India ethnic wear distributor.'
    },
    {
        id: 'cust_204',
        customerCode: 'CUST-0004',
        name: 'StyleHub Garment Mall',
        contactPerson: 'Vikram Joshi',
        mobile: '+91 98220 99887',
        email: 'vikram@stylehub.example.com',
        gstin: '27AABCS3322B1Z1',
        pan: 'AABCS3322B',
        customerType: 'Retail',
        status: 'Active',
        paymentTerms: 'Immediate / COD',
        creditLimit: 50000,
        creditDays: 0,
        defaultPaymentMethod: 'Cash',
        billingAddress: {
            addressLine1: '102, F.C. Road',
            addressLine2: 'Shivajinagar',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            pincode: '411005'
        },
        shippingAddress: {
            sameAsBilling: true,
            addressLine1: '102, F.C. Road',
            addressLine2: 'Shivajinagar',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            pincode: '411005'
        },
        createdOn: '2026-08-15',
        notes: 'Local multi-brand showroom.'
    }
];

class CustomerStore {
    constructor() {
        this._initStore();
    }

    _initStore() {
        if (!localStorage.getItem(CUSTOMER_STORAGE_KEYS.CUSTOMERS)) {
            localStorage.setItem(CUSTOMER_STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[CustomerStore] Error loading key: ${key}`, e);
            return [];
        }
    }

    set(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(`[CustomerStore] Error saving key: ${key}`, e);
        }
    }

    resetToDefault() {
        localStorage.setItem(CUSTOMER_STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
}

export const customerStore = new CustomerStore();
