# CLOTHERP — Complete Clothing Business ERP

> **"Everything Your Clothing Business Needs. In One Place."**

CLOTHERP is a dedicated commercial Business Management ERP built specifically for apparel retail, wholesale, and garment distribution enterprises. It features apparel variant matrices (sizes, colors, SKUs), variant-level inventory stock control ($Product \times Color \times Size \times Quantity$), stock movement audit ledgers, supplier management, multi-variant purchase orders, customer management, sales order lifecycle workflows, GST tax invoicing (CGST/SGST & IGST), printable invoices, live order tracking timelines, freight shipment LR tracking, goods receiving (GRN) with automated stock intake, sales returns, product exchanges, supplier purchase returns, and categorized business reports with real data visualization.

---

## 📁 Project Structure

```
d:/ClothERP/
│
├── index.html                   # Phase 1 Master Landing Page (All 14 Sections)
├── login.html                   # Phase 2 Premium Login Page (1-Click Demo Selector)
├── forgot-password.html         # Phase 2 Password Recovery Request UI
├── reset-password.html          # Phase 2 Set New Password UI
├── access-denied.html           # Phase 2 HTTP 403 Forbidden Access Restricted Page
├── dashboard.html               # Phase 3 Main Authenticated ERP Dashboard & Shell
├── protected-demo.html          # Phase 2 RBAC Verification & Profile Test Screen
│
├── categories.html              # Phase 4 Product Categories Master
├── brands.html                  # Phase 4 Product Brands Master
├── colors.html                  # Phase 4 Color Master (Hex picker sync, Color swatches)
├── sizes.html                   # Phase 4 Size Master (Clothing/Numeric types, Display ordering)
├── products.html                # Phase 4 All Products Listing (KPI cards, Search, Filters)
├── add-product.html             # Phase 4 Multi-section Add Product & Matrix Variant Builder
├── edit-product.html            # Phase 4 Edit Product Form & Variant Management
├── product-details.html         # Phase 4 Tabbed Product Details (Live Variant Stock & Ledger link)
│
├── inventory.html               # Phase 5 Variant-Level Inventory Dashboard & KPI Metrics
├── inventory-details.html       # Phase 5 Variant Stock Ledger & Movement History
├── opening-stock.html           # Phase 5 Initial Opening Stock Setup Form
├── stock-in.html                # Phase 5 Stock IN Manual Inbound Receipt Form
├── stock-out.html               # Phase 5 Stock OUT Removal Form (Negative Stock Prevention)
├── stock-adjustment.html        # Phase 5 Stock Adjustment (Increase/Decrease) & Modal Review
├── stock-movements.html         # Phase 5 Master Stock Movements Audit Trail & Filters
├── low-stock.html               # Phase 5 Dedicated Low Stock & Depletion Alerts Monitor
│
├── suppliers.html               # Phase 6 Supplier Directory & Modal Form
├── supplier-details.html        # Phase 6 Supplier Profile, Terms, & Historical Purchase Ledger
├── purchases.html               # Phase 6 Main Purchase Orders Listing & KPI Summary
├── create-purchase.html         # Phase 6 Multi-section PO Builder & Variant Matrix Selector
├── purchase-details.html        # Phase 6 Tabbed PO Details (GST Invoice, Payments, Shipments)
├── receive-purchase.html        # Phase 6 Inbound Goods Receiving & Auto Inventory Stock IN
├── purchase-shipments.html      # Phase 6 Freight Consignments & LR Documents List
├── purchase-shipment-tracking.html # Phase 6 Interactive Shipment Tracking Timeline
│
├── customers.html               # Phase 7 Customer Directory & CRM Modal Form
├── customer-details.html        # Phase 7 Customer Profile, Addresses, Terms, & Sales Ledger
├── sales.html                   # Phase 7 Main Sales Orders Listing & KPI Summary Cards
├── create-sale.html             # Phase 7 Multi-section Sale Builder & Live Stock Checks
├── sale-details.html            # Phase 7 Tabbed Sale Order Viewer, Tax Breakdown & Printable Invoice
├── customer-tracking.html       # Phase 7 Order Status Tracking Page & Checkpoint Timeline
│
├── returns.html                 # Phase 8 Sales Returns Hub & KPI Summary Cards
├── create-return.html           # Phase 8 Sales Return Request Builder (Returnable Limit Checks)
├── return-details.html          # Phase 8 Tabbed Sales Return Viewer, Inspection & Credit Notes
├── refund-return.html           # Phase 8 Refund Disbursal & Credit Note Generation Screen
├── exchanges.html               # Phase 8 Product Exchanges Hub & Summary Cards
├── create-exchange.html         # Phase 8 Exchange Builder (Price Difference Calculation)
├── exchange-details.html        # Phase 8 Tabbed Exchange Details & Dual Inventory Audit
├── purchase-returns.html        # Phase 8 Purchase Returns to Supplier Listing
├── create-purchase-return.html  # Phase 8 Purchase Return Builder (PO Limits & LR Details)
├── purchase-return-details.html # Phase 8 Purchase Return Details & Debit Note Document
│
├── analytics-dashboard.html     # Phase 9 Executive Business Intelligence Analytics Dashboard
├── reports.html                 # Phase 9 Enterprise Reports Hub & Categorized Directory
├── sales-report.html            # Phase 9 Detailed Sales & Variant-Level Performance Report
├── purchase-report.html         # Phase 9 Procurement & Supplier Volume Report
├── inventory-report.html        # Phase 9 Cost-Basis Inventory Valuation & Low Stock Report
├── gst-report.html              # Phase 9 GST Tax Output, Input Tax Credits & Reversals Report
├── customer-report.html         # Phase 9 Customer CRM & Outstanding Receivables Ledger
├── returns-report.html          # Phase 9 Returns, Defect Reasons & Refund Disbursals Report
│
├── notifications.html           # Phase 10 Notification History & Archive Hub
├── notification-settings.html   # Phase 10 Notification Preferences & Alert Rules Configuration
│
├── branches.html                # Phase 12 Branch Master Hub & Operational Nodes
├── warehouses.html              # Phase 12 Warehouse Master Hub & Storage Depots
├── transfers.html               # Phase 12 Stock Transfers Listing & In-Transit Dashboard
├── create-transfer.html         # Phase 12 Stock Transfer Builder (Live Stock Checks)
├── transfer-details.html        # Phase 12 Stock Transfer Details, Dispatch & Receiving
│
├── ClothERP.csproj              # ASP.NET Core Project targeting .NET 10
├── Program.cs                   # ASP.NET Core Host serving static files & default pages
│
├── assets/
│   ├── css/
│   │   └── style.css            # Custom theme tokens, fabric weave patterns & layout styles
│   │
│   ├── js/
│   │   ├── config/
│   │   │   └── permissions.js   # Centralized Role & Permission definitions (Phases 2-12)
│   │   ├── services/
│   │   │   ├── authService.js   # Auth & Session handling
│   │   │   ├── dashboardService.js # Dashboard Data Layer & live sales/purchase/inventory metrics
│   │   │   ├── productStore.js  # Phase 4 Centralized Persistent Product Store
│   │   │   ├── productService.js# Phase 4 Product & Variant Service & SKU Generator
│   │   │   ├── inventoryStore.js# Phase 5 Persistent Inventory & Movements Data Store
│   │   │   ├── inventoryService.js # Phase 5 Variant Stock Balance & Calculation Service
│   │   │   ├── stockMovementService.js # Phase 5 Stock Movement Audit Trail Engine
│   │   │   ├── taxService.js    # Phase 6 GST Calculation Engine (Intra/Inter-State Tax)
│   │   │   ├── supplierStore.js # Phase 6 Persistent Supplier Store
│   │   │   ├── supplierService.js # Phase 6 Supplier CRUD & Payables Service
│   │   │   ├── purchaseStore.js # Phase 6 Persistent Purchase Orders & Consignments Store
│   │   │   ├── purchaseService.js # Phase 6 Purchase Orders Lifecycle & Payments Service
│   │   │   ├── purchaseReceivingService.js # Phase 6 GRN Goods Intake & Stock IN Engine
│   │   │   ├── customerStore.js # Phase 7 Persistent Customer Store
│   │   │   ├── customerService.js # Phase 7 Customer CRM & Receivables Service
│   │   │   ├── salesStore.js    # Phase 7 Persistent Sales Orders, Invoices & Tracking Store
│   │   │   ├── salesService.js  # Phase 7 Sales Lifecycle & Payment Management Service
│   │   │   ├── salesInventoryIntegrationService.js # Phase 7 Stock OUT on Confirmation Engine
│   │   │   ├── returnStore.js   # Phase 8 Persistent Sales Returns, Refunds & Credit Notes Store
│   │   │   ├── salesReturnService.js # Phase 8 Sales Returns, Inspection & Refund Service
│   │   │   ├── exchangeStore.js # Phase 8 Persistent Exchanges Store
│   │   │   ├── exchangeService.js # Phase 8 Exchange Management & Price Difference Service
│   │   │   ├── purchaseReturnStore.js # Phase 8 Persistent Purchase Returns & Debit Notes Store
│   │   │   ├── purchaseReturnService.js # Phase 8 Purchase Returns & Dispatch Stock OUT Service
│   │   │   ├── reporting/
│   │   │   │   ├── reportFilterService.js # Phase 9 Date Range Normalizer & Filter Service
│   │   │   │   ├── reportExportService.js # Phase 9 CSV Generator & Print Layout Trigger
│   │   │   │   └── reportingService.js    # Phase 9 Single Source of Truth BI & Analytics Layer
│   │   │   ├── notificationStore.js       # Phase 10 Persistent Notifications & Alert State Store
│   │   │   ├── notificationService.js     # Phase 10 Smart Alert Rules Engine & Preference Manager
│   │   │   ├── branchStore.js             # Phase 12 Persistent Branch Store
│   │   │   ├── branchService.js           # Phase 12 Branch Master CRUD & Hierarchy
│   │   │   ├── warehouseStore.js          # Phase 12 Persistent Warehouse Store
│   │   │   ├── warehouseService.js        # Phase 12 Warehouse Master CRUD & Associations
│   │   │   ├── locationService.js         # Phase 12 Location Balances & Idempotent Migration Engine
│   │   │   ├── transferStore.js           # Phase 12 Persistent Stock Transfer Store
│   │   │   └── stockTransferService.js    # Phase 12 Transfer Lifecycle, In-Transit & Receipt Engine
│   │   ├── components/
│   │   │   ├── sidebar.js       # Role-Aware Navigation Sidebar & Mobile Drawer
│   │   │   ├── topbar.js        # Search Bar, Date, Breadcrumb & Header Shell
│   │   │   ├── notifications.js # Phase 10 Live Smart Alerts Dropdown & Badge Counter
│   │   │   └── profileMenu.js   # Reusable Profile Dropdown & Logout Modal
│   │   ├── utils/
│   │   │   └── authGuard.js     # Route protection & redirection helpers
│   │   ├── dashboard.js         # Master Dashboard Controller & Chart Renderers
│   │   └── main.js              # Phase 1 Interactive Landing Page Features
│   │
│   └── images/
│
└── README.md                    # Documentation, credentials, and testing guide
```

---

## 👥 Development Demo Credentials

| Role | Username / Email | Password | Allowed Navigation Scope |
|---|---|---|---|
| **Administrator** | `admin@clotherp.local` (`admin`) | `Admin@123` | **Full Access** across all ERP modules, masters, branches, warehouses, stock transfers, products, inventory, suppliers, purchases, customers, sales, returns, exchanges, debit/credit notes, analytics, reports & smart alert rules |
| **Store Manager** | `manager@clotherp.local` (`manager`) | `Manager@123` | **Operations Oversight**: Manage Branches, Warehouses, Stock Transfers (Approve/Receive), Stock Adjustments, Purchases, Suppliers, Sales, Returns & Inspections, Exchanges, Full Reports Suite |
| **Sales Staff** | `sales@clotherp.local` (`sales`) | `Sales@123` | **Sales, CRM & Returns**: Manage Customers, Sales Orders, Credit Notes, Sales Reports, Relevant Sales & Return Notifications |
| **Purchase Staff** | `purchase@clotherp.local` (`purchase`) | `Purchase@123` | **Procurement & Logistics**: Supplier CRM, Purchase Orders, Goods Receiving, Stock Transfers (Create/Receive), Purchase Returns |

---

## 🏢 Phase 12 Multi-Branch, Warehouse & Stock Transfers

### 1. Hierarchy & Location Topology
- **Branch Master** (`branches.html`): Manage corporate head offices, regional distribution centers, and retail outlets with full address, GSTIN, and manager assignment.
- **Warehouse Master** (`warehouses.html`): Storage depots categorized by operational types (Main Distribution, Finished Goods, Retail Backrooms, and Return Quarantine Bays).
- **Idempotent Stock Migration (`clotherp_location_migration_v1`)**: Safely maps existing global inventory to `Central Apparel Warehouse (WH-001)` without duplicating company inventory totals.

### 2. Stock Transfer Consignment Engine (`assets/js/services/stockTransferService.js`)
- **Lifecycle Workflow**: `Draft` $\rightarrow$ `Submitted` $\rightarrow$ `Approved` $\rightarrow$ `Dispatched` (`TRANSFER_OUT` from source warehouse) $\rightarrow$ `In Transit` $\rightarrow$ `Partially Received` / `Received` (`TRANSFER_IN` into destination warehouse).
- **Validation**: Enforces non-identical origin/destination, checks real-time available stock in origin depot, and prevents negative balances.
- **Partial Receipts**: Dispatches 100 pcs, receives 60 pcs today (40 pcs remain in-transit), subsequent receipt of 40 pcs marks transfer as completed (`Received`).
- **Freight Tracking**: Integrated transporter details, LR docket numbers, and vehicle registration.
- **Notification Integration**: Triggers automated notifications on dispatch and delivery.

---

## 🔌 Future ASP.NET Core API Endpoints

- `GET /api/branches`
- `POST /api/branches`
- `GET /api/warehouses`
- `POST /api/warehouses`
- `GET /api/inventory/by-location`
- `GET /api/stock-transfers`
- `POST /api/stock-transfers`
- `POST /api/stock-transfers/{id}/approve`
- `POST /api/stock-transfers/{id}/dispatch`
- `POST /api/stock-transfers/{id}/receive`
- `POST /api/stock-transfers/{id}/cancel`

---

## 🏭 Phase 13: Manufacturing, Production & Job Work Management

- **Bill of Materials (BOM) Master**: Garment recipe formulation, cutting wastage % allowances, and versioning snapshots (`BOM-2026-00001` v1.0).
- **Production Orders & MRP Planning**: Batch scaling, raw material availability checks against storage warehouse, material issue to WIP via `PRODUCTION_MATERIAL_ISSUE`.
- **Factory Stage & Matrix Execution**: Cutting (with Size $\times$ Color breakdown), Stitching, Washing & Finishing, and Quality Inspection.
- **Finished Goods Intake**: Quality acceptance gating $\rightarrow$ Auto credit to finished goods warehouse via `PRODUCTION_RECEIPT` (`PGR-2026-00001`).
- **Job Worker Outsourcing**: Outsource directory (Mehta Embroidery, Kalamkari Screen Printers, Shreeji Stitchers), piece-rate charges, material custody tracking, and partial receiving.

### Key Routes in Phase 13:
- 👉 **[http://localhost:5000/manufacturing.html](http://localhost:5000/manufacturing.html)** (Manufacturing Operations Hub)
- 👉 **[http://localhost:5000/boms.html](http://localhost:5000/boms.html)** (Bill of Materials Master)
- 👉 **[http://localhost:5000/create-bom.html](http://localhost:5000/create-bom.html)** (Create BOM Recipe)
- 👉 **[http://localhost:5000/production-orders.html](http://localhost:5000/production-orders.html)** (Production Orders)
- 👉 **[http://localhost:5000/create-production.html](http://localhost:5000/create-production.html)** (Plan Batch & MRP Calculation)
- 👉 **[http://localhost:5000/production-details.html](http://localhost:5000/production-details.html)** (Production Execution & Finished Goods Intake)
- 👉 **[http://localhost:5000/job-workers.html](http://localhost:5000/job-workers.html)** (Job Workers Directory)
- 👉 **[http://localhost:5000/job-orders.html](http://localhost:5000/job-orders.html)** (Job Work Orders)
- 👉 **[http://localhost:5000/create-job-order.html](http://localhost:5000/create-job-order.html)** (Issue Job Work Order)
- 👉 **[http://localhost:5000/job-order-details.html](http://localhost:5000/job-order-details.html)** (Job Work Receiving & Tracking)

---

## 💰 Phase 14: Accounting, Ledger, Credit & Financial Management

- **Chart of Accounts (COA)**: Standard general ledger accounts categorized by Asset, Liability, Equity, Revenue, and Expense with system account protection.
- **Double-Entry Journal Postings**: Strict $\sum \text{Debit} = \sum \text{Credit}$ balancing enforcement, audit vouchers, and immutability of posted transactions.
- **Customer & Supplier Ledgers**: Live running balance statements, credit limit gauges with warning thresholds, and payment allocation settlement.
- **Receivables & Payables Aging**: 5-bucket aging analysis (`Current`, `1-30 Days`, `31-60 Days`, `61-90 Days`, `90+ Days`) with overdue alerts.
- **Cash & Bank Management**: Drawers and bank accounts with internal fund transfers (e.g. Cash Deposit to Bank).
- **Financial Statements**: Real-time **Trial Balance**, **Profit & Loss Statement**, and **Balance Sheet**.

### Key Routes in Phase 14:
- 👉 **[http://localhost:5000/accounting.html](http://localhost:5000/accounting.html)** (Financial Operations Hub)
- 👉 **[http://localhost:5000/chart-of-accounts.html](http://localhost:5000/chart-of-accounts.html)** (Chart of Accounts Master)
- 👉 **[http://localhost:5000/journal-entries.html](http://localhost:5000/journal-entries.html)** (Double-Entry Journal Vouchers)
- 👉 **[http://localhost:5000/customer-ledger.html](http://localhost:5000/customer-ledger.html)** (Customer Financial Statement)
- 👉 **[http://localhost:5000/supplier-ledger.html](http://localhost:5000/supplier-ledger.html)** (Supplier Payables Ledger)
- 👉 **[http://localhost:5000/receivables.html](http://localhost:5000/receivables.html)** (Customer Receivables & Aging)
- 👉 **[http://localhost:5000/payables.html](http://localhost:5000/payables.html)** (Supplier Payables & Aging)
- 👉 **[http://localhost:5000/cash-bank.html](http://localhost:5000/cash-bank.html)** (Cash & Bank Accounts)
- 👉 **[http://localhost:5000/expenses.html](http://localhost:5000/expenses.html)** (Operating Expense Vouchers)
- 👉 **[http://localhost:5000/financial-reports.html](http://localhost:5000/financial-reports.html)** (Financial Statements: Trial Balance, P&L, Balance Sheet)

---

## 🤝 Phase 15: CRM, Customer Communication & Sales Automation

- **Lead Management & Duplicate Detection**: Inbound lead capturing with duplicate checking against phone/email/company in both leads and active customer records.
- **Safe Lead-to-Customer Conversion**: 1-click conversion into the unified Customer master without data fragmentation.
- **Visual Kanban Sales Pipeline**: 6-stage deal tracker with win probability and weighted expected revenue forecasting.
- **Follow-up Reminders & Outcomes**: Scheduler for calls, meetings, WhatsApp touchpoints with outcome recording (`INTERESTED`, `ORDER_CONFIRMED`, `CALL_BACK`).
- **Multi-Channel Communications Hub**: Provider-agnostic WhatsApp, SMS, and Email logging with safe dynamic variable templates (`{{customerName}}`, `{{invoiceAmount}}`).
- **Support Tickets & Helpdesk**: Customer complaint tickets categorized by quality, packaging, and logistics with resolution logs.
- **Customer Feedback & CSAT/NPS**: Star ratings, testimonials, and verified buyer reviews.
- **Salesperson Performance Analytics**: Leaderboard, acquisition channel breakdowns, and deal velocity metrics.

### Key Routes in Phase 15:
- 👉 **[http://localhost:5000/crm.html](http://localhost:5000/crm.html)** (CRM Operations Hub)
- 👉 **[http://localhost:5000/leads.html](http://localhost:5000/leads.html)** (Leads Directory & Conversion)
- 👉 **[http://localhost:5000/pipeline.html](http://localhost:5000/pipeline.html)** (Visual Sales Pipeline Kanban)
- 👉 **[http://localhost:5000/follow-ups.html](http://localhost:5000/follow-ups.html)** (Follow-ups & Call Scheduler)
- 👉 **[http://localhost:5000/communications.html](http://localhost:5000/communications.html)** (Multi-Channel Communications)
- 👉 **[http://localhost:5000/communication-templates.html](http://localhost:5000/communication-templates.html)** (Message Templates & Live Preview)
- 👉 **[http://localhost:5000/tickets.html](http://localhost:5000/tickets.html)** (Support Tickets & Complaints)
- 👉 **[http://localhost:5000/feedback.html](http://localhost:5000/feedback.html)** (Customer Feedback & NPS Ratings)
- 👉 **[http://localhost:5000/crm-reports.html](http://localhost:5000/crm-reports.html)** (CRM Analytics & Leaderboard)

---

## 🛡️ Phase 16: Advanced Admin, SaaS Architecture, Multi-Tenant & Subscription Control

- **Super Admin vs Company Admin Separation**: Clear operational hierarchy separating global platform monitoring from tenant-level business data.
- **Multi-Tenant Organization Directory**: Provision new client companies with stable tenant codes (`CLT-00001` through `CLT-00005`) and live status lifecycle (`ACTIVE`, `SUSPENDED`, `DISABLED`, `ARCHIVED`).
- **Subscription Tiers & Usage Limits**: Configurable Starter, Professional, and Enterprise plans with automated capacity meters for Active Users, Branch Nodes, and Warehouses.
- **Platform Module Master**: Dependency engine across all 12 platform ERP modules (e.g. Accounting requires Sales & Purchase; Manufacturing requires Inventory).
- **Platform Control & Security**: Maintenance Mode switch, system-wide broadcast announcements, and diagnostic security audit logs.
- **Tenant Subscription Hub**: Company Admin view of active plan, renewal countdown, and upgrade request triggers.

### Key Routes in Phase 16:
- 👉 **[http://localhost:5000/super-admin.html](http://localhost:5000/super-admin.html)** (SaaS Platform Super Admin Hub)
- 👉 **[http://localhost:5000/tenants.html](http://localhost:5000/tenants.html)** (Multi-Tenant Directory & Management)
- 👉 **[http://localhost:5000/tenant-details.html](http://localhost:5000/tenant-details.html)** (Tenant Console & Capacity Gauges)
- 👉 **[http://localhost:5000/subscription-plans.html](http://localhost:5000/subscription-plans.html)** (Subscription Plans Matrix)
- 👉 **[http://localhost:5000/modules.html](http://localhost:5000/modules.html)** (ERP Modules Master & Dependencies)
- 👉 **[http://localhost:5000/system-settings.html](http://localhost:5000/system-settings.html)** (Platform Configuration & Security)
- 👉 **[http://localhost:5000/announcements.html](http://localhost:5000/announcements.html)** (System Announcements Hub)
- 👉 **[http://localhost:5000/system-logs.html](http://localhost:5000/system-logs.html)** (System Diagnostic & Security Logs)
- 👉 **[http://localhost:5000/subscription.html](http://localhost:5000/subscription.html)** (Tenant Subscription & Plan Usage)

---

## 🚀 How to Run

Run directly with .NET:

```powershell
dotnet run
```

Then visit:
👉 **[http://localhost:5000](http://localhost:5000)** (Landing Page)  
👉 **[http://localhost:5000/login.html](http://localhost:5000/login.html)** (Login Page)  
👉 **[http://localhost:5000/super-admin.html](http://localhost:5000/super-admin.html)** (Platform Super Admin)  
👉 **[http://localhost:5000/tenants.html](http://localhost:5000/tenants.html)** (Tenants Directory)  
👉 **[http://localhost:5000/subscription-plans.html](http://localhost:5000/subscription-plans.html)** (Subscription Plans)  
👉 **[http://localhost:5000/subscription.html](http://localhost:5000/subscription.html)** (Tenant Subscription & Quotas)  
👉 **[http://localhost:5000/crm.html](http://localhost:5000/crm.html)** (CRM Operations Hub)  
👉 **[http://localhost:5000/accounting.html](http://localhost:5000/accounting.html)** (Financial Operations Hub)  
👉 **[http://localhost:5000/manufacturing.html](http://localhost:5000/manufacturing.html)** (Manufacturing Hub)  
👉 **[http://localhost:5000/analytics-dashboard.html](http://localhost:5000/analytics-dashboard.html)** (Executive BI Dashboard)




