// CLOTHERP - Reusable User Profile Dropdown & Logout Modal Component
import { authService } from '../services/authService.js';
import { getRoleDetails } from '../config/permissions.js';
import { openProfileModal } from './profileModal.js';

/**
 * Initialize Profile Dropdown and Logout Modal on the target container
 * @param {string} containerId - Element ID to mount the profile menu into
 */
export function initProfileMenu(containerId = 'profileMenuContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = authService.getCurrentUser();
    if (!user) return;

    const roleInfo = getRoleDetails(user.role);

    container.innerHTML = `
        <div class="relative inline-block text-left" id="clotherpProfileDropdown">
            <!-- Trigger Button -->
            <button id="profileDropdownBtn" type="button" class="flex items-center space-x-3 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40" aria-expanded="false" aria-haspopup="true">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-500/20">
                    ${user.avatar || user.name.slice(0, 2).toUpperCase()}
                </div>
                <div class="hidden sm:flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-200">${user.name}</span>
                    <span class="text-[10px] text-slate-400 font-mono flex items-center">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 pulse-indicator"></span>
                        ${roleInfo.name}
                    </span>
                </div>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 hidden sm:inline-block transition-transform duration-200" id="profileDropdownChevron"></i>
            </button>

            <!-- Dropdown Menu -->
            <div id="profileDropdownMenu" class="hidden absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl shadow-black/90 py-2 z-50 transform origin-top-right transition-all">
                <!-- User Header -->
                <div class="px-4 py-3 border-b border-slate-800">
                    <div class="text-xs text-slate-400">Signed in as</div>
                    <div class="text-sm font-bold text-white truncate">${user.name}</div>
                    <div class="text-xs text-slate-400 font-mono truncate">${user.email}</div>
                    <div class="mt-2">
                        <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleInfo.badgeClass}">
                            ${user.role} • ${user.branch || 'Central'}
                        </span>
                    </div>
                </div>

                <!-- Menu Links -->
                <div class="py-1 text-xs text-slate-300">
                    <a href="javascript:void(0)" class="profile-menu-item flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-800 hover:text-white transition" data-action="profile">
                        <i data-lucide="user" class="w-4 h-4 text-slate-400"></i>
                        <span>My Profile</span>
                    </a>
                    <a href="javascript:void(0)" class="profile-menu-item flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-800 hover:text-white transition" data-action="settings">
                        <i data-lucide="settings" class="w-4 h-4 text-slate-400"></i>
                        <span>Account Settings</span>
                    </a>
                    <a href="javascript:void(0)" class="profile-menu-item flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-800 hover:text-white transition" data-action="activity">
                        <i data-lucide="activity" class="w-4 h-4 text-slate-400"></i>
                        <span>Session Log</span>
                    </a>
                </div>

                <!-- Logout Action -->
                <div class="pt-1 border-t border-slate-800">
                    <button id="btnTriggerLogout" type="button" class="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-left">
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                        <span class="font-semibold">Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Initialize Logout Confirmation Modal in DOM if not present
    ensureLogoutModal();

    // Toggle Dropdown
    const btn = document.getElementById('profileDropdownBtn');
    const menu = document.getElementById('profileDropdownMenu');
    const chevron = document.getElementById('profileDropdownChevron');

    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = menu.classList.contains('hidden');
            if (isHidden) {
                menu.classList.remove('hidden');
                if (chevron) chevron.classList.add('rotate-180');
            } else {
                menu.classList.add('hidden');
                if (chevron) chevron.classList.remove('rotate-180');
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                menu.classList.add('hidden');
                if (chevron) chevron.classList.remove('rotate-180');
            }
        });
    }

    // Attach interactive Profile & Settings modal actions
    document.querySelectorAll('.profile-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const action = item.getAttribute('data-action');
            menu.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
            
            if (action === 'profile') {
                openProfileModal('profile');
            } else if (action === 'settings') {
                openProfileModal('settings');
            } else if (action === 'activity') {
                openProfileModal('sessions');
            }
        });
    });

    // Attach Logout Modal Trigger
    const logoutBtn = document.getElementById('btnTriggerLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            menu.classList.add('hidden');
            openLogoutModal();
        });
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

/**
 * Creates the Logout Confirmation Modal in the DOM
 */
function ensureLogoutModal() {
    if (document.getElementById('clotherpLogoutModal')) return;

    const modal = document.createElement('div');
    modal.id = 'clotherpLogoutModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm hidden opacity-0 transition-opacity duration-200';
    modal.innerHTML = `
        <div class="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-4 text-center transform scale-95 transition-transform duration-200" id="logoutModalCard">
            <div class="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
                <i data-lucide="log-out" class="w-6 h-6"></i>
            </div>
            <div>
                <h3 class="text-base font-bold text-white">Sign Out of CLOTHERP?</h3>
                <p class="text-xs text-slate-400 mt-1">Are you sure you want to end your current session? You will need to sign in again to access ERP modules.</p>
            </div>
            <div class="flex items-center justify-center space-x-3 pt-2">
                <button id="btnCancelLogout" type="button" class="w-1/2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition">
                    Cancel
                </button>
                <button id="btnConfirmLogout" type="button" class="w-1/2 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition">
                    Logout
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btnCancelLogout').addEventListener('click', closeLogoutModal);
    document.getElementById('btnConfirmLogout').addEventListener('click', async () => {
        await authService.logout();
        window.location.href = './login.html?loggedOut=true';
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

export function openLogoutModal() {
    const modal = document.getElementById('clotherpLogoutModal');
    const card = document.getElementById('logoutModalCard');
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (card) card.classList.remove('scale-95');
    }, 10);
}

export function closeLogoutModal() {
    const modal = document.getElementById('clotherpLogoutModal');
    const card = document.getElementById('logoutModalCard');
    if (!modal) return;
    modal.classList.add('opacity-0');
    if (card) card.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

function showNotificationToast(msg) {
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
