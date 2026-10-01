// CLOTHERP - Centralized GST & Purchase Tax Calculation Service

export const BUSINESS_CONFIG = {
    COMPANY_NAME: 'CLOTHERP Fashion Retail & Wholesale',
    GSTIN: '27AABCC1234F1Z9',
    STATE: 'Maharashtra',
    STATE_CODE: '27',
    DEFAULT_GST_RATE: 5
};

class TaxService {
    /**
     * Determine if transaction is Intra-state (Same State) or Inter-state (Different State)
     * @param {string} supplierState 
     * @param {string} businessState 
     * @returns {boolean}
     */
    isSameState(supplierState, businessState = BUSINESS_CONFIG.STATE) {
        if (!supplierState) return true;
        return supplierState.trim().toLowerCase() === businessState.trim().toLowerCase();
    }

    /**
     * Calculate Tax & Discounts for a single Purchase Item Line
     */
    calculateLineTax({
        quantity = 1,
        rate = 0,
        discountType = 'percent', // 'percent' | 'amount'
        discountVal = 0,
        gstRate = 5,
        isSameState = true
    } = {}) {
        const qty = Math.max(0, parseInt(quantity) || 0);
        const unitRate = Math.max(0, parseFloat(rate) || 0);
        const grossAmount = this.round(qty * unitRate);

        // Calculate line discount
        let discountAmount = 0;
        const discVal = parseFloat(discountVal) || 0;
        if (discountType === 'percent') {
            discountAmount = this.round((grossAmount * Math.min(100, Math.max(0, discVal))) / 100);
        } else {
            discountAmount = Math.min(grossAmount, Math.max(0, discVal));
        }

        const taxableAmount = this.round(grossAmount - discountAmount);
        const rateGST = parseFloat(gstRate) || 0;
        const taxAmount = this.round((taxableAmount * rateGST) / 100);

        let cgstRate = 0, cgstAmount = 0;
        let sgstRate = 0, sgstAmount = 0;
        let igstRate = 0, igstAmount = 0;

        if (isSameState) {
            cgstRate = rateGST / 2;
            sgstRate = rateGST / 2;
            cgstAmount = this.round(taxAmount / 2);
            sgstAmount = this.round(taxAmount - cgstAmount); // exact penny match
        } else {
            igstRate = rateGST;
            igstAmount = taxAmount;
        }

        const totalAmount = this.round(taxableAmount + taxAmount);

        return {
            quantity: qty,
            rate: unitRate,
            grossAmount,
            discountType,
            discountVal: discVal,
            discountAmount,
            taxableAmount,
            gstRate: rateGST,
            taxAmount,
            cgstRate,
            cgstAmount,
            sgstRate,
            sgstAmount,
            igstRate,
            igstAmount,
            totalAmount
        };
    }

    /**
     * Calculate Complete Purchase Order Summary
     */
    calculatePurchaseTotals({
        items = [],
        overallDiscountType = 'percent',
        overallDiscountVal = 0,
        supplierState = BUSINESS_CONFIG.STATE,
        businessState = BUSINESS_CONFIG.STATE
    } = {}) {
        const sameState = this.isSameState(supplierState, businessState);
        let totalGross = 0;
        let totalItemDiscount = 0;
        let subtotalTaxable = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;

        const calculatedItems = items.map(item => {
            const line = this.calculateLineTax({
                quantity: item.quantity,
                rate: item.purchaseRate || item.costPrice || item.rate,
                discountType: item.discountType || 'percent',
                discountVal: item.discountVal || 0,
                gstRate: item.gstRate || 5,
                isSameState: sameState
            });

            totalGross += line.grossAmount;
            totalItemDiscount += line.discountAmount;
            subtotalTaxable += line.taxableAmount;
            totalCGST += line.cgstAmount;
            totalSGST += line.sgstAmount;
            totalIGST += line.igstAmount;

            return {
                ...item,
                ...line
            };
        });

        totalGross = this.round(totalGross);
        totalItemDiscount = this.round(totalItemDiscount);
        subtotalTaxable = this.round(subtotalTaxable);

        // Overall Purchase Discount
        let overallDiscountAmount = 0;
        const oDisc = parseFloat(overallDiscountVal) || 0;
        if (overallDiscountType === 'percent') {
            overallDiscountAmount = this.round((subtotalTaxable * Math.min(100, Math.max(0, oDisc))) / 100);
        } else {
            overallDiscountAmount = Math.min(subtotalTaxable, Math.max(0, oDisc));
        }

        const finalTaxableAmount = this.round(subtotalTaxable - overallDiscountAmount);

        // Proportionate Tax adjustment if overall discount is applied
        if (overallDiscountAmount > 0 && subtotalTaxable > 0) {
            const ratio = finalTaxableAmount / subtotalTaxable;
            totalCGST = this.round(totalCGST * ratio);
            totalSGST = this.round(totalSGST * ratio);
            totalIGST = this.round(totalIGST * ratio);
        }

        const totalTax = this.round(sameState ? (totalCGST + totalSGST) : totalIGST);
        const grandTotal = this.round(finalTaxableAmount + totalTax);

        return {
            items: calculatedItems,
            isSameState: sameState,
            supplierState: supplierState || BUSINESS_CONFIG.STATE,
            businessState: businessState || BUSINESS_CONFIG.STATE,
            totalGross,
            totalItemDiscount,
            subtotalTaxable,
            overallDiscountType,
            overallDiscountVal: oDisc,
            overallDiscountAmount,
            finalTaxableAmount,
            cgstTotal: totalCGST,
            sgstTotal: totalSGST,
            igstTotal: totalIGST,
            totalTax,
            grandTotal,
            totalQuantity: calculatedItems.reduce((acc, i) => acc + (i.quantity || 0), 0)
        };
    }

    round(val) {
        return Math.round((parseFloat(val) || 0) * 100) / 100;
    }
}

export const taxService = new TaxService();
