// CLOTHERP - Complete Purchase Workflow Engine
// Workflow: Supplier/Manufacturer -> Purchase Order (PO) -> Proforma Invoice (PI) -> Goods Received Note (GRN) -> Quality Check -> Storage (Rack/Shelf/Bin) -> Stock Update

import { purchaseStore, PURCHASE_STORAGE_KEYS } from './purchaseStore.js';
import { stockMovementService } from './stockMovementService.js';
import { productStore, STORAGE_KEYS as PRODUCT_KEYS } from './productStore.js';
import { companySettingsService } from './companySettingsService.js';

export const WORKFLOW_STORAGE_KEYS = {
    PROFORMA_INVOICES: 'clotherp_proforma_invoices_db',
    GRN_RECORDS: 'clotherp_grn_records_db',
    STORAGE_LOCATIONS: 'clotherp_warehouse_storage_locations_db'
};

class PurchaseWorkflowService {
    constructor() {
        this._initSeedData();
    }

    _initSeedData() {
        // 1. Seed Default Storage Locations (Warehouse -> Rack -> Shelf -> Bin)
        if (!localStorage.getItem(WORKFLOW_STORAGE_KEYS.STORAGE_LOCATIONS)) {
            const locations = [
                { id: 'loc_1', warehouse: 'Central Apparel Warehouse', rack: 'Rack A (Cotton & Pique)', shelf: 'Shelf A1', bin: 'Bin A1-01', capacity: 250, active: true },
                { id: 'loc_2', warehouse: 'Central Apparel Warehouse', rack: 'Rack A (Cotton & Pique)', shelf: 'Shelf A2', bin: 'Bin A2-05', capacity: 200, active: true },
                { id: 'loc_3', warehouse: 'Central Apparel Warehouse', rack: 'Rack B (Silks & Kurtis)', shelf: 'Shelf B1', bin: 'Bin B1-03', capacity: 150, active: true },
                { id: 'loc_4', warehouse: 'Surat Textile Depot', rack: 'Rack S1 (Festive Lots)', shelf: 'Shelf S1-A', bin: 'Bin S1-01', capacity: 300, active: true },
                { id: 'loc_5', warehouse: 'Damage & Quarantine Depot', rack: 'Quarantine Bay Q1', shelf: 'Shelf Q-Defect', bin: 'Bin Q-Hold', capacity: 100, active: true }
            ];
            localStorage.setItem(WORKFLOW_STORAGE_KEYS.STORAGE_LOCATIONS, JSON.stringify(locations));
        }

        // 2. Seed Proforma Invoices with Files, Dates, Years, and Times
        if (!localStorage.getItem(WORKFLOW_STORAGE_KEYS.PROFORMA_INVOICES)) {
            const seedPIs = [
                {
                    id: 'pi_1001',
                    proformaNumber: 'PI-2026-0001',
                    poNumber: 'PUR-000001',
                    purchaseId: 'pur_1001',
                    supplierName: 'Surat Silk & Rayon Mills Ltd.',
                    supplierGstin: '24AAACS1234F1Z5',
                    supplierContact: '+91 261 245 8899',
                    date: '2026-08-16',
                    financialYear: 'FY 2026-2027',
                    time: '11:42:30',
                    expectedDeliveryDate: '2026-08-25',
                    subtotal: 80000,
                    totalTax: 4000,
                    grandTotal: 84000,
                    paymentTerms: '50% Advance via NEFT, 50% on GRN Intake',
                    bankDetails: {
                        bankName: 'HDFC Bank Ltd.',
                        accountNumber: '50200088991122',
                        ifscCode: 'HDFC0001244',
                        branch: 'Ring Road Mill Branch'
                    },
                    status: 'Proforma Approved',
                    notes: 'Advance quotation verified against fabric shade lot specifications.',
                    // Stored Files / Attachments with Date, Year, Time
                    storedFiles: [
                        {
                            id: 'file_pi_1',
                            name: 'PI-2026-0001_Signed_Vendor_Quotation.pdf',
                            size: '342 KB',
                            type: 'application/pdf',
                            uploadDate: '2026-08-16',
                            financialYear: 'FY 2026-2027',
                            uploadTime: '11:45:12',
                            uploadedBy: 'Amit Patel (Procurement)'
                        },
                        {
                            id: 'file_pi_2',
                            name: 'Silk_Thread_Shade_Card_Approval.jpg',
                            size: '1.4 MB',
                            type: 'image/jpeg',
                            uploadDate: '2026-08-16',
                            financialYear: 'FY 2026-2027',
                            uploadTime: '11:48:05',
                            uploadedBy: 'Amit Patel (Procurement)'
                        }
                    ]
                }
            ];
            localStorage.setItem(WORKFLOW_STORAGE_KEYS.PROFORMA_INVOICES, JSON.stringify(seedPIs));
        }

        // 3. Seed GRN Records
        if (!localStorage.getItem(WORKFLOW_STORAGE_KEYS.GRN_RECORDS)) {
            const seedGRNs = [
                {
                    id: 'grn_1001',
                    grnNumber: 'GRN-2026-0001',
                    poNumber: 'PUR-000001',
                    purchaseId: 'pur_1001',
                    supplierName: 'Surat Silk & Rayon Mills Ltd.',
                    invoiceNumber: 'INV-SUR-88910',
                    invoiceDate: '2026-08-18',
                    lrNumber: 'LR-GTL-99124',
                    transporter: 'Gujarat Freight Lines',
                    receivedBy: 'Amit Patel (Warehouse Manager)',
                    grnDate: '2026-08-20',
                    financialYear: 'FY 2026-2027',
                    grnTime: '14:15:00',
                    warehouseName: 'Central Apparel Warehouse',
                    qualityStatus: 'Accepted', // 'Pending Inspection' | 'Accepted' | 'Partially Accepted' | 'Rejected'
                    notes: 'First batch of 90 pcs inspected and stored in Rack B.',
                    items: [
                        {
                            productVariantId: 'var_103_1',
                            productName: "Women's Embroidered Silk Kurti",
                            variantName: 'Mustard Yellow / S',
                            size: 'S',
                            color: 'Mustard Yellow',
                            qrCode: 'QR-KT-SLK-MST-S',
                            orderedQuantity: 40,
                            receivedQuantity: 40,
                            acceptedQuantity: 40,
                            rejectedQuantity: 0,
                            damagedQuantity: 0,
                            pendingQuantity: 0,
                            storageLocation: 'Central Apparel Warehouse > Rack B (Silks & Kurtis) > Shelf B1 > Bin B1-03',
                            qualityNotes: 'Seams and embroidery intact. 100% accepted.'
                        },
                        {
                            productVariantId: 'var_103_2',
                            productName: "Women's Embroidered Silk Kurti",
                            variantName: 'Mustard Yellow / M',
                            size: 'M',
                            color: 'Mustard Yellow',
                            qrCode: 'QR-KT-SLK-MST-M',
                            orderedQuantity: 50,
                            receivedQuantity: 50,
                            acceptedQuantity: 50,
                            rejectedQuantity: 0,
                            damagedQuantity: 0,
                            pendingQuantity: 0,
                            storageLocation: 'Central Apparel Warehouse > Rack B (Silks & Kurtis) > Shelf B1 > Bin B1-03',
                            qualityNotes: 'Lot verified against shade card.'
                        }
                    ]
                }
            ];
            localStorage.setItem(WORKFLOW_STORAGE_KEYS.GRN_RECORDS, JSON.stringify(seedGRNs));
        }
    }

    // =========================================================================
    // 1. PROFORMA INVOICE (PI) STORAGE WITH FILES, DATE, YEARS AND TIMES
    // =========================================================================

    /**
     * Get All Proforma Invoices
     */
    getProformaInvoices(purchaseId = null) {
        const all = JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEYS.PROFORMA_INVOICES) || '[]');
        if (purchaseId) {
            return all.filter(pi => pi.purchaseId === purchaseId || pi.poNumber === purchaseId);
        }
        return all;
    }

    /**
     * Generate & Store Proforma Invoice (DOES NOT AFFECT STOCK)
     */
    generateProformaInvoice({ purchaseId, notes = '', files = [], paymentTerms = '', user = 'Admin' }) {
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const purchase = purchases.find(p => p.id === purchaseId || p.purchaseNumber === purchaseId);

        if (!purchase) {
            return { success: false, message: 'Purchase Order record not found.' };
        }

        const allPIs = this.getProformaInvoices();
        const piCount = allPIs.length + 1;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        const financialYear = companySettingsService.getFinancialYear(dateStr);
        const piNumber = `PI-${now.getFullYear()}-${String(piCount).padStart(4, '0')}`;

        // Map uploaded files with strict date, year, time
        const processedFiles = (files || []).map((f, idx) => ({
            id: 'file_pi_' + Date.now() + '_' + idx,
            name: f.name || `Proforma_Attachment_${idx + 1}.pdf`,
            size: f.size || '350 KB',
            type: f.type || 'application/pdf',
            uploadDate: dateStr,
            financialYear: financialYear,
            uploadTime: timeStr,
            uploadedBy: user
        }));

        // Default quotation PDF attachment if none uploaded
        if (processedFiles.length === 0) {
            processedFiles.push({
                id: 'file_pi_' + Date.now(),
                name: `${piNumber}_Proforma_Quotation_Sheet.pdf`,
                size: '280 KB',
                type: 'application/pdf',
                uploadDate: dateStr,
                financialYear: financialYear,
                uploadTime: timeStr,
                uploadedBy: user
            });
        }

        const newPI = {
            id: 'pi_' + Date.now(),
            proformaNumber: piNumber,
            poNumber: purchase.purchaseNumber,
            purchaseId: purchase.id,
            supplierName: purchase.supplierName,
            supplierGstin: purchase.supplierGstin,
            supplierContact: purchase.supplierContact || '+91 98000 00000',
            date: dateStr,
            financialYear: financialYear,
            time: timeStr,
            expectedDeliveryDate: purchase.expectedDeliveryDate || '—',
            items: purchase.items || [],
            subtotal: purchase.finalTaxableAmount || purchase.subtotalTaxable || 0,
            totalTax: purchase.totalTax || 0,
            grandTotal: purchase.grandTotal || 0,
            paymentTerms: paymentTerms || '50% Advance via Bank / RTGS, balance against GRN',
            bankDetails: {
                bankName: 'HDFC Bank Ltd.',
                accountNumber: '50200088991122',
                ifscCode: 'HDFC0001244',
                branch: 'Textile Market Branch'
            },
            status: 'Proforma Generated',
            notes: notes || 'Commercial proforma invoice stored for advance verification.',
            storedFiles: processedFiles
        };

        allPIs.unshift(newPI);
        localStorage.setItem(WORKFLOW_STORAGE_KEYS.PROFORMA_INVOICES, JSON.stringify(allPIs));

        // Update PO status to 'Proforma Generated' if currently Draft / PO Generated
        if (purchase.status === 'Draft' || purchase.status === 'Confirmed') {
            purchase.status = 'Proforma Generated';
            purchase.proformaNumber = piNumber;
            purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);
        }

        return { 
            success: true, 
            message: `Proforma Invoice ${piNumber} generated & stored successfully with file attachments.`,
            proforma: newPI 
        };
    }

    /**
     * Add Attachment / File to an existing Proforma Invoice
     */
    addProformaAttachment(proformaId, fileData, user = 'Admin') {
        const allPIs = this.getProformaInvoices();
        const pi = allPIs.find(p => p.id === proformaId || p.proformaNumber === proformaId);

        if (!pi) return { success: false, message: 'Proforma Invoice not found.' };

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
        const financialYear = companySettingsService.getFinancialYear(dateStr);

        const newFile = {
            id: 'file_pi_' + Date.now(),
            name: fileData.name || 'Attachment.pdf',
            size: fileData.size || '500 KB',
            type: fileData.type || 'application/pdf',
            uploadDate: dateStr,
            financialYear: financialYear,
            uploadTime: timeStr,
            uploadedBy: user
        };

        pi.storedFiles = pi.storedFiles || [];
        pi.storedFiles.push(newFile);
        localStorage.setItem(WORKFLOW_STORAGE_KEYS.PROFORMA_INVOICES, JSON.stringify(allPIs));

        return { success: true, file: newFile };
    }

    /**
     * Upload & Archive Supplier's Proforma Document (Upload Only - Zero Stock Impact)
     */
    uploadSupplierProformaDocument({
        purchaseId,
        supplierPiNumber = '',
        piDate = '',
        fileName,
        fileSize = '350 KB',
        fileType = 'application/pdf',
        notes = '',
        user = 'Procurement Officer'
    }) {
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const purchase = purchases.find(p => p.id === purchaseId || p.purchaseNumber === purchaseId);
        if (!purchase) return { success: false, message: 'Purchase Order not found.' };

        const allPIs = this.getProformaInvoices();
        const now = new Date();
        const uploadDate = now.toISOString().split('T')[0];
        const uploadTime = now.toLocaleTimeString('en-US', { hour12: true });
        const financialYear = companySettingsService.getFinancialYear(uploadDate);

        let pi = allPIs.find(p => p.purchaseId === purchase.id || p.poNumber === purchase.purchaseNumber);
        if (!pi) {
            pi = {
                id: 'pi_' + Date.now(),
                proformaNumber: supplierPiNumber || `PI-VENDOR-${now.getFullYear()}-${String(allPIs.length + 1).padStart(3, '0')}`,
                poNumber: purchase.purchaseNumber,
                purchaseId: purchase.id,
                supplierName: purchase.supplierName,
                supplierGstin: purchase.supplierGstin,
                supplierContact: purchase.supplierContact || '—',
                date: piDate || uploadDate,
                financialYear,
                time: uploadTime,
                expectedDeliveryDate: purchase.expectedDeliveryDate || '—',
                subtotal: purchase.subtotal || purchase.totalGross || 0,
                totalTax: (purchase.cgstTotal || 0) + (purchase.sgstTotal || 0) + (purchase.igstTotal || 0),
                grandTotal: purchase.grandTotal || 0,
                paymentTerms: purchase.paymentTerms || '30 Days Net after QC',
                status: 'Supplier PI Archived',
                notes: notes || 'Supplier issued proforma quotation attached.',
                storedFiles: []
            };
            allPIs.unshift(pi);
        } else {
            if (supplierPiNumber) pi.proformaNumber = supplierPiNumber;
            if (piDate) pi.date = piDate;
            if (notes) pi.notes = notes;
        }

        const newFile = {
            id: 'file_pi_' + Date.now(),
            name: fileName,
            size: fileSize,
            type: fileType,
            uploadDate,
            financialYear,
            uploadTime,
            uploadedBy: user
        };

        pi.storedFiles = pi.storedFiles || [];
        pi.storedFiles.unshift(newFile);
        localStorage.setItem(WORKFLOW_STORAGE_KEYS.PROFORMA_INVOICES, JSON.stringify(allPIs));

        // Update purchase record to reflect attached PI number
        purchase.proformaNumber = pi.proformaNumber;
        purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);

        return { success: true, message: `Supplier document "${fileName}" archived with timestamp!`, pi, file: newFile };
    }

    /**
     * Delete an archived Proforma file
     */
    deleteProformaFile(purchaseId, fileId) {
        const allPIs = this.getProformaInvoices();
        const pi = allPIs.find(p => p.purchaseId === purchaseId || p.poNumber === purchaseId);
        if (!pi || !pi.storedFiles) return { success: false, message: 'Proforma record not found.' };

        pi.storedFiles = pi.storedFiles.filter(f => f.id !== fileId);
        localStorage.setItem(WORKFLOW_STORAGE_KEYS.PROFORMA_INVOICES, JSON.stringify(allPIs));
        return { success: true, message: 'Archived file removed.' };
    }

    // =========================================================================
    // 2. GOODS RECEIVED NOTE (GRN), QUALITY CHECK & STORAGE ALLOCATION
    // =========================================================================

    /**
     * Get All GRN Records
     */
    getGrnRecords(purchaseId = null) {
        const all = JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEYS.GRN_RECORDS) || '[]');
        if (purchaseId) {
            return all.filter(g => g.purchaseId === purchaseId || g.poNumber === purchaseId);
        }
        return all;
    }

    /**
     * Process Goods Receipt Note (GRN) with Quality Check and Storage Allocation
     * Rule: Only Accepted + Stored quantity increases available stock!
     * Rejected/Damaged quantity is segregated and NOT saleable!
     */
    async processGrnWithQualityAndStorage({
        purchaseId,
        invoiceNumber,
        invoiceDate,
        lrNumber,
        transporter,
        receivedBy,
        warehouseName = 'Central Apparel Warehouse',
        items = [], // [{ productVariantId, receiveQty, acceptQty, rejectQty, damageQty, rack, shelf, bin, notes }]
        user = 'Admin'
    }) {
        const purchases = purchaseStore.get(PURCHASE_STORAGE_KEYS.PURCHASES);
        const purchase = purchases.find(p => p.id === purchaseId || p.purchaseNumber === purchaseId);

        if (!purchase) {
            return { success: false, message: 'Purchase Order record not found.' };
        }

        if (purchase.status === 'Cancelled') {
            return { success: false, message: 'Cannot receive items for a cancelled Purchase Order.' };
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        const financialYear = companySettingsService.getFinancialYear(dateStr);

        const allGRNs = this.getGrnRecords();
        const grnNumber = `GRN-${now.getFullYear()}-${String(allGRNs.length + 1).padStart(4, '0')}`;

        const grnItemLogs = [];
        let totalAcceptedInBatch = 0;
        let totalRejectedInBatch = 0;
        let totalDamagedInBatch = 0;

        // Process each item line
        for (const line of items) {
            const poItem = purchase.items.find(i => i.productVariantId === line.productVariantId || i.id === line.itemId);
            if (!poItem) continue;

            const recQty = parseInt(line.receiveQty) || 0;
            const accQty = parseInt(line.acceptQty !== undefined ? line.acceptQty : recQty) || 0;
            const rejQty = parseInt(line.rejectQty) || 0;
            const damQty = parseInt(line.damageQty) || 0;

            if (recQty <= 0) continue;

            // Validation: accept + reject + damage cannot exceed receiveQty
            if (accQty + rejQty + damQty !== recQty) {
                return {
                    success: false,
                    message: `For ${poItem.productName}, Accepted (${accQty}) + Rejected (${rejQty}) + Damaged (${damQty}) must equal Received Quantity (${recQty}).`
                };
            }

            const rack = line.rack || 'Rack A';
            const shelf = line.shelf || 'Shelf A1';
            const bin = line.bin || 'Bin A1-01';
            const storagePath = `${warehouseName} > ${rack} > ${shelf} > ${bin}`;

            // 1. UPDATE AVAILABLE STOCK ONLY FOR ACCEPTED & STORED QUANTITY
            if (accQty > 0) {
                await stockMovementService.recordStockIn({
                    productVariantId: poItem.productVariantId,
                    quantity: accQty,
                    referenceId: grnNumber,
                    reason: `GRN Intake: ${grnNumber} (PO: ${purchase.purchaseNumber})`,
                    notes: `Quality Accepted. Stored in ${storagePath}`,
                    user: user
                });
                totalAcceptedInBatch += accQty;
            }

            // 2. ISOLATE DAMAGED / REJECTED GOODS (Do not add to saleable stock)
            if (damQty > 0 || rejQty > 0) {
                totalDamagedInBatch += damQty;
                totalRejectedInBatch += rejQty;
                // Log quarantined movement record without adding to saleable balance
                const quarantinedLocation = `Damage & Quarantine Depot > Bay Q1 > Bin Q-Hold`;
                stockMovementService.addMovement({
                    date: dateStr,
                    time: timeStr,
                    productVariantId: poItem.productVariantId,
                    productName: poItem.productName,
                    variantName: poItem.variantName,
                    quantity: damQty + rejQty,
                    movementType: 'Damage / Quality Rejection',
                    referenceNumber: grnNumber,
                    fromLocation: `Supplier (${purchase.supplierName})`,
                    toLocation: quarantinedLocation,
                    user: user,
                    remarks: `Damaged: ${damQty} pcs | Rejected: ${rejQty} pcs (Quarantined, not saleable)`
                });
            }

            // 3. Update PO Item received tally
            poItem.receivedQuantity = (poItem.receivedQuantity || 0) + accQty;
            const remaining = Math.max(0, poItem.quantity - poItem.receivedQuantity);

            grnItemLogs.push({
                productVariantId: poItem.productVariantId,
                productName: poItem.productName,
                variantName: poItem.variantName,
                size: poItem.size,
                color: poItem.color,
                qrCode: poItem.sku ? `QR-${poItem.sku}` : `QR-LOT-${poItem.productVariantId}`,
                orderedQuantity: poItem.quantity,
                receivedQuantity: recQty,
                acceptedQuantity: accQty,
                rejectedQuantity: rejQty,
                damagedQuantity: damQty,
                pendingQuantity: remaining,
                storageLocation: storagePath,
                qualityNotes: line.notes || (rejQty > 0 ? 'Partial rejections quarantined' : '100% Quality Inspection Passed')
            });
        }

        if (grnItemLogs.length === 0) {
            return { success: false, message: 'Please enter at least one item quantity to receive.' };
        }

        // Determine Quality Status
        let qualityStatus = 'Accepted';
        if (totalRejectedInBatch > 0 || totalDamagedInBatch > 0) {
            qualityStatus = totalAcceptedInBatch > 0 ? 'Partially Accepted' : 'Rejected';
        }

        // 4. Save GRN Record
        const newGRN = {
            id: 'grn_' + Date.now(),
            grnNumber: grnNumber,
            poNumber: purchase.purchaseNumber,
            purchaseId: purchase.id,
            supplierName: purchase.supplierName,
            invoiceNumber: invoiceNumber || 'INV-PENDING',
            invoiceDate: invoiceDate || dateStr,
            lrNumber: lrNumber || purchase.shipment?.lrNumber || '—',
            transporter: transporter || purchase.shipment?.transportName || 'Direct Logistics',
            receivedBy: receivedBy || `${user} (Warehouse Manager)`,
            grnDate: dateStr,
            financialYear: financialYear,
            grnTime: timeStr,
            warehouseName: warehouseName,
            qualityStatus: qualityStatus,
            totalAccepted: totalAcceptedInBatch,
            totalRejected: totalRejectedInBatch,
            totalDamaged: totalDamagedInBatch,
            notes: `Inspected and placed in designated warehouse storage locations.`,
            items: grnItemLogs
        };

        allGRNs.unshift(newGRN);
        localStorage.setItem(WORKFLOW_STORAGE_KEYS.GRN_RECORDS, JSON.stringify(allGRNs));

        // 5. Update PO Status
        const totalOrdered = purchase.items.reduce((acc, i) => acc + (i.quantity || 0), 0);
        const totalReceived = purchase.items.reduce((acc, i) => acc + (i.receivedQuantity || 0), 0);
        purchase.totalReceivedQuantity = totalReceived;

        if (totalReceived >= totalOrdered) {
            purchase.status = 'Fully Received';
            purchase.shipmentStatus = 'Delivered';
        } else if (totalReceived > 0) {
            purchase.status = 'Partially Received';
            purchase.shipmentStatus = 'Partially Received';
        }

        purchaseStore.set(PURCHASE_STORAGE_KEYS.PURCHASES, purchases);

        return {
            success: true,
            message: `GRN ${grnNumber} generated successfully. ${totalAcceptedInBatch} accepted units added to inventory stock in ${warehouseName}.`,
            grn: newGRN
        };
    }

    // =========================================================================
    // 3. STORAGE LOCATIONS MASTER (Warehouse -> Rack -> Shelf -> Bin)
    // =========================================================================

    getStorageLocations() {
        return JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEYS.STORAGE_LOCATIONS) || '[]');
    }

    addStorageLocation({ warehouse, rack, shelf, bin, capacity = 200 }) {
        const list = this.getStorageLocations();
        const newLoc = {
            id: 'loc_' + Date.now(),
            warehouse,
            rack,
            shelf,
            bin,
            capacity: Number(capacity) || 200,
            active: true
        };
        list.push(newLoc);
        localStorage.setItem(WORKFLOW_STORAGE_KEYS.STORAGE_LOCATIONS, JSON.stringify(list));
        return { success: true, location: newLoc };
    }
}

export const purchaseWorkflowService = new PurchaseWorkflowService();
