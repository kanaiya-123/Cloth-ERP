// CLOTHERP - ERP Topbar Component
import { initNotifications } from './notifications.js';
import { initProfileMenu } from './profileMenu.js';
import { openMobileDrawer } from './sidebar.js';
import { authService } from '../services/authService.js';
import { openRoleSwitcherModal } from './roleSwitcher.js';

export function initTopbar(containerId = 'topbarMount') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Format current date nicely
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Resolve breadcrumb dynamically
    const path = window.location.pathname.toLowerCase();
    let pageLabel = 'Dashboard';
    let pageIcon = 'layout-dashboard';

    if (path.includes('sales.html')) { pageLabel = 'Sales Orders & Billing'; pageIcon = 'shopping-cart'; }
    else if (path.includes('sale-details.html')) { pageLabel = 'Sale Details & Invoice'; pageIcon = 'file-text'; }
    else if (path.includes('purchases.html')) { pageLabel = 'Purchase Orders'; pageIcon = 'shopping-bag'; }
    else if (path.includes('purchase-details.html')) { pageLabel = 'Purchase Details & PO'; pageIcon = 'receipt'; }
    else if (path.includes('receive-purchase.html')) { pageLabel = 'Receive Goods (GRN)'; pageIcon = 'truck'; }
    else if (path.includes('estimates.html')) { pageLabel = 'Estimates & Quotations'; pageIcon = 'file-spreadsheet'; }
    else if (path.includes('profile.html')) { pageLabel = 'My Profile & Settings'; pageIcon = 'user'; }
    else if (path.includes('inventory.html')) { pageLabel = 'Inventory Stock'; pageIcon = 'boxes'; }
    else if (path.includes('suppliers.html')) { pageLabel = 'Suppliers Master'; pageIcon = 'building-2'; }
    else if (path.includes('customers.html')) { pageLabel = 'Customers Master'; pageIcon = 'users'; }
    else if (path.includes('products.html')) { pageLabel = 'Products Master'; pageIcon = 'tag'; }
    else if (path.includes('reports.html')) { pageLabel = 'Reports Hub'; pageIcon = 'bar-chart-3'; }
    else if (path.includes('purchase-returns.html')) { pageLabel = 'Purchase Returns'; pageIcon = 'corner-up-left'; }

    container.innerHTML = `
        <div class="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
            
            <!-- Left: Mobile Toggle & Breadcrumb -->
            <div class="flex items-center space-x-3 sm:space-x-4">
                <!-- Mobile Hamburger Button -->
                <button id="topbarMobileMenuBtn" class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden transition focus:outline-none" aria-label="Open navigation menu">
                    <i data-lucide="menu" class="w-5 h-5"></i>
                </button>

                <!-- Breadcrumb -->
                <div class="flex items-center space-x-2 text-xs">
                    <span class="text-slate-500 font-mono hidden sm:inline">Store Hub</span>
                    <span class="text-slate-600 hidden sm:inline">/</span>
                    <span class="text-slate-200 font-bold flex items-center space-x-1.5">
                        <i data-lucide="${pageIcon}" class="w-3.5 h-3.5 text-blue-400"></i>
                        <span>${pageLabel}</span>
                    </span>
                </div>
            </div>

            <!-- Center: Search Area Placeholder -->
            <div class="hidden md:flex items-center flex-1 max-w-md mx-6">
                <div class="relative w-full">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <i data-lucide="search" class="w-4 h-4"></i>
                    </div>
                    <input 
                        type="text" 
                        id="globalSearchInput" 
                        placeholder="Search products, invoices, customers... (Ctrl + K)" 
                        class="w-full pl-10 pr-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                    >
                </div>
            </div>

            <!-- Right: Date, Notifications & Profile Menu -->
            <div class="flex items-center space-x-3 sm:space-x-4">
                <!-- Live Date Badge -->
                <div class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-500"></i>
                    <span>${dateFormatted}</span>
                </div>

                <!-- Role Switcher Quick Button -->
                <button id="btnTopbarRoleSwitcher" type="button" class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 text-[11px] font-semibold transition" title="Switch Role (Admin, Manager, Sales, Purchase)">
                    <i data-lucide="shield" class="w-3.5 h-3.5 text-blue-400"></i>
                    <span class="hidden sm:inline">Role:</span>
                    <span id="topbarCurrentRoleText" class="font-bold text-white">Role</span>
                </button>

                <!-- Notifications Mount -->
                <div id="topbarNotifMount"></div>

                <!-- Profile Menu Mount -->
                <div id="topbarProfileMount"></div>
            </div>

        </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Mount subcomponents
    initNotifications('topbarNotifMount');
    initProfileMenu('topbarProfileMount');

    // Populate current role and bind switcher
    const currentUser = authService.getCurrentUser();
    const roleTextEl = document.getElementById('topbarCurrentRoleText');
    if (roleTextEl && currentUser) {
        roleTextEl.innerText = currentUser.role || 'Admin';
    }

    const roleBtn = document.getElementById('btnTopbarRoleSwitcher');
    if (roleBtn) {
        roleBtn.addEventListener('click', openRoleSwitcherModal);
    }

    // Attach Mobile Drawer Opener
    const mobileBtn = document.getElementById('topbarMobileMenuBtn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', openMobileDrawer);
    }

    // Keyboard shortcut for search placeholder
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
}
