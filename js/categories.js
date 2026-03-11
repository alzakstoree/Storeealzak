// نظام الأقسام حسب تصميمك
const categoriesSystem = {
    categories: [
        // ===== الأقسام الرئيسية =====
        { id: 'cocco', name: 'Cocco', icon: 'fa-gem', level: 1, parentId: null },
        { id: 'mtn', name: 'MTN', icon: 'fa-signal', level: 1, parentId: null },
        { id: 'visa', name: 'VISA', icon: 'fa-credit-card', level: 1, parentId: null },
        
        // ===== فئات Cocco =====
        { id: 'cocco_apps', name: 'قسم التطبيقات', level: 2, parentId: 'cocco' },
        { id: 'cocco_games', name: 'قسم الألعاب', level: 2, parentId: 'cocco' },
        { id: 'cocco_help', name: 'قسم التعليمات', level: 2, parentId: 'cocco' },
        
        // ===== فئات MTN =====
        { id: 'mtn_balance', name: 'الرصيد والعمليات', level: 2, parentId: 'mtn' },
        { id: 'mtn_numbers', name: 'قسم الأرقام', level: 2, parentId: 'mtn' },
        { id: 'mtn_digital', name: 'قسم الرقميات', level: 2, parentId: 'mtn' },
        
        // ===== فئات VISA =====
        { id: 'visa_backup', name: 'التوثيق الاحتياطي', level: 2, parentId: 'visa' },
        { id: 'visa_accounts', name: 'توثيق الحسابات', level: 2, parentId: 'visa' },
        { id: 'visa_electronic', name: 'توثيق إلكترونية', level: 2, parentId: 'visa' },
        
        // ===== منتجات (أمثلة) =====
        // Cocco - تطبيقات
        { id: 'prod_app_netflix', name: 'نتفليكس', price: '5.00', level: 3, parentId: 'cocco_apps' },
        { id: 'prod_app_spotify', name: 'سبوتيفاي', price: '3.00', level: 3, parentId: 'cocco_apps' },
        
        // Cocco - ألعاب
        { id: 'prod_game_pubg', name: 'PUBG UC', price: '10.00', level: 3, parentId: 'cocco_games' },
        { id: 'prod_game_freefire', name: 'Free Fire', price: '8.00', level: 3, parentId: 'cocco_games' },
        
        // MTN - رصيد
        { id: 'prod_mtn_5000', name: 'رصيد 5000 ليرة', price: '5.00', level: 3, parentId: 'mtn_balance' },
        { id: 'prod_mtn_10000', name: 'رصيد 10000 ليرة', price: '9.00', level: 3, parentId: 'mtn_balance' },
        
        // MTN - أرقام
        { id: 'prod_mtn_number', name: 'رقم مميز', price: '15.00', level: 3, parentId: 'mtn_numbers' },
        
        // VISA - توثيق
        { id: 'prod_visa_verify', name: 'توثيق فيزا', price: '20.00', level: 3, parentId: 'visa_accounts' }
    ],
    
    // دالة جلب الأقسام حسب المستوى
    getCategoriesByLevel: function(level, parentId = null) {
        return this.categories.filter(c => c.level === level && c.parentId === parentId);
    },
    
    // دالة جلب الفروع لوالد معين
    getChildren: function(parentId) {
        return this.categories.filter(c => c.parentId === parentId);
    },
    
    // دالة جلب مسار القسم
    getPath: function(categoryId) {
        const path = [];
        let current = this.categories.find(c => c.id === categoryId);
        
        while (current) {
            path.unshift(current);
            current = this.categories.find(c => c.id === current.parentId);
        }
        
        return path;
    }
};

// عرض الأقسام الرئيسية
function renderMainCategories() {
    const mainCats = categoriesSystem.getCategoriesByLevel(1);
    const container = document.getElementById('mainCategories');
    if (!container) return;
    
    container.innerHTML = '';
    mainCats.forEach(cat => {
        container.innerHTML += `
            <div class="main-cat-card" onclick="loadSubCategories('${cat.id}')">
                <div class="cat-icon">
                    <i class="fas ${cat.icon || 'fa-folder'}"></i>
                </div>
                <div class="cat-name">${cat.name}</div>
                <div class="cat-arrow">
                    <i class="fas fa-chevron-left"></i>
                </div>
            </div>
        `;
    });
}

// عرض الفئات الفرعية
function loadSubCategories(parentId) {
    const children = categoriesSystem.getChildren(parentId);
    const parent = categoriesSystem.categories.find(c => c.id === parentId);
    
    // تحديث مسار التنقل
    updateBreadcrumb(parentId);
    
    const container = document.getElementById('subCategoriesContainer');
    if (!container) return;
    
    if (children.length === 0 || children[0].level === 4) {
        // إذا كانت المنتجات النهائية
        showProducts(parentId);
        return;
    }
    
    container.innerHTML = `
        <div class="sub-header">
            <h3>${parent.name}</h3>
        </div>
    `;
    
    children.forEach(child => {
        const hasChildren = categoriesSystem.getChildren(child.id).length > 0;
        container.innerHTML += `
            <div class="sub-cat-card" onclick="loadSubCategories('${child.id}')">
                <span>${child.name}</span>
                ${hasChildren ? '<i class="fas fa-chevron-left"></i>' : ''}
                ${child.price ? `<span class="price">$${child.price}</span>` : ''}
            </div>
        `;
    });
}

// عرض المنتجات
function showProducts(categoryId) {
    const products = categoriesSystem.getChildren(categoryId);
    const category = categoriesSystem.categories.find(c => c.id === categoryId);
    
    const container = document.getElementById('subCategoriesContainer');
    
    container.innerHTML = `
        <div class="sub-header">
            <h3>${category.name}</h3>
        </div>
        <div class="products-grid">
    `;
    
    products.forEach(prod => {
        container.innerHTML += `
            <div class="product-card" onclick="openPurchaseModal('${prod.name}', '${prod.price}')">
                <div class="product-name">${prod.name}</div>
                <div class="product-price">$${prod.price}</div>
                <button class="buy-small">اشتري</button>
            </div>
        `;
    });
    
    container.innerHTML += '</div>';
}

// مسار التنقل
function updateBreadcrumb(categoryId) {
    const path = categoriesSystem.getPath(categoryId);
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    breadcrumb.innerHTML = '<i class="fas fa-home" onclick="renderMainCategories()"></i>';
    
    path.forEach((cat, index) => {
        if (index === path.length - 1) {
            breadcrumb.innerHTML += `<span>${cat.name}</span>`;
        } else {
            breadcrumb.innerHTML += `<span onclick="loadSubCategories('${cat.id}')">${cat.name}</span>`;
            breadcrumb.innerHTML += `<i class="fas fa-chevron-left"></i>`;
        }
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    renderMainCategories();
});

// دالة مؤقتة لفتح نافذة الشراء (لأن main.js ممكن يكون مش شغال)
window.openPurchaseModal = function(productName, price) {
    alert(`شراء: ${productName}\nالسعر: $${price}\nهنا رح تفتح نافذة الشراء`);
};