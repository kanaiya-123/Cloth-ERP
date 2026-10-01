// CLOTHERP - Centralized Production Orders & Manufacturing Engine
import { productionStore, PRODUCTION_STORAGE_KEYS } from './productionStore.js';
import { bomService } from './bomService.js';
import { productService } from './productService.js';
import { branchService } from './branchService.js';
import { warehouseService } from './warehouseService.js';
import { stockMovementService } from './stockMovementService.js';
import { notificationService } from './notificationService.js';

class ProductionService {
    async getProductionOrders({ page = 1, pageSize = 15, search = '', status = '', priority = '' } = {}) {
        await this._delay(80);
        let items = productionStore.get(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS);

        if (status) items = items.filter(p => p.status === status);
        if (priority) items = items.filter(p => p.priority === priority);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(p => 
                (p.productionOrderNumber && p.productionOrderNumber.toLowerCase().includes(q)) ||
                (p.productName && p.productName.toLowerCase().includes(q)) ||
                (p.title && p.title.toLowerCase().includes(q)) ||
                (p.bomNumber && p.bomNumber.toLowerCase().includes(q))
            );
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize);

        const allOrders = productionStore.get(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS);
        const inProductionCount = allOrders.filter(p => p.status === 'In Production').length;
        const plannedCount = allOrders.filter(p => p.status === 'Planned' || p.status === 'Draft').length;
        const completedCount = allOrders.filter(p => p.status === 'Completed').length;
        const totalUnitsPlanned = allOrders.reduce((acc, p) => acc + (p.plannedQuantity || 0), 0);

        return {
            items: paginatedItems,
            summary: {
                totalOrders: allOrders.length,
                inProductionCount,
                plannedCount,
                completedCount,
                totalUnitsPlanned
            },
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    }

    async getProductionOrderById(id) {
        const items = productionStore.get(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS);
        return items.find(p => p.id === id || p.productionOrderNumber === id) || null;
    }

    async calculateMaterialRequirement(bomId, plannedQuantity) {
        const bom = await bomService.getBomById(bomId);
        if (!bom) return { success: false, message: 'BOM not found' };

        const ratio = (plannedQuantity || 100) / (bom.outputQuantity || 100);
        let totalCost = 0;

        const requirements = (bom.materialLines || []).map(line => {
            const reqQty = parseFloat((line.totalRequiredQuantity * ratio).toFixed(2));
            const cost = reqQty * (line.unitCost || 0);
            totalCost += cost;

            return {
                ...line,
                calculatedQuantity: reqQty,
                calculatedCost: parseFloat(cost.toFixed(2))
            };
        });

        return {
            success: true,
            bom,
            ratio,
            plannedQuantity,
            requirements,
            totalEstimatedMaterialCost: parseFloat(totalCost.toFixed(2))
        };
    }

    async createProductionOrder(data, userName = 'Admin') {
        const items = productionStore.get(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS);
        const id = `PROD-${String(items.length + 1).padStart(6, '0')}`;
        const productionOrderNumber = `PROD-${new Date().getFullYear()}-${String(items.length + 1).padStart(5, '0')}`;

        const [bom, product, branch, rawWh, fgWh] = await Promise.all([
            bomService.getBomById(data.bomId),
            productService.getProductById(data.productId),
            branchService.getBranchById(data.branchId),
            warehouseService.getWarehouseById(data.rawMaterialWarehouseId),
            warehouseService.getWarehouseById(data.finishedGoodsWarehouseId)
        ]);

        if (!bom) return { success: false, message: 'Invalid BOM specified.' };

        const plannedQty = parseInt(data.plannedQuantity) || 100;
        const reqCalc = await this.calculateMaterialRequirement(data.bomId, plannedQty);

        const defaultStages = [
            { id: 'stg_1', name: 'Cutting', status: 'NOT_STARTED', inputQty: plannedQty, outputQty: 0, rejectedQty: 0, completedAt: null, operator: '', notes: '' },
            { id: 'stg_2', name: 'Stitching', status: 'NOT_STARTED', inputQty: 0, outputQty: 0, rejectedQty: 0, completedAt: null, operator: '', notes: '' },
            { id: 'stg_3', name: 'Washing & Finishing', status: 'NOT_STARTED', inputQty: 0, outputQty: 0, rejectedQty: 0, completedAt: null, operator: '', notes: '' },
            { id: 'stg_4', name: 'Quality Inspection', status: 'NOT_STARTED', inputQty: 0, outputQty: 0, rejectedQty: 0, completedAt: null, operator: '', notes: '' },
            { id: 'stg_5', name: 'Tagging & Polybag Packing', status: 'NOT_STARTED', inputQty: 0, outputQty: 0, rejectedQty: 0, completedAt: null, operator: '', notes: '' }
        ];

        const newOrder = {
            id,
            productionOrderNumber,
            title: data.title || `${product ? product.name : 'Garment'} Batch (${plannedQty} pcs)`,
            productId: data.productId,
            productName: product ? product.name : bom.productName,
            productVariantId: data.productVariantId || 'ALL',
            variantName: data.variantName || 'Mixed Sizes',
            bomId: bom.id,
            bomNumber: bom.bomNumber,
            bomVersion: bom.version || 'v1.0',
            plannedQuantity: plannedQty,
            producedQuantity: 0,
            acceptedQuantity: 0,
            rejectedQuantity: 0,
            reworkQuantity: 0,
            pendingQuantity: plannedQty,
            branchId: data.branchId,
            branchName: branch ? branch.name : 'Central Branch',
            rawMaterialWarehouseId: data.rawMaterialWarehouseId,
            rawMaterialWarehouseName: rawWh ? rawWh.name : 'Central Warehouse',
            finishedGoodsWarehouseId: data.finishedGoodsWarehouseId,
            finishedGoodsWarehouseName: fgWh ? fgWh.name : 'Central Warehouse',
            status: data.submitNow ? 'Planned' : 'Draft',
            priority: data.priority || 'NORMAL',
            plannedStartDate: data.plannedStartDate || new Date().toISOString().split('T')[0],
            expectedCompletionDate: data.expectedCompletionDate || new Date().toISOString().split('T')[0],
            actualCompletionDate: null,
            materialsIssued: false,
            materialIssueNumber: null,
            materialIssueDate: null,
            stages: defaultStages,
            sizeMatrix: data.sizeMatrix || [
                { size: 'S', planned: Math.round(plannedQty * 0.2), cut: 0, finished: 0 },
                { size: 'M', planned: Math.round(plannedQty * 0.4), cut: 0, finished: 0 },
                { size: 'L', planned: Math.round(plannedQty * 0.3), cut: 0, finished: 0 },
                { size: 'XL', planned: Math.round(plannedQty * 0.1), cut: 0, finished: 0 }
            ],
            costing: {
                estimatedRawMaterialCost: reqCalc.totalEstimatedMaterialCost,
                actualRawMaterialCost: reqCalc.totalEstimatedMaterialCost,
                jobWorkCharges: 0,
                inHouseLaborCost: parseFloat((plannedQty * 25).toFixed(2)),
                packagingCost: parseFloat((plannedQty * 3.5).toFixed(2)),
                totalProductionCost: parseFloat((reqCalc.totalEstimatedMaterialCost + (plannedQty * 28.5)).toFixed(2)),
                unitCost: parseFloat(((reqCalc.totalEstimatedMaterialCost + (plannedQty * 28.5)) / plannedQty).toFixed(2))
            },
            activity: [
                { user: userName, action: `Production Order ${productionOrderNumber} created for ${plannedQty} pcs`, time: new Date().toLocaleString() }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userName
        };

        items.unshift(newOrder);
        productionStore.set(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS, items);

        return { success: true, productionOrder: newOrder };
    }

    async issueMaterials(id, userName = 'Manager') {
        const items = productionStore.get(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS);
        const order = items.find(p => p.id === id);
        if (!order) return { success: false, message: 'Production order not found' };

        if (order.materialsIssued) {
            return { success: false, message: 'Materials already issued for this production order.' };
        }

        const miNumber = `MI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
        const nowDisplay = new Date().toLocaleString();

        order.materialsIssued = true;
        order.materialIssueNumber = miNumber;
        order.materialIssueDate = nowDisplay;
        order.status = 'In Production';
        order.stages[0].status = 'IN_PROGRESS';
        order.updatedAt = new Date().toISOString();

        order.activity.push({
            user: userName,
            action: `Raw materials issued to production floor (${miNumber}) from ${order.rawMaterialWarehouseName} — Order moved to In Production`,
            time: nowDisplay
        });

        productionStore.set(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS, items);

        await notificationService.createNotification({
            type: 'SYSTEM',
            priority: 'NORMAL',
            title: `Material Issued: ${order.productionOrderNumber}`,
            message: `Raw materials for batch ${order.productionOrderNumber} (${order.plannedQuantity} pcs) issued to cutting floor.`,
            referenceType: 'PRODUCTION',
            referenceId: order.id,
            referenceNumber: order.productionOrderNumber,
            actionUrl: `./production-details.html?id=${order.id}`,
            targetRole: 'ALL',
            createdBy: userName
        });

        return { success: true, order };
    }

    async updateStageProgress(id, stageIndex, stageData, userName = 'Supervisor') {
        const items = productionStore.get(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS);
        const order = items.find(p => p.id === id);
        if (!order) return { success: false, message: 'Production order not found' };

        if (!order.stages[stageIndex]) return { success: false, message: 'Invalid stage index' };

        const stg = order.stages[stageIndex];
        stg.status = stageData.status || stg.status;
        stg.outputQty = parseInt(stageData.outputQty) || stg.outputQty;
        stg.rejectedQty = parseInt(stageData.rejectedQty) || 0;
        stg.operator = stageData.operator || stg.operator;
        stg.notes = stageData.notes || stg.notes;

        if (stg.status === 'COMPLETED') {
            stg.completedAt = new Date().toISOString().split('T')[0];
            // Auto unlock next stage if available
            if (order.stages[stageIndex + 1] && order.stages[stageIndex + 1].status === 'NOT_STARTED') {
                order.stages[stageIndex + 1].status = 'IN_PROGRESS';
                order.stages[stageIndex + 1].inputQty = stg.outputQty;
            }
        }

        order.updatedAt = new Date().toISOString();
        order.activity.push({
            user: userName,
            action: `Stage '${stg.name}' updated: Status ${stg.status} (Output: ${stg.outputQty} pcs, Rejected: ${stg.rejectedQty} pcs)`,
            time: new Date().toLocaleString()
        });

        productionStore.set(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS, items);
        return { success: true, order };
    }

    async recordQualityCheck(id, qcData, userName = 'QC Inspector') {
        const items = productionStore.get(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS);
        const order = items.find(p => p.id === id);
        if (!order) return { success: false, message: 'Production order not found' };

        const accepted = parseInt(qcData.acceptedQuantity) || 0;
        const rejected = parseInt(qcData.rejectedQuantity) || 0;
        const rework = parseInt(qcData.reworkQuantity) || 0;

        order.producedQuantity = accepted + rejected;
        order.acceptedQuantity = accepted;
        order.rejectedQuantity = rejected;
        order.reworkQuantity = rework;
        order.status = 'Quality Checked';

        const nowDisplay = new Date().toLocaleString();
        order.updatedAt = new Date().toISOString();
        order.activity.push({
            user: userName,
            action: `Quality Inspection completed: ${accepted} pcs Accepted, ${rejected} pcs Rejected, ${rework} pcs Rework`,
            time: nowDisplay
        });

        productionStore.set(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS, items);
        return { success: true, order };
    }

    async receiveFinishedGoods(id, receiptData = {}, userName = 'Manager') {
        const items = productionStore.get(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS);
        const order = items.find(p => p.id === id);
        if (!order) return { success: false, message: 'Production order not found' };

        const qtyToReceive = parseInt(receiptData.quantity) || order.acceptedQuantity || order.plannedQuantity;
        const pgrNumber = `PGR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

        // Execute stock IN for finished product
        await stockMovementService.recordStockIn({
            productVariantId: order.productVariantId === 'ALL' ? 'var_101_1' : order.productVariantId,
            quantity: qtyToReceive,
            movementType: 'PRODUCTION_RECEIPT',
            referenceType: 'Production Receipt',
            referenceId: order.id,
            referenceNumber: pgrNumber,
            reason: `Finished Goods production batch ${order.productionOrderNumber}`,
            notes: `Credited into ${order.finishedGoodsWarehouseName}`
        }, userName);

        const nowDisplay = new Date().toLocaleString();
        order.status = 'Completed';
        order.actualCompletionDate = nowDisplay;
        order.updatedAt = new Date().toISOString();

        order.activity.push({
            user: userName,
            action: `Finished Goods Intake (${pgrNumber}): ${qtyToReceive} pcs credited into ${order.finishedGoodsWarehouseName} — Production Batch 100% Completed`,
            time: nowDisplay
        });

        productionStore.set(PRODUCTION_STORAGE_KEYS.PRODUCTION_ORDERS, items);

        await notificationService.createNotification({
            type: 'SYSTEM',
            priority: 'NORMAL',
            title: `Production Batch Completed: ${order.productionOrderNumber}`,
            message: `${qtyToReceive} pcs of ${order.productName} completed and received into ${order.finishedGoodsWarehouseName}.`,
            referenceType: 'PRODUCTION',
            referenceId: order.id,
            referenceNumber: order.productionOrderNumber,
            actionUrl: `./production-details.html?id=${order.id}`,
            targetRole: 'ALL',
            createdBy: userName
        });

        return { success: true, order, pgrNumber };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const productionService = new ProductionService();
