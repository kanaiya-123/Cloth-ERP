// CLOTHERP - Centralized Company & Branch Master Settings Service
// Manages dynamic company details, logo, GST credentials, and print configurations

const COMPANY_SETTINGS_KEY = 'clotherp_company_settings';

const DEFAULT_COMPANY_SETTINGS = {
    companyName: 'CLOTHERP Apparel Industries Pvt. Ltd.',
    brandName: 'CLOTHERP',
    tagline: 'Clothing Business ERP',
    logoUrl: './assets/images/clotherp-logo.svg',
    address: 'Plot 104-108, GIDC Apparel Park, Khokhra',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    country: 'India',
    pincode: '380008',
    mobile: '+91 79 4899 2200',
    email: 'billing@clotherp.local',
    website: 'www.clotherp.local',
    gstin: '24AABCC1234F1Z5',
    pan: 'AABCC1234F',
    cin: 'U18101GJ2020PTC115482',
    bankDetails: {
        bankName: 'HDFC Bank Ltd.',
        accountName: 'CLOTHERP APPAREL INDUSTRIES PVT LTD',
        accountNumber: '50200088991122',
        ifscCode: 'HDFC0001244',
        branch: 'Navrangpura Branch, Ahmedabad',
        upiId: 'clotherp@hdfcbank'
    },
    termsInvoice: [
        'Goods once sold will be subject to company return policy.',
        'Payment should be made as per agreed terms.',
        'Warranty/return conditions apply according to product policy.',
        'All disputes are subject to the applicable jurisdiction.'
    ],
    termsEstimate: [
        'This estimate is valid until the mentioned validity date.',
        'Prices are subject to change after validity.',
        'GST will be charged as applicable.',
        'Final invoice may vary based on actual quantity/product selection.',
        'This document is an estimate and not a tax invoice.'
    ]
};

class CompanySettingsService {
    constructor() {
        this.settings = this._loadSettings();
    }

    _loadSettings() {
        try {
            const raw = localStorage.getItem(COMPANY_SETTINGS_KEY);
            if (raw) {
                return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) };
            }
        } catch (e) {
            console.error('Error loading company settings:', e);
        }
        return { ...DEFAULT_COMPANY_SETTINGS };
    }

    getSettings() {
        if (!this.settings) {
            this.settings = this._loadSettings();
        }
        return this.settings;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.getSettings(), ...newSettings };
        try {
            localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error saving company settings:', e);
        }
        return this.settings;
    }

    getFinancialYear(dateInput) {
        const d = dateInput ? new Date(dateInput) : new Date();
        const year = d.getFullYear();
        const month = d.getMonth() + 1; // 1-12
        if (month >= 4) {
            // April onwards -> FY year - (year+1)
            return `FY ${year}-${(year + 1).toString().slice(-2)}`;
        } else {
            // Jan to March -> FY (year-1) - year
            return `FY ${year - 1}-${year.toString().slice(-2)}`;
        }
    }
}

export const companySettingsService = new CompanySettingsService();
