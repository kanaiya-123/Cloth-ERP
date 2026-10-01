// CLOTHERP - Centralized CRM, Sales Automation & Communication Service
import { crmStore, CRM_STORAGE_KEYS } from './crmStore.js';
import { customerService } from './customerService.js';
import { notificationService } from './notificationService.js';

class CrmService {
    // ==================== LEADS MANAGEMENT ====================
    async getLeads({ search = '', status = '', priority = '', leadSource = '' } = {}) {
        await this._delay(60);
        let items = crmStore.get(CRM_STORAGE_KEYS.LEADS);

        if (status) items = items.filter(l => l.status === status);
        if (priority) items = items.filter(l => l.priority === priority);
        if (leadSource) items = items.filter(l => l.leadSource === leadSource);

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(l => 
                (l.companyName && l.companyName.toLowerCase().includes(q)) ||
                (l.contactPerson && l.contactPerson.toLowerCase().includes(q)) ||
                (l.leadNumber && l.leadNumber.toLowerCase().includes(q)) ||
                (l.phone && l.phone.includes(q))
            );
        }

        const all = crmStore.get(CRM_STORAGE_KEYS.LEADS);
        return {
            items,
            summary: {
                totalLeads: all.length,
                qualifiedCount: all.filter(l => l.status === 'QUALIFIED' || l.status === 'PROPOSAL_SENT').length,
                newCount: all.filter(l => l.status === 'NEW').length,
                totalEstValue: all.reduce((acc, l) => acc + (l.estimatedValue || 0), 0)
            }
        };
    }

    async checkDuplicateLead(phone, email, companyName) {
        const leads = crmStore.get(CRM_STORAGE_KEYS.LEADS);
        const customersRes = await customerService.getCustomers({ pageSize: 100 });
        const customers = customersRes.items || [];

        const cleanPhone = (phone || '').replace(/\D/g, '');
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanComp = (companyName || '').trim().toLowerCase();

        const matchLead = leads.find(l => 
            (cleanPhone && l.phone && l.phone.replace(/\D/g, '').includes(cleanPhone.slice(-8))) ||
            (cleanEmail && l.email && l.email.toLowerCase() === cleanEmail) ||
            (cleanComp && l.companyName && l.companyName.toLowerCase() === cleanComp)
        );

        const matchCustomer = customers.find(c => 
            (cleanPhone && c.mobile && c.mobile.replace(/\D/g, '').includes(cleanPhone.slice(-8))) ||
            (cleanEmail && c.email && c.email.toLowerCase() === cleanEmail) ||
            (cleanComp && c.name && c.name.toLowerCase() === cleanComp)
        );

        if (matchCustomer) {
            return { isDuplicate: true, type: 'CUSTOMER', record: matchCustomer, message: `Matched existing customer: ${matchCustomer.name}` };
        }
        if (matchLead) {
            return { isDuplicate: true, type: 'LEAD', record: matchLead, message: `Matched existing lead: ${matchLead.companyName} (${matchLead.leadNumber})` };
        }

        return { isDuplicate: false };
    }

    async createLead(data, userName = 'Admin') {
        const items = crmStore.get(CRM_STORAGE_KEYS.LEADS);
        const id = `LEAD-${String(items.length + 1).padStart(6, '0')}`;
        const leadNumber = `LEAD-${new Date().getFullYear()}-${String(items.length + 1).padStart(5, '0')}`;

        const newLead = {
            id,
            leadNumber,
            companyName: data.companyName.trim(),
            contactPerson: data.contactPerson ? data.contactPerson.trim() : data.companyName.trim(),
            phone: data.phone.trim(),
            whatsappNumber: data.whatsappNumber || data.phone.trim(),
            email: (data.email || '').trim(),
            city: data.city || 'Ahmedabad',
            state: data.state || 'Gujarat',
            leadSource: data.leadSource || 'Website Inquiry',
            productInterest: data.productInterest || "Men's Cotton Oxford Shirts",
            estimatedQuantity: parseInt(data.estimatedQuantity) || 100,
            estimatedValue: parseFloat(data.estimatedValue) || 50000,
            assignedTo: data.assignedTo || 'Sales Staff',
            status: data.status || 'NEW',
            priority: data.priority || 'MEDIUM',
            nextFollowUpDate: data.nextFollowUpDate || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userName
        };

        items.unshift(newLead);
        crmStore.set(CRM_STORAGE_KEYS.LEADS, items);

        // Auto schedule initial follow-up
        await this.scheduleFollowUp({
            relatedType: 'LEAD',
            relatedId: newLead.id,
            relatedName: newLead.companyName,
            assignedTo: newLead.assignedTo,
            type: 'PHONE_CALL',
            scheduledDate: newLead.nextFollowUpDate,
            notes: `Initial lead qualification call for ${newLead.companyName}`
        }, userName);

        return { success: true, lead: newLead };
    }

    async convertLeadToCustomer(leadId, userName = 'Admin') {
        const leads = crmStore.get(CRM_STORAGE_KEYS.LEADS);
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return { success: false, message: 'Lead not found' };

        const custData = {
            name: lead.companyName,
            contactPerson: lead.contactPerson,
            mobile: lead.phone,
            email: lead.email,
            customerType: 'Retail',
            billingAddress: {
                city: lead.city,
                state: lead.state,
                country: 'India',
                pincode: '380001'
            }
        };

        const custRes = await customerService.createCustomer(custData);
        if (custRes.success) {
            lead.status = 'WON';
            lead.updatedAt = new Date().toISOString();
            crmStore.set(CRM_STORAGE_KEYS.LEADS, leads);

            await notificationService.createNotification({
                type: 'SYSTEM',
                priority: 'NORMAL',
                title: `Lead Converted: ${lead.companyName}`,
                message: `Lead ${lead.leadNumber} has been successfully converted into Customer ${custRes.customer.name}.`,
                referenceType: 'CUSTOMER',
                referenceId: custRes.customer.id,
                actionUrl: `./customer-details.html?id=${custRes.customer.id}`,
                targetRole: 'ALL',
                createdBy: userName
            });

            return { success: true, customer: custRes.customer };
        }
        return { success: false, message: custRes.message || 'Failed to convert lead' };
    }

    // ==================== OPPORTUNITIES & PIPELINE ====================
    async getOpportunities() {
        await this._delay(40);
        return crmStore.get(CRM_STORAGE_KEYS.OPPORTUNITIES);
    }

    async updateOpportunityStage(oppId, newStage, newProbability) {
        const opps = crmStore.get(CRM_STORAGE_KEYS.OPPORTUNITIES);
        const opp = opps.find(o => o.id === oppId);
        if (!opp) return { success: false, message: 'Opportunity not found' };

        opp.stage = newStage;
        if (newProbability !== undefined) {
            opp.probability = newProbability;
        } else {
            const defaults = { NEW: 10, QUALIFIED: 25, QUOTATION: 50, NEGOTIATION: 75, WON: 100, LOST: 0 };
            opp.probability = defaults[newStage] !== undefined ? defaults[newStage] : opp.probability;
        }
        opp.weightedValue = Math.round((opp.estimatedValue * opp.probability) / 100);

        crmStore.set(CRM_STORAGE_KEYS.OPPORTUNITIES, opps);
        return { success: true, opportunity: opp };
    }

    // ==================== FOLLOW-UPS ====================
    async getFollowUps({ status = '' } = {}) {
        await this._delay(50);
        let items = crmStore.get(CRM_STORAGE_KEYS.FOLLOWUPS);
        if (status) items = items.filter(f => f.status === status);

        const todayStr = new Date().toISOString().split('T')[0];
        const dueToday = items.filter(f => f.status === 'SCHEDULED' && f.scheduledDate === todayStr);
        const overdue = items.filter(f => f.status === 'SCHEDULED' && f.scheduledDate < todayStr);

        return {
            items,
            summary: {
                totalScheduled: items.filter(f => f.status === 'SCHEDULED').length,
                dueTodayCount: dueToday.length,
                overdueCount: overdue.length,
                completedCount: items.filter(f => f.status === 'COMPLETED').length
            }
        };
    }

    async scheduleFollowUp(data, userName = 'Admin') {
        const items = crmStore.get(CRM_STORAGE_KEYS.FOLLOWUPS);
        const id = `FLW-${String(items.length + 1).padStart(6, '0')}`;

        const newFollowUp = {
            id,
            relatedType: data.relatedType || 'LEAD',
            relatedId: data.relatedId,
            relatedName: data.relatedName || 'Prospect Contact',
            assignedTo: data.assignedTo || 'Sales Staff',
            type: data.type || 'PHONE_CALL',
            scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
            status: 'SCHEDULED',
            outcome: null,
            notes: data.notes || '',
            createdBy: userName,
            createdAt: new Date().toISOString()
        };

        items.unshift(newFollowUp);
        crmStore.set(CRM_STORAGE_KEYS.FOLLOWUPS, items);
        return { success: true, followUp: newFollowUp };
    }

    async completeFollowUp(id, outcome, nextDate, notes, userName = 'Sales Staff') {
        const items = crmStore.get(CRM_STORAGE_KEYS.FOLLOWUPS);
        const item = items.find(f => f.id === id);
        if (!item) return { success: false, message: 'Follow-up not found' };

        item.status = 'COMPLETED';
        item.outcome = outcome;
        if (notes) item.notes += ` [Outcome Note: ${notes}]`;

        if (nextDate) {
            await this.scheduleFollowUp({
                relatedType: item.relatedType,
                relatedId: item.relatedId,
                relatedName: item.relatedName,
                assignedTo: item.assignedTo,
                type: item.type,
                scheduledDate: nextDate,
                notes: `Follow-up continuing from previous call (${outcome})`
            }, userName);
        }

        crmStore.set(CRM_STORAGE_KEYS.FOLLOWUPS, items);
        return { success: true, followUp: item };
    }

    // ==================== COMMUNICATIONS & TEMPLATES ====================
    async getCommunications() {
        return crmStore.get(CRM_STORAGE_KEYS.COMMUNICATIONS);
    }

    async getTemplates() {
        return crmStore.get(CRM_STORAGE_KEYS.COMMUNICATION_TEMPLATES);
    }

    async sendCommunication(data, userName = 'Admin') {
        const items = crmStore.get(CRM_STORAGE_KEYS.COMMUNICATIONS);
        const id = `COMM-${String(items.length + 1).padStart(6, '0')}`;

        const newComm = {
            id,
            channel: data.channel || 'WHATSAPP',
            recipientName: data.recipientName.trim(),
            recipientPhone: data.recipientPhone.trim(),
            templateName: data.templateName || 'Direct Message',
            messageSummary: data.messageBody || data.messageSummary,
            status: 'DELIVERED',
            sentAt: new Date().toLocaleString(),
            sentBy: userName
        };

        items.unshift(newComm);
        crmStore.set(CRM_STORAGE_KEYS.COMMUNICATIONS, items);
        return { success: true, communication: newComm };
    }

    // ==================== TICKETS & FEEDBACK ====================
    async getTickets({ status = '', priority = '' } = {}) {
        let items = crmStore.get(CRM_STORAGE_KEYS.TICKETS);
        if (status) items = items.filter(t => t.status === status);
        if (priority) items = items.filter(t => t.priority === priority);
        return items;
    }

    async createTicket(data, userName = 'Admin') {
        const items = crmStore.get(CRM_STORAGE_KEYS.TICKETS);
        const id = `TKT-${String(items.length + 1).padStart(6, '0')}`;
        const ticketNumber = `TKT-${new Date().getFullYear()}-${String(items.length + 1).padStart(5, '0')}`;

        const newTicket = {
            id,
            ticketNumber,
            customerName: data.customerName.trim(),
            subject: data.subject.trim(),
            category: data.category || 'General Inquiry',
            priority: data.priority || 'MEDIUM',
            status: 'OPEN',
            assignedTo: data.assignedTo || 'Support Team',
            createdAt: new Date().toLocaleString(),
            resolvedAt: null,
            resolution: ''
        };

        items.unshift(newTicket);
        crmStore.set(CRM_STORAGE_KEYS.TICKETS, items);
        return { success: true, ticket: newTicket };
    }

    async resolveTicket(id, resolution, userName = 'Support Staff') {
        const items = crmStore.get(CRM_STORAGE_KEYS.TICKETS);
        const ticket = items.find(t => t.id === id);
        if (!ticket) return { success: false, message: 'Ticket not found' };

        ticket.status = 'RESOLVED';
        ticket.resolvedAt = new Date().toLocaleString();
        ticket.resolution = resolution;

        crmStore.set(CRM_STORAGE_KEYS.TICKETS, items);
        return { success: true, ticket };
    }

    async getFeedback() {
        return crmStore.get(CRM_STORAGE_KEYS.FEEDBACK);
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const crmService = new CrmService();
