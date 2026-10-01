// CLOTHERP - Centralized Persistent Bill of Materials (BOM) Data Store
export const BOM_STORAGE_KEYS = {
    BOMS: 'clotherp_boms_db'
};

const SEED_BOMS = [
    {
        id: 'BOM-000001',
        bomNumber: 'BOM-2026-00001',
        name: "Men's Cotton Oxford Shirt (Standard Batch)",
        productId: 'prod_101',
        productName: "Men's Cotton Oxford Shirt",
        productVariantId: 'ALL',
        variantName: 'All Shirt Variants',
        outputQuantity: 100,
        outputUnit: 'PCS',
        version: 'v1.0',
        status: 'ACTIVE',
        isDefault: true,
        effectiveDate: '2026-08-01',
        notes: 'Standard garment specification for formal full-sleeve button-down shirt.',
        materialLines: [
            {
                id: 'BOMI-001',
                rawMaterialName: 'Cotton Oxford Woven Fabric (Sky Blue / White)',
                rawMaterialCategory: 'Fabric',
                unit: 'MTR',
                standardQuantity: 150,
                wastagePercentage: 5,
                totalRequiredQuantity: 157.5,
                unitCost: 140,
                estimatedTotalCost: 22050,
                notes: 'Cut-to-pack allowance included'
            },
            {
                id: 'BOMI-002',
                rawMaterialName: 'High-Tenacity Spun Polyester Thread (40/2)',
                rawMaterialCategory: 'Thread',
                unit: 'CONE',
                standardQuantity: 12,
                wastagePercentage: 2,
                totalRequiredQuantity: 12.24,
                unitCost: 85,
                estimatedTotalCost: 1040,
                notes: 'Overlock and top-stitch'
            },
            {
                id: 'BOMI-003',
                rawMaterialName: 'Mother-of-Pearl 18L Resin Shirt Buttons',
                rawMaterialCategory: 'Button',
                unit: 'PCS',
                standardQuantity: 800,
                wastagePercentage: 6.25,
                totalRequiredQuantity: 850,
                unitCost: 1.5,
                estimatedTotalCost: 1275,
                notes: '8 buttons per shirt + 1 extra spare'
            },
            {
                id: 'BOMI-004',
                rawMaterialName: 'Fused Woven Collar & Cuff Canvas Interlining',
                rawMaterialCategory: 'Interlining',
                unit: 'MTR',
                standardQuantity: 20,
                wastagePercentage: 0,
                totalRequiredQuantity: 20,
                unitCost: 45,
                estimatedTotalCost: 900,
                notes: 'Firm collar band reinforcement'
            },
            {
                id: 'BOMI-005',
                rawMaterialName: 'Woven Brand Neck Label & Wash Care Satin Tags',
                rawMaterialCategory: 'Label',
                unit: 'SET',
                standardQuantity: 100,
                wastagePercentage: 0,
                totalRequiredQuantity: 100,
                unitCost: 4,
                estimatedTotalCost: 400,
                notes: 'Size + Wash instruction tag'
            },
            {
                id: 'BOMI-006',
                rawMaterialName: 'Recyclable Self-Adhesive Apparel Polybag (12x15)',
                rawMaterialCategory: 'Packaging',
                unit: 'PCS',
                standardQuantity: 100,
                wastagePercentage: 0,
                totalRequiredQuantity: 100,
                unitCost: 3.5,
                estimatedTotalCost: 350,
                notes: 'Individual garment packing'
            }
        ],
        totalEstimatedMaterialCost: 26015,
        estimatedCostPerUnit: 260.15,
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
        createdBy: 'Admin'
    },
    {
        id: 'BOM-000002',
        bomNumber: 'BOM-2026-00002',
        name: 'Women Embroidered Festive Kurti',
        productId: 'prod_105',
        productName: 'Chanderi Silk Embroidered Kurti',
        productVariantId: 'ALL',
        variantName: 'All Kurti Variants',
        outputQuantity: 50,
        outputUnit: 'PCS',
        version: 'v1.0',
        status: 'ACTIVE',
        isDefault: true,
        effectiveDate: '2026-08-10',
        notes: 'Includes neckline zari embroidery and contrast inner lining.',
        materialLines: [
            {
                id: 'BOMI-101',
                rawMaterialName: 'Chanderi Silk Fabric (Mustard / Emerald)',
                rawMaterialCategory: 'Fabric',
                unit: 'MTR',
                standardQuantity: 110,
                wastagePercentage: 4,
                totalRequiredQuantity: 114.4,
                unitCost: 280,
                estimatedTotalCost: 32032,
                notes: 'Flared A-line silhouette'
            },
            {
                id: 'BOMI-102',
                rawMaterialName: 'Metallic Gold Zari Embroidery Thread',
                rawMaterialCategory: 'Thread',
                unit: 'CONE',
                standardQuantity: 8,
                wastagePercentage: 0,
                totalRequiredQuantity: 8,
                unitCost: 190,
                estimatedTotalCost: 1520,
                notes: 'Computerized multi-head machine'
            },
            {
                id: 'BOMI-103',
                rawMaterialName: 'Handcrafted Latkan & Tassel Set',
                rawMaterialCategory: 'Accessories',
                unit: 'SET',
                standardQuantity: 50,
                wastagePercentage: 0,
                totalRequiredQuantity: 50,
                unitCost: 35,
                estimatedTotalCost: 1750,
                notes: 'Side tie-up accents'
            }
        ],
        totalEstimatedMaterialCost: 35302,
        estimatedCostPerUnit: 706.04,
        createdAt: '2026-08-10T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
        createdBy: 'Admin'
    }
];

class BomStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(BOM_STORAGE_KEYS.BOMS)) {
            localStorage.setItem(BOM_STORAGE_KEYS.BOMS, JSON.stringify(SEED_BOMS));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[BomStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[BomStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const bomStore = new BomStore();
