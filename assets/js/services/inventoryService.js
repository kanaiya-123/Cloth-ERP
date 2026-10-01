// CLOTHERP - Inventory & Stock Control Service
import { inventoryStore, INVENTORY_STORAGE_KEYS } from './inventoryStore.js';
import { productStore, STORAGE_KEYS as PROD_KEYS } from './productStore.js';

class InventoryService {
    /**
     * Calculate dynamic Stock Status
     * @param {number} currentStock 
     * @param {number} lowStockLevel 
     * @returns {'In Stock'|'Low Stock'|'Out of Stock'}
     */
    calculateStockStatus(currentStock, lowStockLevel = 5) {
        const stock = parseInt(currentStock) || 0;
        const threshold = parseInt(lowStockLevel) || 5;

        if (stock === 0) return 'Out of Stock';
        if (stock <= threshold) return 'Low Stock';
        return 'In Stock';
    }

    /**
     * Get Filtered, Searched & Paginated Inventory List
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/inventory?${params}`);
     * return await res.json();
     */
    async getInventory({
        page = 1,
        pageSize = 10,
        search = '',
        category = '',
        brand = '',
        color = '',
        size = '',
        stockStatus = '',
        sortBy = 'name_asc'
    } = {}) {
        await this._delay(150);
        let items = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);

        // Calculate dynamic status for each item
        items = items.map(item => ({
            ...item,
            status: this.calculateStockStatus(item.currentStock, item.lowStockLevel)
        }));

        // Search Filter (Product Name, Product Code, SKU, Barcode)
        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            items = items.filter(item => 
                (item.productName && item.productName.toLowerCase().includes(query)) ||
                (item.sku && item.sku.toLowerCase().includes(query)) ||
                (item.barcode && item.barcode.toLowerCase().includes(query)) ||
                (item.productCode && item.productCode.toLowerCase().includes(query))
            );
        }

        // Dropdown Filters
        if (category) items = items.filter(item => item.category === category);
        if (brand) items = items.filter(item => item.brand === brand);
        if (color) items = items.filter(item => item.color === color);
        if (size) items = items.filter(item => item.size === size);
        if (stockStatus) items = items.filter(item => item.status === stockStatus);

        // Sorting
        if (sortBy === 'name_asc') {
            items.sort((a, b) => a.productName.localeCompare(b.productName));
        } else if (sortBy === 'stock_asc') {
            items.sort((a, b) => a.currentStock - b.currentStock);
        } else if (sortBy === 'stock_desc') {
            items.sort((a, b) => b.currentStock - a.currentStock);
        } else if (sortBy === 'updated') {
            items.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        // Global KPI Metrics across full catalog
        const allItems = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY).map(i => ({
            ...i,
            status: this.calculateStockStatus(i.currentStock, i.lowStockLevel)
        }));

        const uniqueProducts = new Set(allItems.map(i => i.productId)).size;
        const totalVariants = allItems.length;
        const totalStockUnits = allItems.reduce((acc, i) => acc + (i.currentStock || 0), 0);
        const lowStockCount = allItems.filter(i => i.status === 'Low Stock').length;
        const outOfStockCount = allItems.filter(i => i.status === 'Out of Stock').length;

        return {
            items: paginated,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            },
            summary: {
                totalProducts: uniqueProducts,
                totalVariants: totalVariants,
                totalStockUnits: totalStockUnits,
                lowStockCount: lowStockCount,
                outOfStockCount: outOfStockCount
            }
        };
    }

    /**
     * Get Single Variant Inventory Record
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/inventory/${variantId}`);
     * return await res.json();
     */
    async getInventoryVariant(variantId) {
        await this._delay(100);
        const items = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const item = items.find(i => i.productVariantId === variantId || i.id === variantId);
        if (!item) return null;

        return {
            ...item,
            status: this.calculateStockStatus(item.currentStock, item.lowStockLevel)
        };
    }

    /**
     * Get All Low Stock & Out of Stock Items
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/inventory/low-stock');
     * return await res.json();
     */
    async getLowStockItems({ page = 1, pageSize = 10, search = '' } = {}) {
        await this._delay(120);
        let items = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY).map(item => ({
            ...item,
            status: this.calculateStockStatus(item.currentStock, item.lowStockLevel)
        })).filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock');

        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            items = items.filter(item => 
                (item.productName && item.productName.toLowerCase().includes(query)) ||
                (item.sku && item.sku.toLowerCase().includes(query))
            );
        }

        // Sort: Out of Stock first, then lowest stock
        items.sort((a, b) => a.currentStock - b.currentStock);

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        return {
            items: paginated,
            pagination: { page, pageSize, totalItems, totalPages }
        };
    }

    /**
     * Update Reorder / Low Stock Threshold Level for a Variant
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/inventory/${variantId}/low-stock-level`, { method: 'PUT', body: JSON.stringify({ level }) });
     */
    async updateLowStockLevel(variantId, newLevel) {
        await this._delay(150);
        const items = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const target = items.find(i => i.productVariantId === variantId || i.id === variantId);
        if (!target) return { success: false, message: 'Variant inventory record not found.' };

        const lvl = parseInt(newLevel);
        if (isNaN(lvl) || lvl < 0) return { success: false, message: 'Threshold must be a non-negative number.' };

        target.lowStockLevel = lvl;
        target.lastUpdated = `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        inventoryStore.set(INVENTORY_STORAGE_KEYS.INVENTORY, items);
        return { success: true, lowStockLevel: lvl, status: this.calculateStockStatus(target.currentStock, lvl) };
    }

    /**
     * Get Real-time KPI Summary Metrics for Dashboard integration
     */
    async getSummaryMetrics() {
        await this._delay(80);
        const allItems = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY).map(i => ({
            ...i,
            status: this.calculateStockStatus(i.currentStock, i.lowStockLevel)
        }));

        const totalUnits = allItems.reduce((acc, i) => acc + (i.currentStock || 0), 0);
        const lowCount = allItems.filter(i => i.status === 'Low Stock').length;
        const outCount = allItems.filter(i => i.status === 'Out of Stock').length;

        return {
            totalStockUnits: totalUnits,
            totalStockFormatted: `${totalUnits.toLocaleString('en-IN')} Units`,
            lowStockCount: lowCount,
            lowStockFormatted: `${lowCount} Products`,
            outOfStockCount: outCount,
            outOfStockFormatted: `${outCount} Products`
        };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const inventoryService = new InventoryService();
