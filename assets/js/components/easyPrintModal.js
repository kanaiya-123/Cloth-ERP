// CLOTHERP - Interactive EasyPrint Modal Component
// Supports Live A4 Preview, Document Type Toggle, Direct Print, and PDF Download

import { easyPrintService } from '../services/easyPrintService.js';

let activeDocumentData = null;
let currentMode = 'INVOICE'; // 'INVOICE' | 'ESTIMATE' | 'PURCHASE_ORDER'

/**
 * Initialize or mount the EasyPrint modal in the DOM
 */
export function initEasyPrintModal() {
    if (document.getElementById('easyPrintModalContainer')) return;

    const modalMarkup = `
        <div id="easyPrintModalContainer" class="fixed inset-0 z-50 hidden flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
            <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[94vh] flex flex-col shadow-2xl overflow-hidden">
                
                <!-- MODAL HEADER -->
                <div class="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                            <i data-lucide="printer" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h2 class="text-sm font-bold text-white flex items-center space-x-2">
                                <span id="easyPrintHeaderTitle">EasyPrint Engine</span>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">A4 Standard Format</span>
                            </h2>
                            <p class="text-[11px] text-slate-400" id="easyPrintHeaderSubtitle">Professional Indian Apparel Business Print Format</p>
                        </div>
                    </div>

                    <!-- Mode Switcher Tabs -->
                    <div id="easyPrintModeSwitcher" class="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button type="button" id="easyPrintTabInvoice" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-blue-600 text-white shadow">
                            Tax Invoice
                        </button>
                        <button type="button" id="easyPrintTabEstimate" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white">
                            Estimate / Quotation
                        </button>
                    </div>

                    <!-- Close Button -->
                    <button type="button" id="btnCloseEasyPrintModal" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- ACTION TOOLBAR -->
                <div class="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div class="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                        <span id="easyPrintDocBadge" class="font-bold text-blue-400">INV-2026-0001</span>
                        <span>•</span>
                        <span id="easyPrintCustomerBadge" class="text-slate-300">Customer Name</span>
                    </div>

                    <div class="flex items-center space-x-2">
                        <!-- Direct Print Button -->
                        <button type="button" id="btnActionPrint" class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow flex items-center space-x-1.5">
                            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                            <span id="btnPrintText">Print Invoice</span>
                        </button>

                        <!-- Download PDF Button -->
                        <button type="button" id="btnActionDownloadPdf" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow flex items-center space-x-1.5">
                            <i data-lucide="download" class="w-3.5 h-3.5"></i>
                            <span id="btnDownloadText">Download Invoice PDF</span>
                        </button>
                    </div>
                </div>

                <!-- PREVIEW CONTAINER -->
                <div class="flex-1 bg-slate-950/80 overflow-y-auto p-4 sm:p-6 flex justify-center custom-sidebar-scroll">
                    <div id="easyPrintPreviewSurface" class="w-full max-w-[210mm] bg-white rounded-lg shadow-2xl text-black overflow-hidden transform scale-100 origin-top" style="color: #000000;">
                        <!-- Rendered HTML injects here -->
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
    const modal = document.getElementById('easyPrintModalContainer');
    const closeBtn = document.getElementById('btnCloseEasyPrintModal');
    const tabInvoice = document.getElementById('easyPrintTabInvoice');
    const tabEstimate = document.getElementById('easyPrintTabEstimate');
    const printBtn = document.getElementById('btnActionPrint');
    const downloadBtn = document.getElementById('btnActionDownloadPdf');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (tabInvoice && tabEstimate) {
        tabInvoice.addEventListener('click', () => {
            currentMode = 'INVOICE';
            tabInvoice.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-blue-600 text-white shadow';
            tabEstimate.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white';
            updateButtons();
            renderPreview();
        });

        tabEstimate.addEventListener('click', () => {
            currentMode = 'ESTIMATE';
            tabEstimate.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-blue-600 text-white shadow';
            tabInvoice.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white';
            updateButtons();
            renderPreview();
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            if (activeDocumentData) {
                easyPrintService.print(activeDocumentData, currentMode);
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            if (activeDocumentData) {
                const origText = downloadBtn.innerHTML;
                downloadBtn.innerHTML = '<span class="animate-spin inline-block mr-1">⌛</span> Generating PDF...';
                downloadBtn.disabled = true;
                try {
                    await easyPrintService.downloadPdf(activeDocumentData, currentMode);
                } finally {
                    downloadBtn.innerHTML = origText;
                    downloadBtn.disabled = false;
                }
            }
        });
    }
}

function updateButtons() {
    const printText = document.getElementById('btnPrintText');
    const downloadBtn = document.getElementById('btnActionDownloadPdf');
    const downloadText = document.getElementById('btnDownloadText');
    const headerTitle = document.getElementById('easyPrintHeaderTitle');
    const headerSubtitle = document.getElementById('easyPrintHeaderSubtitle');
    const modeSwitcher = document.getElementById('easyPrintModeSwitcher');

    if (currentMode === 'PURCHASE_ORDER') {
        if (printText) printText.innerText = 'Print Purchase Order';
        if (downloadBtn) downloadBtn.classList.add('hidden');
        if (headerTitle) headerTitle.innerText = 'Purchase Order (PO) Engine';
        if (headerSubtitle) headerSubtitle.innerText = 'Official Supplier Procurement Order Layout';
        if (modeSwitcher) {
            modeSwitcher.innerHTML = `
                <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow flex items-center space-x-1.5">
                    <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
                    <span>Purchase Order</span>
                </span>
            `;
            if (window.lucide) lucide.createIcons();
        }
    } else {
        if (downloadBtn) downloadBtn.classList.remove('hidden');
        if (printText) printText.innerText = currentMode === 'ESTIMATE' ? 'Print Estimate' : 'Print Invoice';
        if (downloadText) downloadText.innerText = currentMode === 'ESTIMATE' ? 'Download Estimate PDF' : 'Download Invoice PDF';
        if (headerTitle) headerTitle.innerText = 'EasyPrint Engine';
        if (headerSubtitle) headerSubtitle.innerText = 'Professional Indian Apparel Business Print Format';
    }
}

function renderPreview() {
    if (!activeDocumentData) return;
    const surface = document.getElementById('easyPrintPreviewSurface');
    if (!surface) return;

    let html;
    if (currentMode === 'PURCHASE_ORDER') {
        html = easyPrintService.generatePurchaseOrderHtml(activeDocumentData);
    } else if (currentMode === 'ESTIMATE') {
        html = easyPrintService.generateEstimateHtml(activeDocumentData);
    } else {
        html = easyPrintService.generateInvoiceHtml(activeDocumentData);
    }

    surface.innerHTML = html;

    // Update Badges
    const docBadge = document.getElementById('easyPrintDocBadge');
    const custBadge = document.getElementById('easyPrintCustomerBadge');
    const enriched = easyPrintService.enrichDocumentData(activeDocumentData, currentMode);

    if (docBadge) {
        if (currentMode === 'PURCHASE_ORDER') {
            docBadge.innerText = enriched.poNumber;
        } else if (currentMode === 'ESTIMATE') {
            docBadge.innerText = enriched.estimateNumber;
        } else {
            docBadge.innerText = enriched.invoiceNumber;
        }
    }
    if (custBadge) {
        if (currentMode === 'PURCHASE_ORDER') {
            custBadge.innerText = enriched.supplier ? enriched.supplier.name : 'Supplier';
        } else {
            custBadge.innerText = enriched.customer ? enriched.customer.name : 'Customer';
        }
    }
}

/**
 * Open EasyPrint modal with given document data
 * @param {object} docData - Sale, Quotation, or Purchase Order data
 * @param {'INVOICE' | 'ESTIMATE' | 'PURCHASE_ORDER'} mode - Initial mode to display
 */
export function openEasyPrint(docData, mode = 'INVOICE') {
    initEasyPrintModal();
    activeDocumentData = docData;
    currentMode = mode;

    const modal = document.getElementById('easyPrintModalContainer');
    if (modal) {
        modal.classList.remove('hidden');
    }

    const tabInvoice = document.getElementById('easyPrintTabInvoice');
    const tabEstimate = document.getElementById('easyPrintTabEstimate');
    if (mode === 'ESTIMATE') {
        if (tabEstimate) tabEstimate.click();
    } else if (mode === 'INVOICE') {
        if (tabInvoice) tabInvoice.click();
    }

    updateButtons();
    renderPreview();
}
