// CLOTHERP - Brand Management Service
import { productStore, STORAGE_KEYS } from './productStore.js';

class BrandService {
    /**
     * Get All Brands
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/brands');
     * return await res.json();
     */
    async getBrands() {
        await this._delay(100);
        return productStore.get(STORAGE_KEYS.BRANDS);
    }

    /**
     * Add Brand
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/brands', { method: 'POST', body: JSON.stringify(data) });
     */
    async createBrand(data) {
        await this._delay(150);
        const brands = productStore.get(STORAGE_KEYS.BRANDS);
        
        const exists = brands.some(b => b.name.toLowerCase() === data.name.trim().toLowerCase());
        if (exists) {
            return { success: false, message: `Brand '${data.name}' already exists.` };
        }

        const newBrand = {
            id: `br_${Date.now()}`,
            name: data.name.trim(),
            description: data.description ? data.description.trim() : '',
            status: data.status || 'Active',
            createdOn: new Date().toISOString().split('T')[0]
        };

        brands.push(newBrand);
        productStore.set(STORAGE_KEYS.BRANDS, brands);
        return { success: true, data: newBrand };
    }

    /**
     * Update Brand
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) });
     */
    async updateBrand(id, data) {
        await this._delay(150);
        const brands = productStore.get(STORAGE_KEYS.BRANDS);
        const idx = brands.findIndex(b => b.id === id);
        if (idx === -1) return { success: false, message: 'Brand not found.' };

        const duplicate = brands.some(b => b.id !== id && b.name.toLowerCase() === data.name.trim().toLowerCase());
        if (duplicate) {
            return { success: false, message: `Another brand named '${data.name}' already exists.` };
        }

        brands[idx] = {
            ...brands[idx],
            name: data.name.trim(),
            description: data.description ? data.description.trim() : '',
            status: data.status || brands[idx].status
        };

        productStore.set(STORAGE_KEYS.BRANDS, brands);
        return { success: true, data: brands[idx] };
    }

    /**
     * Toggle Brand Status
     */
    async toggleStatus(id) {
        await this._delay(100);
        const brands = productStore.get(STORAGE_KEYS.BRANDS);
        const target = brands.find(b => b.id === id);
        if (!target) return { success: false, message: 'Brand not found.' };

        target.status = target.status === 'Active' ? 'Inactive' : 'Active';
        productStore.set(STORAGE_KEYS.BRANDS, brands);
        return { success: true, status: target.status };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const brandService = new BrandService();
