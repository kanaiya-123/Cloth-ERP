// CLOTHERP - Centralized Stock Transfer Lifecycle Service
import { transferStore, TRANSFER_STORAGE_KEYS } from './transferStore.js';
import { branchService } from './branchService.js';
import { warehouseService } from './warehouseService.js';
import { stockMovementService } from './stockMovementService.js';
import { locationService } from './locationService.js';
import { notificationService } from './notificationService.js';

class StockTransferService {
    async getTransfers({ page = 1, pageSize = 15, search = '', status = '', sourceBranchId = '', destinationBranchId = '', sortBy = 'newest' } = {}) {
        await this._delay(80);
        let items = transferStore.get(TRANSFER_STORAGE_KEYS.TRANSFERS);

        if (status) items = items.filter(t => t.status === status);
        if (sourceBranchId) items = items.filter(t => t.sourceBranchId === sourceBranchId);
        if (destinationBranchId) items = items.filter(t => t.destinationBranchId === destinationBranchId);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(t => 
                (t.transferNumber && t.transferNumber.toLowerCase().includes(q)) ||
                (t.sourceWarehouseName && t.sourceWarehouseName.toLowerCase().includes(q)) ||
                (t.destinationWarehouseName && t.destinationWarehouseName.toLowerCase().includes(q)) ||
                (t.lrNumber && t.lrNumber.toLowerCase().includes(q)) ||
                (t.transportName && t.transportName.toLowerCase().includes(q)) ||
                (t.items && t.items.some(i => i.productName.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q))))
            );
        }

        if (sortBy === 'newest') items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (sortBy === 'oldest') items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize);

        const allTransfers = transferStore.get(TRANSFER_STORAGE_KEYS.TRANSFERS);
        const awaitingApproval = allTransfers.filter(t => t.status === 'Submitted').length;
        const inTransit = allTransfers.filter(t => t.status === 'Dispatched' || t.status === 'Partially Received').length;
        const completed = allTransfers.filter(t => t.status === 'Received').length;

        return {
            items: paginatedItems,
            summary: {
                totalTransfers: allTransfers.length,
                awaitingApproval,
                inTransit,
                completed
            },
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    }

    async getTransferById(id) {
        const items = transferStore.get(TRANSFER_STORAGE_KEYS.TRANSFERS);
        return items.find(t => t.id === id) || null;
    }

    async createTransfer(data, userName = 'Admin') {
        const items = transferStore.get(TRANSFER_STORAGE_KEYS.TRANSFERS);
        const id = `TRF-${String(items.length + 1).padStart(6, '0')}`;
        const transferNumber = `TRF-${new Date().getFullYear()}-${String(items.length + 1).padStart(5, '0')}`;

        // Validate source and destination
        if (data.sourceWarehouseId === data.destinationWarehouseId) {
            return { success: false, message: 'Source and Destination warehouses cannot be identical.' };
        }

        const [srcBranch, dstBranch, srcWh, dstWh] = await Promise.all([
            branchService.getBranchById(data.sourceBranchId),
            branchService.getBranchById(data.destinationBranchId),
            warehouseService.getWarehouseById(data.sourceWarehouseId),
            warehouseService.getWarehouseById(data.destinationWarehouseId)
        ]);

        if (!srcWh || !dstWh) {
            return { success: false, message: 'Invalid source or destination warehouse specified.' };
        }

        // Validate items and source stock availability
        let totalRequestedQty = 0;
        const validatedItems = [];

        for (const item of (data.items || [])) {
            const reqQty = parseInt(item.requestedQuantity) || 0;
            if (reqQty <= 0) continue;

            const currentSourceStock = locationService.getVariantStockInWarehouse(item.productVariantId, data.sourceWarehouseId);
            if (currentSourceStock < reqQty) {
                return { 
                    success: false, 
                    message: `Insufficient stock in ${srcWh.name} for ${item.productName} (${item.variantName}). Available: ${currentSourceStock}, Requested: ${reqQty}` 
                };
            }

            totalRequestedQty += reqQty;
            validatedItems.push({
                productId: item.productId,
                productName: item.productName,
                productVariantId: item.productVariantId,
                variantName: item.variantName || `${item.color} / ${item.size}`,
                color: item.color,
                size: item.size,
                sku: item.sku,
                requestedQuantity: reqQty,
                dispatchedQuantity: 0,
                receivedQuantity: 0,
                inTransitQuantity: 0,
                rate: item.rate || 1499,
                remarks: item.remarks || ''
            });
        }

        if (validatedItems.length === 0) {
            return { success: false, message: 'Please specify at least one product variant with quantity greater than zero.' };
        }

        const nowIso = new Date().toISOString();
        const nowDisplay = new Date().toLocaleString();

        const newTransfer = {
            id,
            transferNumber,
            sourceBranchId: data.sourceBranchId,
            sourceBranchName: srcBranch ? srcBranch.name : 'Source Branch',
            sourceWarehouseId: data.sourceWarehouseId,
            sourceWarehouseName: srcWh.name,
            destinationBranchId: data.destinationBranchId,
            destinationBranchName: dstBranch ? dstBranch.name : 'Destination Branch',
            destinationWarehouseId: data.destinationWarehouseId,
            destinationWarehouseName: dstWh.name,
            status: data.submitNow ? 'Submitted' : 'Draft',
            transferDate: data.transferDate || nowIso.split('T')[0],
            expectedReceiveDate: data.expectedReceiveDate || nowIso.split('T')[0],
            dispatchDate: null,
            receiveDate: null,
            totalRequestedQuantity: totalRequestedQty,
            totalDispatchedQuantity: 0,
            totalReceivedQuantity: 0,
            inTransitQuantity: 0,
            transportName: data.transportName || '',
            lrNumber: (data.lrNumber || '').toUpperCase(),
            vehicleNumber: (data.vehicleNumber || '').toUpperCase(),
            driverName: data.driverName || '',
            notes: data.notes || '',
            items: validatedItems,
            activity: [
                { user: userName, action: `Stock transfer ${transferNumber} created${data.submitNow ? ' and submitted for approval' : ' as Draft'}`, time: nowDisplay }
            ],
            createdAt: nowIso,
            updatedAt: nowIso,
            createdBy: userName
        };

        items.unshift(newTransfer);
        transferStore.set(TRANSFER_STORAGE_KEYS.TRANSFERS, items);

        // If submitted, notify destination & manager
        if (newTransfer.status === 'Submitted') {
            await notificationService.createNotification({
                type: 'SYSTEM',
                priority: 'NORMAL',
                title: `Stock Transfer Request: ${transferNumber}`,
                message: `Transfer of ${totalRequestedQty} units requested from ${srcWh.name} to ${dstWh.name}.`,
                referenceType: 'STOCK_TRANSFER',
                referenceId: newTransfer.id,
                referenceNumber: transferNumber,
                actionUrl: `./transfer-details.html?id=${newTransfer.id}`,
                targetRole: 'MANAGER',
                createdBy: userName
            });
        }

        return { success: true, transfer: newTransfer };
    }

    async approveTransfer(id, userName = 'Manager') {
        const items = transferStore.get(TRANSFER_STORAGE_KEYS.TRANSFERS);
        const transfer = items.find(t => t.id === id);
        if (!transfer) return { success: false, message: 'Transfer record not found' };

        if (transfer.status !== 'Draft' && transfer.status !== 'Submitted') {
            return { success: false, message: `Cannot approve transfer in '${transfer.status}' status.` };
        }

        transfer.status = 'Approved';
        transfer.approvedBy = userName;
        transfer.updatedAt = new Date().toISOString();
        transfer.activity.push({
            user: userName,
            action: `Transfer approved for consignment packing & dispatch`,
            time: new Date().toLocaleString()
        });

        transferStore.set(TRANSFER_STORAGE_KEYS.TRANSFERS, items);
        return { success: true, transfer };
    }

    async dispatchTransfer(id, transportData = {}, userName = 'Admin') {
        const items = transferStore.get(TRANSFER_STORAGE_KEYS.TRANSFERS);
        const transfer = items.find(t => t.id === id);
        if (!transfer) return { success: false, message: 'Transfer not found' };

        if (transfer.status !== 'Approved' && transfer.status !== 'Submitted' && transfer.status !== 'Draft') {
            return { success: false, message: `Cannot dispatch transfer in '${transfer.status}' status.` };
        }

        // Validate source warehouse stock
        for (const item of transfer.items) {
            const avail = locationService.getVariantStockInWarehouse(item.productVariantId, transfer.sourceWarehouseId);
            if (avail < item.requestedQuantity) {
                return { 
                    success: false, 
                    message: `Cannot dispatch: Available stock for ${item.productName} in ${transfer.sourceWarehouseName} is ${avail} pcs (Need: ${item.requestedQuantity} pcs).` 
                };
            }
        }

        // Execute TRANSFER_OUT for each line item from source warehouse
        for (const item of transfer.items) {
            await stockMovementService.recordStockOut({
                productVariantId: item.productVariantId,
                quantity: item.requestedQuantity,
                movementType: 'TRANSFER_OUT',
                referenceType: 'Stock Transfer',
                referenceId: transfer.id,
                referenceNumber: transfer.transferNumber,
                reason: `Transfer to ${transfer.destinationWarehouseName}`,
                notes: `Consignment LR: ${transportData.lrNumber || transfer.lrNumber || 'N/A'}`
            }, userName);

            item.dispatchedQuantity = item.requestedQuantity;
            item.inTransitQuantity = item.requestedQuantity;
        }

        const nowDisplay = new Date().toLocaleString();
        transfer.status = 'Dispatched';
        transfer.dispatchDate = nowDisplay;
        transfer.totalDispatchedQuantity = transfer.totalRequestedQuantity;
        transfer.inTransitQuantity = transfer.totalRequestedQuantity;

        if (transportData.transportName) transfer.transportName = transportData.transportName;
        if (transportData.lrNumber) transfer.lrNumber = transportData.lrNumber.toUpperCase();
        if (transportData.vehicleNumber) transfer.vehicleNumber = transportData.vehicleNumber.toUpperCase();
        if (transportData.driverName) transfer.driverName = transportData.driverName;

        transfer.dispatchedBy = userName;
        transfer.updatedAt = new Date().toISOString();
        transfer.activity.push({
            user: userName,
            action: `Consignment dispatched via ${transfer.transportName || 'Logistics'} (LR: ${transfer.lrNumber || 'Direct'}) - ${transfer.totalDispatchedQuantity} units deducted from ${transfer.sourceWarehouseName}`,
            time: nowDisplay
        });

        transferStore.set(TRANSFER_STORAGE_KEYS.TRANSFERS, items);

        // Notify destination warehouse
        await notificationService.createNotification({
            type: 'PURCHASE_SHIPMENT_UPDATE',
            priority: 'HIGH',
            title: `Stock Transfer Dispatched: ${transfer.transferNumber}`,
            message: `${transfer.totalDispatchedQuantity} units dispatched from ${transfer.sourceWarehouseName} to ${transfer.destinationWarehouseName}. In transit.`,
            referenceType: 'STOCK_TRANSFER',
            referenceId: transfer.id,
            referenceNumber: transfer.transferNumber,
            actionUrl: `./transfer-details.html?id=${transfer.id}`,
            targetRole: 'ALL',
            createdBy: userName
        });

        return { success: true, transfer };
    }

    async receiveTransfer(id, receiveData = {}, userName = 'Manager') {
        const items = transferStore.get(TRANSFER_STORAGE_KEYS.TRANSFERS);
        const transfer = items.find(t => t.id === id);
        if (!transfer) return { success: false, message: 'Transfer not found' };

        if (transfer.status !== 'Dispatched' && transfer.status !== 'Partially Received') {
            return { success: false, message: `Cannot receive transfer in '${transfer.status}' status.` };
        }

        const receiveItemsMap = receiveData.items || {};
        let newlyReceivedTotal = 0;

        for (const item of transfer.items) {
            const qtyToReceive = parseInt(receiveItemsMap[item.productVariantId] !== undefined ? receiveItemsMap[item.productVariantId] : item.inTransitQuantity) || 0;

            if (qtyToReceive <= 0) continue;
            if (qtyToReceive > item.inTransitQuantity) {
                return {
                    success: false,
                    message: `Receive quantity for ${item.productName} (${qtyToReceive}) exceeds remaining in-transit quantity (${item.inTransitQuantity}).`
                };
            }

            // Execute TRANSFER_IN into destination warehouse
            await stockMovementService.recordStockIn({
                productVariantId: item.productVariantId,
                quantity: qtyToReceive,
                movementType: 'TRANSFER_IN',
                referenceType: 'Stock Transfer',
                referenceId: transfer.id,
                referenceNumber: transfer.transferNumber,
                reason: `Received from ${transfer.sourceWarehouseName}`,
                notes: `Received at ${transfer.destinationWarehouseName}`
            }, userName);

            item.receivedQuantity = (item.receivedQuantity || 0) + qtyToReceive;
            item.inTransitQuantity = item.inTransitQuantity - qtyToReceive;
            newlyReceivedTotal += qtyToReceive;
        }

        if (newlyReceivedTotal === 0) {
            return { success: false, message: 'Please specify a receive quantity greater than 0.' };
        }

        transfer.totalReceivedQuantity = (transfer.totalReceivedQuantity || 0) + newlyReceivedTotal;
        transfer.inTransitQuantity = Math.max(0, transfer.inTransitQuantity - newlyReceivedTotal);

        const nowDisplay = new Date().toLocaleString();
        const isFullyReceived = transfer.inTransitQuantity === 0;

        transfer.status = isFullyReceived ? 'Received' : 'Partially Received';
        if (isFullyReceived) transfer.receiveDate = nowDisplay;
        transfer.receivedBy = userName;
        transfer.updatedAt = new Date().toISOString();

        transfer.activity.push({
            user: userName,
            action: `${newlyReceivedTotal} units received into ${transfer.destinationWarehouseName}${isFullyReceived ? ' — Consignment 100% completed' : ` — ${transfer.inTransitQuantity} units remaining in transit`}`,
            time: nowDisplay
        });

        transferStore.set(TRANSFER_STORAGE_KEYS.TRANSFERS, items);

        // Notify
        await notificationService.createNotification({
            type: 'SYSTEM',
            priority: 'NORMAL',
            title: `Transfer Consignment Received: ${transfer.transferNumber}`,
            message: `${newlyReceivedTotal} units received at ${transfer.destinationWarehouseName} (Status: ${transfer.status}).`,
            referenceType: 'STOCK_TRANSFER',
            referenceId: transfer.id,
            referenceNumber: transfer.transferNumber,
            actionUrl: `./transfer-details.html?id=${transfer.id}`,
            targetRole: 'ALL',
            createdBy: userName
        });

        return { success: true, transfer };
    }

    async cancelTransfer(id, reason = 'Cancelled by user', userName = 'Admin') {
        const items = transferStore.get(TRANSFER_STORAGE_KEYS.TRANSFERS);
        const transfer = items.find(t => t.id === id);
        if (!transfer) return { success: false, message: 'Transfer not found' };

        if (transfer.status === 'Dispatched' || transfer.status === 'In Transit' || transfer.status === 'Partially Received' || transfer.status === 'Received') {
            return { success: false, message: `Dispatched or received transfers cannot be cancelled directly. Stock has already left warehouse.` };
        }

        transfer.status = 'Cancelled';
        transfer.updatedAt = new Date().toISOString();
        transfer.activity.push({
            user: userName,
            action: `Transfer cancelled: ${reason}`,
            time: new Date().toLocaleString()
        });

        transferStore.set(TRANSFER_STORAGE_KEYS.TRANSFERS, items);
        return { success: true, transfer };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const stockTransferService = new StockTransferService();
