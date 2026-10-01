// CLOTHERP - Master Dashboard Controller
import { requireAuth } from './utils/authGuard.js';
import { authService } from './services/authService.js';
import { dashboardService } from './services/dashboardService.js';
import { initSidebar } from './components/sidebar.js';
import { initTopbar } from './components/topbar.js';
import { switchUserRole, ROLE_ACCOUNTS } from './components/roleSwitcher.js';
import { getRoleDetails } from './config/permissions.js';

// Enforce authentication before loading dashboard
const currentUser = requireAuth();
if (!currentUser) {
    throw new Error('Authentication required');
}

let salesOverviewChart = null;
let salesVsPurchaseChart = null;
let activePeriod = '7D';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Layout Shell Components
    initSidebar('sidebarMount');
    initTopbar('topbarMount');

    if (window.lucide) lucide.createIcons();

    // 2. Set Personalized Greeting & Role Badge
    setPersonalizedGreeting(currentUser);

    // 3. Load Dashboard Data & Render Modules
    await loadDashboardData();

    // 4. Attach Action & Filter Handlers
    attachDashboardEvents();
});

function setPersonalizedGreeting(user) {
    const greetingEl = document.getElementById('dashGreetingName');
    if (greetingEl) {
        const firstName = user.name.split(' ')[0] || user.name;
        greetingEl.textContent = firstName;
    }

    // Role Badge & Scope
    const roleBadge = document.getElementById('dashRoleBadge');
    const roleScopeText = document.getElementById('dashRoleScopeText');
    const acc = ROLE_ACCOUNTS.find(a => a.role === user.role);

    if (roleBadge && acc) {
        roleBadge.innerText = `${acc.title} (${acc.subtitle})`;
    }
    if (roleScopeText && acc) {
        roleScopeText.innerText = acc.scope;
    }

    // Bind Role Buttons
    document.querySelectorAll('.btn-dash-role').forEach(btn => {
        const targetRole = btn.getAttribute('data-role');
        if (targetRole === user.role) {
            btn.classList.add('ring-2', 'ring-white/40', 'font-bold');
        }
        btn.onclick = async () => {
            await switchUserRole(targetRole);
        };
    });
}

async function loadDashboardData() {
    showLoadingSkeletons(true);
    hideErrorState();

    try {
        const [
            summaryData,
            salesOverviewData,
            salesVsPurchaseData,
            topProducts,
            lowStockItems,
            recentSales,
            shipmentOverview,
            recentActivity
        ] = await Promise.all([
            dashboardService.getDashboardSummary(),
            dashboardService.getSalesOverview(activePeriod),
            dashboardService.getSalesVsPurchase(),
            dashboardService.getTopProducts(),
            dashboardService.getLowStockItems(),
            dashboardService.getRecentSales(),
            dashboardService.getShipmentOverview(),
            dashboardService.getRecentActivity()
        ]);

        // Render Summary KPI Cards
        renderPrimarySummaryCards(summaryData.primary);
        renderSecondarySummaryCards(summaryData.secondary);

        // Render Charts
        renderSalesOverviewChart(salesOverviewData);
        renderSalesVsPurchaseChart(salesVsPurchaseData);

        // Render Tables & Lists
        renderTopProductsTable(topProducts);
        renderLowStockTable(lowStockItems);
        renderRecentSalesTable(recentSales);
        renderShipmentOverview(shipmentOverview);
        renderRecentActivity(recentActivity);

        showLoadingSkeletons(false);

        if (window.lucide) lucide.createIcons();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showLoadingSkeletons(false);
        showErrorState('Unable to load real-time ERP analytics. Please check connection and try again.');
    }
}

// 1. Primary KPI Summary Cards
function renderPrimarySummaryCards(data) {
    document.getElementById('kpiTodaySales').textContent = data.todaySales.formatted;
    document.getElementById('kpiTodaySalesChange').innerHTML = `
        <span class="text-emerald-400 font-semibold flex items-center">
            <i data-lucide="trending-up" class="w-3.5 h-3.5 mr-1"></i>
            ${data.todaySales.change}
        </span>
        <span class="text-slate-500 ml-1.5">${data.todaySales.label}</span>
    `;

    document.getElementById('kpiTodayPurchase').textContent = data.todayPurchase.formatted;
    document.getElementById('kpiTodayPurchaseSub').textContent = data.todayPurchase.subtext;

    document.getElementById('kpiTotalStock').textContent = data.totalStock.formatted;
    document.getElementById('kpiTotalStockSub').textContent = data.totalStock.subtext;

    document.getElementById('kpiTodayProfit').textContent = data.todayProfit.formatted;
    document.getElementById('kpiTodayProfitSub').textContent = data.todayProfit.subtext;
}

// 2. Secondary Mini Metric Tiles
function renderSecondarySummaryCards(data) {
    document.getElementById('kpiReceivable').textContent = data.totalReceivable.formatted;
    document.getElementById('kpiReceivableSub').textContent = data.totalReceivable.label;

    document.getElementById('kpiPayable').textContent = data.totalPayable.formatted;
    document.getElementById('kpiPayableSub').textContent = data.totalPayable.label;

    document.getElementById('kpiLowStockCount').textContent = data.lowStockCount.formatted;
    document.getElementById('kpiLowStockSub').textContent = data.lowStockCount.label;

    document.getElementById('kpiOutOfStockCount').textContent = data.outOfStockCount.formatted;
    document.getElementById('kpiOutOfStockSub').textContent = data.outOfStockCount.label;
}

// 3. Sales Overview Area Chart
function renderSalesOverviewChart(data) {
    const ctx = document.getElementById('salesOverviewCanvas');
    if (!ctx) return;

    if (salesOverviewChart) {
        salesOverviewChart.destroy();
    }

    salesOverviewChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Actual Revenue (₹)',
                    data: data.sales,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.14)',
                    fill: true,
                    borderWidth: 2.5,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#38bdf8'
                },
                {
                    label: 'Sales Target (₹)',
                    data: data.target,
                    borderColor: '#64748b',
                    borderDash: [4, 4],
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0.35,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { boxWidth: 12, usePointStyle: true, font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 },
                        callback: (v) => `₹${(v >= 100000 ? (v / 100000).toFixed(1) + 'L' : (v / 1000).toFixed(0) + 'k')}`
                    }
                }
            }
        }
    });
}

// 4. Sales vs Purchase Bar Chart
function renderSalesVsPurchaseChart(data) {
    const ctx = document.getElementById('salesVsPurchaseCanvas');
    if (!ctx) return;

    if (salesVsPurchaseChart) {
        salesVsPurchaseChart.destroy();
    }

    salesVsPurchaseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Sales Revenue (₹L)',
                    data: data.sales,
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                },
                {
                    label: 'Purchases (₹L)',
                    data: data.purchases,
                    backgroundColor: '#334155',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { boxWidth: 10, font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y}L`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 },
                        callback: (v) => `₹${v}L`
                    }
                }
            }
        }
    });
}

// 5. Top Selling Products Table
function renderTopProductsTable(products) {
    const tbody = document.getElementById('topProductsTableBody');
    if (!tbody) return;

    tbody.innerHTML = products.map((p, idx) => `
        <tr class="border-b border-slate-800/60 hover:bg-slate-850/50 transition text-xs">
            <td class="py-3 px-3">
                <div class="flex items-center space-x-2.5">
                    <span class="font-mono text-slate-500 font-bold text-[11px]">#${idx + 1}</span>
                    <div>
                        <div class="font-bold text-slate-200">${p.name}</div>
                        <div class="text-[10px] text-slate-500 font-mono">${p.sku}</div>
                    </div>
                </div>
            </td>
            <td class="py-3 px-3">
                <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                    ${p.variant}
                </span>
            </td>
            <td class="py-3 px-3 text-center font-mono font-bold text-slate-200">${p.unitsSold}</td>
            <td class="py-3 px-3 text-right font-mono font-bold text-slate-100">${p.revenue}</td>
            <td class="py-3 px-3 text-right">
                <span class="text-emerald-400 font-mono text-[11px] font-semibold">${p.growth}</span>
            </td>
        </tr>
    `).join('');
}

// 6. Low Stock Alert Table
function renderLowStockTable(items) {
    const tbody = document.getElementById('lowStockTableBody');
    if (!tbody) return;

    tbody.innerHTML = items.map(item => `
        <tr class="border-b border-slate-800/60 hover:bg-slate-850/50 transition text-xs">
            <td class="py-3 px-3">
                <div class="font-bold text-slate-200">${item.name}</div>
                <div class="text-[10px] text-slate-500 font-mono">${item.sku}</div>
            </td>
            <td class="py-3 px-3">
                <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                    ${item.variant}
                </span>
            </td>
            <td class="py-3 px-3 text-center font-mono font-bold ${
                item.severity === 'danger' ? 'text-red-400' : 'text-amber-400'
            }">
                ${item.currentStock} Units
            </td>
            <td class="py-3 px-3 text-right">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                    item.severity === 'danger'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }">
                    ${item.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// 7. Recent Sales Table
function renderRecentSalesTable(sales) {
    const tbody = document.getElementById('recentSalesTableBody');
    if (!tbody) return;

    tbody.innerHTML = sales.map(s => `
        <tr class="border-b border-slate-800/60 hover:bg-slate-850/50 transition text-xs">
            <td class="py-3 px-3">
                <div class="font-mono font-bold text-blue-400">${s.invoiceNumber}</div>
                <div class="text-[10px] text-slate-500">${s.time}</div>
            </td>
            <td class="py-3 px-3">
                <div class="font-bold text-slate-200">${s.customerName}</div>
                <div class="text-[10px] text-slate-400">${s.customerType}</div>
            </td>
            <td class="py-3 px-3 text-right font-mono font-bold text-slate-100">${s.amount}</td>
            <td class="py-3 px-3 text-right">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    s.status === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : s.status === 'Partial'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                }">
                    ${s.status} • ${s.paymentMode}
                </span>
            </td>
        </tr>
    `).join('');
}

// 8. Shipment Overview Counters & Live Tracking Card
function renderShipmentOverview(data) {
    const counters = data.counters;
    document.getElementById('shipOrdered').textContent = counters.ordered;
    document.getElementById('shipPacked').textContent = counters.packed;
    document.getElementById('shipDispatched').textContent = counters.dispatched;
    document.getElementById('shipInTransit').textContent = counters.inTransit;
    document.getElementById('shipDelivered').textContent = counters.delivered;

    const ship = data.activeShipment;
    document.getElementById('activeShipPO').textContent = ship.consignmentNumber;
    document.getElementById('activeShipTransporter').textContent = ship.transporter;
    document.getElementById('activeShipLR').textContent = ship.lrNumber;
    document.getElementById('activeShipVehicle').textContent = ship.vehicleNumber;
    document.getElementById('activeShipDelivery').textContent = ship.expectedDate;
    document.getElementById('activeShipStatus').textContent = ship.status;
    document.getElementById('activeShipProgress').style.width = `${ship.progressPercent}%`;
}

// 9. Recent Activity Timeline
function renderRecentActivity(activities) {
    const container = document.getElementById('recentActivityContainer');
    if (!container) return;

    container.innerHTML = activities.map(act => `
        <div class="flex items-start space-x-3 text-xs">
            <div class="w-2 h-2 mt-1.5 rounded-full ${
                act.type === 'sales' ? 'bg-blue-400 ring-4 ring-blue-400/20' :
                act.type === 'purchase' ? 'bg-indigo-400 ring-4 ring-indigo-400/20' :
                act.type === 'inventory' ? 'bg-emerald-400 ring-4 ring-emerald-400/20' :
                'bg-purple-400 ring-4 ring-purple-400/20'
            }"></div>
            <div class="flex-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <div class="flex justify-between items-center mb-0.5">
                    <span class="font-bold text-slate-200">${act.person} <span class="text-[10px] text-slate-400 font-normal">(${act.role})</span></span>
                    <span class="text-[10px] text-slate-500 font-mono">${act.time}</span>
                </div>
                <p class="text-[11px] text-slate-400">${act.action}</p>
            </div>
        </div>
    `).join('');
}

// 10. Dashboard Events & Filter Switchers
function attachDashboardEvents() {
    // Period Selector Buttons for Sales Overview
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            document.querySelectorAll('.period-btn').forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white');
                b.classList.add('bg-slate-900', 'text-slate-400');
            });
            btn.classList.add('bg-blue-600', 'text-white');
            btn.classList.remove('bg-slate-900', 'text-slate-400');

            activePeriod = btn.getAttribute('data-period');
            const data = await dashboardService.getSalesOverview(activePeriod);
            renderSalesOverviewChart(data);
        });
    });

    // Quick Action Buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            showToastNotification(`'${action}' will be activated in upcoming module releases.`);
        });
    });

    // Retry Button on Error State
    const retryBtn = document.getElementById('btnRetryDashboard');
    if (retryBtn) {
        retryBtn.addEventListener('click', loadDashboardData);
    }
}

function showLoadingSkeletons(show) {
    const skeletons = document.querySelectorAll('.dashboard-skeleton');
    const contents = document.querySelectorAll('.dashboard-real-content');

    skeletons.forEach(el => {
        if (show) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    contents.forEach(el => {
        if (show) el.classList.add('hidden');
        else el.classList.remove('hidden');
    });
}

function showErrorState(msg) {
    const errorCard = document.getElementById('dashboardErrorCard');
    const errorMsg = document.getElementById('dashboardErrorMsg');
    if (errorCard && errorMsg) {
        errorMsg.textContent = msg;
        errorCard.classList.remove('hidden');
    }
}

function hideErrorState() {
    const errorCard = document.getElementById('dashboardErrorCard');
    if (errorCard) errorCard.classList.add('hidden');
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
