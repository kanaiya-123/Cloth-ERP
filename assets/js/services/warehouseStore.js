// CLOTHERP - Centralized Persistent Warehouse Data Store
export const WAREHOUSE_STORAGE_KEYS = {
    WAREHOUSES: 'clotherp_warehouses_db'
};

const SEED_WAREHOUSES = [
    {
        id: 'WH-001',
        warehouseCode: 'WH-AHM-MAIN',
        name: 'Central Apparel Warehouse',
        branchId: 'BR-001',
        branchName: 'Ahmedabad Central Hub',
        type: 'MAIN',
        address: 'Sector 4, GIDC Apparel Park, Khokhra, Ahmedabad',
        contactPerson: 'Suresh Prajapati',
        phone: '+91 79 4899 2210',
        email: 'warehouse.ahm@clotherp.local',
        managerName: 'Rajesh Shah',
        status: 'ACTIVE',
        isDefault: true,
        description: 'Primary central distribution depot for finished apparel and raw cotton fabrics.',
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    },
    {
        id: 'WH-002',
        warehouseCode: 'WH-AHM-DMG',
        name: 'Damage & Quarantine Depot',
        branchId: 'BR-001',
        branchName: 'Ahmedabad Central Hub',
        type: 'DAMAGE',
        address: 'Rear Bay 8, GIDC Apparel Park, Khokhra, Ahmedabad',
        contactPerson: 'Karan Dave',
        phone: '+91 79 4899 2215',
        email: 'quarantine.ahm@clotherp.local',
        managerName: 'Rajesh Shah',
        status: 'ACTIVE',
        isDefault: false,
        description: 'Designated non-sellable stock quarantine zone for damaged and defective customer returns.',
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    },
    {
        id: 'WH-003',
        warehouseCode: 'WH-SUR-REG',
        name: 'Surat Regional Depot',
        branchId: 'BR-002',
        branchName: 'Surat Textile Depot',
        type: 'FINISHED_GOODS',
        address: 'Godown 12-14, Millennium Textile Market, Ring Road, Surat',
        contactPerson: 'Mahesh Solanki',
        phone: '+91 261 2899 118',
        email: 'warehouse.surat@clotherp.local',
        managerName: 'Vikram Patel',
        status: 'ACTIVE',
        isDefault: true,
        description: 'Regional distribution stockroom for South Gujarat wholesale buyers.',
        createdAt: '2026-08-05T11:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    },
    {
        id: 'WH-004',
        warehouseCode: 'WH-MUM-RET',
        name: 'Bandra Retail Stockroom',
        branchId: 'BR-003',
        branchName: 'Mumbai Fashion Flagship',
        type: 'RETAIL',
        address: 'Basement Stock Vault, Linking Road, Bandra West, Mumbai',
        contactPerson: 'Pooja Iyer',
        phone: '+91 22 2640 8828',
        email: 'stock.mumbai@clotherp.local',
        managerName: 'Ananya Deshmukh',
        status: 'ACTIVE',
        isDefault: true,
        description: 'Store backroom holding ready-to-sell retail garments and display trial stock.',
        createdAt: '2026-08-10T12:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    }
];

class WarehouseStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(WAREHOUSE_STORAGE_KEYS.WAREHOUSES)) {
            localStorage.setItem(WAREHOUSE_STORAGE_KEYS.WAREHOUSES, JSON.stringify(SEED_WAREHOUSES));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[WarehouseStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[WarehouseStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const warehouseStore = new WarehouseStore();
