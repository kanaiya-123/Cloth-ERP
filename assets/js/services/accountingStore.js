// CLOTHERP - Centralized Persistent Accounting & Financial Data Store
export const ACCOUNTING_STORAGE_KEYS = {
    ACCOUNT_GROUPS: 'clotherp_account_groups_db',
    CHART_OF_ACCOUNTS: 'clotherp_chart_of_accounts_db',
    JOURNAL_ENTRIES: 'clotherp_journal_entries_db',
    CASH_BANK_ACCOUNTS: 'clotherp_cash_bank_db',
    EXPENSES: 'clotherp_expenses_db',
    PAYMENT_TERMS: 'clotherp_payment_terms_db'
};

const SEED_ACCOUNT_GROUPS = [
    { id: 'grp_ca', name: 'Current Assets', code: '1100', accountType: 'ASSET', parentGroupId: null, description: 'Cash, bank balances, accounts receivable, and inventory' },
    { id: 'grp_fa', name: 'Fixed Assets', code: '1200', accountType: 'ASSET', parentGroupId: null, description: 'Plant, machinery, office equipment, and furniture' },
    { id: 'grp_cl', name: 'Current Liabilities', code: '2100', accountType: 'LIABILITY', parentGroupId: null, description: 'Accounts payable, GST payable, and short-term obligations' },
    { id: 'grp_eq', name: 'Equity & Capital', code: '3100', accountType: 'EQUITY', parentGroupId: null, description: 'Owner capital and retained earnings' },
    { id: 'grp_rev', name: 'Operating Revenue', code: '4100', accountType: 'INCOME', parentGroupId: null, description: 'Garment sales revenue and discount income' },
    { id: 'grp_cogs', name: 'Cost of Goods Sold', code: '5100', accountType: 'EXPENSE', parentGroupId: null, description: 'Fabric purchases, stitching labor, and job work expenses' },
    { id: 'grp_opex', name: 'Operating Expenses', code: '5200', accountType: 'EXPENSE', parentGroupId: null, description: 'Factory rent, electricity, transport, and administrative overheads' }
];

const SEED_CHART_OF_ACCOUNTS = [
    // Current Assets (1000s)
    { id: 'acc_1010', accountCode: '1010', name: 'Cash in Hand (Main Drawer)', groupId: 'grp_ca', groupName: 'Current Assets', accountType: 'ASSET', openingBalance: 45000, openingBalanceType: 'DEBIT', currentBalance: 45000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_1020', accountCode: '1020', name: 'HDFC Bank Operating A/c', groupId: 'grp_ca', groupName: 'Current Assets', accountType: 'ASSET', openingBalance: 320000, openingBalanceType: 'DEBIT', currentBalance: 320000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_1025', accountCode: '1025', name: 'State Bank of India (SBI) A/c', groupId: 'grp_ca', groupName: 'Current Assets', accountType: 'ASSET', openingBalance: 180000, openingBalanceType: 'DEBIT', currentBalance: 180000, isSystemAccount: false, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_1030', accountCode: '1030', name: 'Accounts Receivable (Debtors)', groupId: 'grp_ca', groupName: 'Current Assets', accountType: 'ASSET', openingBalance: 145000, openingBalanceType: 'DEBIT', currentBalance: 145000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_1040', accountCode: '1040', name: 'Inventory Asset (Stock Valuation)', groupId: 'grp_ca', groupName: 'Current Assets', accountType: 'ASSET', openingBalance: 850000, openingBalanceType: 'DEBIT', currentBalance: 850000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    
    // Fixed Assets
    { id: 'acc_1210', accountCode: '1210', name: 'Garment Stitching Machines & Equipment', groupId: 'grp_fa', groupName: 'Fixed Assets', accountType: 'ASSET', openingBalance: 240000, openingBalanceType: 'DEBIT', currentBalance: 240000, isSystemAccount: false, status: 'ACTIVE', branchId: 'BR-001' },

    // Current Liabilities (2000s)
    { id: 'acc_2010', accountCode: '2010', name: 'Accounts Payable (Creditors)', groupId: 'grp_cl', groupName: 'Current Liabilities', accountType: 'LIABILITY', openingBalance: 95000, openingBalanceType: 'CREDIT', currentBalance: 95000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_2020', accountCode: '2020', name: 'Output GST Payable (Sales)', groupId: 'grp_cl', groupName: 'Current Liabilities', accountType: 'LIABILITY', openingBalance: 28000, openingBalanceType: 'CREDIT', currentBalance: 28000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_2030', accountCode: '2030', name: 'Input GST Credit (Purchases)', groupId: 'grp_cl', groupName: 'Current Liabilities', accountType: 'LIABILITY', openingBalance: 18000, openingBalanceType: 'DEBIT', currentBalance: 18000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },

    // Equity (3000s)
    { id: 'acc_3010', accountCode: '3010', name: 'Owner / Partners Capital', groupId: 'grp_eq', groupName: 'Equity & Capital', accountType: 'EQUITY', openingBalance: 1600000, openingBalanceType: 'CREDIT', currentBalance: 1600000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_3020', accountCode: '3020', name: 'Retained Earnings', groupId: 'grp_eq', groupName: 'Equity & Capital', accountType: 'EQUITY', openingBalance: 87000, openingBalanceType: 'CREDIT', currentBalance: 87000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },

    // Revenue (4000s)
    { id: 'acc_4010', accountCode: '4010', name: 'Garment Sales Revenue', groupId: 'grp_rev', groupName: 'Operating Revenue', accountType: 'INCOME', openingBalance: 0, openingBalanceType: 'CREDIT', currentBalance: 420000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_4020', accountCode: '4020', name: 'Job Work / Service Income', groupId: 'grp_rev', groupName: 'Operating Revenue', accountType: 'INCOME', openingBalance: 0, openingBalanceType: 'CREDIT', currentBalance: 15000, isSystemAccount: false, status: 'ACTIVE', branchId: 'BR-001' },

    // Expenses & COGS (5000s)
    { id: 'acc_5010', accountCode: '5010', name: 'Fabric & Raw Material Purchases', groupId: 'grp_cogs', groupName: 'Cost of Goods Sold', accountType: 'EXPENSE', openingBalance: 0, openingBalanceType: 'DEBIT', currentBalance: 165000, isSystemAccount: true, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_5020', accountCode: '5020', name: 'Direct Stitching & Factory Labor', groupId: 'grp_cogs', groupName: 'Cost of Goods Sold', accountType: 'EXPENSE', openingBalance: 0, openingBalanceType: 'DEBIT', currentBalance: 45000, isSystemAccount: false, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_5030', accountCode: '5030', name: 'Outsource Job Work Charges', groupId: 'grp_cogs', groupName: 'Cost of Goods Sold', accountType: 'EXPENSE', openingBalance: 0, openingBalanceType: 'DEBIT', currentBalance: 18500, isSystemAccount: false, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_5040', accountCode: '5040', name: 'Factory Rent & Warehouse Lease', groupId: 'grp_opex', groupName: 'Operating Expenses', accountType: 'EXPENSE', openingBalance: 0, openingBalanceType: 'DEBIT', currentBalance: 35000, isSystemAccount: false, status: 'ACTIVE', branchId: 'BR-001' },
    { id: 'acc_5050', accountCode: '5050', name: 'Freight, Logistics & Courier', groupId: 'grp_opex', groupName: 'Operating Expenses', accountType: 'EXPENSE', openingBalance: 0, openingBalanceType: 'DEBIT', currentBalance: 12400, isSystemAccount: false, status: 'ACTIVE', branchId: 'BR-001' }
];

const SEED_JOURNAL_ENTRIES = [
    {
        id: 'JV-000001',
        journalNumber: 'JV-2026-00001',
        date: '2026-08-15',
        referenceType: 'SALES_INVOICE',
        referenceNumber: 'INV-2026-00001',
        branchId: 'BR-001',
        branchName: 'Ahmedabad Central Hub',
        description: 'Sales Invoice finalized for Royal Textile Emporium',
        status: 'POSTED',
        totalDebit: 52500,
        totalCredit: 52500,
        lines: [
            { accountId: 'acc_1030', accountCode: '1030', accountName: 'Accounts Receivable (Debtors)', debit: 52500, credit: 0, narration: 'Being garment sale invoice #INV-2026-00001' },
            { accountId: 'acc_4010', accountCode: '4010', accountName: 'Garment Sales Revenue', debit: 0, credit: 50000, narration: '50 pcs Oxford Cotton Shirts' },
            { accountId: 'acc_2020', accountCode: '2020', accountName: 'Output GST Payable (Sales)', debit: 0, credit: 2500, narration: '5% GST on apparel' }
        ],
        createdBy: 'Admin',
        postedAt: '2026-08-15 10:30 AM'
    },
    {
        id: 'JV-000002',
        journalNumber: 'JV-2026-00002',
        date: '2026-08-18',
        referenceType: 'PAYMENT_RECEIPT',
        referenceNumber: 'PAY-2026-00001',
        branchId: 'BR-001',
        branchName: 'Ahmedabad Central Hub',
        description: 'Customer payment received via HDFC Bank Transfer',
        status: 'POSTED',
        totalDebit: 52500,
        totalCredit: 52500,
        lines: [
            { accountId: 'acc_1020', accountCode: '1020', accountName: 'HDFC Bank Operating A/c', debit: 52500, credit: 0, narration: 'NEFT credit from Royal Textile' },
            { accountId: 'acc_1030', accountCode: '1030', accountName: 'Accounts Receivable (Debtors)', debit: 0, credit: 52500, narration: 'Full settlement of INV-2026-00001' }
        ],
        createdBy: 'Admin',
        postedAt: '2026-08-18 02:15 PM'
    },
    {
        id: 'JV-000003',
        journalNumber: 'JV-2026-00003',
        date: '2026-08-20',
        referenceType: 'PURCHASE_BILL',
        referenceNumber: 'BILL-2026-00001',
        branchId: 'BR-001',
        branchName: 'Ahmedabad Central Hub',
        description: 'Purchase of Cotton Oxford Fabric from Vardhman Textiles',
        status: 'POSTED',
        totalDebit: 84000,
        totalCredit: 84000,
        lines: [
            { accountId: 'acc_5010', accountCode: '5010', accountName: 'Fabric & Raw Material Purchases', debit: 80000, credit: 0, narration: '600 MTR Cotton Fabric' },
            { accountId: 'acc_2030', accountCode: '2030', accountName: 'Input GST Credit (Purchases)', debit: 4000, credit: 0, narration: '5% Input Tax Credit' },
            { accountId: 'acc_2010', accountCode: '2010', accountName: 'Accounts Payable (Creditors)', debit: 0, credit: 84000, narration: 'Bill payable to Vardhman Textiles' }
        ],
        createdBy: 'Purchase Staff',
        postedAt: '2026-08-20 11:00 AM'
    },
    {
        id: 'JV-000004',
        journalNumber: 'JV-2026-00004',
        date: '2026-08-22',
        referenceType: 'EXPENSE_PAYMENT',
        referenceNumber: 'EXP-2026-00001',
        branchId: 'BR-001',
        branchName: 'Ahmedabad Central Hub',
        description: 'Monthly Factory Unit Rent payment',
        status: 'POSTED',
        totalDebit: 35000,
        totalCredit: 35000,
        lines: [
            { accountId: 'acc_5040', accountCode: '5040', accountName: 'Factory Rent & Warehouse Lease', debit: 35000, credit: 0, narration: 'Rent for Odhav Industrial Unit' },
            { accountId: 'acc_1020', accountCode: '1020', accountName: 'HDFC Bank Operating A/c', debit: 0, credit: 35000, narration: 'RTGS rent transfer' }
        ],
        createdBy: 'Admin',
        postedAt: '2026-08-22 04:45 PM'
    }
];

const SEED_CASH_BANK_ACCOUNTS = [
    { id: 'cb_1', accountName: 'Main Cash Drawer', accountType: 'CASH', accountNumber: 'CASH-AHM-01', branchName: 'Ahmedabad Central Hub', balance: 45000, status: 'ACTIVE' },
    { id: 'cb_2', accountName: 'Surat Depot Petty Cash', accountType: 'CASH', accountNumber: 'CASH-SUR-02', branchName: 'Surat Textile Depot', balance: 15000, status: 'ACTIVE' },
    { id: 'cb_3', accountName: 'HDFC Bank Current A/c', accountType: 'BANK', accountNumber: '50200048192834', ifscCode: 'HDFC0000240', branchName: 'Navrangpura, Ahmedabad', balance: 320000, status: 'ACTIVE' },
    { id: 'cb_4', accountName: 'State Bank of India (SBI)', accountType: 'BANK', accountNumber: '30491829401', ifscCode: 'SBIN0001890', branchName: 'Ring Road, Surat', balance: 180000, status: 'ACTIVE' }
];

const SEED_EXPENSES = [
    { id: 'exp_1', expenseNumber: 'EXP-2026-00001', date: '2026-08-22', expenseAccountName: 'Factory Rent & Warehouse Lease', amount: 35000, paymentMethod: 'Bank Transfer', paymentAccount: 'HDFC Bank Current A/c', payee: 'Shree Mahavir Industrial Park', branchName: 'Ahmedabad Central Hub', description: 'Factory rent for August 2026', status: 'PAID', createdBy: 'Admin' },
    { id: 'exp_2', expenseNumber: 'EXP-2026-00002', date: '2026-08-24', expenseAccountName: 'Freight, Logistics & Courier', amount: 4800, paymentMethod: 'Cash', paymentAccount: 'Main Cash Drawer', payee: 'Gujarat Transport Logistics', branchName: 'Ahmedabad Central Hub', description: 'Fabric rolls freight charges from Surat', status: 'PAID', createdBy: 'Admin' }
];

class AccountingStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(ACCOUNTING_STORAGE_KEYS.ACCOUNT_GROUPS)) {
            localStorage.setItem(ACCOUNTING_STORAGE_KEYS.ACCOUNT_GROUPS, JSON.stringify(SEED_ACCOUNT_GROUPS));
        }
        if (!localStorage.getItem(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS)) {
            localStorage.setItem(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS, JSON.stringify(SEED_CHART_OF_ACCOUNTS));
        }
        if (!localStorage.getItem(ACCOUNTING_STORAGE_KEYS.JOURNAL_ENTRIES)) {
            localStorage.setItem(ACCOUNTING_STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(SEED_JOURNAL_ENTRIES));
        }
        if (!localStorage.getItem(ACCOUNTING_STORAGE_KEYS.CASH_BANK_ACCOUNTS)) {
            localStorage.setItem(ACCOUNTING_STORAGE_KEYS.CASH_BANK_ACCOUNTS, JSON.stringify(SEED_CASH_BANK_ACCOUNTS));
        }
        if (!localStorage.getItem(ACCOUNTING_STORAGE_KEYS.EXPENSES)) {
            localStorage.setItem(ACCOUNTING_STORAGE_KEYS.EXPENSES, JSON.stringify(SEED_EXPENSES));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[AccountingStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[AccountingStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const accountingStore = new AccountingStore();
