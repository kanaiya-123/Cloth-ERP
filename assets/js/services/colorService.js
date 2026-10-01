// CLOTHERP - Color Master Management Service
import { productStore, STORAGE_KEYS } from './productStore.js';

class ColorService {
    /**
     * Get All Colors
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/colors');
     * return await res.json();
     */
    async getColors() {
        await this._delay(100);
        return productStore.get(STORAGE_KEYS.COLORS);
    }

    /**
     * Add Color
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/colors', { method: 'POST', body: JSON.stringify(data) });
     */
    async createColor(data) {
        await this._delay(150);
        const colors = productStore.get(STORAGE_KEYS.COLORS);

        const exists = colors.some(c => c.name.toLowerCase() === data.name.trim().toLowerCase());
        if (exists) {
            return { success: false, message: `Color '${data.name}' already exists.` };
        }

        const newColor = {
            id: `col_${Date.now()}`,
            name: data.name.trim(),
            hexCode: data.hexCode || '#1E293B',
            status: data.status || 'Active',
            createdOn: new Date().toISOString().split('T')[0]
        };

        colors.push(newColor);
        productStore.set(STORAGE_KEYS.COLORS, colors);
        return { success: true, data: newColor };
    }

    /**
     * Update Color
     */
    async updateColor(id, data) {
        await this._delay(150);
        const colors = productStore.get(STORAGE_KEYS.COLORS);
        const idx = colors.findIndex(c => c.id === id);
        if (idx === -1) return { success: false, message: 'Color not found.' };

        const duplicate = colors.some(c => c.id !== id && c.name.toLowerCase() === data.name.trim().toLowerCase());
        if (duplicate) {
            return { success: false, message: `Another color named '${data.name}' already exists.` };
        }

        colors[idx] = {
            ...colors[idx],
            name: data.name.trim(),
            hexCode: data.hexCode || colors[idx].hexCode,
            status: data.status || colors[idx].status
        };

        productStore.set(STORAGE_KEYS.COLORS, colors);
        return { success: true, data: colors[idx] };
    }

    /**
     * Toggle Color Status
     */
    async toggleStatus(id) {
        await this._delay(100);
        const colors = productStore.get(STORAGE_KEYS.COLORS);
        const target = colors.find(c => c.id === id);
        if (!target) return { success: false, message: 'Color not found.' };

        target.status = target.status === 'Active' ? 'Inactive' : 'Active';
        productStore.set(STORAGE_KEYS.COLORS, colors);
        return { success: true, status: target.status };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const colorService = new ColorService();
