// CLOTHERP - Centralized Branch Master Service
import { branchStore, BRANCH_STORAGE_KEYS } from './branchStore.js';

class BranchService {
    async getBranches({ page = 1, pageSize = 20, search = '', status = '', type = '' } = {}) {
        await this._delay(80);
        let items = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(b => 
                (b.name && b.name.toLowerCase().includes(q)) ||
                (b.branchCode && b.branchCode.toLowerCase().includes(q)) ||
                (b.city && b.city.toLowerCase().includes(q)) ||
                (b.state && b.state.toLowerCase().includes(q))
            );
        }

        if (status) items = items.filter(b => b.status === status);
        if (type) items = items.filter(b => b.type === type);

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize);

        const allBranches = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES);
        const activeCount = allBranches.filter(b => b.status === 'ACTIVE').length;
        const headOfficeCount = allBranches.filter(b => b.type === 'HEAD_OFFICE').length;
        const retailCount = allBranches.filter(b => b.type === 'RETAIL_STORE').length;

        return {
            items: paginatedItems,
            summary: {
                totalBranches: allBranches.length,
                activeCount,
                headOfficeCount,
                retailCount
            },
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            }
        };
    }

    async getActiveBranches() {
        const items = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES);
        return items.filter(b => b.status === 'ACTIVE');
    }

    async getBranchById(id) {
        const items = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES);
        return items.find(b => b.id === id) || null;
    }

    async createBranch(data, userName = 'Admin') {
        const items = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES);
        const id = `BR-${String(items.length + 1).padStart(3, '0')}`;

        // Validate uniqueness of code
        const codeExists = items.some(b => b.branchCode.toLowerCase() === data.branchCode.trim().toLowerCase());
        if (codeExists) {
            return { success: false, message: `Branch Code '${data.branchCode}' is already registered.` };
        }

        const newBranch = {
            id,
            branchCode: data.branchCode.trim().toUpperCase(),
            name: data.name.trim(),
            type: data.type || 'RETAIL_STORE',
            companyName: data.companyName || 'CLOTHERP Apparel Industries Pvt Ltd',
            gstin: (data.gstin || '').trim().toUpperCase(),
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || 'Gujarat',
            country: data.country || 'India',
            pincode: data.pincode || '',
            managerName: data.managerName || 'Assigned Manager',
            managerEmail: data.managerEmail || '',
            status: data.status || 'ACTIVE',
            isDefault: items.length === 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userName
        };

        items.push(newBranch);
        branchStore.set(BRANCH_STORAGE_KEYS.BRANCHES, items);
        return { success: true, branch: newBranch };
    }

    async updateBranch(id, data, userName = 'Admin') {
        const items = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES);
        const index = items.findIndex(b => b.id === id);
        if (index === -1) return { success: false, message: 'Branch not found' };

        // Validate code uniqueness if changing
        if (data.branchCode && data.branchCode.trim().toUpperCase() !== items[index].branchCode) {
            const codeExists = items.some(b => b.id !== id && b.branchCode.toLowerCase() === data.branchCode.trim().toLowerCase());
            if (codeExists) {
                return { success: false, message: `Branch Code '${data.branchCode}' is already in use.` };
            }
        }

        items[index] = {
            ...items[index],
            ...data,
            branchCode: data.branchCode ? data.branchCode.trim().toUpperCase() : items[index].branchCode,
            updatedAt: new Date().toISOString(),
            updatedBy: userName
        };

        branchStore.set(BRANCH_STORAGE_KEYS.BRANCHES, items);
        return { success: true, branch: items[index] };
    }

    async toggleBranchStatus(id, userName = 'Admin') {
        const items = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES);
        const item = items.find(b => b.id === id);
        if (!item) return { success: false, message: 'Branch not found' };

        item.status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        item.updatedAt = new Date().toISOString();
        item.updatedBy = userName;

        branchStore.set(BRANCH_STORAGE_KEYS.BRANCHES, items);
        return { success: true, status: item.status };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const branchService = new BranchService();
