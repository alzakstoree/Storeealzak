// بيانات الأقسام حسب طلبك
const categoriesData = {
    main: [
        {
            id: 'cocco',
            name: 'Cocco',
            icon: 'fa-gem',
            sub: [
                { id: 'cocco_apps', name: 'قسم التطبيقات' },
                { id: 'cocco_games', name: 'قسم الألعاب' },
                { id: 'cocco_help', name: 'قسم التعليمات' }
            ]
        },
        {
            id: 'mtn',
            name: 'MTN',
            icon: 'fa-signal',
            sub: [
                { id: 'mtn_balance', name: 'الرصيد والعمليات' },
                { id: 'mtn_numbers', name: 'قسم الأرقام' },
                { id: 'mtn_digital', name: 'قسم الرقميات' }
            ]
        },
        {
            id: 'visa',
            name: 'VISA',
            icon: 'fa-credit-card',
            sub: [
                { id: 'visa_backup', name: 'التوثيق الاحتياطي' },
                { id: 'visa_accounts', name: 'توثيق الحسابات' },
                { id: 'visa_electronic', name: 'توثيق إلكترونية' }
            ]
        }
    ],
    
    products: {
        cocco_apps: [
            { name: 'نتفليكس', price: 5 },
            { name: 'سبوتيفاي', price: 3 },
            { name: 'شاهد VIP', price: 4 }
        ],
        cocco_games: [
            { name: 'PUBG - 60 UC', price: 1 },
            { name: 'PUBG - 300 UC', price: 5 },
            { name: 'Free Fire - 100', price: 2 }
        ],
        mtn_balance: [
            { name: 'رصيد 5000', price: 5 },
            { name: 'رصيد 10000', price: 9 },
            { name: 'رصيد 25000', price: 20 }
        ],
        visa_accounts: [
            { name: 'توثيق فيزا', price: 15 },
            { name: 'توثيق ماستركارد', price: 15 }
        ]
    }
};

// عرض الأقسام الرئيسية
function showMainCategories() {
    const container = document.getElementById('mainCategories');
    const subContainer = document.getElementById('subContent');
    
    container.innerHTML = '';
    subContainer.innerHTML = '';
    
    categoriesData.main.forEach(cat => {
        container.innerHTML += `
            <div class="category-card" onclick="showSubCategories('${cat.id}')">
                <i class="fas ${cat.icon}"></i>
                <h3>${cat.name}</h3>
            </div>
        `;
    });
    
    updateBreadcrumb([{ name: 'الرئيسية' }]);
}

// عرض الفئات الفرعية
function showSubCategories(mainId) {
    const mainCat = categoriesData.main.find(c => c.id === mainId);
    const container = document.getElementById('subContent');
    
    container.innerHTML = '<h2>' + mainCat.name + '</h2>';
    
    mainCat.sub.forEach(sub => {
        container.innerHTML += `
            <div class="sub-card" onclick="showProducts('${sub.id}', '${sub.name}')">
                <span>${sub.name}</span>
                <i class="fas fa-chevron-left"></i>
            </div>
        `;
    });
    
    updateBreadcrumb([
        { name: 'الرئيسية', onclick: 'showMainCategories()' },
        { name: mainCat.name }
    ]);
}

// عرض المنتجات
function showProducts(subId, subName) {
    const products = categoriesData.products[subId] || [];
    const container = document.getElementById('subContent');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">لا توجد منتجات</p>';
        return;
    }
    
    let html = '<h2>' + subName + '</h2><div class="products-grid">';
    
    products.forEach(p => {
        html += `
            <div class="product-card" onclick="openPurchaseModal('${p.name}', ${p.price})">
                <h4>${p.name}</h4>
                <p class="price">${p.price} $</p>
                <button class="buy-btn">اشتري</button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// تحديث مسار التنقل
function updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    
    path.forEach((item, index) => {
        if (item.onclick) {
            breadcrumb.innerHTML += `<span onclick="${item.onclick}">${item.name}</span>`;
        } else {
            breadcrumb.innerHTML += `<span>${item.name}</span>`;
        }
        if (index < path.length - 1) {
            breadcrumb.innerHTML += `<i class="fas fa-chevron-left"></i>`;
        }
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    showMainCategories();
});