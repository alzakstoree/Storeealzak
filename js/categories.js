// ==================== الأقسام والفئات ====================
const storeData = {
    sections: [
        {
            id: 'games',
            name: 'الألعاب',
            icon: 'fa-gamepad',
            image: 'https://i.ibb.co/vc4DVH2C/Screenshot-20260312-002402.png',
            categories: [
                {
                    id: 'pubg',
                    name: 'PUBG',
                    image: 'https://i.ibb.co/vc4DVH2C/Screenshot-20260312-002402.png',
                    products: [
                        { id: 'pubg1', name: '60 UC', price: 0.99 },
                        { id: 'pubg2', name: '300 UC + 25', price: 4.99 },
                        { id: 'pubg3', name: '600 UC + 60', price: 9.99 },
                        { id: 'pubg4', name: '1500 UC + 300', price: 24.99 },
                        { id: 'pubg5', name: '3000 UC + 850', price: 49.99 },
                        { id: 'pubg6', name: '6000 UC + 2000', price: 99.99 }
                    ]
                },
                {
                    id: 'freefire',
                    name: 'Free Fire',
                    image: 'https://i.ibb.co/vc4DVH2C/Screenshot-20260312-002402.png',
                    products: [
                        { id: 'ff1', name: '100 جوهرة', price: 1.50 },
                        { id: 'ff2', name: '341 جوهرة', price: 3.99 },
                        { id: 'ff3', name: '572 جوهرة', price: 5.99 },
                        { id: 'ff4', name: '1060 جوهرة', price: 11.99 },
                        { id: 'ff5', name: '2079 جوهرة', price: 24.99 },
                        { id: 'ff6', name: '5600 دايموند', price: 49.99 }
                    ]
                }
            ]
        },
        {
            id: 'apps',
            name: 'التطبيقات',
            icon: 'fa-mobile-alt',
            image: 'https://i.ibb.co/dpjQfMPQ/Screenshot-20260312-001846.png',
            categories: [
                {
                    id: 'shahid',
                    name: 'شاهد VIP',
                    image: 'https://i.ibb.co/dpjQfMPQ/Screenshot-20260312-001846.png',
                    products: [
                        { id: 'shahid1', name: 'شهر واحد', price: 5.99 },
                        { id: 'shahid2', name: '3 شهور', price: 15.99 },
                        { id: 'shahid3', name: 'سنة كاملة', price: 49.99 }
                    ]
                },
                {
                    id: 'netflix',
                    name: 'نتفلكس',
                    image: 'https://i.ibb.co/dpjQfMPQ/Screenshot-20260312-001846.png',
                    products: [
                        { id: 'net1', name: 'شهر واحد', price: 7.99 },
                        { id: 'net2', name: '3 شهور', price: 21.99 },
                        { id: 'net3', name: 'سنة كاملة', price: 79.99 }
                    ]
                }
            ]
        },
        {
            id: 'cards',
            name: 'بطاقات جوجل',
            icon: 'fa-google',
            image: 'https://i.ibb.co/qF95JZfM/Screenshot-20260312-002552.png',
            categories: [
                {
                    id: 'google',
                    name: 'بطاقات جوجل بلاي',
                    image: 'https://i.ibb.co/qF95JZfM/Screenshot-20260312-002552.png',
                    products: [
                        { id: 'gp1', name: 'بطاقة 10$', price: 10.00 },
                        { id: 'gp2', name: 'بطاقة 25$', price: 25.00 },
                        { id: 'gp3', name: 'بطاقة 50$', price: 50.00 }
                    ]
                }
            ]
        }
    ]
};

// متغير عام للطلب الحالي
let currentPurchase = null;

// عرض الأقسام الرئيسية
function showMainCategories() {
    const container = document.getElementById('mainCategories');
    if (!container) return;
    
    container.innerHTML = '';
    
    storeData.sections.forEach(section => {
        container.innerHTML += `
            <div class="section-card" onclick="showCategories('${section.id}')">
                <div class="section-image" style="background-image: url('${section.image}')">
                    <div class="section-overlay">
                        <i class="fas ${section.icon}"></i>
                        <h3>${section.name}</h3>
                    </div>
                </div>
            </div>
        `;
    });
    
    const subContent = document.getElementById('subContent');
    if (subContent) subContent.innerHTML = '';
    
    updateBreadcrumb([{ name: 'الرئيسية' }]);
}

// عرض الفئات
function showCategories(sectionId) {
    const section = storeData.sections.find(s => s.id === sectionId);
    const container = document.getElementById('subContent');
    if (!container) return;
    
    container.innerHTML = `<h2 class="section-title">${section.name}</h2>`;
    
    section.categories.forEach(cat => {
        container.innerHTML += `
            <div class="category-card" onclick="showProducts('${sectionId}', '${cat.id}')">
                <div class="category-image" style="background-image: url('${cat.image}')">
                    <div class="category-overlay">
                        <h4>${cat.name}</h4>
                    </div>
                </div>
            </div>
        `;
    });
    
    updateBreadcrumb([
        { name: 'الرئيسية', onclick: 'showMainCategories()' },
        { name: section.name }
    ]);
}

// عرض المنتجات
function showProducts(sectionId, categoryId) {
    const section = storeData.sections.find(s => s.id === sectionId);
    const category = section.categories.find(c => c.id === categoryId);
    const container = document.getElementById('subContent');
    if (!container) return;
    
    let html = `<h2 class="section-title">${category.name}</h2><div class="products-grid">`;
    
    category.products.forEach(prod => {
        html += `
            <div class="product-card" onclick="openPurchaseModal('${prod.name}', ${prod.price}, '${category.name}')">
                <h4>${prod.name}</h4>
                <p class="price">${prod.price} $</p>
                <button class="buy-btn">اشتري</button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    updateBreadcrumb([
        { name: 'الرئيسية', onclick: 'showMainCategories()' },
        { name: section.name, onclick: `showCategories('${sectionId}')` },
        { name: category.name }
    ]);
}

// فتح نافذة الشراء
function openPurchaseModal(productName, price, categoryName) {
    currentPurchase = { productName, price, categoryName };
    const details = document.getElementById('purchaseDetails');
    if (details) {
        details.innerHTML = `
            <p>المنتج: ${productName}</p>
            <p>السعر: ${price} $</p>
        `;
    }
    const modal = document.getElementById('purchaseModal');
    if (modal) modal.style.display = 'flex';
}

// مسار التنقل
function updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    breadcrumb.innerHTML = '<i class="fas fa-home" onclick="showMainCategories()"></i>';
    
    path.forEach((item, index) => {
        if (item.onclick) {
            breadcrumb.innerHTML += `<span onclick="${item.onclick}">${item.name}</span>`;
        } else {
            breadcrumb.innerHTML += `<span>${item.name}</span>`;
        }
        if (index < path.length - 1) breadcrumb.innerHTML += `<i class="fas fa-chevron-left"></i>`;
    });
}

// تأكيد الشراء
function confirmPurchase() {
    if (!currentPurchase) return;
    
    const playerId = document.getElementById('playerId')?.value;
    if (!playerId) {
        showToast('أدخل معرف اللعبة', 'error');
        return;
    }
    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push({
        product: currentPurchase.productName,
        price: currentPurchase.price,
        category: currentPurchase.categoryName,
        playerId: playerId,
        date: new Date().toISOString(),
        status: 'pending'
    });
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = orders.length;
    
    showToast('تم تأكيد الطلب');
    document.getElementById('purchaseModal').style.display = 'none';
    
    const message = `طلب جديد: ${currentPurchase.productName}\nالسعر: ${currentPurchase.price}$\nمعرف: ${playerId}`;
    window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(message)}`, '_blank');
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    showMainCategories();
});