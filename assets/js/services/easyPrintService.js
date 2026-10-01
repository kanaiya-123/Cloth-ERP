// CLOTHERP - EasyPrint Engine for Invoices, Estimates & Quotations
import { companySettingsService } from './companySettingsService.js';
import { amountInWords, formatCurrency } from '../utils/numberToWords.js';
import { productStore, STORAGE_KEYS } from './productStore.js';
import { customerStore, CUSTOMER_STORAGE_KEYS } from './customerStore.js';
import { branchStore, BRANCH_STORAGE_KEYS } from './branchStore.js';

class EasyPrintService {
    /**
     * Enrich raw sale or estimate data with product master details (Category, Brand, HSN, etc.)
     */
    enrichDocumentData(doc, type = 'INVOICE') {
        const company = companySettingsService.getSettings();
        const branches = branchStore.get(BRANCH_STORAGE_KEYS.BRANCHES) || [];
        const defaultBranch = branches.find(b => b.isDefault) || branches[0] || {};
        
        // Enrich customer if needed
        const allCustomers = customerStore.get(CUSTOMER_STORAGE_KEYS.CUSTOMERS) || [];
        const customer = doc.customerId ? allCustomers.find(c => c.id === doc.customerId) : null;

        const customerName = doc.customerName || (customer && customer.name) || 'Cash Customer';
        const customerMobile = doc.customerMobile || (customer && customer.mobile) || '—';
        const customerEmail = (customer && customer.email) || doc.customerEmail || '—';
        const customerGstin = doc.customerGstin || (customer && customer.gstin) || '';
        
        let customerAddress = '—';
        let customerState = doc.customerState || (customer && customer.billingAddress && customer.billingAddress.state) || company.state;
        let customerStateCode = customerGstin ? customerGstin.slice(0, 2) : '';

        if (customer && customer.billingAddress) {
            const addr = customer.billingAddress;
            customerAddress = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
        } else if (doc.delivery && doc.delivery.shippingAddress) {
            const addr = doc.delivery.shippingAddress;
            customerAddress = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
        }

        const isInterState = customerState && company.state && (customerState.toLowerCase() !== company.state.toLowerCase());

        // Enrich items
        const allProducts = productStore.get(STORAGE_KEYS.PRODUCTS) || [];
        const enrichedItems = (doc.items || []).map((it, idx) => {
            const prod = allProducts.find(p => p.id === it.productId || p.name === it.productName) || {};
            
            const category = it.category || prod.category || 'Apparel';
            const brand = it.brand || prod.brand || 'ClothERP';
            const hsn = it.hsnCode || prod.hsnCode || '620520';
            const variant = it.variantName || `${it.color || 'Standard'} / ${it.size || 'Free'}`;
            const size = it.size || 'M';
            const color = it.color || 'Standard';
            const qty = Number(it.quantity) || 1;
            const rate = Number(it.purchaseRate || it.sellingRate || it.rate || it.unitPrice || 0);
            
            let discVal = Number(it.discountVal || it.discount || 0);
            let discAmt = Number(it.discountAmount || 0);
            if (discVal > 0 && discAmt === 0) {
                discAmt = (rate * qty * discVal) / 100;
            }

            const taxable = Number(it.taxableAmount || (rate * qty - discAmt));
            const gstRate = Number(it.gstRate !== undefined ? it.gstRate : 5);
            const gstAmt = Number(it.totalTax || (it.cgstAmount ? (it.cgstAmount + it.sgstAmount) : ((taxable * gstRate) / 100)));
            const lineTotal = Number(it.totalAmount || (taxable + gstAmt));

            return {
                srNo: idx + 1,
                product: it.productName || prod.name || 'Garment Item',
                category,
                brand,
                variant,
                size,
                color,
                hsn,
                qty,
                rate,
                discount: discAmt > 0 ? (discVal > 0 ? `${discVal}% (₹${discAmt.toFixed(2)})` : `₹${discAmt.toFixed(2)}`) : '0.00',
                discountAmount: discAmt,
                gstRate,
                gstAmount: gstAmt,
                amount: lineTotal,
                taxable
            };
        });

        // Supplier details (for PO)
        const supplierName = doc.supplierName || 'Surat Silk Mills Pvt. Ltd.';
        const supplierGstin = doc.supplierGstin || '';
        const supplierState = doc.supplierState || company.state;
        const supplierStateCode = supplierGstin ? supplierGstin.slice(0, 2) : '';
        const supplierAddress = doc.supplierAddress || 'Plot 42, GIDC Apparel Park, Sachin, Surat';
        const supplierMobile = doc.supplierMobile || doc.supplierContact || '+91 98251 22334';
        const supplierEmail = doc.supplierEmail || 'sales@suratsilk.example.com';
        const supplierPan = doc.supplierPan || (supplierGstin && supplierGstin.length >= 12 ? supplierGstin.slice(2, 12) : 'AABCS1234F');
        const supplierContactPerson = doc.supplierContact || doc.contactPerson || 'Rajesh Singhania (Sales Head)';

        const isPoInterState = type === 'PURCHASE_ORDER'
            ? (supplierState && company.state && supplierState.toLowerCase() !== company.state.toLowerCase())
            : isInterState;

        // Totals calculation
        const subTotal = enrichedItems.reduce((acc, it) => acc + (it.qty * it.rate), 0);
        const totalDiscount = enrichedItems.reduce((acc, it) => acc + it.discountAmount, 0) + (Number(doc.overallDiscountAmount) || 0);
        const taxableAmount = enrichedItems.reduce((acc, it) => acc + it.taxable, 0);

        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (isPoInterState) {
            igst = enrichedItems.reduce((acc, it) => acc + it.gstAmount, 0);
        } else {
            const halfTax = enrichedItems.reduce((acc, it) => acc + it.gstAmount, 0) / 2;
            cgst = halfTax;
            sgst = halfTax;
        }

        const otherCharges = Number(doc.otherCharges || doc.shippingCharge || 0);
        const rawGrandTotal = taxableAmount + cgst + sgst + igst + otherCharges;
        const roundedGrandTotal = Math.round(rawGrandTotal);
        const roundOff = (roundedGrandTotal - rawGrandTotal);

        const grandTotal = doc.grandTotal ? Number(doc.grandTotal) : roundedGrandTotal;
        const paidAmount = Number(doc.paidAmount !== undefined ? doc.paidAmount : (doc.paymentStatus === 'Paid' ? grandTotal : 0));
        const balanceAmount = Math.max(0, grandTotal - paidAmount);

        let paymentStatus = 'UNPAID';
        if (paidAmount >= grandTotal && grandTotal > 0) {
            paymentStatus = 'PAID';
        } else if (paidAmount > 0 && paidAmount < grandTotal) {
            paymentStatus = 'PARTIALLY PAID';
        }

        const date = doc.purchaseDate || doc.saleDate || doc.estimateDate || doc.date || new Date().toISOString().split('T')[0];
        const financialYear = companySettingsService.getFinancialYear(date);

        // Due date / Expected delivery: default 15 days ahead
        const dObj = new Date(date);
        dObj.setDate(dObj.getDate() + 15);
        const dueDate = doc.dueDate || doc.expectedDeliveryDate || doc.validUntil || dObj.toISOString().split('T')[0];

        return {
            company,
            branch: doc.branch || defaultBranch.name || 'Central Head Office',
            salesPerson: doc.salesPerson || doc.createdBy || 'Staff Desk',
            financialYear,
            
            // Document numbers
            docType: type,
            invoiceNumber: doc.invoiceNumber || doc.saleNumber || 'INV-2026-0001',
            estimateNumber: doc.estimateNumber || (doc.saleNumber ? doc.saleNumber.replace('SAL-', 'EST-') : 'EST-2026-0001'),
            poNumber: doc.purchaseNumber || doc.poNumber || 'PO-2026-0001',
            referenceNumber: doc.referenceNumber || '—',
            date,
            dueDate,
            validUntil: dueDate,
            expectedDeliveryDate: doc.expectedDeliveryDate || dueDate,
            paymentMode: doc.paymentMode || doc.paymentMethod || 'NEFT / RTGS',
            paymentTerms: doc.paymentTerms || 'Net 30 Days after Quality Check approval',
            transporter: (doc.shipment && doc.shipment.transportName) || doc.transporter || 'Navkar Roadlines Express',
            lrNumber: (doc.shipment && doc.shipment.lrNumber) || doc.lrNumber || 'LR-GUJ-9921',
            deliveryAddress: doc.deliveryAddress || `${company.companyName} Central Store & Depot, ${company.address}, ${company.city}, ${company.state} - ${company.pincode}`,
            notes: doc.notes || '1. Materials must strictly adhere to approved shade cards and shrinkage specs. 2. Quality Check will be conducted within 24 hours of delivery.',
            paymentStatus,
            paidAmount,
            balanceAmount,

            // Customer (for sales)
            customer: {
                name: customerName,
                mobile: customerMobile,
                email: customerEmail,
                address: customerAddress,
                gstin: customerGstin,
                state: customerState,
                stateCode: customerStateCode || (customerState === 'Gujarat' ? '24' : (customerState === 'Maharashtra' ? '27' : ''))
            },

            // Supplier / Manufacturer (for PO)
            supplier: {
                name: supplierName,
                contactPerson: supplierContactPerson,
                mobile: supplierMobile,
                email: supplierEmail,
                address: supplierAddress,
                gstin: supplierGstin,
                pan: supplierPan,
                state: supplierState,
                stateCode: supplierStateCode || '24'
            },

            // Items & Calculations
            items: enrichedItems,
            subTotal,
            totalDiscount,
            taxableAmount,
            cgst,
            sgst,
            igst,
            isInterState: isPoInterState,
            otherCharges,
            roundOff,
            grandTotal,
            amountInWords: amountInWords(grandTotal)
        };
    }

    /**
     * Generate HTML for Tax Invoice
     */
    generateInvoiceHtml(rawDoc) {
        const d = this.enrichDocumentData(rawDoc, 'INVOICE');
        const c = d.company;
        const cust = d.customer;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tax Invoice - ${d.invoiceNumber}</title>
    <style>
        ${this.getPrintStyles()}
    </style>
</head>
<body>
    <div class="easyprint-page">
        
        <!-- COMPANY HEADER -->
        <header class="company-header">
            <div class="header-left">
                <img src="${c.logoUrl}" alt="${c.brandName}" class="company-logo" onerror="this.src='./assets/images/clotherp-logo.svg'">
                <div class="company-tagline">${c.tagline}</div>
            </div>
            <div class="header-right">
                <h1 class="company-name">${c.companyName}</h1>
                <div class="company-info-line">${c.address}, ${c.city}, ${c.state} - ${c.pincode}</div>
                <div class="company-info-line"><strong>Mobile:</strong> ${c.mobile} &nbsp;|&nbsp; <strong>Email:</strong> ${c.email}</div>
                <div class="company-info-line"><strong>Website:</strong> ${c.website}</div>
                <div class="company-info-line gstin-badge">
                    <span><strong>GSTIN:</strong> ${c.gstin}</span>
                    <span style="margin-left: 12px;"><strong>State / Code:</strong> ${c.state} (${c.stateCode})</span>
                </div>
            </div>
        </header>

        <!-- TITLE BAR -->
        <div class="doc-title-bar">
            <div class="doc-title">TAX INVOICE</div>
            <div class="doc-subtitle">ORIGINAL FOR RECIPIENT</div>
        </div>

        <!-- INVOICE METADATA & BILL TO GRID -->
        <section class="meta-grid">
            <div class="meta-col customer-box">
                <div class="box-title">BILL TO</div>
                <div class="cust-name">${cust.name}</div>
                <div class="cust-detail"><strong>Mobile:</strong> ${cust.mobile}</div>
                ${cust.email && cust.email !== '—' ? `<div class="cust-detail"><strong>Email:</strong> ${cust.email}</div>` : ''}
                <div class="cust-detail"><strong>Address:</strong> ${cust.address}</div>
                <div class="cust-detail highlight-gst">
                    <strong>GSTIN:</strong> ${cust.gstin ? cust.gstin : 'URP (Unregistered Customer)'}
                </div>
                <div class="cust-detail">
                    <strong>State:</strong> ${cust.state} &nbsp;|&nbsp; <strong>State Code:</strong> ${cust.stateCode || '—'}
                </div>
            </div>

            <div class="meta-col invoice-info-box">
                <div class="box-title">INVOICE DETAILS</div>
                <table class="info-kv-table">
                    <tr>
                        <td class="kv-key">Invoice No.:</td>
                        <td class="kv-val font-bold text-dark">${d.invoiceNumber}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Invoice Date:</td>
                        <td class="kv-val font-bold">${d.date}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Due Date:</td>
                        <td class="kv-val">${d.dueDate}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Financial Year:</td>
                        <td class="kv-val font-bold">${d.financialYear}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Branch:</td>
                        <td class="kv-val">${d.branch}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Sales Person:</td>
                        <td class="kv-val">${d.salesPerson}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Payment Mode:</td>
                        <td class="kv-val">${d.paymentMode}</td>
                    </tr>
                </table>
            </div>
        </section>

        <!-- PRODUCT TABLE -->
        <table class="product-table">
            <thead>
                <tr>
                    <th style="width: 4%;">Sr.</th>
                    <th style="width: 17%;">Product</th>
                    <th style="width: 8%;">Category</th>
                    <th style="width: 8%;">Brand</th>
                    <th style="width: 9%;">Variant</th>
                    <th style="width: 5%;">Size</th>
                    <th style="width: 7%;">Color</th>
                    <th style="width: 7%;">HSN/SAC</th>
                    <th style="width: 5%; text-align: center;">Qty</th>
                    <th style="width: 7%; text-align: right;">Rate (₹)</th>
                    <th style="width: 6%; text-align: right;">Disc.</th>
                    <th style="width: 5%; text-align: center;">GST%</th>
                    <th style="width: 6%; text-align: right;">GST Amt</th>
                    <th style="width: 8%; text-align: right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${d.items.map(it => `
                    <tr>
                        <td style="text-align: center; color: #000000; font-weight: 600;">${it.srNo}</td>
                        <td class="font-bold text-dark" style="color: #000000;">${it.product}</td>
                        <td style="color: #000000;">${it.category}</td>
                        <td style="color: #000000;">${it.brand}</td>
                        <td style="color: #000000;">${it.variant}</td>
                        <td style="text-align: center; color: #000000;">${it.size}</td>
                        <td style="color: #000000;">${it.color}</td>
                        <td class="font-mono" style="color: #000000;">${it.hsn}</td>
                        <td style="text-align: center; font-weight: bold; color: #000000;">${it.qty}</td>
                        <td style="text-align: right; color: #000000; font-weight: 600;">${it.rate.toFixed(2)}</td>
                        <td style="text-align: right; color: #000000;">${it.discount}</td>
                        <td style="text-align: center; color: #000000;">${it.gstRate}%</td>
                        <td style="text-align: right; color: #000000; font-weight: 600;">${it.gstAmount.toFixed(2)}</td>
                        <td style="text-align: right; font-weight: bold; color: #000000;">${it.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- INVOICE CALCULATION & SUMMARY SECTION -->
        <div class="summary-container">
            <!-- Left: Bank Details & Amount in Words -->
            <div class="summary-left">
                <div class="amount-words-box">
                    <span class="label">Amount in Words:</span>
                    <div class="words-text">${d.amountInWords}</div>
                </div>

                <div class="bank-details-box">
                    <div class="bank-title">Bank & UPI Settlement Details</div>
                    <div class="bank-grid">
                        <div><strong>Bank Name:</strong> ${c.bankDetails.bankName}</div>
                        <div><strong>A/C Name:</strong> ${c.bankDetails.accountName}</div>
                        <div><strong>A/C No.:</strong> <span class="font-mono font-bold">${c.bankDetails.accountNumber}</span></div>
                        <div><strong>IFSC Code:</strong> <span class="font-mono font-bold">${c.bankDetails.ifscCode}</span></div>
                        <div><strong>Branch:</strong> ${c.bankDetails.branch}</div>
                        <div><strong>UPI ID:</strong> <span class="font-mono">${c.bankDetails.upiId}</span></div>
                    </div>
                </div>

                <div class="payment-status-strip">
                    <span class="status-badge status-${d.paymentStatus.toLowerCase().replace(/\s+/g, '-')}">
                        Payment Status: ${d.paymentStatus}
                    </span>
                    <span class="pay-info">Paid: <strong>₹ ${d.paidAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></span>
                    <span class="pay-info">Balance: <strong>₹ ${d.balanceAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></span>
                </div>
            </div>

            <!-- Right: Calculations Table -->
            <div class="summary-right">
                <table class="calc-table">
                    <tr>
                        <td class="calc-label">Sub Total:</td>
                        <td class="calc-val">₹ ${d.subTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    ${d.totalDiscount > 0 ? `
                        <tr>
                            <td class="calc-label">Total Discount:</td>
                            <td class="calc-val text-green">-₹ ${d.totalDiscount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : ''}
                    <tr>
                        <td class="calc-label font-bold">Taxable Amount:</td>
                        <td class="calc-val font-bold">₹ ${d.taxableAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    ${!d.isInterState ? `
                        <tr>
                            <td class="calc-label">CGST:</td>
                            <td class="calc-val">₹ ${d.cgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td class="calc-label">SGST:</td>
                            <td class="calc-val">₹ ${d.sgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : `
                        <tr>
                            <td class="calc-label">IGST (Inter-State):</td>
                            <td class="calc-val">₹ ${d.igst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    `}
                    ${d.otherCharges > 0 ? `
                        <tr>
                            <td class="calc-label">Other Charges:</td>
                            <td class="calc-val">₹ ${d.otherCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : ''}
                    ${d.roundOff !== 0 ? `
                        <tr>
                            <td class="calc-label">Round Off:</td>
                            <td class="calc-val">${d.roundOff >= 0 ? '+' : ''}${d.roundOff.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    <tr class="grand-total-row">
                        <td class="calc-label-total">TOTAL PAYABLE:</td>
                        <td class="calc-val-total">₹ ${d.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- FOOTER: TERMS & CONDITIONS & SIGNATURES -->
        <footer class="invoice-footer">
            <div class="terms-block">
                <div class="terms-title">Terms & Conditions:</div>
                <ol class="terms-list">
                    ${c.termsInvoice.map(t => `<li>${t}</li>`).join('')}
                </ol>
            </div>

            <div class="signature-row">
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-label">Customer Signature</div>
                </div>
                <div class="sig-box text-right">
                    <div class="for-company">For ${c.companyName}</div>
                    <div class="sig-line"></div>
                    <div class="sig-label">Authorized Signature</div>
                </div>
            </div>

            <div class="bottom-tagline">
                ★ Thank You for Shopping With Us! ★
            </div>
        </footer>

    </div>
</body>
</html>
        `;
    }

    /**
     * Generate HTML for Estimate / Quotation
     */
    generateEstimateHtml(rawDoc) {
        const d = this.enrichDocumentData(rawDoc, 'ESTIMATE');
        const c = d.company;
        const cust = d.customer;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Estimate / Quotation - ${d.estimateNumber}</title>
    <style>
        ${this.getPrintStyles()}
    </style>
</head>
<body>
    <div class="easyprint-page">
        
        <!-- COMPANY HEADER -->
        <header class="company-header">
            <div class="header-left">
                <img src="${c.logoUrl}" alt="${c.brandName}" class="company-logo" onerror="this.src='./assets/images/clotherp-logo.svg'">
                <div class="company-tagline">${c.tagline}</div>
            </div>
            <div class="header-right">
                <h1 class="company-name">${c.companyName}</h1>
                <div class="company-info-line">${c.address}, ${c.city}, ${c.state} - ${c.pincode}</div>
                <div class="company-info-line"><strong>Mobile:</strong> ${c.mobile} &nbsp;|&nbsp; <strong>Email:</strong> ${c.email}</div>
                <div class="company-info-line"><strong>Website:</strong> ${c.website}</div>
                <div class="company-info-line gstin-badge">
                    <span><strong>GSTIN:</strong> ${c.gstin}</span>
                    <span style="margin-left: 12px;"><strong>State / Code:</strong> ${c.state} (${c.stateCode})</span>
                </div>
            </div>
        </header>

        <!-- TITLE BAR -->
        <div class="doc-title-bar estimate-title-bar">
            <div class="doc-title">ESTIMATE / QUOTATION</div>
            <div class="doc-subtitle">NON-TAX PROFORMA DOCUMENT</div>
        </div>

        <!-- ESTIMATE METADATA & QUOTATION FOR GRID -->
        <section class="meta-grid">
            <div class="meta-col customer-box">
                <div class="box-title">QUOTATION FOR</div>
                <div class="cust-name">${cust.name}</div>
                <div class="cust-detail"><strong>Mobile:</strong> ${cust.mobile}</div>
                <div class="cust-detail"><strong>Email:</strong> ${cust.email}</div>
                <div class="cust-detail"><strong>Address:</strong> ${cust.address}</div>
                <div class="cust-detail highlight-gst">
                    <strong>GSTIN:</strong> ${cust.gstin ? cust.gstin : 'Not Provided / Retail'}
                </div>
            </div>

            <div class="meta-col invoice-info-box">
                <div class="box-title">ESTIMATE DETAILS</div>
                <table class="info-kv-table">
                    <tr>
                        <td class="kv-key">Estimate No.:</td>
                        <td class="kv-val font-bold text-dark">${d.estimateNumber}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Estimate Date:</td>
                        <td class="kv-val font-bold">${d.date}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Valid Until:</td>
                        <td class="kv-val font-bold text-dark">${d.validUntil}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Sales Person:</td>
                        <td class="kv-val">${d.salesPerson}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Branch:</td>
                        <td class="kv-val">${d.branch}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Reference:</td>
                        <td class="kv-val">${d.referenceNumber}</td>
                    </tr>
                </table>
            </div>
        </section>

        <!-- ESTIMATE PRODUCT TABLE -->
        <table class="product-table">
            <thead>
                <tr>
                    <th style="width: 4%;">Sr.</th>
                    <th style="width: 17%;">Product</th>
                    <th style="width: 8%;">Category</th>
                    <th style="width: 8%;">Brand</th>
                    <th style="width: 9%;">Variant</th>
                    <th style="width: 5%;">Size</th>
                    <th style="width: 7%;">Color</th>
                    <th style="width: 7%;">HSN/SAC</th>
                    <th style="width: 5%; text-align: center;">Qty</th>
                    <th style="width: 7%; text-align: right;">Rate (₹)</th>
                    <th style="width: 6%; text-align: right;">Disc.</th>
                    <th style="width: 5%; text-align: center;">GST%</th>
                    <th style="width: 6%; text-align: right;">Tax</th>
                    <th style="width: 8%; text-align: right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${d.items.map(it => `
                    <tr>
                        <td style="text-align: center; color: #000000; font-weight: 600;">${it.srNo}</td>
                        <td class="font-bold text-dark" style="color: #000000;">${it.product}</td>
                        <td style="color: #000000;">${it.category}</td>
                        <td style="color: #000000;">${it.brand}</td>
                        <td style="color: #000000;">${it.variant}</td>
                        <td style="text-align: center; color: #000000;">${it.size}</td>
                        <td style="color: #000000;">${it.color}</td>
                        <td class="font-mono" style="color: #000000;">${it.hsn}</td>
                        <td style="text-align: center; font-weight: bold; color: #000000;">${it.qty}</td>
                        <td style="text-align: right; color: #000000; font-weight: 600;">${it.rate.toFixed(2)}</td>
                        <td style="text-align: right; color: #000000;">${it.discount}</td>
                        <td style="text-align: center; color: #000000;">${it.gstRate}%</td>
                        <td style="text-align: right; color: #000000; font-weight: 600;">${it.gstAmount.toFixed(2)}</td>
                        <td style="text-align: right; font-weight: bold; color: #000000;">${it.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- ESTIMATE SUMMARY SECTION -->
        <div class="summary-container">
            <div class="summary-left">
                <div class="amount-words-box">
                    <span class="label">Amount in Words:</span>
                    <div class="words-text">${d.amountInWords}</div>
                </div>

                <div class="estimate-validity-notice">
                    <strong>Notice:</strong> This quotation is generated electronically and reflects present prevailing inventory prices. Final invoice and taxes apply as per billing date.
                </div>
            </div>

            <div class="summary-right">
                <table class="calc-table">
                    <tr>
                        <td class="calc-label">Sub Total:</td>
                        <td class="calc-val">₹ ${d.subTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    ${d.totalDiscount > 0 ? `
                        <tr>
                            <td class="calc-label">Discount:</td>
                            <td class="calc-val text-green">-₹ ${d.totalDiscount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : ''}
                    <tr>
                        <td class="calc-label font-bold">Taxable Amount:</td>
                        <td class="calc-val font-bold">₹ ${d.taxableAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    ${!d.isInterState ? `
                        <tr>
                            <td class="calc-label">CGST:</td>
                            <td class="calc-val">₹ ${d.cgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td class="calc-label">SGST:</td>
                            <td class="calc-val">₹ ${d.sgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : `
                        <tr>
                            <td class="calc-label">IGST (Inter-State):</td>
                            <td class="calc-val">₹ ${d.igst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    `}
                    ${d.otherCharges > 0 ? `
                        <tr>
                            <td class="calc-label">Other Charges:</td>
                            <td class="calc-val">₹ ${d.otherCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : ''}
                    ${d.roundOff !== 0 ? `
                        <tr>
                            <td class="calc-label">Round Off:</td>
                            <td class="calc-val">${d.roundOff >= 0 ? '+' : ''}${d.roundOff.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    <tr class="grand-total-row estimate-total-row">
                        <td class="calc-label-total">ESTIMATED TOTAL:</td>
                        <td class="calc-val-total">₹ ${d.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- ESTIMATE TERMS & SIGNATURES -->
        <footer class="invoice-footer">
            <div class="terms-block">
                <div class="terms-title">Estimate Terms:</div>
                <ol class="terms-list">
                    ${c.termsEstimate.map(t => `<li>${t}</li>`).join('')}
                </ol>
            </div>

            <div class="signature-row">
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-label">Customer Signature</div>
                </div>
                <div class="sig-box text-right">
                    <div class="for-company">For ${c.companyName}</div>
                    <div class="sig-line"></div>
                    <div class="sig-label">Authorized Signature</div>
                </div>
            </div>
        </footer>

    </div>
</body>
</html>
        `;
    }

    /**
     * Generate Professional A4 HTML for Purchase Order (PO)
     */
    generatePurchaseOrderHtml(rawDoc) {
        const d = this.enrichDocumentData(rawDoc, 'PURCHASE_ORDER');
        const c = d.company;
        const sup = d.supplier;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Purchase Order - ${d.poNumber}</title>
    <style>
        ${this.getPrintStyles()}
        .po-title-bar {
            background: #0f172a;
            color: #ffffff;
            padding: 5px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 4px;
            margin-bottom: 8px;
        }
        .po-badge {
            background: #2563eb;
            color: #ffffff;
            font-size: 8px;
            padding: 2px 7px;
            border-radius: 3px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="easyprint-page">
        
        <!-- COMPANY HEADER -->
        <header class="company-header">
            <div class="header-left">
                <img src="${c.logoUrl}" alt="${c.brandName}" class="company-logo" onerror="this.src='./assets/images/clotherp-logo.svg'">
                <div class="company-tagline">${c.tagline}</div>
            </div>
            <div class="header-right">
                <h1 class="company-name">${c.companyName}</h1>
                <div class="company-info-line">${c.address}, ${c.city}, ${c.state} - ${c.pincode}</div>
                <div class="company-info-line"><strong>Mobile:</strong> ${c.mobile} &nbsp;|&nbsp; <strong>Email:</strong> ${c.email}</div>
                <div class="company-info-line"><strong>Website:</strong> ${c.website}</div>
                <div class="company-info-line gstin-badge">
                    <span><strong>GSTIN:</strong> ${c.gstin}</span>
                    <span style="margin-left: 12px;"><strong>State / Code:</strong> ${c.state} (${c.stateCode})</span>
                </div>
            </div>
        </header>

        <!-- PO TITLE BAR -->
        <div class="po-title-bar">
            <div style="display: flex; align-items: center;">
                <span class="doc-title" style="letter-spacing: 1.5px; font-weight: 800; font-size: 13px;">PURCHASE ORDER</span>
                <span class="po-badge" style="margin-left: 10px;">OFFICIAL PROCUREMENT ORDER</span>
            </div>
            <div class="doc-subtitle">FY: ${d.financialYear} &nbsp;|&nbsp; ${d.branch}</div>
        </div>

        <!-- TWO COLUMN META GRID: VENDOR & DELIVERY -->
        <section class="meta-grid">
            <!-- Left: Supplier / Manufacturer -->
            <div class="meta-col customer-box" style="border-left: 3px solid #2563eb;">
                <div class="box-title">SUPPLIER / MANUFACTURER (VENDOR)</div>
                <div class="cust-name">${sup.name}</div>
                <div class="cust-detail"><strong>Contact Person:</strong> ${sup.contactPerson}</div>
                <div class="cust-detail"><strong>Mobile:</strong> ${sup.mobile} &nbsp;|&nbsp; <strong>Email:</strong> ${sup.email}</div>
                <div class="cust-detail"><strong>Address:</strong> ${sup.address}</div>
                <div class="cust-detail highlight-gst">
                    <strong>GSTIN:</strong> ${sup.gstin ? sup.gstin : 'Unregistered Vendor'}
                    &nbsp;|&nbsp; <strong>PAN:</strong> ${sup.pan}
                </div>
                <div class="cust-detail">
                    <strong>State:</strong> ${sup.state} &nbsp;|&nbsp; <strong>State Code:</strong> ${sup.stateCode || '—'}
                </div>
            </div>

            <!-- Right: Order, Logistics & Delivery -->
            <div class="meta-col invoice-info-box" style="border-left: 3px solid #0f172a;">
                <div class="box-title">PO & DELIVERY SPECIFICATIONS</div>
                <table class="info-kv-table">
                    <tr>
                        <td class="kv-key">PO Number:</td>
                        <td class="kv-val font-bold text-dark" style="color:#000000; font-family:'JetBrains Mono', monospace; font-size:10px;">${d.poNumber}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">PO Date:</td>
                        <td class="kv-val font-bold" style="color:#000000;">${d.date}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Exp. Delivery Date:</td>
                        <td class="kv-val font-bold" style="color:#2563eb;">${d.expectedDeliveryDate}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Payment Terms:</td>
                        <td class="kv-val" style="color:#000000;">${d.paymentTerms}</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Transporter / LR:</td>
                        <td class="kv-val" style="color:#000000;">${d.transporter} (${d.lrNumber})</td>
                    </tr>
                    <tr>
                        <td class="kv-key">Delivery Depot:</td>
                        <td class="kv-val" style="color:#000000; font-size:8px;">${d.deliveryAddress}</td>
                    </tr>
                </table>
            </div>
        </section>

        <!-- PRODUCT TABLE -->
        <table class="product-table">
            <thead>
                <tr>
                    <th style="width: 4%;">Sr.</th>
                    <th style="width: 20%;">Product Style & Fabric Description</th>
                    <th style="width: 8%;">Category</th>
                    <th style="width: 8%;">Brand</th>
                    <th style="width: 10%;">Variant</th>
                    <th style="width: 5%; text-align: center;">Size</th>
                    <th style="width: 7%;">Color</th>
                    <th style="width: 7%;">HSN/SAC</th>
                    <th style="width: 5%; text-align: center;">Qty</th>
                    <th style="width: 7%; text-align: right;">Rate (₹)</th>
                    <th style="width: 5%; text-align: center;">GST%</th>
                    <th style="width: 6%; text-align: right;">Tax (₹)</th>
                    <th style="width: 8%; text-align: right;">Total (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${d.items.map(it => `
                    <tr>
                        <td style="text-align: center; color: #000000; font-weight: 600;">${it.srNo}</td>
                        <td class="font-bold text-dark" style="color: #000000;">${it.product}</td>
                        <td style="color: #000000;">${it.category}</td>
                        <td style="color: #000000;">${it.brand}</td>
                        <td style="color: #000000;">${it.variant}</td>
                        <td style="text-align: center; color: #000000;">${it.size}</td>
                        <td style="color: #000000;">${it.color}</td>
                        <td class="font-mono" style="color: #000000;">${it.hsn}</td>
                        <td style="text-align: center; font-weight: bold; color: #000000;">${it.qty}</td>
                        <td style="text-align: right; color: #000000; font-weight: 600;">${it.rate.toFixed(2)}</td>
                        <td style="text-align: center; color: #000000;">${it.gstRate}%</td>
                        <td style="text-align: right; color: #000000; font-weight: 600;">${it.gstAmount.toFixed(2)}</td>
                        <td style="text-align: right; font-weight: bold; color: #000000;">${it.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- SUMMARY CALCULATION & TERMS -->
        <div class="summary-container">
            <div class="summary-left">
                <div class="amount-words-box">
                    <span class="label">Amount in Words:</span>
                    <div class="words-text" style="color: #000000 !important; font-weight: 700;">${d.amountInWords}</div>
                </div>

                <div class="terms-block" style="margin-top: 8px;">
                    <div class="terms-title">Purchase Terms & Quality Conditions:</div>
                    <ol class="terms-list" style="font-size: 7.5px;">
                        <li>Materials delivered are strictly subject to physical count verification & Quality Check (QC) upon unloading at our warehouse.</li>
                        <li>Rejected or damaged fabric lots will not be accepted into saleable inventory and will be debited via Vendor Debit Note.</li>
                        <li>The official PO number must be clearly referenced on the Transporter Lorry Receipt (LR) and delivery invoice.</li>
                        <li>Payment shall be processed according to agreed terms: <strong>${d.paymentTerms}</strong>.</li>
                    </ol>
                </div>
            </div>

            <div class="summary-right">
                <table class="calc-table">
                    <tr>
                        <td class="calc-label">Sub Total:</td>
                        <td class="calc-val">₹ ${d.subTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    ${d.totalDiscount > 0 ? `
                        <tr>
                            <td class="calc-label">Discount:</td>
                            <td class="calc-val text-green">-₹ ${d.totalDiscount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : ''}
                    <tr>
                        <td class="calc-label font-bold">Taxable Amount:</td>
                        <td class="calc-val font-bold">₹ ${d.taxableAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    ${!d.isInterState ? `
                        <tr>
                            <td class="calc-label">CGST:</td>
                            <td class="calc-val">₹ ${d.cgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td class="calc-label">SGST:</td>
                            <td class="calc-val">₹ ${d.sgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : `
                        <tr>
                            <td class="calc-label">IGST (Inter-State):</td>
                            <td class="calc-val">₹ ${d.igst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    `}
                    ${d.otherCharges > 0 ? `
                        <tr>
                            <td class="calc-label">Freight / Handling:</td>
                            <td class="calc-val">₹ ${d.otherCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        </tr>
                    ` : ''}
                    ${d.roundOff !== 0 ? `
                        <tr>
                            <td class="calc-label">Round Off:</td>
                            <td class="calc-val">${d.roundOff >= 0 ? '+' : ''}${d.roundOff.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    <tr class="grand-total-row po-total-row" style="background:#0f172a; color:#ffffff;">
                        <td class="calc-label-total" style="color:#ffffff;">GRAND TOTAL (PO):</td>
                        <td class="calc-val-total" style="color:#ffffff;">₹ ${d.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- DUAL AUTHORIZATION SIGNATURES -->
        <footer class="invoice-footer" style="margin-top: 14px;">
            <div class="signature-row">
                <div class="sig-box">
                    <div style="font-size: 8.5px; font-weight: 700; color: #0f172a; margin-bottom: 24px;">Prepared By: ${d.salesPerson}</div>
                    <div class="sig-line"></div>
                    <div class="sig-label">Purchase Officer / Merchandiser</div>
                </div>
                <div class="sig-box text-right">
                    <div class="for-company">For ${c.companyName}</div>
                    <div class="sig-line"></div>
                    <div class="sig-label">Authorized Signatory & Stamp</div>
                </div>
            </div>
            <div class="bottom-tagline">This Purchase Order is generated through CLOTHERP Enterprise Management System.</div>
        </footer>
    </div>
</body>
</html>
        `;
    }

    /**
     * Complete EasyPrint CSS Stylesheet for A4 Print and Screen Preview
     */
    getPrintStyles() {
        return `
            @page {
                size: A4 portrait;
                margin: 8mm;
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            body {
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #ffffff;
                color: #1e293b;
                font-size: 10px;
                line-height: 1.35;
            }

            .easyprint-page {
                width: 100%;
                max-width: 210mm;
                margin: 0 auto;
                background: #ffffff !important;
                color: #000000 !important;
                padding: 6mm 8mm;
                border: 1px solid #e2e8f0;
            }

            @media print {
                body {
                    background: transparent;
                }
                .easyprint-page {
                    border: none;
                    padding: 0;
                    max-width: 100%;
                }
            }

            /* COMPANY HEADER */
            .company-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 8px;
                margin-bottom: 8px;
            }

            .header-left {
                width: 40%;
            }

            .company-logo {
                max-height: 48px;
                max-width: 200px;
                object-fit: contain;
                display: block;
            }

            .company-tagline {
                font-size: 8.5px;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #64748b;
                font-weight: 600;
                margin-top: 2px;
            }

            .header-right {
                width: 60%;
                text-align: right;
            }

            .company-name {
                font-size: 14px;
                font-weight: 800;
                color: #000000;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            }

            .company-info-line {
                font-size: 9.5px;
                color: #000000;
                margin-bottom: 1.5px;
            }

            .gstin-badge {
                display: inline-block;
                background: #f1f5f9;
                padding: 2px 6px;
                border-radius: 4px;
                border: 1px solid #cbd5e1;
                font-family: 'JetBrains Mono', monospace;
                font-size: 9.5px;
                margin-top: 2px;
            }

            /* TITLE BAR */
            .doc-title-bar {
                background: #0f172a;
                color: #ffffff;
                padding: 4px 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 4px;
                margin-bottom: 8px;
            }

            .estimate-title-bar {
                background: #1e3a8a;
            }

            .doc-title {
                font-size: 12px;
                font-weight: 800;
                letter-spacing: 1.5px;
            }

            .doc-subtitle {
                font-size: 8.5px;
                font-weight: 600;
                letter-spacing: 1px;
                opacity: 0.85;
            }

            /* META GRID */
            .meta-grid {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
            }

            .meta-col {
                flex: 1;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 6px 8px;
                background: #f8fafc;
            }

            .box-title {
                font-size: 9px;
                font-weight: 800;
                text-transform: uppercase;
                color: #0f172a;
                border-bottom: 1px solid #cbd5e1;
                padding-bottom: 3px;
                margin-bottom: 4px;
                letter-spacing: 0.5px;
            }

            .cust-name {
                font-size: 11px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 2px;
            }

            .cust-detail {
                font-size: 9px;
                color: #000000;
                margin-bottom: 2px;
            }

            .highlight-gst {
                font-family: 'JetBrains Mono', monospace;
                color: #1e40af;
                font-weight: 600;
            }

            .info-kv-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 9px;
            }

            .info-kv-table td {
                padding: 1.5px 0;
            }

            .kv-key {
                color: #475569;
                width: 42%;
            }

            .kv-val {
                color: #000000;
                font-weight: 600;
            }

            /* PRODUCT TABLE */
            .product-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 8px;
                font-size: 8.5px;
                color: #000000 !important;
            }

            .product-table th {
                background: #f1f5f9;
                color: #000000 !important;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                border: 1px solid #cbd5e1;
                padding: 4px 3px;
                text-align: left;
            }

            .product-table td {
                border: 1px solid #cbd5e1;
                padding: 4px 3px;
                vertical-align: middle;
                color: #000000 !important;
            }

            .product-table tbody tr:nth-child(even) {
                background: #f8fafc;
            }

            /* SUMMARY CONTAINER */
            .summary-container {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
                align-items: flex-start;
            }

            .summary-left {
                flex: 1.2;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .amount-words-box {
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 5px 8px;
                background: #f8fafc;
            }

            .amount-words-box .label {
                font-size: 8.5px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
            }

            .amount-words-box .words-text {
                font-size: 10px;
                font-weight: 700;
                color: #0f172a;
                margin-top: 2px;
                line-height: 1.3;
            }

            .bank-details-box {
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 5px 8px;
                background: #f8fafc;
                font-size: 8.5px;
            }

            .bank-title {
                font-weight: 700;
                text-transform: uppercase;
                color: #0f172a;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 2px;
                margin-bottom: 4px;
            }

            .bank-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2px 8px;
                color: #000000;
            }

            .payment-status-strip {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 8px;
                background: #f1f5f9;
                border-radius: 4px;
                border: 1px solid #cbd5e1;
                font-size: 9px;
                color: #000000;
            }

            .pay-info {
                color: #000000;
            }

            .status-badge {
                font-weight: 800;
                padding: 1px 6px;
                border-radius: 3px;
                text-transform: uppercase;
            }

            .status-paid {
                background: #dcfce7;
                color: #15803d;
            }

            .status-partially-paid {
                background: #fef3c7;
                color: #b45309;
            }

            .status-unpaid {
                background: #fee2e2;
                color: #b91c1c;
            }

            .estimate-validity-notice {
                border: 1px dashed #cbd5e1;
                border-radius: 4px;
                padding: 6px 8px;
                background: #fffbeb;
                color: #92400e;
                font-size: 8.5px;
            }

            .summary-right {
                flex: 0.9;
            }

            .calc-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                overflow: hidden;
                font-size: 9px;
            }

            .calc-table td {
                padding: 3px 8px;
                border-bottom: 1px solid #e2e8f0;
            }

            .calc-label {
                color: #475569;
                width: 55%;
            }

            .calc-val {
                text-align: right;
                font-family: 'JetBrains Mono', monospace;
                font-weight: 700;
                color: #000000 !important;
            }

            .grand-total-row {
                background: #0f172a;
                color: #ffffff;
            }

            .estimate-total-row {
                background: #1e3a8a;
            }

            .calc-label-total {
                font-weight: 800;
                font-size: 10.5px;
                color: #ffffff;
                padding: 6px 8px !important;
            }

            .calc-val-total {
                text-align: right;
                font-family: 'JetBrains Mono', monospace;
                font-weight: 800;
                font-size: 12px;
                color: #ffffff;
                padding: 6px 8px !important;
            }

            /* FOOTER */
            .invoice-footer {
                border-top: 1px solid #cbd5e1;
                padding-top: 6px;
            }

            .terms-block {
                margin-bottom: 8px;
            }

            .terms-title {
                font-size: 8.5px;
                font-weight: 700;
                text-transform: uppercase;
                color: #0f172a;
                margin-bottom: 2px;
            }

            .terms-list {
                padding-left: 14px;
                font-size: 8px;
                color: #475569;
                line-height: 1.3;
            }

            .signature-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 14px;
                padding-bottom: 4px;
            }

            .sig-box {
                width: 35%;
            }

            .for-company {
                font-size: 8.5px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 24px;
            }

            .sig-line {
                border-top: 1px dashed #94a3b8;
                margin-top: 24px;
                margin-bottom: 3px;
            }

            .sig-label {
                font-size: 8.5px;
                font-weight: 700;
                color: #334155;
            }

            .bottom-tagline {
                text-align: center;
                font-size: 8.5px;
                font-weight: 700;
                color: #64748b;
                letter-spacing: 1px;
                border-top: 1px solid #e2e8f0;
                padding-top: 4px;
                margin-top: 6px;
            }

            /* UTILS */
            .font-bold { font-weight: 700; color: #000000 !important; }
            .font-mono { font-family: 'JetBrains Mono', monospace; color: #000000 !important; }
            .text-dark { color: #000000 !important; }
            .text-green { color: #15803d; }
            .text-right { text-align: right; }
        `;
    }

    /**
     * Trigger print dialog for the generated HTML via isolated hidden iframe
     */
    print(rawDoc, type = 'INVOICE') {
        let html;
        if (type === 'PURCHASE_ORDER') {
            html = this.generatePurchaseOrderHtml(rawDoc);
        } else if (type === 'ESTIMATE') {
            html = this.generateEstimateHtml(rawDoc);
        } else {
            html = this.generateInvoiceHtml(rawDoc);
        }
        
        let iframe = document.getElementById('easyprint-hidden-frame');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'easyprint-hidden-frame';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
        }

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            }, 250);
        };
        // Fallback for immediate print if already loaded
        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (e) {
                console.error('Print trigger error:', e);
            }
        }, 500);
    }

    /**
     * Download document as PDF
     * Uses html2pdf library if loaded, or falls back to print dialog formatted for Save as PDF
     */
    async downloadPdf(rawDoc, type = 'INVOICE') {
        const d = this.enrichDocumentData(rawDoc, type);
        let fileName = `Invoice_${d.invoiceNumber}.pdf`;
        if (type === 'PURCHASE_ORDER') {
            fileName = `PurchaseOrder_${d.poNumber}.pdf`;
        } else if (type === 'ESTIMATE') {
            fileName = `Estimate_${d.estimateNumber}.pdf`;
        }

        let html;
        if (type === 'PURCHASE_ORDER') {
            html = this.generatePurchaseOrderHtml(rawDoc);
        } else if (type === 'ESTIMATE') {
            html = this.generateEstimateHtml(rawDoc);
        } else {
            html = this.generateInvoiceHtml(rawDoc);
        }

        // Check if html2pdf is available
        if (window.html2pdf) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const element = tempDiv.querySelector('.easyprint-page') || tempDiv;
            
            const opt = {
                margin: 6,
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await window.html2pdf().set(opt).from(element).save();
        } else {
            // Load html2pdf dynamically if not present
            try {
                await this._loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
                return await this.downloadPdf(rawDoc, type);
            } catch (err) {
                console.warn('html2pdf could not be loaded, using browser print-to-pdf:', err);
                this.print(rawDoc, type);
            }
        }
    }

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                return resolve();
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = (e) => reject(e);
            document.head.appendChild(script);
        });
    }
}

export const easyPrintService = new EasyPrintService();
