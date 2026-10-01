// CLOTHERP - Customer Relationship Management (CRM) Service
import { customerStore, CUSTOMER_STORAGE_KEYS } from './customerStore.js';

class CustomerService {
    /**
     * Get Filtered, Searched & Paginated Customers
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/customers?${params}`);
     * return await res.json();
     */
    async getCustomers({
        page = 1,
        pageSize = 10,
        search = '',
        customerType = '',
        status = '',
        sortBy = 'newest'
    } = {}) {
        await this._delay(150);
        let items = customerStore.get(CUSTOMER_STORAGE_KEYS.CUSTOMERS);

        // Search Filter (Name, Mobile, Email, GSTIN, Code, City)
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter(c => 
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.mobile && c.mobile.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.gstin && c.gstin.toLowerCase().includes(q)) ||
                (c.customerCode && c.customerCode.toLowerCase().includes(q)) ||
                (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
                (c.billingAddress && c.billingAddress.city && c.billingAddress.city.toLowerCase().includes(q))
            );
        }

        if (customerType) items = items.filter(c => c.customerType === customerType);
        if (status) items = items.filter(c => c.status === status);

        // Sorting
        if (sortBy === 'newest') {
            items.sort((a, b) => new Date(b.createdOn || 0) - new Date(a.createdOn || 0));
        } else if (sortBy === 'oldest') {
            items.sort((a, b) => new Date(a.createdOn || 0) - new Date(b.createdOn || 0));
        } else if (sortBy === 'name_asc') {
            items.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name_desc') {
            items.sort((a, b) => b.name.localeCompare(a.name));
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        const allCustomers = customerStore.get(CUSTOMER_STORAGE_KEYS.CUSTOMERS);
        const activeCount = allCustomers.filter(c => c.status === 'Active').length;
        const wholesaleCount = allCustomers.filter(c => c.customerType === 'Wholesale' || c.customerType === 'Business').length;

        return {
            items: paginated,
            pagination: { page, pageSize, totalItems, totalPages },
            totalCustomers: allCustomers.length,
            activeCustomers: activeCount,
            wholesaleCustomers: wholesaleCount
        };
    }

    /**
     * Get Customer by ID or Customer Code
     */
    async getCustomerById(id) {
        await this._delay(100);
        const customers = customerStore.get(CUSTOMER_STORAGE_KEYS.CUSTOMERS);
        return customers.find(c => c.id === id || c.customerCode === id) || null;
    }

    /**
     * Create New Customer
     */
    async createCustomer(data) {
        await this._delay(200);
        const customers = customerStore.get(CUSTOMER_STORAGE_KEYS.CUSTOMERS);

        if (!data.name || !data.name.trim()) {
            return { success: false, message: 'Customer name is required.' };
        }
        if (!data.mobile || !data.mobile.trim()) {
            return { success: false, message: 'Mobile number is required.' };
        }

        const newId = `cust_${Date.now()}`;
        const newCode = `CUST-${String(customers.length + 1).padStart(4, '0')}`;

        const newCustomer = {
            id: newId,
            customerCode: newCode,
            name: data.name.trim(),
            contactPerson: data.contactPerson ? data.contactPerson.trim() : '',
            mobile: data.mobile.trim(),
            email: data.email ? data.email.trim() : '',
            gstin: data.gstin ? data.gstin.trim().toUpperCase() : '',
            pan: data.pan ? data.pan.trim().toUpperCase() : '',
            customerType: data.customerType || 'Retail',
            status: 'Active',
            paymentTerms: data.paymentTerms || 'Net 30 Days',
            creditLimit: parseFloat(data.creditLimit) || 100000,
            creditDays: parseInt(data.creditDays) || 30,
            defaultPaymentMethod: data.defaultPaymentMethod || 'Bank Transfer',
            billingAddress: {
                addressLine1: data.billingAddressLine1 || data.addressLine1 || '',
                addressLine2: data.billingAddressLine2 || data.addressLine2 || '',
                city: data.billingCity || data.city || '',
                state: data.billingState || data.state || 'Maharashtra',
                country: 'India',
                pincode: data.billingPincode || data.pincode || ''
            },
            shippingAddress: {
                sameAsBilling: data.sameAsBilling !== false,
                addressLine1: data.sameAsBilling !== false ? (data.billingAddressLine1 || data.addressLine1 || '') : (data.shippingAddressLine1 || ''),
                addressLine2: data.sameAsBilling !== false ? (data.billingAddressLine2 || data.addressLine2 || '') : (data.shippingAddressLine2 || ''),
                city: data.sameAsBilling !== false ? (data.billingCity || data.city || '') : (data.shippingCity || ''),
                state: data.sameAsBilling !== false ? (data.billingState || data.state || 'Maharashtra') : (data.shippingState || 'Maharashtra'),
                country: 'India',
                pincode: data.sameAsBilling !== false ? (data.billingPincode || data.pincode || '') : (data.shippingPincode || '')
            },
            createdOn: new Date().toISOString().split('T')[0],
            notes: data.notes || ''
        };

        customers.unshift(newCustomer);
        customerStore.set(CUSTOMER_STORAGE_KEYS.CUSTOMERS, customers);

        return { success: true, customer: newCustomer };
    }

    /**
     * Update Existing Customer
     */
    async updateCustomer(id, data) {
        await this._delay(200);
        const customers = customerStore.get(CUSTOMER_STORAGE_KEYS.CUSTOMERS);
        const idx = customers.findIndex(c => c.id === id);

        if (idx === -1) {
            return { success: false, message: 'Customer not found.' };
        }

        const existing = customers[idx];
        const updated = {
            ...existing,
            name: data.name ? data.name.trim() : existing.name,
            contactPerson: data.contactPerson !== undefined ? data.contactPerson.trim() : existing.contactPerson,
            mobile: data.mobile ? data.mobile.trim() : existing.mobile,
            email: data.email !== undefined ? data.email.trim() : existing.email,
            gstin: data.gstin !== undefined ? data.gstin.trim().toUpperCase() : existing.gstin,
            pan: data.pan !== undefined ? data.pan.trim().toUpperCase() : existing.pan,
            customerType: data.customerType || existing.customerType,
            paymentTerms: data.paymentTerms || existing.paymentTerms,
            creditLimit: data.creditLimit !== undefined ? parseFloat(data.creditLimit) : existing.creditLimit,
            creditDays: data.creditDays !== undefined ? parseInt(data.creditDays) : existing.creditDays,
            defaultPaymentMethod: data.defaultPaymentMethod || existing.defaultPaymentMethod,
            billingAddress: {
                addressLine1: data.billingAddressLine1 || data.addressLine1 || existing.billingAddress.addressLine1,
                addressLine2: data.billingAddressLine2 || data.addressLine2 || existing.billingAddress.addressLine2,
                city: data.billingCity || data.city || existing.billingAddress.city,
                state: data.billingState || data.state || existing.billingAddress.state,
                country: 'India',
                pincode: data.billingPincode || data.pincode || existing.billingAddress.pincode
            },
            shippingAddress: {
                sameAsBilling: data.sameAsBilling !== undefined ? data.sameAsBilling : existing.shippingAddress.sameAsBilling,
                addressLine1: data.sameAsBilling ? (data.billingAddressLine1 || data.addressLine1 || existing.billingAddress.addressLine1) : (data.shippingAddressLine1 || existing.shippingAddress.addressLine1),
                addressLine2: data.sameAsBilling ? (data.billingAddressLine2 || data.addressLine2 || existing.billingAddress.addressLine2) : (data.shippingAddressLine2 || existing.shippingAddress.addressLine2),
                city: data.sameAsBilling ? (data.billingCity || data.city || existing.billingAddress.city) : (data.shippingCity || existing.shippingAddress.city),
                state: data.sameAsBilling ? (data.billingState || data.state || existing.billingAddress.state) : (data.shippingState || existing.shippingAddress.state),
                country: 'India',
                pincode: data.sameAsBilling ? (data.billingPincode || data.pincode || existing.billingAddress.pincode) : (data.shippingPincode || existing.shippingAddress.pincode)
            },
            notes: data.notes !== undefined ? data.notes : existing.notes
        };

        customers[idx] = updated;
        customerStore.set(CUSTOMER_STORAGE_KEYS.CUSTOMERS, customers);

        return { success: true, customer: updated };
    }

    /**
     * Toggle Customer Active / Inactive Status
     */
    async toggleStatus(id) {
        await this._delay(150);
        const customers = customerStore.get(CUSTOMER_STORAGE_KEYS.CUSTOMERS);
        const target = customers.find(c => c.id === id);

        if (!target) return { success: false, message: 'Customer not found.' };

        target.status = target.status === 'Active' ? 'Inactive' : 'Active';
        customerStore.set(CUSTOMER_STORAGE_KEYS.CUSTOMERS, customers);

        return { success: true, status: target.status, customer: target };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const customerService = new CustomerService();
