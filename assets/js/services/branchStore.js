// CLOTHERP - Centralized Persistent Branch Data Store
export const BRANCH_STORAGE_KEYS = {
    BRANCHES: 'clotherp_branches_db'
};

const SEED_BRANCHES = [
    {
        id: 'BR-001',
        branchCode: 'BR-AHM-01',
        name: 'Ahmedabad Central Hub',
        type: 'HEAD_OFFICE',
        companyName: 'CLOTHERP Apparel Industries Pvt Ltd',
        gstin: '24AABCC1234F1Z5',
        phone: '+91 79 4899 2200',
        email: 'ahmedabad.hub@clotherp.local',
        address: 'Plot 104-108, GIDC Apparel Park, Khokhra',
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        pincode: '380008',
        managerName: 'Rajesh Shah',
        managerEmail: 'admin@clotherp.local',
        status: 'ACTIVE',
        isDefault: true,
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    },
    {
        id: 'BR-002',
        branchCode: 'BR-SUR-02',
        name: 'Surat Textile Depot',
        type: 'DISTRIBUTION_CENTER',
        companyName: 'CLOTHERP Apparel Industries Pvt Ltd',
        gstin: '24AABCC1234F1Z5',
        phone: '+91 261 2899 110',
        email: 'surat.depot@clotherp.local',
        address: 'Shop 42-45, Millennium Textile Market, Ring Road',
        city: 'Surat',
        state: 'Gujarat',
        country: 'India',
        pincode: '395002',
        managerName: 'Vikram Patel',
        managerEmail: 'manager@clotherp.local',
        status: 'ACTIVE',
        isDefault: false,
        createdAt: '2026-08-05T11:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    },
    {
        id: 'BR-003',
        branchCode: 'BR-MUM-03',
        name: 'Mumbai Fashion Flagship',
        type: 'RETAIL_STORE',
        companyName: 'CLOTHERP Apparel Industries Pvt Ltd',
        gstin: '27AABCC1234F1Z2',
        phone: '+91 22 2640 8822',
        email: 'mumbai.flagship@clotherp.local',
        address: 'Level 2, Linking Road, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400050',
        managerName: 'Ananya Deshmukh',
        managerEmail: 'sales@clotherp.local',
        status: 'ACTIVE',
        isDefault: false,
        createdAt: '2026-08-10T12:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z'
    }
];

class BranchStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(BRANCH_STORAGE_KEYS.BRANCHES)) {
            localStorage.setItem(BRANCH_STORAGE_KEYS.BRANCHES, JSON.stringify(SEED_BRANCHES));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[BranchStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[BranchStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const branchStore = new BranchStore();
