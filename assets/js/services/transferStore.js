// CLOTHERP - Centralized Persistent Stock Transfer Data Store
export const TRANSFER_STORAGE_KEYS = {
    TRANSFERS: 'clotherp_stock_transfers_db'
};

const SEED_TRANSFERS = [
    {
        id: 'TRF-000001',
        transferNumber: 'TRF-2026-00001',
        sourceBranchId: 'BR-001',
        sourceBranchName: 'Ahmedabad Central Hub',
        sourceWarehouseId: 'WH-001',
        sourceWarehouseName: 'Central Apparel Warehouse',
        destinationBranchId: 'BR-002',
        destinationBranchName: 'Surat Textile Depot',
        destinationWarehouseId: 'WH-003',
        destinationWarehouseName: 'Surat Regional Depot',
        status: 'Received',
        transferDate: '2026-08-22',
        expectedReceiveDate: '2026-08-24',
        dispatchDate: '2026-08-22 02:30 PM',
        receiveDate: '2026-08-24 11:15 AM',
        totalRequestedQuantity: 20,
        totalDispatchedQuantity: 20,
        totalReceivedQuantity: 20,
        inTransitQuantity: 0,
        transportName: 'VRL Logistics',
        lrNumber: 'LR-AHM-88912',
        vehicleNumber: 'GJ-01-AX-9944',
        driverName: 'Ramesh Yadav (+91 98221 00192)',
        notes: 'Monthly regional depot replenishment for festive demand',
        items: [
            {
                productId: 'prod_101',
                productName: "Men's Cotton Oxford Shirt",
                productVariantId: 'var_101_1',
                variantName: 'Black / M',
                color: 'Black',
                size: 'M',
                sku: 'SH-OXF-BLK-M',
                requestedQuantity: 20,
                dispatchedQuantity: 20,
                receivedQuantity: 20,
                inTransitQuantity: 0,
                rate: 1499
            }
        ],
        activity: [
            { user: 'Admin', action: 'Transfer draft created and submitted', time: '2026-08-22 11:00 AM' },
            { user: 'Manager', action: 'Transfer approved for dispatch', time: '2026-08-22 01:15 PM' },
            { user: 'Admin', action: 'Consignment dispatched via VRL Logistics (LR: LR-AHM-88912) - Source stock deducted (20 pcs)', time: '2026-08-22 02:30 PM' },
            { user: 'Manager', action: 'Consignment received at Surat Regional Depot - Destination stock credited (20 pcs)', time: '2026-08-24 11:15 AM' }
        ],
        createdAt: '2026-08-22T05:30:00Z',
        updatedAt: '2026-08-24T05:45:00Z',
        createdBy: 'Admin'
    }
];

class TransferStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(TRANSFER_STORAGE_KEYS.TRANSFERS)) {
            localStorage.setItem(TRANSFER_STORAGE_KEYS.TRANSFERS, JSON.stringify(SEED_TRANSFERS));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[TransferStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[TransferStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const transferStore = new TransferStore();
