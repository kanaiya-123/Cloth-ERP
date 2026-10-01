// CLOTHERP - Product & Variant Service
import { productStore, STORAGE_KEYS } from './productStore.js';

class ProductService {
    /**
     * Get Paginated, Filtered & Searched Products List
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const params = new URLSearchParams({ page, pageSize, search, category, brand, status, sortBy });
     * const res = await fetch(`/api/products?${params}`);
     * return await res.json();
     */
    async getProducts({
        page = 1,
        pageSize = 10,
        search = '',
        category = '',
        brand = '',
        status = '',
        sortBy = 'newest'
    } = {}) {
        await this._delay(150);
        let products = productStore.get(STORAGE_KEYS.PRODUCTS);

        // Search Filter (Product Name, Product Code, Variant SKU, Variant Barcode)
        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            products = products.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(query);
                const codeMatch = p.code && p.code.toLowerCase().includes(query);
                const variantMatch = (p.variants || []).some(v => 
                    (v.sku && v.sku.toLowerCase().includes(query)) ||
                    (v.barcode && v.barcode.toLowerCase().includes(query))
                );
                return nameMatch || codeMatch || variantMatch;
            });
        }

        // Category Filter
        if (category) {
            products = products.filter(p => p.category === category);
        }

        // Brand Filter
        if (brand) {
            products = products.filter(p => p.brand === brand);
        }

        // Status Filter
        if (status) {
            products = products.filter(p => p.status === status);
        }

        // Sorting
        if (sortBy === 'newest') {
            products.sort((a, b) => new Date(b.createdOn || 0) - new Date(a.createdOn || 0));
        } else if (sortBy === 'oldest') {
            products.sort((a, b) => new Date(a.createdOn || 0) - new Date(b.createdOn || 0));
        } else if (sortBy === 'name_asc') {
            products.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'price_asc') {
            products.sort((a, b) => a.baseSellingPrice - b.baseSellingPrice);
        } else if (sortBy === 'price_desc') {
            products.sort((a, b) => b.baseSellingPrice - a.baseSellingPrice);
        }

        // Summary Calculations across all matching products
        const totalItems = products.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginatedItems = products.slice(start, start + pageSize);

        // Global metrics
        const allProducts = productStore.get(STORAGE_KEYS.PRODUCTS);
        const totalVariantsCount = allProducts.reduce((acc, p) => acc + (p.variants ? p.variants.length : 0), 0);

        return {
            items: paginatedItems,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages
            },
            summary: {
                totalProducts: allProducts.length,
                activeProducts: allProducts.filter(p => p.status === 'Active').length,
                inactiveProducts: allProducts.filter(p => p.status === 'Inactive').length,
                totalVariants: totalVariantsCount
            }
        };
    }

    /**
     * Get Single Product by ID
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/products/${id}`);
     * return await res.json();
     */
    async getProductById(id) {
        await this._delay(100);
        const products = productStore.get(STORAGE_KEYS.PRODUCTS);
        return products.find(p => p.id === id) || null;
    }

    /**
     * Create Product with Variants
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch('/api/products', { method: 'POST', body: JSON.stringify(data) });
     * return await res.json();
     */
    async createProduct(data) {
        await this._delay(250);
        const products = productStore.get(STORAGE_KEYS.PRODUCTS);

        // Validate uniqueness of Product Code
        if (data.code && data.code.trim()) {
            const codeExists = products.some(p => p.code.toLowerCase() === data.code.trim().toLowerCase());
            if (codeExists) {
                return { success: false, message: `Product code '${data.code}' is already in use.` };
            }
        }

        const newId = `prod_${Date.now()}`;
        const newProduct = {
            id: newId,
            name: data.name.trim(),
            code: data.code ? data.code.trim().toUpperCase() : `PRD-${Date.now().toString().slice(-4)}`,
            category: data.category,
            brand: data.brand || 'Unbranded',
            gender: data.gender || 'Unisex',
            fabric: data.fabric || 'Standard Fabric',
            hsnCode: data.hsnCode || '6205',
            gstRate: data.gstRate || '5%',
            description: data.description || '',
            baseCostPrice: parseFloat(data.baseCostPrice) || 0,
            baseSellingPrice: parseFloat(data.baseSellingPrice) || 0,
            status: data.status || 'Active',
            createdOn: new Date().toISOString().split('T')[0],
            createdBy: 'Admin',
            primaryImage: data.primaryImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
            variants: data.variants || [],
            activity: [
                {
                    time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    user: 'Admin',
                    action: `Created product '${data.name}' with ${data.variants ? data.variants.length : 0} variants.`
                }
            ]
        };

        products.unshift(newProduct);
        productStore.set(STORAGE_KEYS.PRODUCTS, products);
        return { success: true, data: newProduct };
    }

    /**
     * Update Product
     * 
     * FUTURE ASP.NET CORE API REPLACEMENT POINT:
     * const res = await fetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
     * return await res.json();
     */
    async updateProduct(id, data) {
        await this._delay(200);
        const products = productStore.get(STORAGE_KEYS.PRODUCTS);
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return { success: false, message: 'Product not found.' };

        const current = products[idx];

        // Code uniqueness check
        if (data.code && data.code.trim()) {
            const duplicate = products.some(p => p.id !== id && p.code.toLowerCase() === data.code.trim().toLowerCase());
            if (duplicate) {
                return { success: false, message: `Another product with code '${data.code}' already exists.` };
            }
        }

        const updatedActivity = current.activity || [];
        updatedActivity.unshift({
            time: `${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            user: 'Admin',
            action: `Updated product details and variant configuration.`
        });

        products[idx] = {
            ...current,
            name: data.name ? data.name.trim() : current.name,
            code: data.code ? data.code.trim().toUpperCase() : current.code,
            category: data.category || current.category,
            brand: data.brand || current.brand,
            gender: data.gender || current.gender,
            fabric: data.fabric || current.fabric,
            hsnCode: data.hsnCode || current.hsnCode,
            gstRate: data.gstRate || current.gstRate,
            description: data.description !== undefined ? data.description : current.description,
            baseCostPrice: data.baseCostPrice !== undefined ? parseFloat(data.baseCostPrice) : current.baseCostPrice,
            baseSellingPrice: data.baseSellingPrice !== undefined ? parseFloat(data.baseSellingPrice) : current.baseSellingPrice,
            status: data.status || current.status,
            primaryImage: data.primaryImage || current.primaryImage,
            variants: data.variants || current.variants,
            activity: updatedActivity
        };

        productStore.set(STORAGE_KEYS.PRODUCTS, products);
        return { success: true, data: products[idx] };
    }

    /**
     * Toggle Product Status
     */
    async toggleStatus(id) {
        await this._delay(100);
        const products = productStore.get(STORAGE_KEYS.PRODUCTS);
        const target = products.find(p => p.id === id);
        if (!target) return { success: false, message: 'Product not found.' };

        target.status = target.status === 'Active' ? 'Inactive' : 'Active';
        productStore.set(STORAGE_KEYS.PRODUCTS, products);
        return { success: true, status: target.status };
    }

    /**
     * Helper: Generate SKU pattern (PRODUCTCODE-COLOR-SIZE)
     */
    generateSku(productCode, colorName, sizeName) {
        const cleanCode = (productCode || 'PRD').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const cleanColor = (colorName || 'COL').trim().toUpperCase().slice(0, 3);
        const cleanSize = (sizeName || 'STD').trim().toUpperCase();
        return `${cleanCode}-${cleanColor}-${cleanSize}`;
    }

    /**
     * Helper: Generate Barcode
     */
    generateBarcode() {
        return `890${Math.floor(10000 + Math.random() * 90000)}`;
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const productService = new ProductService();
