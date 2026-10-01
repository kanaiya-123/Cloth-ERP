// CLOTHERP - Core Interactive Logic & Event Handling

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
        });
    }

    // 3. Sticky Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    const updateNavbar = () => {
        if (window.scrollY > 20) {
            navbar.classList.add('glass-nav', 'border-b', 'border-slate-800/80', 'shadow-lg');
            navbar.classList.remove('bg-transparent');
        } else {
            navbar.classList.remove('glass-nav', 'border-b', 'border-slate-800/80', 'shadow-lg');
            navbar.classList.add('bg-transparent');
        }
    };
    window.addEventListener('scroll', updateNavbar);
    updateNavbar();

    // 4. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('flex');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            }
        });

        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            });
        });
    }

    // 5. Interactive Sales & GST Invoice Demo Engine
    initSalesGSTCalculator();

    // 6. Interactive Payment Method Selector
    initPaymentMethodSelector();

    // 7. Route Placeholder Handler
    initPlaceholderRoutes();
});

// Interactive Sales & GST Invoicing Engine
function initSalesGSTCalculator() {
    // Initial Item State
    let items = [
        { id: 1, name: "Men's Oxford Shirt", variant: "Black / M", sku: "SH-BLK-M", qty: 2, rate: 900 },
        { id: 2, name: "Slim Fit Stretch Pant", variant: "Navy Blue / 32", sku: "PT-NVY-32", qty: 1, rate: 1000 }
    ];

    let discount = 200; // Flat discount

    const itemsContainer = document.getElementById('invoiceItemsList');
    const subtotalEl = document.getElementById('invSubtotal');
    const discountEl = document.getElementById('invDiscount');
    const taxableEl = document.getElementById('invTaxable');
    const cgstEl = document.getElementById('invCgst');
    const sgstEl = document.getElementById('invSgst');
    const grandTotalEl = document.getElementById('invGrandTotal');
    const addProductBtn = document.getElementById('btnAddProduct');

    function renderInvoice() {
        if (!itemsContainer) return;
        itemsContainer.innerHTML = '';

        let subtotal = 0;

        items.forEach(item => {
            const itemTotal = item.qty * item.rate;
            subtotal += itemTotal;

            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-800/60 hover:bg-slate-800/30 transition text-sm';
            tr.innerHTML = `
                <td class="py-3 px-3">
                    <div class="font-medium text-slate-100">${item.name}</div>
                    <div class="text-xs text-slate-400 font-mono">${item.sku}</div>
                </td>
                <td class="py-3 px-2">
                    <span class="inline-block px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                        ${item.variant}
                    </span>
                </td>
                <td class="py-3 px-2 text-center">
                    <div class="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded-md p-1">
                        <button class="qty-btn text-slate-400 hover:text-white px-1.5 py-0.5 rounded transition text-xs" data-id="${item.id}" data-action="dec">−</button>
                        <span class="w-5 text-center font-semibold text-slate-200 text-xs">${item.qty}</span>
                        <button class="qty-btn text-slate-400 hover:text-white px-1.5 py-0.5 rounded transition text-xs" data-id="${item.id}" data-action="inc">+</button>
                    </div>
                </td>
                <td class="py-3 px-2 text-right font-mono text-slate-300 text-xs">₹${item.rate.toLocaleString('en-IN')}</td>
                <td class="py-3 px-3 text-right font-mono font-semibold text-slate-100 text-sm">₹${itemTotal.toLocaleString('en-IN')}</td>
                <td class="py-3 px-2 text-center">
                    <button class="btn-remove-item text-slate-500 hover:text-red-400 transition p-1" data-id="${item.id}" title="Remove item">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            itemsContainer.appendChild(tr);
        });

        // Recalculate Totals
        const taxable = Math.max(0, subtotal - discount);
        const cgst = taxable * 0.025; // 2.5% GST on Apparel
        const sgst = taxable * 0.025; // 2.5% GST on Apparel
        const grandTotal = taxable + cgst + sgst;

        if (subtotalEl) subtotalEl.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
        if (discountEl) discountEl.innerText = `-₹${discount.toLocaleString('en-IN')}`;
        if (taxableEl) taxableEl.innerText = `₹${taxable.toLocaleString('en-IN')}`;
        if (cgstEl) cgstEl.innerText = `₹${cgst.toFixed(0)}`;
        if (sgstEl) sgstEl.innerText = `₹${sgst.toFixed(0)}`;
        if (grandTotalEl) grandTotalEl.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

        if (window.lucide) {
            lucide.createIcons();
        }

        attachItemEvents();
    }

    function attachItemEvents() {
        // Quantity +/- Buttons
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                const action = e.currentTarget.getAttribute('data-action');
                const target = items.find(i => i.id === id);
                if (target) {
                    if (action === 'inc') target.qty += 1;
                    if (action === 'dec' && target.qty > 1) target.qty -= 1;
                    renderInvoice();
                }
            });
        });

        // Remove Item
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                if (items.length > 1) {
                    items = items.filter(i => i.id !== id);
                    renderInvoice();
                } else {
                    showToast('At least one line item is required for GST invoice calculation.');
                }
            });
        });
    }

    // Add Product Demo Action
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            const availableCatalog = [
                { name: "Linen Formal Trousers", variant: "Charcoal / 34", sku: "TR-CHR-34", qty: 1, rate: 1200 },
                { name: "Printed Silk Kurta", variant: "Mustard / L", sku: "KT-MST-L", qty: 1, rate: 1450 },
                { name: "Cotton Polo T-Shirt", variant: "Olive / M", sku: "TS-OLV-M", qty: 2, rate: 650 }
            ];
            const nextItem = availableCatalog[items.length % availableCatalog.length];
            items.push({
                id: Date.now(),
                ...nextItem
            });
            renderInvoice();
            showToast(`Added '${nextItem.name}' to invoice.`);
        });
    }

    renderInvoice();
}

// Interactive Payment Method Pill Toggle
function initPaymentMethodSelector() {
    const paymentButtons = document.querySelectorAll('.payment-method-btn');
    paymentButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentButtons.forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white', 'border-blue-500', 'shadow-blue-500/20', 'shadow-md');
                b.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
            });
            btn.classList.add('bg-blue-600', 'text-white', 'border-blue-500', 'shadow-blue-500/20', 'shadow-md');
            btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        });
    });
}

// Future ASP.NET API & Route Integration Placeholder Feedback
function initPlaceholderRoutes() {
    const routeLinks = document.querySelectorAll('[data-route]');
    routeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const route = link.getAttribute('data-route');
            if (route) {
                e.preventDefault();
                showToast(`Navigating to [${route}] in Phase 2 backend integration.`);
            }
        });
    });
}

// Lightweight Toast Notification
function showToast(message) {
    let toast = document.getElementById('clotherp-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'clotherp-toast';
        toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-slate-100 border border-slate-700 px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 transition-all duration-300 transform translate-y-10 opacity-0';
        toast.innerHTML = `
            <div class="w-2 h-2 rounded-full bg-blue-500 pulse-indicator"></div>
            <span id="toast-message" class="text-sm font-medium"></span>
        `;
        document.body.appendChild(toast);
    }

    const msgSpan = document.getElementById('toast-message');
    if (msgSpan) msgSpan.textContent = message;

    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3200);
}
