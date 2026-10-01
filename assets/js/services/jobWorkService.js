// CLOTHERP - Centralized Job Work Outsourcing & Contractor Service
import { jobWorkStore, JOBWORK_STORAGE_KEYS } from './jobWorkStore.js';
import { warehouseService } from './warehouseService.js';
import { notificationService } from './notificationService.js';

class JobWorkService {
    // ==================== JOB WORKERS ====================
    async getJobWorkers({ search = '', status = '' } = {}) {
        await this._delay(60);
        let items = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_WORKERS);

        if (status) items = items.filter(w => w.status === status);
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(w => 
                (w.name && w.name.toLowerCase().includes(q)) ||
                (w.jobWorkerCode && w.jobWorkerCode.toLowerCase().includes(q)) ||
                (w.city && w.city.toLowerCase().includes(q))
            );
        }

        const all = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_WORKERS);
        return {
            items,
            summary: {
                totalWorkers: all.length,
                activeCount: all.filter(w => w.status === 'ACTIVE').length
            }
        };
    }

    async getActiveJobWorkers() {
        const items = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_WORKERS);
        return items.filter(w => w.status === 'ACTIVE');
    }

    async getJobWorkerById(id) {
        const items = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_WORKERS);
        return items.find(w => w.id === id) || null;
    }

    async createJobWorker(data, userName = 'Admin') {
        const items = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_WORKERS);
        const id = `JW-${String(items.length + 1).padStart(3, '0')}`;

        const newWorker = {
            id,
            jobWorkerCode: data.jobWorkerCode ? data.jobWorkerCode.trim().toUpperCase() : `JW-LOC-${String(items.length + 1).padStart(2, '0')}`,
            name: data.name.trim(),
            contactPerson: data.contactPerson || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            city: data.city || 'Ahmedabad',
            state: data.state || 'Gujarat',
            gstin: (data.gstin || '').trim().toUpperCase(),
            serviceTypes: data.serviceTypes || ['Stitching', 'Embroidery'],
            rateType: data.rateType || 'Per Piece',
            defaultRate: parseFloat(data.defaultRate) || 20.00,
            status: data.status || 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userName
        };

        items.push(newWorker);
        jobWorkStore.set(JOBWORK_STORAGE_KEYS.JOB_WORKERS, items);
        return { success: true, jobWorker: newWorker };
    }

    // ==================== JOB WORK ORDERS ====================
    async getJobOrders({ page = 1, pageSize = 15, search = '', status = '', jobWorkerId = '' } = {}) {
        await this._delay(80);
        let items = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_ORDERS);

        if (status) items = items.filter(j => j.status === status);
        if (jobWorkerId) items = items.filter(j => j.jobWorkerId === jobWorkerId);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(j => 
                (j.jobWorkOrderNumber && j.jobWorkOrderNumber.toLowerCase().includes(q)) ||
                (j.jobWorkerName && j.jobWorkerName.toLowerCase().includes(q)) ||
                (j.title && j.title.toLowerCase().includes(q)) ||
                (j.productName && j.productName.toLowerCase().includes(q))
            );
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize);

        const allOrders = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_ORDERS);
        const withJobWorkerCount = allOrders.filter(j => j.status === 'With Job Worker' || j.status === 'Partially Received').length;
        const completedCount = allOrders.filter(j => j.status === 'Completed').length;

        return {
            items: paginatedItems,
            summary: {
                totalOrders: allOrders.length,
                withJobWorkerCount,
                completedCount
            },
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    }

    async getJobOrderById(id) {
        const items = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_ORDERS);
        return items.find(j => j.id === id || j.jobWorkOrderNumber === id) || null;
    }

    async createJobOrder(data, userName = 'Admin') {
        const items = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_ORDERS);
        const id = `JWO-${String(items.length + 1).padStart(6, '0')}`;
        const jobWorkOrderNumber = `JWO-${new Date().getFullYear()}-${String(items.length + 1).padStart(5, '0')}`;

        const [worker, wh] = await Promise.all([
            this.getJobWorkerById(data.jobWorkerId),
            warehouseService.getWarehouseById(data.sourceWarehouseId)
        ]);

        const issuedQty = parseInt(data.issuedQuantity) || 100;
        const rate = parseFloat(data.ratePerUnit) || 25;
        const totalCharges = issuedQty * rate;

        const newJobOrder = {
            id,
            jobWorkOrderNumber,
            title: data.title || `${data.serviceType || 'Garment Job Work'} (${issuedQty} pcs)`,
            jobWorkerId: data.jobWorkerId,
            jobWorkerName: worker ? worker.name : 'Contractor',
            serviceType: data.serviceType || 'Embroidery',
            productionOrderId: data.productionOrderId || '',
            productionOrderNumber: data.productionOrderNumber || 'PROD-DIRECT',
            productName: data.productName || 'Garment Fabric / Panels',
            issuedQuantity: issuedQty,
            receivedQuantity: 0,
            pendingQuantity: issuedQty,
            ratePerUnit: rate,
            totalCharges: parseFloat(totalCharges.toFixed(2)),
            sourceWarehouseId: data.sourceWarehouseId,
            sourceWarehouseName: wh ? wh.name : 'Central Warehouse',
            status: data.submitNow ? 'With Job Worker' : 'Draft',
            issueDate: data.issueDate || new Date().toISOString().split('T')[0],
            expectedReturnDate: data.expectedReturnDate || new Date().toISOString().split('T')[0],
            actualReturnDate: null,
            transportName: data.transportName || 'Local Delivery',
            lrNumber: (data.lrNumber || '').toUpperCase(),
            notes: data.notes || '',
            activity: [
                { user: userName, action: `Job Work Order ${jobWorkOrderNumber} created for ${issuedQty} pcs to ${worker ? worker.name : 'Job Worker'}`, time: new Date().toLocaleString() }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userName
        };

        items.unshift(newJobOrder);
        jobWorkStore.set(JOBWORK_STORAGE_KEYS.JOB_ORDERS, items);

        return { success: true, jobOrder: newJobOrder };
    }

    async receiveJobOrder(id, receivedQty, userName = 'QC Inspector') {
        const items = jobWorkStore.get(JOBWORK_STORAGE_KEYS.JOB_ORDERS);
        const order = items.find(j => j.id === id);
        if (!order) return { success: false, message: 'Job Work Order not found' };

        const qty = parseInt(receivedQty) || 0;
        if (qty <= 0) return { success: false, message: 'Receive quantity must be greater than 0' };

        order.receivedQuantity = (order.receivedQuantity || 0) + qty;
        order.pendingQuantity = Math.max(0, order.issuedQuantity - order.receivedQuantity);

        const isFullyReceived = order.pendingQuantity === 0;
        const nowDisplay = new Date().toLocaleString();

        order.status = isFullyReceived ? 'Completed' : 'Partially Received';
        if (isFullyReceived) order.actualReturnDate = nowDisplay;
        order.updatedAt = new Date().toISOString();

        order.activity.push({
            user: userName,
            action: `${qty} pcs received back from ${order.jobWorkerName}${isFullyReceived ? ' — Job Work 100% Completed' : ` — ${order.pendingQuantity} pcs pending`}`,
            time: nowDisplay
        });

        jobWorkStore.set(JOBWORK_STORAGE_KEYS.JOB_ORDERS, items);
        return { success: true, order };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const jobWorkService = new JobWorkService();
