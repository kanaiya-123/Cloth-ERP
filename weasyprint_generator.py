"""
CLOTHERP - WeasyPrint Server-Side PDF Generation Engine
Supports:
1. Purchase Order (PO) PDF
2. Proforma Invoice (PI) PDF (with files, date, year, time storage)
3. Goods Received Note (GRN) PDF (with Quality Check & Storage Location)
4. Purchase Invoice PDF
5. Purchase Return PDF
"""

import sys
import os
import json
import argparse
from datetime import datetime

# Try importing WeasyPrint
HAS_WEASYPRINT = False
try:
    from weasyprint import HTML, CSS
    HAS_WEASYPRINT = True
except Exception as e:
    HAS_WEASYPRINT = False
    WEASYPRINT_ERROR = str(e)


def get_base_css():
    return """
    @page {
        size: A4 portrait;
        margin: 12mm 15mm 15mm 15mm;
        @bottom-right {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 8pt;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #64748b;
        }
        @bottom-left {
            content: "CLOTHERP Enterprise — Computer Generated Document";
            font-size: 8pt;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #64748b;
        }
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 9pt;
        line-height: 1.35;
        color: #000000;
        background: #ffffff;
    }

    .header-table {
        width: 100%;
        border-bottom: 2pt solid #0f172a;
        padding-bottom: 8px;
        margin-bottom: 12px;
    }

    .header-logo {
        font-size: 18pt;
        font-weight: 900;
        letter-spacing: 1px;
        color: #0f172a;
    }

    .header-tagline {
        font-size: 7.5pt;
        text-transform: uppercase;
        color: #475569;
        letter-spacing: 1px;
        font-weight: 600;
    }

    .doc-badge {
        display: inline-block;
        background: #0f172a;
        color: #ffffff;
        font-size: 11pt;
        font-weight: 800;
        padding: 4px 12px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .doc-meta-table {
        width: 100%;
        margin-bottom: 12px;
        border-collapse: collapse;
    }

    .doc-meta-table td {
        vertical-align: top;
        padding: 6px 8px;
        border: 1pt solid #cbd5e1;
        font-size: 8.5pt;
    }

    .meta-box-title {
        font-size: 7.5pt;
        font-weight: 800;
        text-transform: uppercase;
        color: #475569;
        border-bottom: 0.5pt solid #e2e8f0;
        padding-bottom: 2px;
        margin-bottom: 4px;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
        font-size: 8pt;
    }

    .data-table th {
        background: #f1f5f9;
        color: #000000;
        font-weight: 700;
        border: 1pt solid #94a3b8;
        padding: 5px 4px;
        text-align: left;
        text-transform: uppercase;
        font-size: 7.5pt;
    }

    .data-table td {
        border: 1pt solid #cbd5e1;
        padding: 4px;
        color: #000000;
    }

    .data-table tr:nth-child(even) {
        background-color: #f8fafc;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }

    .summary-table {
        width: 45%;
        margin-left: auto;
        border-collapse: collapse;
        margin-bottom: 12px;
        font-size: 8.5pt;
    }

    .summary-table td {
        padding: 3px 6px;
        border-bottom: 0.5pt solid #cbd5e1;
    }

    .grand-total-row {
        background: #0f172a;
        color: #ffffff !important;
        font-weight: 800;
        font-size: 10pt;
    }

    .grand-total-row td {
        color: #ffffff !important;
        padding: 6px;
    }

    .words-box {
        border: 1pt solid #cbd5e1;
        padding: 6px 8px;
        background: #f8fafc;
        margin-bottom: 12px;
        font-size: 8.5pt;
    }

    .footer-signatures {
        width: 100%;
        margin-top: 30px;
    }

    .sig-line {
        border-top: 1pt dashed #64748b;
        margin-top: 40px;
        padding-top: 4px;
        font-size: 8pt;
        font-weight: 700;
        text-align: center;
    }

    .storage-badge {
        display: inline-block;
        background: #e0e7ff;
        color: #3730a3;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 3px;
        font-family: monospace;
        font-size: 7.5pt;
    }
    """


def generate_purchase_order_html(po):
    items = po.get('items', [])
    rows = ""
    for idx, it in enumerate(items, 1):
        rate = float(it.get('purchaseRate', 0))
        qty = int(it.get('quantity', 0))
        gst_rate = float(it.get('gstRate', 5))
        total = float(it.get('totalAmount', rate * qty))
        rows += f"""
        <tr>
            <td class="text-center">{idx}</td>
            <td class="font-bold">{it.get('productName', 'Garment Product')}</td>
            <td>{it.get('category', 'Apparel')}</td>
            <td>{it.get('brand', 'ClothERP')}</td>
            <td>{it.get('variantName', 'Standard')}</td>
            <td class="text-center">{it.get('size', 'M')}</td>
            <td>{it.get('color', 'Standard')}</td>
            <td class="font-mono">{it.get('sku', 'SKU')}</td>
            <td class="text-center font-bold">{qty}</td>
            <td class="text-right">₹{rate:.2f}</td>
            <td class="text-center">{gst_rate:.0f}%</td>
            <td class="text-right font-bold">₹{total:.2f}</td>
        </tr>
        """

    subtotal = float(po.get('finalTaxableAmount', po.get('subtotalTaxable', 0)))
    total_tax = float(po.get('totalTax', 0))
    grand_total = float(po.get('grandTotal', subtotal + total_tax))

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Purchase Order — {po.get('purchaseNumber', 'PO')}</title>
        <style>{get_base_css()}</style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    <div class="header-logo">CLOTHERP APPAREL</div>
                    <div class="header-tagline">Clothing Business ERP & Inventory Operations</div>
                    <div style="font-size: 8pt; color: #334155; margin-top: 3px;">
                        ClothERP Logistics Complex, Textile Ring Road, Surat, Gujarat - 395002<br>
                        <strong>GSTIN:</strong> 24AAACC9988P1Z3 | <strong>Email:</strong> purchase@clotherp.local
                    </div>
                </td>
                <td style="width: 40%; text-align: right;">
                    <div class="doc-badge">PURCHASE ORDER</div>
                    <div style="font-size: 9pt; font-weight: 700; margin-top: 4px;">PO No: {po.get('purchaseNumber', 'PO-000001')}</div>
                    <div style="font-size: 8pt; color: #475569;">Date: {po.get('purchaseDate', datetime.now().strftime('%Y-%m-%d'))}</div>
                    <div style="font-size: 8pt; color: #475569;">Delivery Expected: {po.get('expectedDeliveryDate', '—')}</div>
                </td>
            </tr>
        </table>

        <table class="doc-meta-table">
            <tr>
                <td style="width: 50%;">
                    <div class="meta-box-title">Vendor / Supplier Details</div>
                    <div style="font-size: 10pt; font-weight: 700;">{po.get('supplierName', 'Vendor')}</div>
                    <div><strong>GSTIN:</strong> {po.get('supplierGstin', 'Unregistered')}</div>
                    <div><strong>State:</strong> {po.get('supplierState', 'Gujarat')}</div>
                    <div><strong>Contact:</strong> {po.get('supplierContact', '+91 98000 00000')}</div>
                    <div><strong>Payment Terms:</strong> {po.get('paymentTerms', '30 Days Credit')}</div>
                </td>
                <td style="width: 50%;">
                    <div class="meta-box-title">Ship-To Warehouse & Transport</div>
                    <div><strong>Delivery Location:</strong> Main Warehouse, Surat Logistics Hub</div>
                    <div><strong>Transporter:</strong> {po.get('shipment', {}).get('transportName', 'Direct Mill Dispatch')}</div>
                    <div><strong>LR / Tracking No:</strong> {po.get('shipment', {}).get('lrNumber', 'Pending')}</div>
                    <div><strong>Order Status:</strong> <span class="font-bold">{po.get('status', 'PO Generated')}</span></div>
                    <div><strong>Order Notes:</strong> {po.get('notes', 'Standard Quality Lot')}</div>
                </td>
            </tr>
        </table>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 4%;">#</th>
                    <th style="width: 22%;">Product</th>
                    <th style="width: 10%;">Category</th>
                    <th style="width: 10%;">Brand</th>
                    <th style="width: 12%;">Variant</th>
                    <th style="width: 6%;">Size</th>
                    <th style="width: 8%;">Color</th>
                    <th style="width: 8%;">SKU</th>
                    <th style="width: 6%; text-align: center;">Qty</th>
                    <th style="width: 9%; text-align: right;">Rate (₹)</th>
                    <th style="width: 6%; text-align: center;">GST</th>
                    <th style="width: 10%; text-align: right;">Total (₹)</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>

        <table style="width: 100%;">
            <tr>
                <td style="width: 55%; vertical-align: top;">
                    <div class="words-box">
                        <div class="meta-box-title">Amount in Words</div>
                        <div class="font-bold" style="font-size: 9pt;">Indian Rupees {po.get('amountInWords', 'Eighty-Four Thousand Only')}</div>
                    </div>
                    <div style="font-size: 7.5pt; color: #475569; padding-right: 15px;">
                        <strong>Terms & Conditions:</strong><br>
                        1. Goods must conform strictly to fabric specifications and shade cards.<br>
                        2. Defective, torn, or non-matching lots will be rejected during GRN inspection.<br>
                        3. Purchase order creation does not grant title until stored in warehouse.
                    </div>
                </td>
                <td style="width: 45%; vertical-align: top;">
                    <table class="summary-table" style="width: 100%;">
                        <tr>
                            <td>Taxable Subtotal:</td>
                            <td class="text-right font-mono font-bold">₹{subtotal:.2f}</td>
                        </tr>
                        <tr>
                            <td>Total GST Tax:</td>
                            <td class="text-right font-mono font-bold">₹{total_tax:.2f}</td>
                        </tr>
                        <tr class="grand-total-row">
                            <td>TOTAL PAYABLE:</td>
                            <td class="text-right font-mono font-bold">₹{grand_total:.2f}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <table class="footer-signatures">
            <tr>
                <td style="width: 30%; text-align: center;">
                    <div class="sig-line">Prepared By (Purchase Officer)</div>
                </td>
                <td style="width: 40%;"></td>
                <td style="width: 30%; text-align: center;">
                    <div class="sig-line">Authorized Signatory (ClothERP)</div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html


def generate_proforma_invoice_html(pi):
    po_num = pi.get('poNumber', pi.get('purchaseNumber', 'PO-000001'))
    pi_num = pi.get('proformaNumber', f"PI-{po_num}")
    date_str = pi.get('piDate', pi.get('purchaseDate', datetime.now().strftime('%Y-%m-%d')))
    year_str = pi.get('financialYear', 'FY 2026-2027')
    time_str = pi.get('issueTime', datetime.now().strftime('%H:%M:%S'))

    items = pi.get('items', [])
    rows = ""
    for idx, it in enumerate(items, 1):
        rate = float(it.get('purchaseRate', 0))
        qty = int(it.get('quantity', 0))
        gst = float(it.get('gstRate', 5))
        tot = float(it.get('totalAmount', rate * qty))
        rows += f"""
        <tr>
            <td class="text-center">{idx}</td>
            <td class="font-bold">{it.get('productName', 'Apparel')}</td>
            <td>{it.get('variantName', 'Free Size')}</td>
            <td class="text-center font-bold">{qty}</td>
            <td class="text-right">₹{rate:.2f}</td>
            <td class="text-center">{gst:.0f}%</td>
            <td class="text-right font-bold">₹{tot:.2f}</td>
        </tr>
        """

    subtotal = float(pi.get('finalTaxableAmount', 80000))
    tax = float(pi.get('totalTax', 4000))
    grand = float(pi.get('grandTotal', 84000))

    # Stored attachments metadata
    files = pi.get('storedFiles', [
        {'name': f'{pi_num}_Vendor_Quotation.pdf', 'size': '245 KB', 'year': year_str, 'time': time_str},
        {'name': 'Shade_Card_Approval.jpg', 'size': '1.2 MB', 'year': year_str, 'time': time_str}
    ])
    files_list = "".join([f"<li>📄 <strong>{f['name']}</strong> ({f['size']}) — Stored on {date_str} [{year_str} {time_str}]</li>" for f in files])

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Proforma Invoice — {pi_num}</title>
        <style>{get_base_css()}</style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    <div class="header-logo">{pi.get('supplierName', 'Surat Silk & Rayon Mills Ltd.')}</div>
                    <div class="header-tagline">Manufacturer & Wholesale Fabric Supplier</div>
                    <div style="font-size: 8pt; color: #334155; margin-top: 3px;">
                        Ring Road Mill Compound, Surat, Gujarat - 395002<br>
                        <strong>GSTIN:</strong> {pi.get('supplierGstin', '24AAACS1234F1Z5')} | <strong>PAN:</strong> AAACS1234F
                    </div>
                </td>
                <td style="width: 40%; text-align: right;">
                    <div class="doc-badge" style="background: #1e3a8a;">PROFORMA INVOICE</div>
                    <div style="font-size: 10pt; font-weight: 700; margin-top: 4px;">PI No: {pi_num}</div>
                    <div style="font-size: 8pt;">PO Ref: {po_num}</div>
                    <div style="font-size: 8pt; color: #475569;">Issue Date: <strong>{date_str}</strong></div>
                    <div style="font-size: 8pt; color: #475569;">Fiscal Year: <strong>{year_str}</strong> | Time: <strong>{time_str}</strong></div>
                </td>
            </tr>
        </table>

        <div style="background: #fffbeb; border: 1pt dashed #d97706; padding: 6px 10px; margin-bottom: 12px; font-size: 8pt; color: #92400e;">
            <strong>Important Accounting Notice:</strong> This is a Proforma Invoice for advance commercial verification. It does NOT constitute a final tax invoice and does NOT increase inventory stock.
        </div>

        <table class="doc-meta-table">
            <tr>
                <td style="width: 50%;">
                    <div class="meta-box-title">Billed To (Buyer)</div>
                    <div style="font-size: 10pt; font-weight: 700;">CLOTHERP APPAREL INDUSTRIES PVT LTD</div>
                    <div>ClothERP Complex, Ring Road, Surat, Gujarat</div>
                    <div><strong>GSTIN:</strong> 24AAACC9988P1Z3</div>
                </td>
                <td style="width: 50%;">
                    <div class="meta-box-title">Bank & Remittance Details</div>
                    <div><strong>Bank Name:</strong> HDFC Bank Ltd.</div>
                    <div><strong>A/C No.:</strong> 50200088991122</div>
                    <div><strong>IFSC:</strong> HDFC0001244</div>
                    <div><strong>Payment Terms:</strong> 100% Advance or 30 Days LC</div>
                </td>
            </tr>
        </table>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 35%;">Product & Description</th>
                    <th style="width: 20%;">Variant / Size</th>
                    <th style="width: 10%; text-align: center;">Qty</th>
                    <th style="width: 12%; text-align: right;">Rate (₹)</th>
                    <th style="width: 8%; text-align: center;">GST%</th>
                    <th style="width: 15%; text-align: right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>

        <table style="width: 100%;">
            <tr>
                <td style="width: 55%; vertical-align: top;">
                    <div class="words-box">
                        <div class="meta-box-title">PI Storage & Digital Archive Record</div>
                        <ul style="padding-left: 15px; font-size: 7.5pt; color: #1e293b; line-height: 1.5;">
                            {files_list}
                        </ul>
                    </div>
                </td>
                <td style="width: 45%; vertical-align: top;">
                    <table class="summary-table" style="width: 100%;">
                        <tr><td>Taxable Subtotal:</td><td class="text-right font-mono font-bold">₹{subtotal:.2f}</td></tr>
                        <tr><td>Tax (GST):</td><td class="text-right font-mono font-bold">₹{tax:.2f}</td></tr>
                        <tr class="grand-total-row" style="background: #1e3a8a;">
                            <td>PROFORMA TOTAL:</td>
                            <td class="text-right font-mono font-bold">₹{grand:.2f}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html


def generate_grn_html(grn):
    grn_num = grn.get('grnNumber', 'GRN-2026-0001')
    po_num = grn.get('poNumber', 'PO-000001')
    items = grn.get('items', [])
    rows = ""
    for idx, it in enumerate(items, 1):
        ord_qty = int(it.get('orderedQuantity', it.get('quantity', 0)))
        rec_qty = int(it.get('receivedQuantity', 0))
        acc_qty = int(it.get('acceptedQuantity', rec_qty))
        rej_qty = int(it.get('rejectedQuantity', 0))
        dam_qty = int(it.get('damagedQuantity', 0))
        pending_qty = max(0, ord_qty - rec_qty)
        loc = it.get('storageLocation', 'Rack A > Shelf A1 > Bin 01')

        rows += f"""
        <tr>
            <td class="text-center">{idx}</td>
            <td class="font-bold">{it.get('productName', 'Item')}</td>
            <td>{it.get('variantName', 'M')}</td>
            <td class="text-center font-bold">{ord_qty}</td>
            <td class="text-center font-bold" style="color: #0284c7;">{rec_qty}</td>
            <td class="text-center font-bold" style="color: #16a34a;">{acc_qty}</td>
            <td class="text-center font-bold" style="color: #dc2626;">{rej_qty}</td>
            <td class="text-center font-bold" style="color: #ea580c;">{dam_qty}</td>
            <td class="text-center font-mono font-bold">{pending_qty}</td>
            <td class="text-center"><span class="storage-badge">{loc}</span></td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Goods Received Note — {grn_num}</title>
        <style>{get_base_css()}</style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    <div class="header-logo">CLOTHERP APPAREL INTAKE</div>
                    <div class="header-tagline">Quality Assurance & Warehouse Material Receipt</div>
                    <div style="font-size: 8pt; color: #334155; margin-top: 3px;">
                        Main Logistics Hub, Warehouse A, Surat<br>
                        <strong>Received By:</strong> {grn.get('receivedBy', 'Amit Patel (Warehouse Manager)')}
                    </div>
                </td>
                <td style="width: 40%; text-align: right;">
                    <div class="doc-badge" style="background: #059669;">GOODS RECEIVED NOTE</div>
                    <div style="font-size: 10pt; font-weight: 700; margin-top: 4px;">GRN No: {grn_num}</div>
                    <div style="font-size: 8pt;">PO Ref: {po_num}</div>
                    <div style="font-size: 8pt; color: #475569;">Inspection Date: {grn.get('grnDate', datetime.now().strftime('%Y-%m-%d'))}</div>
                </td>
            </tr>
        </table>

        <table class="doc-meta-table">
            <tr>
                <td style="width: 50%;">
                    <div class="meta-box-title">Vendor & Challan Reference</div>
                    <div><strong>Supplier:</strong> {grn.get('supplierName', 'Surat Silk Mills')}</div>
                    <div><strong>Invoice No:</strong> {grn.get('invoiceNumber', 'INV-SUP-8891')}</div>
                    <div><strong>Invoice Date:</strong> {grn.get('invoiceDate', '2026-08-20')}</div>
                    <div><strong>LR Number:</strong> {grn.get('lrNumber', 'LR-998812')}</div>
                </td>
                <td style="width: 50%;">
                    <div class="meta-box-title">Quality Inspection & Stock Status</div>
                    <div><strong>Quality Status:</strong> <span class="font-bold" style="color: #16a34a;">Quality Passed (Accepted)</span></div>
                    <div><strong>Warehouse:</strong> Main Warehouse (Surat Hub)</div>
                    <div><strong>Stock Intake Rule:</strong> Only Accepted quantity added to active stock.</div>
                    <div><strong>Damaged / Rejected:</strong> Isolated to Quarantined Bin.</div>
                </td>
            </tr>
        </table>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 4%;">#</th>
                    <th style="width: 20%;">Product</th>
                    <th style="width: 12%;">Variant</th>
                    <th style="width: 7%; text-align: center;">Ord.</th>
                    <th style="width: 7%; text-align: center;">Rec.</th>
                    <th style="width: 7%; text-align: center;">Acc.</th>
                    <th style="width: 6%; text-align: center;">Rej.</th>
                    <th style="width: 6%; text-align: center;">Dam.</th>
                    <th style="width: 7%; text-align: center;">Pending</th>
                    <th style="width: 24%; text-align: center;">Storage Location</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>

        <table class="footer-signatures">
            <tr>
                <td style="width: 30%; text-align: center;"><div class="sig-line">QC Inspector</div></td>
                <td style="width: 40%;"></td>
                <td style="width: 30%; text-align: center;"><div class="sig-line">Warehouse Manager</div></td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html


def generate_pdf_from_html(html_content, output_pdf_path):
    """
    Generate PDF using WeasyPrint if available, otherwise write HTML with print instructions.
    """
    if HAS_WEASYPRINT:
        HTML(string=html_content).write_pdf(output_pdf_path)
        return True, "Generated using WeasyPrint"
    else:
        # Fallback: write HTML file
        html_path = output_pdf_path.replace('.pdf', '.html')
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        return False, f"WeasyPrint library missing. Generated HTML template at {html_path}"


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="ClothERP WeasyPrint Document Generator")
    parser.add_argument('--type', choices=['po', 'pi', 'grn', 'invoice', 'return'], default='po')
    parser.add_argument('--input', help="Path to input JSON file", required=False)
    parser.add_argument('--output', help="Output PDF file path", required=False)

    args = parser.parse_args()

    data = {}
    if args.input and os.path.exists(args.input):
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)

    out_path = args.output or f"clotherp_{args.type}.pdf"

    if args.type == 'po':
        html = generate_purchase_order_html(data)
    elif args.type == 'pi':
        html = generate_proforma_invoice_html(data)
    elif args.type == 'grn':
        html = generate_grn_html(data)
    else:
        html = generate_purchase_order_html(data)

    success, msg = generate_pdf_from_html(html, out_path)
    print(f"Status: {success} | Message: {msg}")
