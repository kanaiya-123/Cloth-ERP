// CLOTHERP - Centralized Persistent Production Orders Data Store
export const PRODUCTION_STORAGE_KEYS = {
    PRODUCTION_ORDERS: 'clotherp_production_orders_db'
};

const SEED_PRODUCTION_ORDERS = [
    {
        id: 'PROD-000001',
        productionOrderNumber: 'PROD-2026-00001',
        title: "Men's Cotton Oxford Shirt - Batch 101",
        productId: 'prod_101',
        productName: "Men's Cotton Oxford Shirt",
        productVariantId: 'ALL',
        variantName: 'Mixed Size Matrix (S, M, L, XL)',
        bomId: 'BOM-000001',
        bomNumber: 'BOM-2026-00001',
        bomVersion: 'v1.0',
        plannedQuantity: 200,
        producedQuantity: 190,
        acceptedQuantity: 190,
        rejectedQuantity: 10,
        reworkQuantity: 0,
        pendingQuantity: 0,
        branchId: 'BR-001',
        branchName: 'Ahmedabad Central Hub',
        rawMaterialWarehouseId: 'WH-001',
        rawMaterialWarehouseName: 'Central Apparel Warehouse',
        finishedGoodsWarehouseId: 'WH-001',
        finishedGoodsWarehouseName: 'Central Apparel Warehouse',
        status: 'In Production',
        priority: 'HIGH',
        plannedStartDate: '2026-08-20',
        expectedCompletionDate: '2026-08-28',
        actualCompletionDate: null,
        materialsIssued: true,
        materialIssueNumber: 'MI-2026-00001',
        materialIssueDate: '2026-08-20 11:30 AM',
        stages: [
            { id: 'stg_1', name: 'Cutting', status: 'COMPLETED', inputQty: 200, outputQty: 200, rejectedQty: 0, completedAt: '2026-08-21', operator: 'Naresh Bhai', notes: 'Size breakdown: S:40, M:80, L:60, XL:20' },
            { id: 'stg_2', name: 'Stitching', status: 'COMPLETED', inputQty: 200, outputQty: 196, rejectedQty: 4, completedAt: '2026-08-24', operator: 'Unit Floor 2', notes: 'Collar & cuff assembly' },
            { id: 'stg_3', name: 'Washing & Finishing', status: 'IN_PROGRESS', inputQty: 196, outputQty: 0, rejectedQty: 0, completedAt: null, operator: 'Finishing Bay', notes: 'Enzyme wash & steam press' },
            { id: 'stg_4', name: 'Quality Inspection', status: 'NOT_STARTED', inputQty: 0, outputQty: 0, rejectedQty: 0, completedAt: null, operator: 'QC Team', notes: 'Final stitch & measurement check' },
            { id: 'stg_5', name: 'Tagging & Polybag Packing', status: 'NOT_STARTED', inputQty: 0, outputQty: 0, rejectedQty: 0, completedAt: null, operator: 'Packing Team', notes: 'Ready for finished goods stockroom' }
        ],
        sizeMatrix: [
            { size: 'S', planned: 40, cut: 40, finished: 38 },
            { size: 'M', planned: 80, cut: 80, finished: 78 },
            { size: 'L', planned: 60, cut: 60, finished: 56 },
            { size: 'XL', planned: 20, cut: 20, finished: 18 }
        ],
        costing: {
            estimatedRawMaterialCost: 52030,
            actualRawMaterialCost: 52030,
            jobWorkCharges: 3000,
            inHouseLaborCost: 4500,
            packagingCost: 700,
            totalProductionCost: 60230,
            unitCost: 317.00
        },
        activity: [
            { user: 'Admin', action: 'Production Order PROD-2026-00001 planned for 200 pcs', time: '2026-08-20 10:00 AM' },
            { user: 'Manager', action: 'Material Issue MI-2026-00001 completed - 315 MTR Fabric & Trims issued to WIP', time: '2026-08-20 11:30 AM' },
            { user: 'Naresh Bhai', action: 'Cutting stage completed for 200 pcs (S:40, M:80, L:60, XL:20)', time: '2026-08-21 04:15 PM' },
            { user: 'Floor Supervisor', action: 'Stitching stage completed - 196 pcs passed to Washing & Finishing', time: '2026-08-24 05:00 PM' }
        ],
        createdAt: '2026-08-20T04:30:00Z',
        updatedAt: '2026-08-24T11:30:00Z',
        createdBy: 'Admin'
    }
];

class ProductionStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS)) {
            localStorage.setItem(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS, JSON.stringify(SEED_PRODUCTION_ORDERS));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[ProductionStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[ProductionStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const productionStore = new ProductionStore();
