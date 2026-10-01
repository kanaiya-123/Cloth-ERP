// CLOTHERP - Centralized Persistent Job Worker & Job Orders Data Store
export const JOBWORK_STORAGE_KEYS = {
    JOB_WORKERS: 'clotherp_job_workers_db',
    JOB_ORDERS: 'clotherp_job_orders_db'
};

const SEED_JOB_WORKERS = [
    {
        id: 'JW-001',
        jobWorkerCode: 'JW-SUR-01',
        name: 'Mehta Embroidery Works',
        contactPerson: 'Ketan Mehta',
        phone: '+91 261 2899 440',
        email: 'mehta.embroidery@surat.local',
        address: 'Plot 48, GIDC Industrial Estate, Pandesara, Surat',
        city: 'Surat',
        state: 'Gujarat',
        gstin: '24AABCM9910E1Z4',
        serviceTypes: ['Embroidery', 'Zari Work', 'Sequin Attachment'],
        rateType: 'Per Piece',
        defaultRate: 25.00,
        status: 'ACTIVE',
        createdAt: '2026-08-05T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    },
    {
        id: 'JW-002',
        jobWorkerCode: 'JW-AHM-02',
        name: 'Kalamkari Screen Printers',
        contactPerson: 'Arvind Prajapati',
        phone: '+91 79 4899 7711',
        email: 'kalamkari.print@ahmedabad.local',
        address: 'Bays 12-14, Narol Textile Processing Zone, Ahmedabad',
        city: 'Ahmedabad',
        state: 'Gujarat',
        gstin: '24AABCK8820D1Z8',
        serviceTypes: ['Screen Printing', 'Discharge Printing', 'Digital Fabric Print'],
        rateType: 'Per Meter',
        defaultRate: 18.50,
        status: 'ACTIVE',
        createdAt: '2026-08-08T11:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    },
    {
        id: 'JW-003',
        jobWorkerCode: 'JW-AHM-03',
        name: 'Shreeji Garment Stitchers',
        contactPerson: 'Dhaval Patel',
        phone: '+91 79 4899 3320',
        email: 'shreeji.stitch@ahmedabad.local',
        address: 'Floor 3, Mahavir Industrial Complex, Odhav, Ahmedabad',
        city: 'Ahmedabad',
        state: 'Gujarat',
        gstin: '24AABCS7712C1Z2',
        serviceTypes: ['Shirt Stitching', 'Collar Assembly', 'Button Holing'],
        rateType: 'Per Piece',
        defaultRate: 35.00,
        status: 'ACTIVE',
        createdAt: '2026-08-12T12:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    }
];

const SEED_JOB_ORDERS = [
    {
        id: 'JWO-000001',
        jobWorkOrderNumber: 'JWO-2026-00001',
        title: 'Chanderi Kurti Neckline Zari Embroidery',
        jobWorkerId: 'JW-001',
        jobWorkerName: 'Mehta Embroidery Works',
        serviceType: 'Embroidery',
        productionOrderId: 'PROD-000002',
        productionOrderNumber: 'PROD-2026-00002',
        productName: 'Chanderi Silk Embroidered Kurti',
        issuedQuantity: 50,
        receivedQuantity: 50,
        pendingQuantity: 0,
        ratePerUnit: 35,
        totalCharges: 1750,
        sourceWarehouseId: 'WH-001',
        sourceWarehouseName: 'Central Apparel Warehouse',
        status: 'Completed',
        issueDate: '2026-08-21',
        expectedReturnDate: '2026-08-25',
        actualReturnDate: '2026-08-25 04:00 PM',
        transportName: 'Local Van Pickup',
        lrNumber: 'JW-CHALLAN-1092',
        notes: 'Metallic gold zari neck yoke embroidery',
        activity: [
            { user: 'Admin', action: 'Job Work Order created for 50 pcs kurti panels', time: '2026-08-21 11:00 AM' },
            { user: 'Manager', action: 'Materials dispatched to Mehta Embroidery Works (JW-CHALLAN-1092)', time: '2026-08-21 02:30 PM' },
            { user: 'QC Inspector', action: '50 pcs received and inspected from job worker — 100% Quality Passed', time: '2026-08-25 04:00 PM' }
        ],
        createdAt: '2026-08-21T05:30:00Z',
        updatedAt: '2026-08-25T10:30:00Z',
        createdBy: 'Admin'
    }
];

class JobWorkStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(JOBWORK_STORAGE_KEYS.JOB_WORKERS)) {
            localStorage.setItem(JOBWORK_STORAGE_KEYS.JOB_WORKERS, JSON.stringify(SEED_JOB_WORKERS));
        }
        if (!localStorage.getItem(JOBWORK_STORAGE_KEYS.JOB_ORDERS)) {
            localStorage.setItem(JOBWORK_STORAGE_KEYS.JOB_ORDERS, JSON.stringify(SEED_JOB_ORDERS));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[JobWorkStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[JobWorkStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const jobWorkStore = new JobWorkStore();
