// CLOTHERP - Centralized Persistent Inventory & Stock Movements Data Store
import { productStore, STORAGE_KEYS as PROD_KEYS } from './productStore.js';

const INVENTORY_STORAGE_KEYS = {
    INVENTORY: 'clotherp_inventory_db',
    MOVEMENTS: 'clotherp_stock_movements_db'
};

const DEFAULT_MOVEMENTS = [
    {
        id: 'MOV-000101',
        productVariantId: 'var_101_1',
        sku: 'SH-OXF-BLK-M',
        productName: "Men's Cotton Oxford Shirt",
        variantName: 'Black / M',
        movementType: 'OPENING',
        quantity: 50,
        previousStock: 0,
        newStock: 50,
        referenceType: 'Opening Stock',
        referenceId: 'OPEN-001',
        reason: 'Initial warehouse stock count',
        notes: 'Verified against physical intake tally',
        createdDate: '2026-08-20 10:30 AM',
        createdBy: 'Admin'
    },
    {
        id: 'MOV-000102',
        productVariantId: 'var_101_2',
        sku: 'SH-OXF-BLK-L',
        productName: "Men's Cotton Oxford Shirt",
        variantName: 'Black / L',
        movementType: 'OPENING',
        quantity: 45,
        previousStock: 0,
        newStock: 45,
        referenceType: 'Opening Stock',
        referenceId: 'OPEN-001',
        reason: 'Initial warehouse stock count',
        notes: 'Central warehouse bay 4',
        createdDate: '2026-08-20 10:30 AM',
        createdBy: 'Admin'
    },
    {
        id: 'MOV-000103',
        productVariantId: 'var_101_3',
        sku: 'SH-OXF-BLK-XL',
        productName: "Men's Cotton Oxford Shirt",
        variantName: 'Black / XL',
        movementType: 'OPENING',
        quantity: 5,
        previousStock: 0,
        newStock: 5,
        referenceType: 'Opening Stock',
        referenceId: 'OPEN-001',
        reason: 'Initial warehouse stock count',
        notes: 'Low initial consignment allocation',
        createdDate: '2026-08-20 10:30 AM',
        createdBy: 'Admin'
    },
    {
        id: 'MOV-000104',
        productVariantId: 'var_101_3',
        sku: 'SH-OXF-BLK-XL',
        productName: "Men's Cotton Oxford Shirt",
        variantName: 'Black / XL',
        movementType: 'STOCK_OUT',
        quantity: 2,
        previousStock: 5,
        newStock: 3,
        referenceType: 'Stock Out',
        referenceId: 'SO-00045',
        reason: 'Damaged',
        notes: '2 units found with fabric dye stain during inspection',
        createdDate: '2026-08-25 02:15 PM',
        createdBy: 'Store Manager'
    },
    {
        id: 'MOV-000105',
        productVariantId: 'var_102_1',
        sku: 'JN-STR-NVY-30',
        productName: 'Slim Fit Stretch Denim',
        variantName: 'Navy Blue / 30',
        movementType: 'OPENING',
        quantity: 35,
        previousStock: 0,
        newStock: 35,
        referenceType: 'Opening Stock',
        referenceId: 'OPEN-002',
        reason: 'Initial warehouse stock count',
        notes: 'Store rack A1',
        createdDate: '2026-08-21 11:00 AM',
        createdBy: 'Admin'
    },
    {
        id: 'MOV-000106',
        productVariantId: 'var_102_4',
        sku: 'JN-STR-BLK-32',
        productName: 'Slim Fit Stretch Denim',
        variantName: 'Black / 32',
        movementType: 'OPENING',
        quantity: 2,
        previousStock: 0,
        newStock: 2,
        referenceType: 'Opening Stock',
        referenceId: 'OPEN-002',
        reason: 'Initial floor trial stock',
        notes: 'Low buffer inventory',
        createdDate: '2026-08-21 11:00 AM',
        createdBy: 'Admin'
    },
    {
        id: 'MOV-000107',
        productVariantId: 'var_103_4',
        sku: 'KT-SLK-MST-L',
        productName: "Women's Embroidered Silk Kurti",
        variantName: 'Mustard Yellow / L',
        movementType: 'OPENING',
        quantity: 0,
        previousStock: 0,
        newStock: 0,
        referenceType: 'Opening Stock',
        referenceId: 'OPEN-003',
        reason: 'Zero initial stock allocation',
        notes: 'Awaiting primary supplier shipment',
        createdDate: '2026-08-22 02:00 PM',
        createdBy: 'Admin'
    },
    {
        id: 'MOV-000108',
        productVariantId: 'var_104_1',
        sku: 'TS-POL-GRN-M',
        productName: 'Classic Polo Pique T-Shirt',
        variantName: 'Emerald Green / M',
        movementType: 'OPENING',
        quantity: 60,
        previousStock: 0,
        newStock: 60,
        referenceType: 'Opening Stock',
        referenceId: 'OPEN-004',
        reason: 'Intake batch from Urban Weave',
        notes: 'Warehouse Bay 2',
        createdDate: '2026-08-23 09:30 AM',
        createdBy: 'Admin'
    }
];

class InventoryStore {
    constructor() {
        this._initInventory();
    }

    _initInventory() {
        if (!localStorage.getItem(INVENTORY_STORAGE_KEYS.MOVEMENTS)) {
            localStorage.setItem(INVENTORY_STORAGE_KEYS.MOVEMENTS, JSON.stringify(DEFAULT_MOVEMENTS));
        }

        // Build or sync Inventory records for all products & variants in productStore
        const products = productStore.get(PROD_KEYS.PRODUCTS);
        let existingInventory = this.get(INVENTORY_STORAGE_KEYS.INVENTORY);
        let updated = false;

        if (!existingInventory || existingInventory.length === 0) {
            existingInventory = [];
            updated = true;
        }

        // Ensure every variant in productStore has a corresponding inventory entry
        products.forEach(p => {
            (p.variants || []).forEach(v => {
                const found = existingInventory.find(inv => inv.productVariantId === v.id || inv.sku === v.sku);
                if (!found) {
                    // Compute initial stock from default movements or assign balanced starter stock
                    const moves = DEFAULT_MOVEMENTS.filter(m => m.sku === v.sku || m.productVariantId === v.id);
                    let initialStock = 25; // default fallback

                    if (moves.length > 0) {
                        const lastMove = moves[moves.length - 1];
                        initialStock = lastMove.newStock;
                    } else if (v.sku === 'SH-OXF-BLK-XL') {
                        initialStock = 3; // Low stock demo
                    } else if (v.sku === 'JN-STR-BLK-32') {
                        initialStock = 2; // Critical low stock
                    } else if (v.sku === 'KT-SLK-MST-L') {
                        initialStock = 0; // Out of stock demo
                    }

                    existingInventory.push({
                        id: `inv_${v.id}`,
                        productVariantId: v.id,
                        productId: p.id,
                        productName: p.name,
                        productCode: p.code,
                        category: p.category,
                        brand: p.brand,
                        gender: p.gender || 'Unisex',
                        color: v.color,
                        colorHex: v.colorHex || '#111827',
                        size: v.size,
                        sku: v.sku,
                        barcode: v.barcode,
                        costPrice: v.costPrice || p.baseCostPrice,
                        sellingPrice: v.sellingPrice || p.baseSellingPrice,
                        currentStock: initialStock,
                        reservedStock: 0,
                        incomingStock: 0,
                        lowStockLevel: 5,
                        primaryImage: p.primaryImage,
                        lastUpdated: 'Today, 10:30 AM'
                    });
                    updated = true;
                }
            });
        });

        if (updated) {
            this.set(INVENTORY_STORAGE_KEYS.INVENTORY, existingInventory);
        }
    }

    get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error(`Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving ${key}:`, e);
        }
    }
}

export const inventoryStore = new InventoryStore();
export { INVENTORY_STORAGE_KEYS };
