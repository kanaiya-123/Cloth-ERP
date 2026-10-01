// CLOTHERP - Interactive User Profile, Account Settings & Session Log Modal
import { userProfileService } from '../services/userProfileService.js';
import { authService } from '../services/authService.js';

let activeTab = 'profile'; // 'profile' | 'settings' | 'sessions'

export function initProfileModal() {
    if (document.getElementById('clotherpProfileModalContainer')) return;

    const modalMarkup = `
        <div id="clotherpProfileModalContainer" class="fixed inset-0 z-50 hidden flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
            <div class="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                <!-- MODAL HEADER -->
                <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div id="modalUserAvatarBadge" class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-blue-500/25">
                            PS
                        </div>
                        <div>
                            <h2 class="text-base font-bold text-white flex items-center space-x-2">
                                <span id="modalUserName">Priya Sharma</span>
                                <span id="modalUserRoleBadge" class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">SalesStaff</span>
                            </h2>
                            <p id="modalUserEmail" class="text-xs text-slate-400 font-mono">sales@clotherp.local</p>
                        </div>
                    </div>

                    <!-- Header Nav Tabs -->
                    <div class="hidden sm:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                        <button type="button" id="tabBtnProfile" class="profile-tab-btn px-3.5 py-1.5 rounded-lg font-semibold transition bg-blue-600 text-white shadow" data-tab="profile">
                            <span class="flex items-center space-x-1.5"><i data-lucide="user" class="w-3.5 h-3.5"></i><span>My Profile</span></span>
                        </button>
                        <button type="button" id="tabBtnSettings" class="profile-tab-btn px-3.5 py-1.5 rounded-lg font-semibold transition text-slate-400 hover:text-white" data-tab="settings">
                            <span class="flex items-center space-x-1.5"><i data-lucide="settings" class="w-3.5 h-3.5"></i><span>Account Settings</span></span>
                        </button>
                        <button type="button" id="tabBtnSessions" class="profile-tab-btn px-3.5 py-1.5 rounded-lg font-semibold transition text-slate-400 hover:text-white" data-tab="sessions">
                            <span class="flex items-center space-x-1.5"><i data-lucide="activity" class="w-3.5 h-3.5"></i><span>Session Log</span></span>
                        </button>
                    </div>

                    <!-- Right Controls -->
                    <div class="flex items-center space-x-2">
                        <a href="./profile.html" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Open in Full Screen Page">
                            <i data-lucide="external-link" class="w-4 h-4"></i>
                        </a>
                        <button type="button" id="btnCloseProfileModal" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Close">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>

                <!-- MOBILE TABS BAR -->
                <div class="sm:hidden flex border-b border-slate-800 bg-slate-950/60 p-2 overflow-x-auto text-xs gap-1">
                    <button type="button" class="profile-tab-btn px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap bg-blue-600 text-white" data-tab="profile">My Profile</button>
                    <button type="button" class="profile-tab-btn px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap text-slate-400" data-tab="settings">Account Settings</button>
                    <button type="button" class="profile-tab-btn px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap text-slate-400" data-tab="sessions">Session Log</button>
                </div>

                <!-- MODAL BODY -->
                <div class="flex-1 overflow-y-auto p-5 sm:p-6 custom-sidebar-scroll bg-slate-900/60">
                    
                    <!-- TAB 1: MY PROFILE -->
                    <div id="profileTabContentProfile" class="tab-pane space-y-6">
                        <form id="formUserProfile" class="space-y-6">
                            <!-- Basic Info Card -->
                            <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
                                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                                    <i data-lucide="user-check" class="w-4 h-4 text-blue-400"></i>
                                    <span>Personal & Work Details</span>
                                </h3>
                                
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label class="block text-slate-400 mb-1 font-medium">Full Name</label>
                                        <input type="text" id="profInputName" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" required>
                                    </div>
                                    <div>
                                        <label class="block text-slate-400 mb-1 font-medium">Email Address</label>
                                        <input type="email" id="profInputEmail" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" required>
                                    </div>
                                    <div>
                                        <label class="block text-slate-400 mb-1 font-medium">Mobile / Phone</label>
                                        <input type="text" id="profInputPhone" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                                    </div>
                                    <div>
                                        <label class="block text-slate-400 mb-1 font-medium">Assigned Branch / Counter</label>
                                        <input type="text" id="profInputBranch" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                                    </div>
                                    <div>
                                        <label class="block text-slate-400 mb-1 font-medium">Department</label>
                                        <input type="text" id="profInputDept" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                                    </div>
                                    <div>
                                        <label class="block text-slate-400 mb-1 font-medium">Employee Code</label>
                                        <input type="text" id="profInputEmpId" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-mono cursor-not-allowed" readonly>
                                    </div>
                                    <div class="sm:col-span-2">
                                        <label class="block text-slate-400 mb-1 font-medium">Emergency Contact</label>
                                        <input type="text" id="profInputEmergency" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                                    </div>
                                    <div class="sm:col-span-2">
                                        <label class="block text-slate-400 mb-1 font-medium">Physical Address</label>
                                        <textarea id="profInputAddress" rows="2" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"></textarea>
                                    </div>
                                    <div class="sm:col-span-2">
                                        <label class="block text-slate-400 mb-1 font-medium">Biography / Role Summary</label>
                                        <textarea id="profInputBio" rows="2" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"></textarea>
                                    </div>
                                </div>

                                <div class="flex justify-end pt-2">
                                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center space-x-2">
                                        <i data-lucide="save" class="w-4 h-4"></i>
                                        <span>Save Profile Changes</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- TAB 2: ACCOUNT SETTINGS -->
                    <div id="profileTabContentSettings" class="tab-pane hidden space-y-6">
                        <!-- Password Change Box -->
                        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
                            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                                <i data-lucide="key" class="w-4 h-4 text-emerald-400"></i>
                                <span>Security & Password Management</span>
                            </h3>

                            <form id="formChangePassword" class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label class="block text-slate-400 mb-1 font-medium">Current Password</label>
                                    <input type="password" id="passCurrent" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 transition" placeholder="••••••••" required>
                                </div>
                                <div>
                                    <label class="block text-slate-400 mb-1 font-medium">New Password</label>
                                    <input type="password" id="passNew" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 transition" placeholder="Min. 6 chars" required>
                                </div>
                                <div>
                                    <label class="block text-slate-400 mb-1 font-medium">Confirm New Password</label>
                                    <input type="password" id="passConfirm" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 transition" placeholder="Repeat new" required>
                                </div>
                                <div class="sm:col-span-3 flex justify-between items-center pt-2">
                                    <span class="text-[11px] text-slate-500">Default passwords for demo: Admin@123, Sales@123, Manager@123</span>
                                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2">
                                        <i data-lucide="shield-check" class="w-4 h-4"></i>
                                        <span>Update Password</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- System Preferences Card -->
                        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
                            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                                <i data-lucide="sliders" class="w-4 h-4 text-indigo-400"></i>
                                <span>ERP Preferences & Display</span>
                            </h3>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                    <div>
                                        <div class="font-bold text-white">Two-Factor Authentication (2FA)</div>
                                        <div class="text-[11px] text-slate-400">Require OTP on new terminal logins</div>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="setting2FA" class="sr-only peer">
                                        <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                    <div>
                                        <div class="font-bold text-white">Auto-Lock Idle Session</div>
                                        <div class="text-[11px] text-slate-400">Lock terminal after inactivity</div>
                                    </div>
                                    <select id="settingAutoLock" class="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs">
                                        <option value="5">5 Minutes</option>
                                        <option value="15" selected>15 Minutes</option>
                                        <option value="30">30 Minutes</option>
                                        <option value="60">60 Minutes</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                    <div>
                                        <div class="font-bold text-white">Email Bill & PO Alerts</div>
                                        <div class="text-[11px] text-slate-400">Receive dispatch and receipt alerts</div>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="settingEmailAlerts" class="sr-only peer" checked>
                                        <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                    <div>
                                        <div class="font-bold text-white">Sound Effects</div>
                                        <div class="text-[11px] text-slate-400">Beep on barcode scan and billing</div>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="settingSoundAlerts" class="sr-only peer" checked>
                                        <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            <div class="flex justify-end pt-2">
                                <button type="button" id="btnSavePreferences" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2">
                                    <i data-lucide="check" class="w-4 h-4"></i>
                                    <span>Save Preferences</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 3: SESSION LOG -->
                    <div id="profileTabContentSessions" class="tab-pane hidden space-y-6">
                        <!-- Current Session Banner -->
                        <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div class="flex items-center space-x-3.5">
                                <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                                    <i data-lucide="monitor" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm font-bold text-white">Current Active Session</span>
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Live Now</span>
                                    </div>
                                    <p class="text-xs text-slate-400 mt-0.5" id="currentSessionDeviceInfo">Desktop Chrome • 127.0.0.1 (Local POS)</p>
                                </div>
                            </div>
                            <button type="button" id="btnTerminateOthers" class="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold transition flex items-center space-x-1.5 self-start sm:self-auto">
                                <i data-lucide="shield-alert" class="w-4 h-4"></i>
                                <span>Terminate Other Sessions</span>
                            </button>
                        </div>

                        <!-- Session Logs Table -->
                        <div class="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                            <div class="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                                <div class="font-bold text-xs text-white uppercase tracking-wider flex items-center space-x-2">
                                    <i data-lucide="history" class="w-4 h-4 text-blue-400"></i>
                                    <span>Terminal & Device Access History</span>
                                </div>
                                <span class="text-[11px] text-slate-400 font-mono" id="sessionLogCount">Showing past entries</span>
                            </div>

                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-xs">
                                    <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                                        <tr>
                                            <th class="py-3 px-4">Device & Browser</th>
                                            <th class="py-3 px-4">IP Address</th>
                                            <th class="py-3 px-4">Location</th>
                                            <th class="py-3 px-4">Login Time</th>
                                            <th class="py-3 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="sessionLogsTbody" class="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                                        <!-- Rendered dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    if (window.lucide) lucide.createIcons();

    attachModalEvents();
}

function attachModalEvents() {
    const modal = document.getElementById('clotherpProfileModalContainer');
    const closeBtn = document.getElementById('btnCloseProfileModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Tab buttons
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Profile Form submit
    const formProf = document.getElementById('formUserProfile');
    if (formProf) {
        formProf.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = {
                name: document.getElementById('profInputName').value.trim(),
                email: document.getElementById('profInputEmail').value.trim(),
                phone: document.getElementById('profInputPhone').value.trim(),
                branch: document.getElementById('profInputBranch').value.trim(),
                department: document.getElementById('profInputDept').value.trim(),
                emergencyContact: document.getElementById('profInputEmergency').value.trim(),
                address: document.getElementById('profInputAddress').value.trim(),
                bio: document.getElementById('profInputBio').value.trim()
            };

            userProfileService.updateProfile(updated);
            showToast('Profile updated successfully!', 'success');
            loadProfileData();

            // Also refresh topbar display if present
            const topbarName = document.querySelector('#profileDropdownBtn .text-slate-200');
            if (topbarName) topbarName.textContent = updated.name;
        });
    }

    // Password Form submit
    const formPass = document.getElementById('formChangePassword');
    if (formPass) {
        formPass.addEventListener('submit', (e) => {
            e.preventDefault();
            const curr = document.getElementById('passCurrent').value;
            const newP = document.getElementById('passNew').value;
            const conf = document.getElementById('passConfirm').value;

            const res = userProfileService.changePassword(curr, newP, conf);
            if (res.success) {
                showToast(res.message, 'success');
                formPass.reset();
            } else {
                showToast(res.message, 'error');
            }
        });
    }

    // Preferences Save
    const btnSavePref = document.getElementById('btnSavePreferences');
    if (btnSavePref) {
        btnSavePref.addEventListener('click', () => {
            const newPrefs = {
                twoFactorAuth: document.getElementById('setting2FA').checked,
                autoLockMinutes: Number(document.getElementById('settingAutoLock').value),
                emailNotifications: document.getElementById('settingEmailAlerts').checked,
                soundAlerts: document.getElementById('settingSoundAlerts').checked
            };
            userProfileService.updateSettings(newPrefs);
            showToast('Account preferences saved!', 'success');
        });
    }

    // Terminate Others
    const btnTerm = document.getElementById('btnTerminateOthers');
    if (btnTerm) {
        btnTerm.addEventListener('click', () => {
            userProfileService.terminateOtherSessions();
            showToast('All other sessions terminated successfully.', 'info');
            loadSessionLogs();
        });
    }
}

export function openProfileModal(tab = 'profile') {
    initProfileModal();
    const modal = document.getElementById('clotherpProfileModalContainer');
    if (!modal) return;

    loadProfileData();
    loadSettingsData();
    loadSessionLogs();

    switchTab(tab);
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function switchTab(tab) {
    activeTab = tab;
    // Update tab button classes
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        const btnTab = btn.getAttribute('data-tab');
        if (btnTab === tab) {
            btn.className = 'profile-tab-btn px-3.5 py-1.5 rounded-lg font-semibold transition bg-blue-600 text-white shadow';
        } else {
            btn.className = 'profile-tab-btn px-3.5 py-1.5 rounded-lg font-semibold transition text-slate-400 hover:text-white';
        }
    });

    // Toggle panes
    const panes = {
        'profile': document.getElementById('profileTabContentProfile'),
        'settings': document.getElementById('profileTabContentSettings'),
        'sessions': document.getElementById('profileTabContentSessions')
    };

    Object.keys(panes).forEach(k => {
        if (panes[k]) {
            if (k === tab) {
                panes[k].classList.remove('hidden');
            } else {
                panes[k].classList.add('hidden');
            }
        }
    });

    if (window.lucide) lucide.createIcons();
}

function loadProfileData() {
    const prof = userProfileService.getProfile();

    const nameEl = document.getElementById('modalUserName');
    const roleEl = document.getElementById('modalUserRoleBadge');
    const emailEl = document.getElementById('modalUserEmail');
    const avatarEl = document.getElementById('modalUserAvatarBadge');

    if (nameEl) nameEl.textContent = prof.name;
    if (roleEl) roleEl.textContent = prof.role;
    if (emailEl) emailEl.textContent = prof.email;
    if (avatarEl) avatarEl.textContent = prof.avatar;

    // Fill form
    if (document.getElementById('profInputName')) document.getElementById('profInputName').value = prof.name || '';
    if (document.getElementById('profInputEmail')) document.getElementById('profInputEmail').value = prof.email || '';
    if (document.getElementById('profInputPhone')) document.getElementById('profInputPhone').value = prof.phone || '';
    if (document.getElementById('profInputBranch')) document.getElementById('profInputBranch').value = prof.branch || '';
    if (document.getElementById('profInputDept')) document.getElementById('profInputDept').value = prof.department || '';
    if (document.getElementById('profInputEmpId')) document.getElementById('profInputEmpId').value = prof.employeeId || 'EMP-2024-001';
    if (document.getElementById('profInputEmergency')) document.getElementById('profInputEmergency').value = prof.emergencyContact || '';
    if (document.getElementById('profInputAddress')) document.getElementById('profInputAddress').value = prof.address || '';
    if (document.getElementById('profInputBio')) document.getElementById('profInputBio').value = prof.bio || '';
}

function loadSettingsData() {
    const s = userProfileService.getSettings();
    if (document.getElementById('setting2FA')) document.getElementById('setting2FA').checked = !!s.twoFactorAuth;
    if (document.getElementById('settingAutoLock')) document.getElementById('settingAutoLock').value = s.autoLockMinutes || 15;
    if (document.getElementById('settingEmailAlerts')) document.getElementById('settingEmailAlerts').checked = s.emailNotifications !== false;
    if (document.getElementById('settingSoundAlerts')) document.getElementById('settingSoundAlerts').checked = s.soundAlerts !== false;
}

function loadSessionLogs() {
    const logs = userProfileService.getSessionLogs();
    const tbody = document.getElementById('sessionLogsTbody');
    const countEl = document.getElementById('sessionLogCount');
    
    if (countEl) countEl.textContent = `${logs.length} Total Sessions Tracked`;
    if (!tbody) return;

    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500">No session logs found.</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(l => {
        let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
        if (l.status === 'Active' || l.isCurrent) badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        else if (l.status.includes('Terminated')) badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';

        const d = new Date(l.loginTime);
        const timeStr = d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
            <tr class="hover:bg-slate-900/40 transition">
                <td class="py-3 px-4 text-white font-sans font-medium flex items-center space-x-2">
                    <i data-lucide="${l.device.includes('Tablet') ? 'tablet' : 'laptop'}" class="w-4 h-4 text-slate-400"></i>
                    <span>${l.device}</span>
                    ${l.isCurrent ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">This Device</span>' : ''}
                </td>
                <td class="py-3 px-4 font-mono">${l.ipAddress}</td>
                <td class="py-3 px-4 font-sans text-slate-300">${l.location}</td>
                <td class="py-3 px-4 font-mono text-slate-400">${timeStr}</td>
                <td class="py-3 px-4">
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}">
                        ${l.status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function showToast(message, type = 'info') {
    // If the page already has a toast function, try to call it
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }
    const t = document.createElement('div');
    t.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold text-white transition-all transform flex items-center space-x-2 border ${type === 'success' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200' : (type === 'error' ? 'bg-rose-950 border-rose-500/50 text-rose-200' : 'bg-slate-900 border-slate-700 text-white')}`;
    t.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 300);
    }, 2500);
}
