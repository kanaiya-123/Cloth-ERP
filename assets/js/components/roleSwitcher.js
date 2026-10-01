// CLOTHERP - Role Switcher & Access Control Helper
// Enables 1-click seamless testing across Admin, Manager, Sales Staff & Purchase Staff roles

import { authService } from '../services/authService.js';
import { ROLES, getRoleDetails } from '../config/permissions.js';

export const ROLE_ACCOUNTS = [
    {
        role: ROLES.ADMIN,
        title: 'Admin',
        subtitle: 'Full Access',
        email: 'admin@clotherp.local',
        password: 'Admin@123',
        colorClass: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
        badgeClass: 'bg-blue-600 text-white',
        icon: 'shield-check',
        scope: 'Full Access across all modules, SaaS Platform, Accounting & Settings.'
    },
    {
        role: ROLES.MANAGER,
        title: 'Manager',
        subtitle: 'Operations',
        email: 'manager@clotherp.local',
        password: 'Manager@123',
        colorClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        badgeClass: 'bg-emerald-600 text-white',
        icon: 'briefcase',
        scope: 'Inventory, Stock Transfers, Purchases, Sales, Production & CRM Operations.'
    },
    {
        role: ROLES.SALES_STAFF,
        title: 'Sales Staff',
        subtitle: 'POS & Billing',
        email: 'sales@clotherp.local',
        password: 'Sales@123',
        colorClass: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
        badgeClass: 'bg-sky-600 text-white',
        icon: 'shopping-cart',
        scope: 'POS Billing, Tax Invoices, Quotations/Estimates, Customers & Returns.'
    },
    {
        role: ROLES.PURCHASE_STAFF,
        title: 'Purchase Staff',
        subtitle: 'Suppliers & LR',
        email: 'purchase@clotherp.local',
        password: 'Purchase@123',
        colorClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        badgeClass: 'bg-amber-600 text-white',
        icon: 'truck',
        scope: 'Suppliers Master, Purchase Orders, Goods Intake & Transporter LR Tracking.'
    }
];

/**
 * Switch current user session immediately to the requested role
 * @param {string} targetRole 
 */
export async function switchUserRole(targetRole) {
    const acc = ROLE_ACCOUNTS.find(a => a.role === targetRole);
    if (!acc) return false;

    await authService.login(acc.email, acc.password, true);
    window.location.reload();
    return true;
}

/**
 * Initialize Role Switcher Modal in DOM
 */
export function initRoleSwitcherModal() {
    if (document.getElementById('roleSwitcherModalContainer')) return;

    const currentUser = authService.getCurrentUser() || {};

    const markup = `
        <div id="roleSwitcherModalContainer" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
            <div class="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden p-6 space-y-5">
                
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div class="flex items-center space-x-2.5">
                        <div class="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                            <i data-lucide="users" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-white">Switch Role Profile</h3>
                            <p class="text-[11px] text-slate-400">Instantly test access permissions for each staff tier</p>
                        </div>
                    </div>
                    <button type="button" id="btnCloseRoleSwitcher" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${ROLE_ACCOUNTS.map(a => {
                        const isActive = currentUser.role === a.role;
                        return `
                            <button type="button" class="btn-role-switch p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                                isActive ? `${a.colorClass} ring-2 ring-blue-500/50` : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-850 text-slate-300'
                            }" data-target-role="${a.role}">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-2">
                                        <i data-lucide="${a.icon}" class="w-4 h-4 text-blue-400"></i>
                                        <span class="text-xs font-bold">${a.title}</span>
                                    </div>
                                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${a.badgeClass}">
                                        ${a.subtitle}
                                    </span>
                                </div>
                                <p class="text-[10px] text-slate-400 leading-relaxed">${a.scope}</p>
                                ${isActive ? `<span class="text-[9px] font-mono font-bold text-emerald-400">● Currently Active</span>` : `<span class="text-[9px] font-mono text-slate-500">Click to switch</span>`}
                            </button>
                        `;
                    }).join('')}
                </div>

                <div class="text-center text-[11px] text-slate-500 border-t border-slate-800 pt-3">
                    CLOTHERP Centralized Role-Based Access Control
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', markup);
    if (window.lucide) lucide.createIcons();

    const modal = document.getElementById('roleSwitcherModalContainer');
    const closeBtn = document.getElementById('btnCloseRoleSwitcher');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    document.querySelectorAll('.btn-role-switch').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetRole = btn.getAttribute('data-target-role');
            if (targetRole) {
                await switchUserRole(targetRole);
            }
        });
    });
}

export function openRoleSwitcherModal() {
    initRoleSwitcherModal();
    const modal = document.getElementById('roleSwitcherModalContainer');
    if (modal) modal.classList.remove('hidden');
}
