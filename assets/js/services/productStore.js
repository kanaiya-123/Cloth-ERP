// CLOTHERP - Centralized Persistent Product & Masters Data Store
// Provides persistent client-side data for development across page transitions.

const STORAGE_KEYS = {
    CATEGORIES: 'clotherp_categories_db',
    BRANDS: 'clotherp_brands_db',
    COLORS: 'clotherp_colors_db',
    SIZES: 'clotherp_sizes_db',
    PRODUCTS: 'clotherp_products_db'
};

const DEFAULT_CATEGORIES = [
    { id: 'cat_1', name: 'Shirts', description: 'Formal, casual & semi-formal shirts', status: 'Active', createdOn: '2026-08-15', createdBy: 'Admin' },
    { id: 'cat_2', name: 'T-Shirts', description: 'Round neck, polo & oversized tees', status: 'Active', createdOn: '2026-08-15', createdBy: 'Admin' },
    { id: 'cat_3', name: 'Jeans', description: 'Slim, regular, and relaxed denim bottoms', status: 'Active', createdOn: '2026-08-15', createdBy: 'Admin' },
    { id: 'cat_4', name: 'Trousers', description: 'Formal, chinos, and pleated trousers', status: 'Active', createdOn: '2026-08-15', createdBy: 'Admin' },
    { id: 'cat_5', name: 'Kurtis', description: 'Ethnic embroidered & printed women kurtis', status: 'Active', createdOn: '2026-08-16', createdBy: 'Admin' },
    { id: 'cat_6', name: 'Dresses', description: 'Western casual & festive dresses', status: 'Active', createdOn: '2026-08-16', createdBy: 'Admin' },
    { id: 'cat_7', name: 'Jackets', description: 'Bomber, winter & denim outerwear', status: 'Active', createdOn: '2026-08-16', createdBy: 'Admin' },
    { id: 'cat_8', name: 'Accessories', description: 'Belts, scarves, and ties', status: 'Active', createdOn: '2026-08-17', createdBy: 'Admin' }
];

const DEFAULT_BRANDS = [
    { id: 'br_1', name: 'Loom & Thread Co.', description: 'Premium formal & bespoke shirts', status: 'Active', createdOn: '2026-08-15' },
    { id: 'br_2', name: 'Indigo Edge', description: 'Everyday stretch denim & rugged wear', status: 'Active', createdOn: '2026-08-15' },
    { id: 'br_3', name: 'Royal Silk', description: 'Traditional ethnic kurtis & sarees', status: 'Active', createdOn: '2026-08-16' },
    { id: 'br_4', name: 'Urban Weave', description: 'Casual street polos & knitwear', status: 'Active', createdOn: '2026-08-16' },
    { id: 'br_5', name: 'Raymond Apparels', description: 'Fine suiting fabrics & formal trousers', status: 'Active', createdOn: '2026-08-17' }
];

const DEFAULT_COLORS = [
    { id: 'col_1', name: 'Black', hexCode: '#111827', status: 'Active', createdOn: '2026-08-15' },
    { id: 'col_2', name: 'White', hexCode: '#FFFFFF', status: 'Active', createdOn: '2026-08-15' },
    { id: 'col_3', name: 'Navy Blue', hexCode: '#1E3A8A', status: 'Active', createdOn: '2026-08-15' },
    { id: 'col_4', name: 'Crimson Red', hexCode: '#DC2626', status: 'Active', createdOn: '2026-08-15' },
    { id: 'col_5', name: 'Emerald Green', hexCode: '#059669', status: 'Active', createdOn: '2026-08-16' },
    { id: 'col_6', name: 'Mustard Yellow', hexCode: '#D97706', status: 'Active', createdOn: '2026-08-16' },
    { id: 'col_7', name: 'Beige', hexCode: '#D4B996', status: 'Active', createdOn: '2026-08-16' },
    { id: 'col_8', name: 'Charcoal Grey', hexCode: '#374151', status: 'Active', createdOn: '2026-08-17' }
];

const DEFAULT_SIZES = [
    { id: 'sz_1', name: 'XS', type: 'Clothing', displayOrder: 1, status: 'Active' },
    { id: 'sz_2', name: 'S', type: 'Clothing', displayOrder: 2, status: 'Active' },
    { id: 'sz_3', name: 'M', type: 'Clothing', displayOrder: 3, status: 'Active' },
    { id: 'sz_4', name: 'L', type: 'Clothing', displayOrder: 4, status: 'Active' },
    { id: 'sz_5', name: 'XL', type: 'Clothing', displayOrder: 5, status: 'Active' },
    { id: 'sz_6', name: 'XXL', type: 'Clothing', displayOrder: 6, status: 'Active' },
    { id: 'sz_7', name: '3XL', type: 'Clothing', displayOrder: 7, status: 'Active' },
    { id: 'sz_8', name: '28', type: 'Numeric', displayOrder: 1, status: 'Active' },
    { id: 'sz_9', name: '30', type: 'Numeric', displayOrder: 2, status: 'Active' },
    { id: 'sz_10', name: '32', type: 'Numeric', displayOrder: 3, status: 'Active' },
    { id: 'sz_11', name: '34', type: 'Numeric', displayOrder: 4, status: 'Active' },
    { id: 'sz_12', name: '36', type: 'Numeric', displayOrder: 5, status: 'Active' },
    { id: 'sz_13', name: '38', type: 'Numeric', displayOrder: 6, status: 'Active' }
];

const DEFAULT_PRODUCTS = [
    {
        id: 'prod_101',
        name: "Men's Cotton Oxford Shirt",
        code: 'SH-OXF-01',
        category: 'Shirts',
        brand: 'Loom & Thread Co.',
        gender: 'Men',
        fabric: '100% Oxford Cotton',
        hsnCode: '620520',
        gstRate: '5%',
        description: 'Classic button-down Oxford shirt tailored with single-needle tailoring and breathable weave.',
        baseCostPrice: 450,
        baseSellingPrice: 899,
        status: 'Active',
        createdOn: '2026-08-20',
        createdBy: 'Admin',
        primaryImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80',
        variants: [
            { id: 'var_101_1', color: 'Black', colorHex: '#111827', size: 'M', sku: 'SH-OXF-BLK-M', barcode: '89010101', costPrice: 450, sellingPrice: 899, status: 'Active' },
            { id: 'var_101_2', color: 'Black', colorHex: '#111827', size: 'L', sku: 'SH-OXF-BLK-L', barcode: '89010102', costPrice: 450, sellingPrice: 899, status: 'Active' },
            { id: 'var_101_3', color: 'Black', colorHex: '#111827', size: 'XL', sku: 'SH-OXF-BLK-XL', barcode: '89010103', costPrice: 480, sellingPrice: 949, status: 'Active' },
            { id: 'var_101_4', color: 'White', colorHex: '#FFFFFF', size: 'M', sku: 'SH-OXF-WHT-M', barcode: '89010104', costPrice: 450, sellingPrice: 899, status: 'Active' },
            { id: 'var_101_5', color: 'White', colorHex: '#FFFFFF', size: 'L', sku: 'SH-OXF-WHT-L', barcode: '89010105', costPrice: 450, sellingPrice: 899, status: 'Active' },
            { id: 'var_101_6', color: 'Navy Blue', colorHex: '#1E3A8A', size: 'M', sku: 'SH-OXF-NVY-M', barcode: '89010106', costPrice: 450, sellingPrice: 899, status: 'Active' }
        ],
        activity: [
            { time: '2026-08-20 10:15 AM', user: 'Admin', action: 'Created product Men\'s Cotton Oxford Shirt with 6 initial variants.' },
            { time: '2026-08-22 03:30 PM', user: 'Admin', action: 'Updated selling price for XL variant to ₹949.' }
        ]
    },
    {
        id: 'prod_102',
        name: 'Slim Fit Stretch Denim',
        code: 'JN-STR-02',
        category: 'Jeans',
        brand: 'Indigo Edge',
        gender: 'Men',
        fabric: 'Cotton Lycra Denim (12 Oz)',
        hsnCode: '620342',
        gstRate: '5%',
        description: 'Mid-rise stretch slim fit jeans with stone wash and durable copper rivet accents.',
        baseCostPrice: 650,
        baseSellingPrice: 1499,
        status: 'Active',
        createdOn: '2026-08-21',
        createdBy: 'Admin',
        primaryImage: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80',
        variants: [
            { id: 'var_102_1', color: 'Navy Blue', colorHex: '#1E3A8A', size: '30', sku: 'JN-STR-NVY-30', barcode: '89010201', costPrice: 650, sellingPrice: 1499, status: 'Active' },
            { id: 'var_102_2', color: 'Navy Blue', colorHex: '#1E3A8A', size: '32', sku: 'JN-STR-NVY-32', barcode: '89010202', costPrice: 650, sellingPrice: 1499, status: 'Active' },
            { id: 'var_102_3', color: 'Navy Blue', colorHex: '#1E3A8A', size: '34', sku: 'JN-STR-NVY-34', barcode: '89010203', costPrice: 650, sellingPrice: 1499, status: 'Active' },
            { id: 'var_102_4', color: 'Black', colorHex: '#111827', size: '32', sku: 'JN-STR-BLK-32', barcode: '89010204', costPrice: 680, sellingPrice: 1549, status: 'Active' }
        ],
        activity: [
            { time: '2026-08-21 11:00 AM', user: 'Admin', action: 'Created product Slim Fit Stretch Denim with 4 size variants.' }
        ]
    },
    {
        id: 'prod_103',
        name: "Women's Embroidered Silk Kurti",
        code: 'KT-SLK-03',
        category: 'Kurtis',
        brand: 'Royal Silk',
        gender: 'Women',
        fabric: 'Pure Chanderi Silk with Zari',
        hsnCode: '620443',
        gstRate: '5%',
        description: 'Handcrafted embroidered ethnic kurti with intricate neckline and scalloped hemline.',
        baseCostPrice: 550,
        baseSellingPrice: 1250,
        status: 'Active',
        createdOn: '2026-08-22',
        createdBy: 'Admin',
        primaryImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
        variants: [
            { id: 'var_103_1', color: 'Crimson Red', colorHex: '#DC2626', size: 'M', sku: 'KT-SLK-RED-M', barcode: '89010301', costPrice: 550, sellingPrice: 1250, status: 'Active' },
            { id: 'var_103_2', color: 'Crimson Red', colorHex: '#DC2626', size: 'L', sku: 'KT-SLK-RED-L', barcode: '89010302', costPrice: 550, sellingPrice: 1250, status: 'Active' },
            { id: 'var_103_3', color: 'Mustard Yellow', colorHex: '#D97706', size: 'M', sku: 'KT-SLK-MST-M', barcode: '89010303', costPrice: 550, sellingPrice: 1250, status: 'Active' },
            { id: 'var_103_4', color: 'Mustard Yellow', colorHex: '#D97706', size: 'L', sku: 'KT-SLK-MST-L', barcode: '89010304', costPrice: 550, sellingPrice: 1250, status: 'Active' }
        ],
        activity: [
            { time: '2026-08-22 02:00 PM', user: 'Admin', action: 'Created product Women\'s Embroidered Silk Kurti.' }
        ]
    },
    {
        id: 'prod_104',
        name: 'Classic Polo Pique T-Shirt',
        code: 'TS-POL-04',
        category: 'T-Shirts',
        brand: 'Urban Weave',
        gender: 'Unisex',
        fabric: '100% Combed Cotton Pique',
        hsnCode: '610910',
        gstRate: '5%',
        description: '220 GSM breathable honeycomb pique polo with ribbed collar and double-stitched cuffs.',
        baseCostPrice: 300,
        baseSellingPrice: 699,
        status: 'Active',
        createdOn: '2026-08-23',
        createdBy: 'Admin',
        primaryImage: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80',
        variants: [
            { id: 'var_104_1', color: 'Emerald Green', colorHex: '#059669', size: 'M', sku: 'TS-POL-GRN-M', barcode: '89010401', costPrice: 300, sellingPrice: 699, status: 'Active' },
            { id: 'var_104_2', color: 'Emerald Green', colorHex: '#059669', size: 'L', sku: 'TS-POL-GRN-L', barcode: '89010402', costPrice: 300, sellingPrice: 699, status: 'Active' },
            { id: 'var_104_3', color: 'Black', colorHex: '#111827', size: 'M', sku: 'TS-POL-BLK-M', barcode: '89010403', costPrice: 300, sellingPrice: 699, status: 'Active' },
            { id: 'var_104_4', color: 'Black', colorHex: '#111827', size: 'L', sku: 'TS-POL-BLK-L', barcode: '89010404', costPrice: 300, sellingPrice: 699, status: 'Active' },
            { id: 'var_104_5', color: 'White', colorHex: '#FFFFFF', size: 'M', sku: 'TS-POL-WHT-M', barcode: '89010405', costPrice: 300, sellingPrice: 699, status: 'Active' }
        ],
        activity: [
            { time: '2026-08-23 09:30 AM', user: 'Admin', action: 'Created product Classic Polo Pique T-Shirt.' }
        ]
    }
];

class ProductStore {
    constructor() {
        this._initStore();
    }

    _initStore() {
        if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
            localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(DEFAULT_BRANDS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.COLORS)) {
            localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(DEFAULT_COLORS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.SIZES)) {
            localStorage.setItem(STORAGE_KEYS.SIZES, JSON.stringify(DEFAULT_SIZES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
        }
    }

    get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error(`Error reading ${key}:`, e);
            return [];
        }
    }

    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving ${key}:`, e);
        }
    }
}

export const productStore = new ProductStore();
export { STORAGE_KEYS };
