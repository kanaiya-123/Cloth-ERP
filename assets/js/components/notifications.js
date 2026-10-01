// CLOTHERP - Notifications Dropdown Component (Live Smart Alerts)
import { notificationService } from '../services/notificationService.js';
import { authService } from '../services/authService.js';

export function initNotifications(containerId = 'notificationsMount') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let notifications = [];

    async function render() {
        const user = authService.getCurrentUser();
        const role = user ? user.role : 'ADMIN';

        const res = await notificationService.getNotifications({
            page: 1,
            pageSize: 6,
            userRole: role
        });

        notifications = res.items || [];
        const unreadCount = res.summary.unreadCount;

        container.innerHTML = `
            <div class="relative inline-block text-left" id="notificationsDropdownWrapper">
                <!-- Trigger Button -->
                <button id="notifDropdownBtn" type="button" class="relative p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500/40" aria-label="Notifications">
                    <i data-lucide="bell" class="w-4 h-4"></i>
                    ${unreadCount > 0 ? `
                        <span id="notifBadge" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold flex items-center justify-center pulse-indicator shadow">
                            ${unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    ` : ''}
                </button>

                <!-- Dropdown Menu -->
                <div id="notifDropdownMenu" class="hidden absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl shadow-black/90 py-2 z-50 transform origin-top-right transition-all">
                    
                    <!-- Header -->
                    <div class="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <h4 class="text-xs font-bold text-white">Notifications</h4>
                            <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold" id="notifCountHeader">
                                ${unreadCount} New
                            </span>
                        </div>
                        <button id="btnMarkAllRead" type="button" class="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition">
                            Mark all as read
                        </button>
                    </div>

                    <!-- Items List -->
                    <div class="max-h-72 overflow-y-auto divide-y divide-slate-800/60" id="notifItemsContainer">
                        ${notifications.length === 0 ? `
                            <div class="p-6 text-center text-slate-500 text-xs font-sans">
                                <i data-lucide="bell-off" class="w-6 h-6 mx-auto mb-1 text-slate-600"></i>
                                You're all caught up! No new notifications.
                            </div>
                        ` : notifications.map(n => `
                            <div class="p-3.5 hover:bg-slate-850 transition flex items-start space-x-3 cursor-pointer notif-item ${!n.isRead ? 'bg-slate-900/60' : 'opacity-65'}" data-id="${n.id}" data-url="${n.actionUrl || ''}">
                                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                    n.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    n.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }">
                                    <i data-lucide="${
                                        n.type === 'OUT_OF_STOCK' || n.priority === 'CRITICAL' ? 'alert-octagon' :
                                        n.type === 'LOW_STOCK' || n.priority === 'HIGH' ? 'alert-triangle' :
                                        n.type === 'RETURN_REQUESTED' ? 'rotate-ccw' :
                                        n.type === 'REFUND_PENDING' ? 'credit-card' : 'bell'
                                    }" class="w-3.5 h-3.5"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-center mb-0.5">
                                        <span class="text-xs font-bold text-slate-200 truncate">${n.title}</span>
                                        <span class="text-[10px] text-slate-500 font-mono">${n.relativeTime}</span>
                                    </div>
                                    <p class="text-[11px] text-slate-400 leading-normal line-clamp-2">${n.message}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Footer -->
                    <div class="pt-2 px-4 pb-1 border-t border-slate-800 text-center flex justify-between items-center text-xs">
                        <a href="./notifications.html" class="text-xs text-blue-400 hover:text-blue-300 font-medium py-1">
                            View all notifications →
                        </a>
                        <a href="./notification-settings.html" class="text-[11px] text-slate-500 hover:text-slate-300">
                            Settings
                        </a>
                    </div>

                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        attachEvents();
    }

    function attachEvents() {
        const btn = document.getElementById('notifDropdownBtn');
        const menu = document.getElementById('notifDropdownMenu');
        const wrapper = document.getElementById('notificationsDropdownWrapper');
        const markAllBtn = document.getElementById('btnMarkAllRead');

        if (btn && menu) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('hidden');
            });

            document.addEventListener('click', (e) => {
                if (wrapper && !wrapper.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            });
        }

        // Notification Item Click (Mark read & navigate)
        document.querySelectorAll('.notif-item').forEach(el => {
            el.addEventListener('click', async (e) => {
                const id = el.getAttribute('data-id');
                const url = el.getAttribute('data-url');
                await notificationService.markAsRead(id);
                if (url) {
                    window.location.href = url;
                } else {
                    render();
                }
            });
        });

        if (markAllBtn) {
            markAllBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await notificationService.markAllAsRead();
                const badge = document.getElementById('notifBadge');
                if (badge) badge.remove();
                const headerCount = document.getElementById('notifCountHeader');
                if (headerCount) headerCount.textContent = '0 New';
                const itemsContainer = document.getElementById('notifItemsContainer');
                if (itemsContainer) {
                    itemsContainer.querySelectorAll('.notif-item').forEach(el => el.classList.add('opacity-65'));
                }
                showToastNotification('All notifications marked as read.');
            });
        }
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

    render();
}
