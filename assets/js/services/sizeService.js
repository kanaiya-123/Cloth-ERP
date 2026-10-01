// CLOTHERP - Size Master Management Service
import { productStore, STORAGE_KEYS } from './productStore.js';

class SizeService {
    /**
     * Get All Sizes (Sorted by Logical Display Order)
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/sizes');
     * return await res.json();
     */
    async getSizes() {
        await this._delay(100);
        const sizes = productStore.get(STORAGE_KEYS.SIZES);
        return sizes.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    }

    /**
     * Add Size
     */
    async createSize(data) {
        await this._delay(150);
        const sizes = productStore.get(STORAGE_KEYS.SIZES);

        const exists = sizes.some(s => s.name.toLowerCase() === data.name.trim().toLowerCase() && s.type === data.type);
        if (exists) {
            return { success: false, message: `Size '${data.name}' already exists for type ${data.type}.` };
        }

        const newSize = {
            id: `sz_${Date.now()}`,
            name: data.name.trim(),
            type: data.type || 'Clothing',
            displayOrder: parseInt(data.displayOrder) || (sizes.length + 1),
            status: data.status || 'Active'
        };

        sizes.push(newSize);
        productStore.set(STORAGE_KEYS.SIZES, sizes);
        return { success: true, data: newSize };
    }

    /**
     * Update Size
     */
    async updateSize(id, data) {
        await this._delay(150);
        const sizes = productStore.get(STORAGE_KEYS.SIZES);
        const idx = sizes.findIndex(s => s.id === id);
        if (idx === -1) return { success: false, message: 'Size not found.' };

        sizes[idx] = {
            ...sizes[idx],
            name: data.name.trim(),
            type: data.type || sizes[idx].type,
            displayOrder: parseInt(data.displayOrder) || sizes[idx].displayOrder,
            status: data.status || sizes[idx].status
        };

        productStore.set(STORAGE_KEYS.SIZES, sizes);
        return { success: true, data: sizes[idx] };
    }

    /**
     * Toggle Size Status
     */
    async toggleStatus(id) {
        await this._delay(100);
        const sizes = productStore.get(STORAGE_KEYS.SIZES);
        const target = sizes.find(s => s.id === id);
        if (!target) return { success: false, message: 'Size not found.' };

        target.status = target.status === 'Active' ? 'Inactive' : 'Active';
        productStore.set(STORAGE_KEYS.SIZES, sizes);
        return { success: true, status: target.status };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const sizeService = new SizeService();
