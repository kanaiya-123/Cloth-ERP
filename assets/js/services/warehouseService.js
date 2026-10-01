// CLOTHERP - Centralized Warehouse Master Service
import { warehouseStore, WAREHOUSE_STORAGE_KEYS } from './warehouseStore.js';
import { branchService } from './branchService.js';

class WarehouseService {
    async getWarehouses({ page = 1, pageSize = 20, search = '', branchId = '', status = '', type = '' } = {}) {
        await this._delay(80);
        let items = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES);

        if (branchId) items = items.filter(w => w.branchId === branchId);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(w => 
                (w.name && w.name.toLowerCase().includes(q)) ||
                (w.warehouseCode && w.warehouseCode.toLowerCase().includes(q)) ||
                (w.branchName && w.branchName.toLowerCase().includes(q))
            );
        }

        if (status) items = items.filter(w => w.status === status);
        if (type) items = items.filter(w => w.type === type);

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize);

        const allWarehouses = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES);
        const activeCount = allWarehouses.filter(w => w.status === 'ACTIVE').length;
        const mainCount = allWarehouses.filter(w => w.type === 'MAIN').length;
        const damageCount = allWarehouses.filter(w => w.type === 'DAMAGE').length;

        return {
            items: paginatedItems,
            summary: {
                totalWarehouses: allWarehouses.length,
                activeCount,
                mainCount,
                damageCount
            },
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    }

    async getActiveWarehouses(branchId = '') {
        let items = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES).filter(w => w.status === 'ACTIVE');
        if (branchId) items = items.filter(w => w.branchId === branchId);
        return items;
    }

    async getWarehouseById(id) {
        const items = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES);
        return items.find(w => w.id === id) || null;
    }

    async getWarehousesByBranch(branchId) {
        const items = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES);
        return items.filter(w => w.branchId === branchId && w.status === 'ACTIVE');
    }

    async createWarehouse(data, userName = 'Admin') {
        const items = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES);
        const id = `WH-${String(items.length + 1).padStart(3, '0')}`;

        // Validate code uniqueness
        const codeExists = items.some(w => w.warehouseCode.toLowerCase() === data.warehouseCode.trim().toLowerCase());
        if (codeExists) {
            return { success: false, message: `Warehouse Code '${data.warehouseCode}' is already registered.` };
        }

        const branch = await branchService.getBranchById(data.branchId);

        const newWarehouse = {
            id,
            warehouseCode: data.warehouseCode.trim().toUpperCase(),
            name: data.name.trim(),
            branchId: data.branchId,
            branchName: branch ? branch.name : 'Central Branch',
            type: data.type || 'MAIN',
            address: data.address || '',
            contactPerson: data.contactPerson || '',
            phone: data.phone || '',
            email: data.email || '',
            managerName: data.managerName || (branch ? branch.managerName : 'Assigned Manager'),
            status: data.status || 'ACTIVE',
            isDefault: data.isDefault || false,
            description: data.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userName
        };

        // If marked default, unset other defaults in the same branch
        if (newWarehouse.isDefault) {
            items.forEach(w => {
                if (w.branchId === newWarehouse.branchId) w.isDefault = false;
            });
        }

        items.push(newWarehouse);
        warehouseStore.set(WAREHOUSE_STORAGE_KEYS.WAREHOUSES, items);
        return { success: true, warehouse: newWarehouse };
    }

    async updateWarehouse(id, data, userName = 'Admin') {
        const items = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES);
        const index = items.findIndex(w => w.id === id);
        if (index === -1) return { success: false, message: 'Warehouse not found' };

        // Validate code uniqueness if changing
        if (data.warehouseCode && data.warehouseCode.trim().toUpperCase() !== items[index].warehouseCode) {
            const codeExists = items.some(w => w.id !== id && w.warehouseCode.toLowerCase() === data.warehouseCode.trim().toLowerCase());
            if (codeExists) {
                return { success: false, message: `Warehouse Code '${data.warehouseCode}' is already in use.` };
            }
        }

        let branchName = items[index].branchName;
        if (data.branchId && data.branchId !== items[index].branchId) {
            const branch = await branchService.getBranchById(data.branchId);
            if (branch) branchName = branch.name;
        }

        if (data.isDefault) {
            items.forEach(w => {
                if (w.branchId === (data.branchId || items[index].branchId)) w.isDefault = false;
            });
        }

        items[index] = {
            ...items[index],
            ...data,
            branchName,
            warehouseCode: data.warehouseCode ? data.warehouseCode.trim().toUpperCase() : items[index].warehouseCode,
            updatedAt: new Date().toISOString(),
            updatedBy: userName
        };

        warehouseStore.set(WAREHOUSE_STORAGE_KEYS.WAREHOUSES, items);
        return { success: true, warehouse: items[index] };
    }

    async toggleWarehouseStatus(id, userName = 'Admin') {
        const items = warehouseStore.get(WAREHOUSE_STORAGE_KEYS.WAREHOUSES);
        const item = items.find(w => w.id === id);
        if (!item) return { success: false, message: 'Warehouse not found' };

        item.status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        item.updatedAt = new Date().toISOString();
        item.updatedBy = userName;

        warehouseStore.set(WAREHOUSE_STORAGE_KEYS.WAREHOUSES, items);
        return { success: true, status: item.status };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const warehouseService = new WarehouseService();
