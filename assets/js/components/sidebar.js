// CLOTHERP - Role-Aware Navigation Sidebar & Mobile Drawer Component
import { authService } from '../services/authService.js';
import { PERMISSIONS, getRoleDetails } from '../config/permissions.js';

/**
 * Master Navigation Menu Definition with Permission Mapping
 */
const NAVIGATION_SECTIONS = [
    {
        title: 'Core',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', href: './dashboard.html', permission: null }
        ]
    },
    {
        title: 'PRODUCTS & MASTERS',
        items: [
            { id: 'products', label: 'All Products & Variants', icon: 'tag', href: './products.html', permission: PERMISSIONS.PRODUCTS_VIEW },
            { id: 'colors', label: 'Colors Master', icon: 'palette', href: './colors.html', permission: PERMISSIONS.MASTERS_VIEW },
            { id: 'sizes', label: 'Sizes Master', icon: 'ruler', href: './sizes.html', permission: PERMISSIONS.MASTERS_VIEW },
            { id: 'categories', label: 'Categories', icon: 'folder-tree', href: './categories.html', permission: PERMISSIONS.MASTERS_VIEW },
            { id: 'brands', label: 'Brands', icon: 'award', href: './brands.html', permission: PERMISSIONS.MASTERS_VIEW }
        ]
    },
    {
        title: 'INVENTORY & STOCK',
        items: [
            { id: 'inventory', label: 'Inventory Stock', icon: 'boxes', href: './inventory.html', permission: PERMISSIONS.INVENTORY_VIEW },
            { id: 'stock-movements', label: 'Stock Movements', icon: 'history', href: './stock-movements.html', permission: PERMISSIONS.INVENTORY_MOVEMENTS_VIEW },
            { id: 'stock-adjustment', label: 'Stock Adjustment', icon: 'sliders-horizontal', href: './stock-adjustment.html', permission: PERMISSIONS.INVENTORY_ADJUST },
            { id: 'low-stock', label: 'Low Stock Alerts', icon: 'alert-triangle', href: './low-stock.html', permission: PERMISSIONS.INVENTORY_LOWSTOCK_VIEW }
        ]
    },
    {
        title: 'PURCHASE & SHIPMENTS',
        items: [
            { id: 'purchases', label: 'Purchases', icon: 'shopping-bag', href: './purchases.html', permission: PERMISSIONS.PURCHASES_VIEW },
            { id: 'purchase-shipments', label: 'Shipment & LR Tracking', icon: 'truck', href: './purchase-shipments.html', permission: PERMISSIONS.PURCHASE_SHIPMENTS_VIEW },
            { id: 'suppliers', label: 'Suppliers Master', icon: 'building-2', href: './suppliers.html', permission: PERMISSIONS.SUPPLIERS_VIEW },
            { id: 'purchase-returns', label: 'Purchase Returns', icon: 'corner-up-left', href: './purchase-returns.html', permission: PERMISSIONS.PURCHASE_RETURNS_VIEW }
        ]
    },
    {
        title: 'SALES & FULFILLMENT',
        items: [
            { id: 'sales', label: 'Sales & Invoices', icon: 'shopping-cart', href: './sales.html', permission: PERMISSIONS.SALES_VIEW },
            { id: 'estimates', label: 'Estimates & Quotations', icon: 'file-text', href: './estimates.html', permission: PERMISSIONS.SALES_VIEW },
            { id: 'customer-tracking', label: 'Order & Delivery Tracking', icon: 'map-pin', href: './customer-tracking.html', permission: PERMISSIONS.SALES_TRACKING_VIEW },
            { id: 'customers', label: 'Customers Master', icon: 'users', href: './customers.html', permission: PERMISSIONS.CUSTOMERS_VIEW },
            { id: 'returns', label: 'Sales Returns', icon: 'rotate-ccw', href: './returns.html', permission: PERMISSIONS.RETURNS_VIEW },
            { id: 'exchanges', label: 'Exchanges', icon: 'refresh-cw', href: './exchanges.html', permission: PERMISSIONS.EXCHANGES_VIEW }
        ]
    },
    {
        title: 'REPORTS & ANALYTICS',
        items: [
            { id: 'reports', label: 'Reports Hub', icon: 'bar-chart-3', href: './reports.html', permission: PERMISSIONS.REPORTS_VIEW },
            { id: 'sales-report', label: 'Sales Report', icon: 'trending-up', href: './sales-report.html', permission: PERMISSIONS.REPORTS_VIEW },
            { id: 'purchase-report', label: 'Purchase Report', icon: 'shopping-bag', href: './purchase-report.html', permission: PERMISSIONS.REPORTS_VIEW },
            { id: 'inventory-report', label: 'Stock Report', icon: 'boxes', href: './inventory-report.html', permission: PERMISSIONS.REPORTS_VIEW },
            { id: 'gst-report', label: 'GST Tax Report', icon: 'receipt', href: './gst-report.html', permission: PERMISSIONS.REPORTS_VIEW }
        ]
    },
    {
        title: 'SYSTEM',
        items: [
            { id: 'notifications', label: 'Notifications', icon: 'bell', href: './notifications.html', permission: PERMISSIONS.NOTIFICATIONS_VIEW }
        ]
    }
];

export function initSidebar(containerId = 'sidebarMount', activeModuleId = 'dashboard') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = authService.getCurrentUser();
    if (!user) return;

    const roleInfo = getRoleDetails(user.role);

    // Filter Sections & Items by User Permissions
    let filteredSections = NAVIGATION_SECTIONS.map(sec => {
        const allowedItems = sec.items.filter(item => {
            if (!item.permission) return true;
            return authService.hasPermission(item.permission);
        }).map(item => ({
            ...item,
            active: item.id === activeModuleId
        }));

        return {
            title: sec.title,
            items: allowedItems
        };
    }).filter(sec => sec.items.length > 0);

    // Role-based smart section prioritization
    if (user.role === 'PurchaseStaff') {
        const coreSec = filteredSections.find(s => s.title === 'Core');
        const purchaseSec = filteredSections.find(s => s.title === 'PURCHASE & SHIPMENTS');
        const others = filteredSections.filter(s => s.title !== 'Core' && s.title !== 'PURCHASE & SHIPMENTS');
        filteredSections = [coreSec, purchaseSec, ...others].filter(Boolean);
    } else if (user.role === 'SalesStaff') {
        const coreSec = filteredSections.find(s => s.title === 'Core');
        const salesSec = filteredSections.find(s => s.title === 'SALES & FULFILLMENT');
        const others = filteredSections.filter(s => s.title !== 'Core' && s.title !== 'SALES & FULFILLMENT');
        filteredSections = [coreSec, salesSec, ...others].filter(Boolean);
    }

    container.innerHTML = `
        <!-- Desktop Sidebar Frame -->
        <aside id="mainSidebar" class="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 z-30 hidden lg:flex select-none">
            ${generateSidebarMarkup(filteredSections, user, roleInfo)}
        </aside>

        <!-- Mobile Drawer Overlay & Sidebar -->
        <div id="mobileDrawerBackdrop" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-300 lg:hidden">
            <div id="mobileDrawerContent" class="w-72 bg-slate-950 border-r border-slate-800 h-full flex flex-col justify-between transform -translate-x-full transition-transform duration-300 shadow-2xl">
                ${generateSidebarMarkup(filteredSections, user, roleInfo, true)}
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Auto-scroll active module link into view
    setTimeout(() => {
        const activeNav = container.querySelector('.nav-module-link.bg-blue-600\\/15');
        if (activeNav) {
            activeNav.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, 100);

    attachSidebarEvents();
}

function generateSidebarMarkup(sections, user, roleInfo, isMobile = false) {
    return `
        <!-- Top Brand Section -->
        <div class="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <a href="./dashboard.html" class="flex items-center space-x-3 group">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                    <i data-lucide="layers" class="w-4 h-4 text-white"></i>
                </div>
                <div class="flex flex-col">
                    <span class="text-lg font-extrabold tracking-wider text-white font-mono">CLOTH<span class="text-blue-400">ERP</span></span>
                    <span class="text-[8px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">Clothing Business ERP</span>
                </div>
            </a>
            ${isMobile ? `
                <button id="closeMobileDrawerBtn" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" aria-label="Close sidebar">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            ` : ''}
        </div>

        <!-- Scrollable Navigation Items -->
        <div class="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-sidebar-scroll text-xs">
            ${sections.map(sec => `
                <div class="space-y-1">
                    ${sec.title !== 'Core' ? `
                        <div class="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-500 font-mono mb-1.5">
                            ${sec.title}
                        </div>
                    ` : ''}
                    ${sec.items.map(item => `
                        <a href="${item.href}" 
                           class="nav-module-link flex items-center space-x-3 px-3 py-2 rounded-xl transition font-medium ${
                               item.active 
                                   ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-inner' 
                                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                           }"
                           data-label="${item.label}"
                           data-href="${item.href}"
                        >
                            <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0 ${item.active ? 'text-blue-400' : 'text-slate-400'}"></i>
                            <span class="truncate">${item.label}</span>
                        </a>
                    `).join('')}
                </div>
            `).join('')}
        </div>

        <!-- Bottom User Card -->
        <div class="p-3 border-t border-slate-800/80 bg-slate-950/40">
            <a href="./profile.html" class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition flex items-center justify-between group cursor-pointer block" title="View Profile & Account Settings">
                <div class="flex items-center space-x-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                        ${user.avatar || user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="text-xs font-bold text-slate-200 truncate group-hover:text-blue-300 transition-colors">${user.name}</span>
                        <span class="text-[10px] text-slate-400 font-mono truncate">${roleInfo.name}</span>
                    </div>
                </div>
                <div class="flex items-center space-x-1.5 flex-shrink-0">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-indicator" title="Active Session"></span>
                    <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors"></i>
                </div>
            </a>
        </div>
    `;
}

function attachSidebarEvents() {
    // Placeholder click notifications for modules not yet activated
    document.querySelectorAll('.nav-module-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('data-href');
            if (href === 'javascript:void(0)') {
                e.preventDefault();
                const label = link.getAttribute('data-label');
                showToastNotification(`'${label}' module will be activated in future ERP phases.`);
            }
        });
    });

    // Mobile Drawer Close Button
    const closeBtn = document.getElementById('closeMobileDrawerBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileDrawer);
    }

    // Backdrop Click Dismiss
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeMobileDrawer();
            }
        });
    }
}

export function openMobileDrawer() {
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    const content = document.getElementById('mobileDrawerContent');
    if (!backdrop || !content) return;

    backdrop.classList.remove('hidden');
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        content.classList.remove('-translate-x-full');
    }, 10);
}

export function closeMobileDrawer() {
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    const content = document.getElementById('mobileDrawerContent');
    if (!backdrop || !content) return;

    backdrop.classList.add('opacity-0');
    content.classList.add('-translate-x-full');
    setTimeout(() => {
        backdrop.classList.add('hidden');
    }, 300);
}

function showToastNotification(msg) {
    let toast = document.getElementById('clotherp-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'clotherp-toast';
        toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-slate-100 border border-slate-700 px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 transition-all duration-300 transform translate-y-10 opacity-0';
        toast.innerHTML = `<span id="toast-message" class="text-sm font-medium"></span>`;
        document.body.appendChild(toast);
    }
    const msgEl = document.getElementById('toast-message');
    if (msgEl) msgEl.textContent = msg;
    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
}
