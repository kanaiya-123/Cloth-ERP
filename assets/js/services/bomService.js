// CLOTHERP - Centralized Bill of Materials (BOM) Service
import { bomStore, BOM_STORAGE_KEYS } from './bomStore.js';
import { productService } from './productService.js';

class BomService {
    async getBoms({ page = 1, pageSize = 20, search = '', status = '', productId = '' } = {}) {
        await this._delay(80);
        let items = bomStore.get(BOM_STORAGE_KEYS.BOMS);

        if (productId) items = items.filter(b => b.productId === productId);
        if (status) items = items.filter(b => b.status === status);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(b => 
                (b.name && b.name.toLowerCase().includes(q)) ||
                (b.bomNumber && b.bomNumber.toLowerCase().includes(q)) ||
                (b.productName && b.productName.toLowerCase().includes(q))
            );
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize);

        const allBoms = bomStore.get(BOM_STORAGE_KEYS.BOMS);
        const activeCount = allBoms.filter(b => b.status === 'ACTIVE').length;
        const totalItemsCount = allBoms.reduce((acc, b) => acc + (b.materialLines ? b.materialLines.length : 0), 0);

        return {
            items: paginatedItems,
            summary: {
                totalBoms: allBoms.length,
                activeCount,
                totalItemsCount
            },
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    }

    async getBomById(id) {
        const items = bomStore.get(BOM_STORAGE_KEYS.BOMS);
        return items.find(b => b.id === id || b.bomNumber === id) || null;
    }

    async getActiveBomsForProduct(productId) {
        const items = bomStore.get(BOM_STORAGE_KEYS.BOMS);
        return items.filter(b => b.productId === productId && b.status === 'ACTIVE');
    }

    async createBom(data, userName = 'Admin') {
        const items = bomStore.get(BOM_STORAGE_KEYS.BOMS);
        const id = `BOM-${String(items.length + 1).padStart(6, '0')}`;
        const bomNumber = `BOM-${new Date().getFullYear()}-${String(items.length + 1).padStart(5, '0')}`;

        const product = await productService.getProductById(data.productId);

        let totalCost = 0;
        const validatedLines = (data.materialLines || []).map((line, idx) => {
            const stdQty = parseFloat(line.standardQuantity) || 0;
            const wastage = parseFloat(line.wastagePercentage) || 0;
            const totalQty = stdQty * (1 + wastage / 100);
            const cost = parseFloat(line.unitCost) || 0;
            const lineCost = totalQty * cost;
            totalCost += lineCost;

            return {
                id: `BOMI-${String(idx + 1).padStart(3, '0')}`,
                rawMaterialName: line.rawMaterialName.trim(),
                rawMaterialCategory: line.rawMaterialCategory || 'Fabric',
                unit: line.unit || 'MTR',
                standardQuantity: stdQty,
                wastagePercentage: wastage,
                totalRequiredQuantity: parseFloat(totalQty.toFixed(2)),
                unitCost: cost,
                estimatedTotalCost: parseFloat(lineCost.toFixed(2)),
                notes: line.notes || ''
            };
        });

        const outputQty = parseInt(data.outputQuantity) || 100;
        const costPerUnit = outputQty > 0 ? totalCost / outputQty : 0;

        const newBom = {
            id,
            bomNumber,
            name: data.name.trim(),
            productId: data.productId,
            productName: product ? product.name : 'Garment Product',
            productVariantId: data.productVariantId || 'ALL',
            variantName: data.variantName || 'All Variants',
            outputQuantity: outputQty,
            outputUnit: data.outputUnit || 'PCS',
            version: data.version || 'v1.0',
            status: data.status || 'ACTIVE',
            isDefault: data.isDefault || false,
            effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
            notes: data.notes || '',
            materialLines: validatedLines,
            totalEstimatedMaterialCost: parseFloat(totalCost.toFixed(2)),
            estimatedCostPerUnit: parseFloat(costPerUnit.toFixed(2)),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userName
        };

        if (newBom.isDefault) {
            items.forEach(b => {
                if (b.productId === newBom.productId) b.isDefault = false;
            });
        }

        items.unshift(newBom);
        bomStore.set(BOM_STORAGE_KEYS.BOMS, items);
        return { success: true, bom: newBom };
    }

    async toggleBomStatus(id, userName = 'Admin') {
        const items = bomStore.get(BOM_STORAGE_KEYS.BOMS);
        const item = items.find(b => b.id === id);
        if (!item) return { success: false, message: 'BOM not found' };

        item.status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        item.updatedAt = new Date().toISOString();
        bomStore.set(BOM_STORAGE_KEYS.BOMS, items);
        return { success: true, status: item.status };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const bomService = new BomService();
