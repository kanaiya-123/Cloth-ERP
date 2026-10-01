// CLOTHERP - Category Management Service
import { productStore, STORAGE_KEYS } from './productStore.js';

class CategoryService {
    /**
     * Get All Categories
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/categories');
     * return await res.json();
     */
    async getCategories() {
        await this._delay(100);
        return productStore.get(STORAGE_KEYS.CATEGORIES);
    }

    /**
     * Add Category
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/categories', { method: 'POST', body: JSON.stringify(data) });
     */
    async createCategory(data) {
        await this._delay(150);
        const categories = productStore.get(STORAGE_KEYS.CATEGORIES);
        
        // Validation check for duplicates
        const exists = categories.some(c => c.name.toLowerCase() === data.name.trim().toLowerCase());
        if (exists) {
            return { success: false, message: `Category '${data.name}' already exists.` };
        }

        const newCategory = {
            id: `cat_${Date.now()}`,
            name: data.name.trim(),
            description: data.description ? data.description.trim() : '',
            status: data.status || 'Active',
            createdOn: new Date().toISOString().split('T')[0],
            createdBy: 'Admin'
        };

        categories.push(newCategory);
        productStore.set(STORAGE_KEYS.CATEGORIES, categories);
        return { success: true, data: newCategory };
    }

    /**
     * Update Category
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
     */
    async updateCategory(id, data) {
        await this._delay(150);
        const categories = productStore.get(STORAGE_KEYS.CATEGORIES);
        const idx = categories.findIndex(c => c.id === id);
        if (idx === -1) return { success: false, message: 'Category not found.' };

        // Duplicate check (ignoring self)
        const duplicate = categories.some(c => c.id !== id && c.name.toLowerCase() === data.name.trim().toLowerCase());
        if (duplicate) {
            return { success: false, message: `Another category named '${data.name}' already exists.` };
        }

        categories[idx] = {
            ...categories[idx],
            name: data.name.trim(),
            description: data.description ? data.description.trim() : '',
            status: data.status || categories[idx].status
        };

        productStore.set(STORAGE_KEYS.CATEGORIES, categories);
        return { success: true, data: categories[idx] };
    }

    /**
     * Toggle Category Status (Active/Inactive)
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/categories/${id}/status`, { method: 'PATCH' });
     */
    async toggleStatus(id) {
        await this._delay(100);
        const categories = productStore.get(STORAGE_KEYS.CATEGORIES);
        const target = categories.find(c => c.id === id);
        if (!target) return { success: false, message: 'Category not found.' };

        target.status = target.status === 'Active' ? 'Inactive' : 'Active';
        productStore.set(STORAGE_KEYS.CATEGORIES, categories);
        return { success: true, status: target.status };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const categoryService = new CategoryService();
