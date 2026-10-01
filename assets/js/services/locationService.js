// CLOTHERP - Centralized Multi-Location Stock Balances & Migration Service
import { inventoryStore, INVENTORY_STORAGE_KEYS } from './inventoryStore.js';
import { warehouseStore, WAREHOUSE_STORAGE_KEYS } from './warehouseStore.js';
import { branchStore, BRANCH_STORAGE_KEYS } from './branchStore.js';

const MIGRATION_FLAG = 'clotherp_location_migration_v1';

class LocationService {
    constructor() {
        this.ensureLocationStockMigration();
    }

    /**
     * Idempotent migration of global stock to default central warehouse
     */
    ensureLocationStockMigration() {
        const migrated = localStorage.getItem(MIGRATION_FLAG);
        if (migrated) return;

        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        let changed = false;

        inventory.forEach(item => {
            if (!item.warehouseId || !item.branchId) {
                item.branchId = 'BR-001';
                item.warehouseId = 'WH-001';
                item.warehouseName = 'Central Apparel Warehouse';
                item.branchName = 'Ahmedabad Central Hub';
                changed = true;
            }
        });

        if (changed) {
            inventoryStore.set(INVENTORY_STORAGE_KEYS.INVENTORY, inventory);
        }

        localStorage.setItem(MIGRATION_FLAG, 'true');
    }

    /**
     * Get stock for a specific variant in a specific warehouse
     */
    getVariantStockInWarehouse(productVariantId, warehouseId = 'WH-001') {
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const record = inventory.find(i => i.productVariantId === productVariantId && (i.warehouseId === warehouseId || !i.warehouseId));
        return record ? (record.currentStock || 0) : 0;
    }

    /**
     * Get total aggregate stock for a variant across all warehouses
     */
    getTotalVariantStock(productVariantId) {
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        const matching = inventory.filter(i => i.productVariantId === productVariantId);
        return matching.reduce((acc, i) => acc + (i.currentStock || 0), 0);
    }

    /**
     * Get all inventory records filtered by warehouse or branch
     */
    getInventoryByLocation(branchId = '', warehouseId = '') {
        let inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        if (branchId) inventory = inventory.filter(i => i.branchId === branchId);
        if (warehouseId) inventory = inventory.filter(i => i.warehouseId === warehouseId);
        return inventory;
    }

    /**
     * Get location summary KPI counts
     */
    getLocationSummary() {
        const branches = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES);
        const warehouses = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES);
        const inventory = inventoryStore.get(INVENTORY_STORAGE_KEYS.INVENTORY);

        const totalStockUnits = inventory.reduce((acc, i) => acc + (i.currentStock || 0), 0);

        return {
            totalBranches: branches.length,
            activeBranches: branches.filter(b => b.status === 'ACTIVE').length,
            totalWarehouses: warehouses.length,
            activeWarehouses: warehouses.filter(w => w.status === 'ACTIVE').length,
            totalStockUnits
        };
    }
}

export const locationService = new LocationService();
