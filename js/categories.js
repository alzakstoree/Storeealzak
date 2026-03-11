// نظام الأقسام والفئات المتعددة المستويات
const categoriesSystem = {
    // جميع الأقسام (بيانات ثابتة)
    categories: [
        // الأقسام الرئيسية (level 1)
        { id: 'cat_mobile', name: 'ألعاب موبايل', icon: 'fa-gamepad', level: 1, parentId: null },
        { id: 'cat_pc', name: 'ألعاب كمبيوتر', icon: 'fa-desktop', level: 1, parentId: null },
        { id: 'cat_playstation', name: 'بلايستيشن', icon: 'fa-playstation', level: 1, parentId: null },
        
        // فئات فرعية للموبايل (level 2)
        { id: 'cat_pubg', name: 'PUBG Mobile', icon: 'fa-crosshairs', level: 2, parentId: 'cat_mobile' },
        { id: 'cat_freefire', name: 'Free Fire', icon: 'fa-fire', level: 2, parentId: 'cat_mobile' },
        { id: 'cat_cod', name: 'Call of Duty', icon: 'fa-bolt', level: 2, parentId: 'cat_mobile' },
        
        // فئات فرعية لـ PUBG (level 3)
        { id: 'cat_pubg_uc', name: 'UC (عملة)', level: 3, parentId: 'cat_pubg' },
        { id: 'cat_pubg_pass', name: 'Royale Pass', level: 3, parentId: 'cat_pubg' },
        { id: 'cat_pubg_skins', name: 'جلود أسلحة', level: 3, parentId: 'cat_pubg' },
        
        // فئات فرعية لـ UC (level 4 - المنتجات)
        { id: 'prod_pubg_60uc', name: '60 UC', price: '0.99', level: 4, parentId: 'cat_pubg_uc' },
        { id: 'prod_pubg_300uc', name: '300 UC + 25', price: '4.99', level: 4, parentId: 'cat_pubg_uc' },
        { id: 'prod_pubg_600uc', name: '600 UC + 60', price: '9.99', level: 4, parentId: 'cat_pubg_uc' },
        
        // فئات فرعية لـ Free Fire (level 3)
        { id: 'cat_ff_diamonds', name: 'دايموند', level: 3, parentId: 'cat_freefire' },
        { id: 'cat_ff_characters', name: 'شخصيات', level: 3, parentId: 'cat_freefire' },
        
        // منتجات Free Fire (level 4)
        { id: 'prod_ff_100', name: '100 جوهرة', price: '1.50', level: 4, parentId: 'cat_ff_diamonds' },
        { id: 'prod_ff_341', name: '341 جوهرة', price: '3.99', level: 4, parentId: 'cat_ff_diamonds' }
    ],
    
    // دالة جلب الأقسام حسب المستوى
    getCategoriesByLevel: function(level, parentId = null) {
        return this.categories.filter(c => c.level === level && c.parentId === parentId);
    },
    
    // دالة جلب الفروع لوالد معين
    getChildren: function(parentId) {
        return this.categories.filter(c => c.parentId === parentId);
    },
    
    // دالة جلب مسار القسم (للتنقل Breadcrumb)
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

// دالة عرض الأقسام الرئيسية في الصفحة
function renderMainCategories() {
    const mainCats = categoriesSystem.getCategoriesByLevel(1);
    const container = document.querySelector('.main-categories');
    if (!container) return;
    
    container.innerHTML = '';
    mainCats.forEach(cat => {
        container.innerHTML += `
            <div class="main-cat-item" onclick="loadSubCategories('${cat.id}', '${cat.name}')">
                ${cat.icon ? `<i class="fas ${cat.icon}"></i>` : ''}
                <span>${cat.name}</span>
                <i class="fas fa-chevron-left"></i>
            </div>
        `;
    });
}

// دالة عرض الفئات الفرعية
function loadSubCategories(parentId, parentName) {
    const children = categoriesSystem.getChildren(parentId);
    
    // تحديث مسار التنقل
    updateBreadcrumb(parentId);
    
    // عرض الفئات الفرعية
    const container = document.getElementById('subCategoriesContainer');
    if (!container) return;
    
    if (children.length === 0) {
        // هذا المنتج النهائي (صل للمنتجات)
        showProducts(parentId);
        return;
    }
    
    container.innerHTML = `<h3>${parentName}</h3>`;
    
    children.forEach(child => {
        const hasChildren = categoriesSystem.getChildren(child.id).length > 0;
        container.innerHTML += `
            <div class="sub-cat-item" onclick="loadSubCategories('${child.id}', '${child.name}')">
                <span>${child.name}</span>
                ${hasChildren ? '<i class="fas fa-chevron-left"></i>' : ''}
                ${child.price ? `<span class="price">$${child.price}</span>` : ''}
            </div>
        `;
    });
}

// دالة عرض المنتجات النهائية
function showProducts(categoryId) {
    const products = categoriesSystem.getChildren(categoryId); // المنتجات
    const container = document.getElementById('productsContainer');
    
    container.innerHTML = '<h3>المنتجات المتوفرة</h3>';
    
    products.forEach(prod => {
        container.innerHTML += `
            <div class="product-card" onclick="openPurchaseModal('${prod.name}', '${prod.price}')">
                <span>${prod.name}</span>
                <span class="price">$${prod.price}</span>
                <button class="buy-small">اشتري</button>
            </div>
        `;
    });
}

// دالة مسار التنقل (Breadcrumb)
function updateBreadcrumb(categoryId) {
    const path = categoriesSystem.getPath(categoryId);
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    breadcrumb.innerHTML = '';
    path.forEach((cat, index) => {
        if (index === path.length - 1) {
            breadcrumb.innerHTML += `<span>${cat.name}</span>`;
        } else {
            breadcrumb.innerHTML += `<span onclick="loadSubCategories('${cat.id}', '${cat.name}')">${cat.name}</span> <i class="fas fa-chevron-left"></i> `;
        }
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    renderMainCategories();
});