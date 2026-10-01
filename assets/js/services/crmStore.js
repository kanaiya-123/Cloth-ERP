// CLOTHERP - Centralized Persistent CRM & Sales Automation Data Store
export const CRM_STORAGE_KEYS = {
    LEADS: 'clotherp_leads_db',
    LEAD_SOURCES: 'clotherp_lead_sources_db',
    OPPORTUNITIES: 'clotherp_opportunities_db',
    FOLLOWUPS: 'clotherp_followups_db',
    COMMUNICATIONS: 'clotherp_communications_db',
    COMMUNICATION_TEMPLATES: 'clotherp_communication_templates_db',
    TICKETS: 'clotherp_tickets_db',
    FEEDBACK: 'clotherp_feedback_db'
};

const SEED_LEAD_SOURCES = [
    { id: 'src_web', name: 'Website Inquiry', code: 'WEB' },
    { id: 'src_wa', name: 'WhatsApp Business', code: 'WHATSAPP' },
    { id: 'src_walk', name: 'Showroom Walk-in', code: 'WALKIN' },
    { id: 'src_fair', name: 'Textile Trade Fair', code: 'FAIR' },
    { id: 'src_ref', name: 'Client Referral', code: 'REFERRAL' },
    { id: 'src_insta', name: 'Instagram DM / Ad', code: 'INSTAGRAM' }
];

const SEED_LEADS = [
    {
        id: 'LEAD-000001',
        leadNumber: 'LEAD-2026-00001',
        companyName: 'Surat Silk & Sarees Plaza',
        contactPerson: 'Harshil Vora',
        phone: '+91 98250 88712',
        whatsappNumber: '+91 98250 88712',
        email: 'harshil@suratsilk.example.com',
        city: 'Surat',
        state: 'Gujarat',
        leadSource: 'Textile Trade Fair',
        productInterest: 'Festive Kurtis & Women Ethnic',
        estimatedQuantity: 250,
        estimatedValue: 220000,
        assignedTo: 'Sales Staff',
        status: 'QUALIFIED',
        priority: 'HIGH',
        nextFollowUpDate: '2026-08-30',
        notes: 'Met at Garment Expo Surat. Interested in catalog for Diwali batch.',
        createdAt: '2026-08-20T10:00:00Z',
        updatedAt: '2026-08-25T11:30:00Z'
    },
    {
        id: 'LEAD-000002',
        leadNumber: 'LEAD-2026-00002',
        companyName: 'Elite Menswear Mumbai',
        contactPerson: 'Sanjay Deshmukh',
        phone: '+91 98201 44552',
        whatsappNumber: '+91 98201 44552',
        email: 'sanjay@elitemenswear.example.com',
        city: 'Mumbai',
        state: 'Maharashtra',
        leadSource: 'WhatsApp Business',
        productInterest: "Men's Cotton Oxford Shirts",
        estimatedQuantity: 500,
        estimatedValue: 350000,
        assignedTo: 'Sales Staff',
        status: 'PROPOSAL_SENT',
        priority: 'URGENT',
        nextFollowUpDate: '2026-08-29',
        notes: 'Sent quotation QTN-2026-00001 for 500 pcs blue & white shirts. Follow up on terms.',
        createdAt: '2026-08-22T14:15:00Z',
        updatedAt: '2026-08-26T09:00:00Z'
    },
    {
        id: 'LEAD-000003',
        leadNumber: 'LEAD-2026-00003',
        companyName: 'Ahmedabad Retail Mart',
        contactPerson: 'Bhavin Patel',
        phone: '+91 79 4991 2233',
        whatsappNumber: '+91 79 4991 2233',
        email: 'bhavin@ahmretail.example.com',
        city: 'Ahmedabad',
        state: 'Gujarat',
        leadSource: 'Website Inquiry',
        productInterest: 'Round Neck Casual T-Shirts',
        estimatedQuantity: 100,
        estimatedValue: 45000,
        assignedTo: 'Sales Staff',
        status: 'NEW',
        priority: 'MEDIUM',
        nextFollowUpDate: '2026-08-31',
        notes: 'Inquired through contact form on website for plain tees.',
        createdAt: '2026-08-26T16:00:00Z',
        updatedAt: '2026-08-26T16:00:00Z'
    }
];

const SEED_OPPORTUNITIES = [
    {
        id: 'OPP-000001',
        opportunityNumber: 'OPP-2026-00001',
        name: 'Elite Menswear - 500 Pcs Shirt Bulk Order',
        leadId: 'LEAD-000002',
        accountName: 'Elite Menswear Mumbai',
        contactPerson: 'Sanjay Deshmukh',
        stage: 'QUOTATION',
        probability: 50,
        estimatedValue: 350000,
        weightedValue: 175000,
        expectedClosingDate: '2026-09-05',
        assignedTo: 'Sales Staff',
        notes: 'Negotiating 30 days credit terms.'
    },
    {
        id: 'OPP-000002',
        opportunityNumber: 'OPP-2026-00002',
        name: 'Surat Silk - Festive Kurti Launch Batch',
        leadId: 'LEAD-000001',
        accountName: 'Surat Silk & Sarees Plaza',
        contactPerson: 'Harshil Vora',
        stage: 'QUALIFIED',
        probability: 25,
        estimatedValue: 220000,
        weightedValue: 55000,
        expectedClosingDate: '2026-09-15',
        assignedTo: 'Sales Staff',
        notes: 'Reviewing physical fabric swatches.'
    },
    {
        id: 'OPP-000003',
        opportunityNumber: 'OPP-2026-00003',
        name: 'Royal Boutique - Winter Denim Jackets',
        leadId: null,
        accountName: 'Royal Fashion Boutique',
        contactPerson: 'Anjali Sharma',
        stage: 'NEGOTIATION',
        probability: 75,
        estimatedValue: 180000,
        weightedValue: 135000,
        expectedClosingDate: '2026-08-31',
        assignedTo: 'Sales Staff',
        notes: 'Final price revision sent.'
    },
    {
        id: 'OPP-000004',
        opportunityNumber: 'OPP-2026-00004',
        name: 'Vibrant Threads - Repeat Linen Trousers',
        leadId: null,
        accountName: 'Vibrant Threads Wholesale',
        contactPerson: 'Karan Mehra',
        stage: 'WON',
        probability: 100,
        estimatedValue: 420000,
        weightedValue: 420000,
        expectedClosingDate: '2026-08-20',
        assignedTo: 'Sales Staff',
        notes: 'Deal closed & SO-2026-00001 generated.'
    }
];

const SEED_FOLLOWUPS = [
    {
        id: 'FLW-000001',
        relatedType: 'LEAD',
        relatedId: 'LEAD-000002',
        relatedName: 'Elite Menswear Mumbai',
        assignedTo: 'Sales Staff',
        type: 'PHONE_CALL',
        scheduledDate: '2026-08-29',
        status: 'SCHEDULED',
        outcome: null,
        notes: 'Call Sanjay to discuss quotation payment terms & batch delivery timeline.',
        createdBy: 'Admin'
    },
    {
        id: 'FLW-000002',
        relatedType: 'CUSTOMER',
        relatedId: 'cust_201',
        relatedName: 'Royal Fashion Boutique',
        assignedTo: 'Sales Staff',
        type: 'WHATSAPP',
        scheduledDate: '2026-08-29',
        status: 'SCHEDULED',
        outcome: null,
        notes: 'WhatsApp Anjali for confirmation on winter jacket sizing matrix.',
        createdBy: 'Admin'
    },
    {
        id: 'FLW-000003',
        relatedType: 'LEAD',
        relatedId: 'LEAD-000001',
        relatedName: 'Surat Silk & Sarees Plaza',
        assignedTo: 'Sales Staff',
        type: 'MEETING',
        scheduledDate: '2026-08-24',
        status: 'COMPLETED',
        outcome: 'INTERESTED',
        notes: 'Showroom sample demo given. Client requested custom latkan tassels.',
        createdBy: 'Sales Staff'
    }
];

const SEED_TEMPLATES = [
    {
        id: 'tpl_wa_inv',
        name: 'WhatsApp Invoice Due Reminder',
        channel: 'WHATSAPP',
        subject: '',
        body: 'Dear {{customerName}}, your payment of ₹{{invoiceAmount}} for invoice #{{invoiceNumber}} is due on {{dueDate}}. Kindly arrange remittance. Thank you, {{companyName}}.',
        category: 'Finance'
    },
    {
        id: 'tpl_wa_dispatch',
        name: 'WhatsApp Shipment Dispatch Alert',
        channel: 'WHATSAPP',
        subject: '',
        body: 'Hello {{customerName}}, your garment order has been dispatched via {{transporterName}} (LR: {{lrNumber}}). Expected delivery: {{deliveryDate}}. Team {{companyName}}.',
        category: 'Logistics'
    },
    {
        id: 'tpl_em_quote',
        name: 'Email Quotation Proposal',
        channel: 'EMAIL',
        subject: 'Quotation #{{quotationNumber}} for Garment Batch from {{companyName}}',
        body: 'Dear {{contactPerson}},\n\nThank you for your interest in {{companyName}}. Please find attached our detailed commercial proposal #{{quotationNumber}} for your review.\n\nWarm regards,\n{{salespersonName}}',
        category: 'Sales'
    }
];

const SEED_COMMUNICATIONS = [
    {
        id: 'COMM-000001',
        channel: 'WHATSAPP',
        recipientName: 'Sanjay Deshmukh',
        recipientPhone: '+91 98201 44552',
        templateName: 'Email Quotation Proposal',
        messageSummary: 'Quotation QTN-2026-00001 sent for 500 pcs Cotton Oxford Shirts.',
        status: 'DELIVERED',
        sentAt: '2026-08-22 14:30',
        sentBy: 'Sales Staff'
    },
    {
        id: 'COMM-000002',
        channel: 'EMAIL',
        recipientName: 'Anjali Sharma',
        recipientPhone: 'royalfashion.mum@example.com',
        templateName: 'WhatsApp Invoice Due Reminder',
        messageSummary: 'Invoice due reminder for INV-2026-00001 (₹52,500).',
        status: 'READ',
        sentAt: '2026-08-25 11:00',
        sentBy: 'Admin'
    }
];

const SEED_TICKETS = [
    {
        id: 'TKT-000001',
        ticketNumber: 'TKT-2026-00001',
        customerName: 'Royal Fashion Boutique',
        subject: 'Packaging carton slight crush on arrival',
        category: 'Packaging',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        assignedTo: 'Support Team',
        createdAt: '2026-08-22 10:00 AM',
        resolvedAt: '2026-08-23 04:00 PM',
        resolution: 'Polybag protected garments undamaged. Transporter caution feedback recorded.'
    },
    {
        id: 'TKT-000002',
        ticketNumber: 'TKT-2026-00002',
        customerName: 'Vibrant Threads Wholesale',
        subject: 'Custom brand wash care satin tags alignment query',
        category: 'Quality',
        priority: 'HIGH',
        status: 'OPEN',
        assignedTo: 'QC Supervisor',
        createdAt: '2026-08-25 02:30 PM',
        resolvedAt: null,
        resolution: ''
    }
];

const SEED_FEEDBACK = [
    {
        id: 'FB-000001',
        customerName: 'Royal Fashion Boutique',
        orderNumber: 'SO-2026-00001',
        rating: 5,
        feedback: 'Fabric weave quality and stitching precision is top notch. Delivery on time.',
        date: '2026-08-20'
    },
    {
        id: 'FB-000002',
        customerName: 'Vibrant Threads Wholesale',
        orderNumber: 'SO-2026-00002',
        rating: 4,
        feedback: 'Great fabric hand-feel. Packaging outer boxes could be slightly thicker.',
        date: '2026-08-22'
    }
];

class CrmStore {
    constructor() {
        this._initStorage();
    }

    _initStorage() {
        if (!localStorage.getItem(CRM_STORAGE_KEYS.LEADS)) {
            localStorage.setItem(CRM_STORAGE_KEYS.LEADS, JSON.stringify(SEED_LEADS));
        }
        if (!localStorage.getItem(CRM_STORAGE_KEYS.LEAD_SOURCES)) {
            localStorage.setItem(CRM_STORAGE_KEYS.LEAD_SOURCES, JSON.stringify(SEED_LEAD_SOURCES));
        }
        if (!localStorage.getItem(CRM_STORAGE_KEYS.OPPORTUNITIES)) {
            localStorage.setItem(CRM_STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(SEED_OPPORTUNITIES));
        }
        if (!localStorage.getItem(CRM_STORAGE_KEYS.FOLLOWUPS)) {
            localStorage.setItem(CRM_STORAGE_KEYS.FOLLOWUPS, JSON.stringify(SEED_FOLLOWUPS));
        }
        if (!localStorage.getItem(CRM_STORAGE_KEYS.COMMUNICATION_TEMPLATES)) {
            localStorage.setItem(CRM_STORAGE_KEYS.COMMUNICATION_TEMPLATES, JSON.stringify(SEED_TEMPLATES));
        }
        if (!localStorage.getItem(CRM_STORAGE_KEYS.COMMUNICATIONS)) {
            localStorage.setItem(CRM_STORAGE_KEYS.COMMUNICATIONS, JSON.stringify(SEED_COMMUNICATIONS));
        }
        if (!localStorage.getItem(CRM_STORAGE_KEYS.TICKETS)) {
            localStorage.setItem(CRM_STORAGE_KEYS.TICKETS, JSON.stringify(SEED_TICKETS));
        }
        if (!localStorage.getItem(CRM_STORAGE_KEYS.FEEDBACK)) {
            localStorage.setItem(CRM_STORAGE_KEYS.FEEDBACK, JSON.stringify(SEED_FEEDBACK));
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`[CrmStore] Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[CrmStore] Error writing ${key}:`, e);
            return false;
        }
    }
}

export const crmStore = new CrmStore();
