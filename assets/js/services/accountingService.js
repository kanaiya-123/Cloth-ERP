// CLOTHERP - Centralized Financial Management & Accounting Engine
import { accountingStore, ACCOUNTING_STORAGE_KEYS } from './accountingStore.js';
import { customerService } from './customerService.js';
import { supplierService } from './supplierService.js';
import { salesService } from './salesService.js';
import { purchaseService } from './purchaseService.js';

class AccountingService {
    // ==================== CHART OF ACCOUNTS ====================
    async getChartOfAccounts({ search = '', accountType = '', groupId = '' } = {}) {
        await this._delay(60);
        let items = accountingStore.get(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS);

        if (accountType) items = items.filter(a => a.accountType === accountType);
        if (groupId) items = items.filter(a => a.groupId === groupId);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(a => 
                (a.name && a.name.toLowerCase().includes(q)) ||
                (a.accountCode && a.accountCode.toLowerCase().includes(q)) ||
                (a.groupName && a.groupName.toLowerCase().includes(q))
            );
        }

        const all = accountingStore.get(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS);
        return {
            items,
            summary: {
                totalAccounts: all.length,
                assetsCount: all.filter(a => a.accountType === 'ASSET').length,
                liabilitiesCount: all.filter(a => a.accountType === 'LIABILITY').length,
                equityCount: all.filter(a => a.accountType === 'EQUITY').length,
                incomeCount: all.filter(a => a.accountType === 'INCOME').length,
                expenseCount: all.filter(a => a.accountType === 'EXPENSE').length
            }
        };
    }

    async getAccountGroups() {
        return accountingStore.get(ACCOUNTING_STORAGE_KEYS.ACCOUNT_GROUPS);
    }

    async createAccount(data) {
        const items = accountingStore.get(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS);
        const groups = accountingStore.get(ACCOUNTING_STORAGE_KEYS.ACCOUNT_GROUPS);
        
        // Code uniqueness validation
        if (items.some(a => a.accountCode === data.accountCode.trim())) {
            return { success: false, message: `Account code ${data.accountCode} already exists.` };
        }

        const group = groups.find(g => g.id === data.groupId);
        const id = `acc_${data.accountCode.trim()}`;
        const openingBal = parseFloat(data.openingBalance) || 0;

        const newAccount = {
            id,
            accountCode: data.accountCode.trim(),
            name: data.name.trim(),
            groupId: data.groupId,
            groupName: group ? group.name : 'General Group',
            accountType: group ? group.accountType : (data.accountType || 'EXPENSE'),
            openingBalance: openingBal,
            openingBalanceType: data.openingBalanceType || 'DEBIT',
            currentBalance: openingBal,
            isSystemAccount: false,
            status: 'ACTIVE',
            branchId: data.branchId || 'BR-001'
        };

        items.push(newAccount);
        accountingStore.set(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS, items);
        return { success: true, account: newAccount };
    }

    // ==================== DOUBLE-ENTRY JOURNAL ENTRIES ====================
    async getJournalEntries({ page = 1, pageSize = 15, search = '', status = '' } = {}) {
        await this._delay(60);
        let items = accountingStore.get(ACCOUNTING_STORAGE_KEYS.JOURNAL_ENTRIES);

        if (status) items = items.filter(j => j.status === status);
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(j => 
                (j.journalNumber && j.journalNumber.toLowerCase().includes(q)) ||
                (j.description && j.description.toLowerCase().includes(q)) ||
                (j.referenceNumber && j.referenceNumber.toLowerCase().includes(q))
            );
        }

        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = items.slice(startIndex, startIndex + pageSize);

        const all = accountingStore.get(ACCOUNTING_STORAGE_KEYS.JOURNAL_ENTRIES);
        return {
            items: paginatedItems,
            summary: {
                totalJournals: all.length,
                postedCount: all.filter(j => j.status === 'POSTED').length
            },
            pagination: { page, pageSize, totalItems, totalPages }
        };
    }

    async createJournalEntry(data, userName = 'Admin') {
        const lines = data.lines || [];
        if (lines.length < 2) {
            return { success: false, message: 'A journal entry must contain at least 2 lines (Debit & Credit).' };
        }

        let totalDebit = 0;
        let totalCredit = 0;

        lines.forEach(l => {
            totalDebit += parseFloat(l.debit) || 0;
            totalCredit += parseFloat(l.credit) || 0;
        });

        // Double-entry validation: Debit must equal Credit
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return { 
                success: false, 
                message: `Double-entry unbalanced: Total Debit (₹${totalDebit.toFixed(2)}) must equal Total Credit (₹${totalCredit.toFixed(2)}).` 
            };
        }

        const items = accountingStore.get(ACCOUNTING_STORAGE_KEYS.JOURNAL_ENTRIES);
        const id = `JV-${String(items.length + 1).padStart(6, '0')}`;
        const journalNumber = `JV-${new Date().getFullYear()}-${String(items.length + 1).padStart(5, '0')}`;

        const newJournal = {
            id,
            journalNumber,
            date: data.date || new Date().toISOString().split('T')[0],
            referenceType: data.referenceType || 'MANUAL_JOURNAL',
            referenceNumber: data.referenceNumber || 'JV-DIRECT',
            branchId: data.branchId || 'BR-001',
            branchName: 'Ahmedabad Central Hub',
            description: data.description.trim(),
            status: data.postNow ? 'POSTED' : 'DRAFT',
            totalDebit: parseFloat(totalDebit.toFixed(2)),
            totalCredit: parseFloat(totalCredit.toFixed(2)),
            lines: lines.map(l => ({
                accountId: l.accountId,
                accountCode: l.accountCode || '',
                accountName: l.accountName || '',
                debit: parseFloat(l.debit) || 0,
                credit: parseFloat(l.credit) || 0,
                narration: l.narration || ''
            })),
            createdBy: userName,
            postedAt: data.postNow ? new Date().toLocaleString() : null
        };

        items.unshift(newJournal);
        accountingStore.set(ACCOUNTING_STORAGE_KEYS.JOURNAL_ENTRIES, items);

        // Update balances in Chart of Accounts if posted
        if (newJournal.status === 'POSTED') {
            await this._postJournalToAccounts(newJournal);
        }

        return { success: true, journal: newJournal };
    }

    async _postJournalToAccounts(journal) {
        const accounts = accountingStore.get(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS);
        (journal.lines || []).forEach(l => {
            const acc = accounts.find(a => a.id === l.accountId || a.accountCode === l.accountCode);
            if (acc) {
                if (acc.accountType === 'ASSET' || acc.accountType === 'EXPENSE') {
                    acc.currentBalance += (l.debit - l.credit);
                } else {
                    acc.currentBalance += (l.credit - l.debit);
                }
            }
        });
        accountingStore.set(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS, accounts);
    }

    // ==================== CUSTOMER & SUPPLIER LEDGERS ====================
    async getCustomerLedger(customerId) {
        const [customer, salesRes] = await Promise.all([
            customerService.getCustomerById(customerId),
            salesService.getSalesOrders({ customerId, pageSize: 100 })
        ]);

        if (!customer) return null;

        const creditLimit = customer.creditLimit || 100000;
        let runningBalance = 0;

        const ledgerEntries = (salesRes.items || []).map(sale => {
            const debit = sale.totalAmount || 0;
            const credit = sale.paidAmount || 0;
            runningBalance += (debit - credit);

            return {
                date: sale.orderDate,
                referenceNumber: sale.orderNumber,
                transactionType: 'Sales Invoice',
                description: `Invoice for ${sale.customerName}`,
                debit,
                credit,
                runningBalance,
                status: sale.paymentStatus
            };
        });

        const currentOutstanding = Math.max(0, runningBalance);
        const availableCredit = Math.max(0, creditLimit - currentOutstanding);

        return {
            customer,
            creditLimit,
            currentOutstanding,
            availableCredit,
            isOverLimit: currentOutstanding > creditLimit,
            entries: ledgerEntries
        };
    }

    async getSupplierLedger(supplierId) {
        const [supplier, purchRes] = await Promise.all([
            supplierService.getSupplierById(supplierId),
            purchaseService.getPurchaseOrders({ supplierId, pageSize: 100 })
        ]);

        if (!supplier) return null;

        let runningBalance = 0;
        const ledgerEntries = (purchRes.items || []).map(po => {
            const credit = po.grandTotal || 0;
            const debit = po.paidAmount || 0;
            runningBalance += (credit - debit);

            return {
                date: po.orderDate,
                referenceNumber: po.poNumber,
                transactionType: 'Purchase Bill',
                description: `Bill from ${po.supplierName}`,
                debit,
                credit,
                runningBalance,
                status: po.paymentStatus
            };
        });

        return {
            supplier,
            currentPayable: Math.max(0, runningBalance),
            entries: ledgerEntries
        };
    }

    // ==================== RECEIVABLES & PAYABLES AGING ====================
    async getReceivablesAging() {
        const salesRes = await salesService.getSalesOrders({ pageSize: 100 });
        const orders = salesRes.items || [];

        const buckets = {
            current: 0,
            days1_30: 0,
            days31_60: 0,
            days61_90: 0,
            days90Plus: 0
        };

        const records = [];
        let totalReceivables = 0;

        orders.forEach(sale => {
            const outstanding = Math.max(0, (sale.totalAmount || 0) - (sale.paidAmount || 0));
            if (outstanding > 0) {
                totalReceivables += outstanding;
                // Dummy age calculation based on order date
                const orderDate = new Date(sale.orderDate);
                const ageDays = Math.max(0, Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24)));

                if (ageDays <= 0) buckets.current += outstanding;
                else if (ageDays <= 30) buckets.days1_30 += outstanding;
                else if (ageDays <= 60) buckets.days31_60 += outstanding;
                else if (ageDays <= 90) buckets.days61_90 += outstanding;
                else buckets.days90Plus += outstanding;

                records.push({
                    id: sale.id,
                    orderNumber: sale.orderNumber,
                    customerName: sale.customerName,
                    orderDate: sale.orderDate,
                    totalAmount: sale.totalAmount,
                    paidAmount: sale.paidAmount || 0,
                    outstanding,
                    ageDays,
                    paymentStatus: sale.paymentStatus
                });
            }
        });

        return {
            totalReceivables,
            buckets,
            records
        };
    }

    async getPayablesAging() {
        const purchRes = await purchaseService.getPurchaseOrders({ pageSize: 100 });
        const pos = purchRes.items || [];

        const buckets = {
            current: 0,
            days1_30: 0,
            days31_60: 0,
            days61_90: 0,
            days90Plus: 0
        };

        const records = [];
        let totalPayables = 0;

        pos.forEach(po => {
            const outstanding = Math.max(0, (po.grandTotal || 0) - (po.paidAmount || 0));
            if (outstanding > 0) {
                totalPayables += outstanding;
                const poDate = new Date(po.orderDate);
                const ageDays = Math.max(0, Math.floor((new Date() - poDate) / (1000 * 60 * 60 * 24)));

                if (ageDays <= 0) buckets.current += outstanding;
                else if (ageDays <= 30) buckets.days1_30 += outstanding;
                else if (ageDays <= 60) buckets.days31_60 += outstanding;
                else if (ageDays <= 90) buckets.days61_90 += outstanding;
                else buckets.days90Plus += outstanding;

                records.push({
                    id: po.id,
                    poNumber: po.poNumber,
                    supplierName: po.supplierName,
                    orderDate: po.orderDate,
                    grandTotal: po.grandTotal,
                    paidAmount: po.paidAmount || 0,
                    outstanding,
                    ageDays,
                    paymentStatus: po.paymentStatus
                });
            }
        });

        return {
            totalPayables,
            buckets,
            records
        };
    }

    // ==================== CASH & BANK MANAGEMENT ====================
    async getCashBankAccounts() {
        return accountingStore.get(ACCOUNTING_STORAGE_KEYS.CASH_BANK_ACCOUNTS);
    }

    async transferFunds(fromId, toId, amount, notes = '', userName = 'Admin') {
        const accounts = accountingStore.get(ACCOUNTING_STORAGE_KEYS.CASH_BANK_ACCOUNTS);
        const fromAcc = accounts.find(a => a.id === fromId);
        const toAcc = accounts.find(a => a.id === toId);

        if (!fromAcc || !toAcc) return { success: false, message: 'Invalid source or target fund account.' };
        const numAmount = parseFloat(amount) || 0;
        if (numAmount <= 0) return { success: false, message: 'Transfer amount must be greater than 0.' };
        if (fromAcc.balance < numAmount) return { success: false, message: `Insufficient balance in ${fromAcc.accountName}.` };

        fromAcc.balance -= numAmount;
        toAcc.balance += numAmount;
        accountingStore.set(ACCOUNTING_STORAGE_KEYS.CASH_BANK_ACCOUNTS, accounts);

        // Auto record Journal Entry for Fund Transfer
        await this.createJournalEntry({
            description: `Internal Fund Transfer from ${fromAcc.accountName} to ${toAcc.accountName}: ${notes}`,
            postNow: true,
            lines: [
                { accountId: 'acc_1020', accountCode: '1020', accountName: toAcc.accountName, debit: numAmount, credit: 0, narration: `Received from ${fromAcc.accountName}` },
                { accountId: 'acc_1010', accountCode: '1010', accountName: fromAcc.accountName, debit: 0, credit: numAmount, narration: `Transferred to ${toAcc.accountName}` }
            ]
        }, userName);

        return { success: true, fromAcc, toAcc };
    }

    // ==================== EXPENSES ====================
    async getExpenses({ search = '' } = {}) {
        let items = accountingStore.get(ACCOUNTING_STORAGE_KEYS.EXPENSES);
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(e => 
                (e.expenseNumber && e.expenseNumber.toLowerCase().includes(q)) ||
                (e.expenseAccountName && e.expenseAccountName.toLowerCase().includes(q)) ||
                (e.payee && e.payee.toLowerCase().includes(q))
            );
        }
        return items;
    }

    async createExpense(data, userName = 'Admin') {
        const items = accountingStore.get(ACCOUNTING_STORAGE_KEYS.EXPENSES);
        const id = `exp_${items.length + 1}`;
        const expenseNumber = `EXP-${new Date().getFullYear()}-${String(items.length + 1).padStart(5, '0')}`;
        const amount = parseFloat(data.amount) || 0;

        const newExpense = {
            id,
            expenseNumber,
            date: data.date || new Date().toISOString().split('T')[0],
            expenseAccountName: data.expenseAccountName || 'Operating Expenses',
            amount,
            paymentMethod: data.paymentMethod || 'Bank Transfer',
            paymentAccount: data.paymentAccount || 'HDFC Bank Current A/c',
            payee: data.payee.trim(),
            branchName: 'Ahmedabad Central Hub',
            description: data.description || '',
            status: 'PAID',
            createdBy: userName
        };

        items.unshift(newExpense);
        accountingStore.set(ACCOUNTING_STORAGE_KEYS.EXPENSES, items);

        // Auto post double entry journal
        await this.createJournalEntry({
            description: `Expense Payment: ${newExpense.expenseAccountName} (${newExpense.payee})`,
            postNow: true,
            lines: [
                { accountId: 'acc_5040', accountCode: '5040', accountName: newExpense.expenseAccountName, debit: amount, credit: 0, narration: newExpense.description },
                { accountId: 'acc_1020', accountCode: '1020', accountName: newExpense.paymentAccount, debit: 0, credit: amount, narration: `Paid to ${newExpense.payee}` }
            ]
        }, userName);

        return { success: true, expense: newExpense };
    }

    // ==================== FINANCIAL STATEMENTS ====================
    async getTrialBalance() {
        const accounts = accountingStore.get(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS);
        let totalDebit = 0;
        let totalCredit = 0;

        const rows = accounts.map(acc => {
            let debit = 0;
            let credit = 0;

            if (acc.accountType === 'ASSET' || acc.accountType === 'EXPENSE') {
                debit = acc.currentBalance >= 0 ? acc.currentBalance : 0;
                credit = acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0;
            } else {
                credit = acc.currentBalance >= 0 ? acc.currentBalance : 0;
                debit = acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0;
            }

            totalDebit += debit;
            totalCredit += credit;

            return {
                ...acc,
                periodDebit: debit,
                periodCredit: credit
            };
        });

        return {
            rows,
            totalDebit: parseFloat(totalDebit.toFixed(2)),
            totalCredit: parseFloat(totalCredit.toFixed(2)),
            isBalanced: Math.abs(totalDebit - totalCredit) < 1.0
        };
    }

    async getProfitAndLoss() {
        const accounts = accountingStore.get(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS);
        
        const incomeAccounts = accounts.filter(a => a.accountType === 'INCOME');
        const cogsAccounts = accounts.filter(a => a.groupId === 'grp_cogs');
        const opexAccounts = accounts.filter(a => a.groupId === 'grp_opex');

        const totalRevenue = incomeAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
        const totalCogs = cogsAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
        const grossProfit = totalRevenue - totalCogs;
        const totalOpex = opexAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
        const netProfit = grossProfit - totalOpex;

        return {
            incomeAccounts,
            cogsAccounts,
            opexAccounts,
            totalRevenue,
            totalCogs,
            grossProfit,
            totalOpex,
            netProfit
        };
    }

    async getBalanceSheet() {
        const accounts = accountingStore.get(ACCOUNTING_STORAGE_KEYS.CHART_OF_ACCOUNTS);
        const pnl = await this.getProfitAndLoss();

        const assetAccounts = accounts.filter(a => a.accountType === 'ASSET');
        const liabilityAccounts = accounts.filter(a => a.accountType === 'LIABILITY');
        const equityAccounts = accounts.filter(a => a.accountType === 'EQUITY');

        const totalAssets = assetAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
        const totalLiabilities = liabilityAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
        const totalEquity = equityAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0) + pnl.netProfit;

        return {
            assetAccounts,
            liabilityAccounts,
            equityAccounts,
            totalAssets,
            totalLiabilities,
            totalEquity,
            netProfitRetained: pnl.netProfit,
            isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1.0
        };
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const accountingService = new AccountingService();
