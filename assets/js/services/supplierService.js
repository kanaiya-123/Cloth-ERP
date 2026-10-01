// CLOTHERP - Supplier Service
import { supplierStore, SUPPLIER_STORAGE_KEYS } from './supplierStore.js';

class SupplierService {
    /**
     * Get Filtered & Paginated Suppliers
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/suppliers?${params}`);
     * return await res.json();
     */
    async getSuppliers({
        page = 1,
        pageSize = 10,
        search = '',
        state = '',
        status = ''
    } = {}) {
        await this._delay(120);
        let items = supplierStore.get(SUPPLIER_STORAGE_KEYS.SUPPLIERS);

        // Search Filter (Name, Contact Person, GSTIN, Mobile, City)
        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            items = items.filter(s => 
                (s.name && s.name.toLowerCase().includes(query)) ||
                (s.contactPerson && s.contactPerson.toLowerCase().includes(query)) ||
                (s.gstin && s.gstin.toLowerCase().includes(query)) ||
                (s.mobile && s.mobile.toLowerCase().includes(query)) ||
                (s.city && s.city.toLowerCase().includes(query))
            );
        }

        if (state) items = items.filter(s => s.state === state);
        if (status) items = items.filter(s => s.status === status);

        // Sort: Active first, then name
        items.sort((a, b) => {
            if (a.status === 'Active' && b.status !== 'Active') return -1;
            if (a.status !== 'Active' && b.status === 'Active') return 1;
            return a.name.localeCompare(b.name);
        });

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        return {
            items: paginated,
            pagination: { page, pageSize, totalItems, totalPages },
            totalSuppliers: totalItems,
            activeSuppliers: items.filter(s => s.status === 'Active').length
        };
    }

    /**
     * Get Single Supplier by ID
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/suppliers/${id}`);
     * return await res.json();
     */
    async getSupplierById(id) {
        await this._delay(80);
        const suppliers = supplierStore.get(SUPPLIER_STORAGE_KEYS.SUPPLIERS);
        return suppliers.find(s => s.id === id || s.code === id) || null;
    }

    /**
     * Create Supplier
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/suppliers', { method: 'POST', body: JSON.stringify(data) });
     */
    async createSupplier(data) {
        await this._delay(150);
        const suppliers = supplierStore.get(SUPPLIER_STORAGE_KEYS.SUPPLIERS);

        if (!data.name || !data.name.trim()) {
            return { success: false, message: 'Supplier name is required.' };
        }

        const newId = `sup_${Date.now()}`;
        const newCode = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;

        const newSupplier = {
            id: newId,
            code: newCode,
            name: data.name.trim(),
            contactPerson: data.contactPerson ? data.contactPerson.trim() : '',
            mobile: data.mobile ? data.mobile.trim() : '',
            email: data.email ? data.email.trim() : '',
            gstin: data.gstin ? data.gstin.trim().toUpperCase() : '',
            pan: data.pan ? data.pan.trim().toUpperCase() : '',
            addressLine1: data.addressLine1 || '',
            addressLine2: data.addressLine2 || '',
            city: data.city || '',
            state: data.state || 'Maharashtra',
            country: data.country || 'India',
            pincode: data.pincode || '',
            paymentTerms: data.paymentTerms || 'Net 30 Days',
            creditDays: parseInt(data.creditDays) || 30,
            defaultPaymentMethod: data.defaultPaymentMethod || 'Bank Transfer',
            bankDetails: data.bankDetails || '',
            status: data.status || 'Active',
            createdOn: new Date().toISOString().split('T')[0],
            notes: data.notes || ''
        };

        suppliers.unshift(newSupplier);
        supplierStore.set(SUPPLIER_STORAGE_KEYS.SUPPLIERS, suppliers);

        return { success: true, supplier: newSupplier };
    }

    /**
     * Update Supplier
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
     */
    async updateSupplier(id, data) {
        await this._delay(150);
        const suppliers = supplierStore.get(SUPPLIER_STORAGE_KEYS.SUPPLIERS);
        const index = suppliers.findIndex(s => s.id === id);

        if (index === -1) {
            return { success: false, message: 'Supplier not found.' };
        }

        if (!data.name || !data.name.trim()) {
            return { success: false, message: 'Supplier name is required.' };
        }

        suppliers[index] = {
            ...suppliers[index],
            name: data.name.trim(),
            contactPerson: data.contactPerson ? data.contactPerson.trim() : '',
            mobile: data.mobile ? data.mobile.trim() : '',
            email: data.email ? data.email.trim() : '',
            gstin: data.gstin ? data.gstin.trim().toUpperCase() : '',
            pan: data.pan ? data.pan.trim().toUpperCase() : '',
            addressLine1: data.addressLine1 || '',
            addressLine2: data.addressLine2 || '',
            city: data.city || '',
            state: data.state || 'Maharashtra',
            country: data.country || 'India',
            pincode: data.pincode || '',
            paymentTerms: data.paymentTerms || 'Net 30 Days',
            creditDays: parseInt(data.creditDays) || 30,
            defaultPaymentMethod: data.defaultPaymentMethod || 'Bank Transfer',
            bankDetails: data.bankDetails || '',
            status: data.status || suppliers[index].status,
            notes: data.notes || ''
        };

        supplierStore.set(SUPPLIER_STORAGE_KEYS.SUPPLIERS, suppliers);
        return { success: true, supplier: suppliers[index] };
    }

    /**
     * Toggle Supplier Active / Inactive Status
     */
    async toggleStatus(id) {
        await this._delay(100);
        const suppliers = supplierStore.get(SUPPLIER_STORAGE_KEYS.SUPPLIERS);
        const target = suppliers.find(s => s.id === id);
        if (!target) return { success: false, message: 'Supplier not found.' };

        target.status = target.status === 'Active' ? 'Inactive' : 'Active';
        supplierStore.set(SUPPLIER_STORAGE_KEYS.SUPPLIERS, suppliers);

        return { success: true, status: target.status };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const supplierService = new SupplierService();
