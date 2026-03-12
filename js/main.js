// ==================== دوال العرض الرئيسية والعناصر المشتركة ====================
import { defaultStoreData, loadStoreData } from './store-data.js';
import { initAuth, currentUser } from './auth.js';

let storeData = loadStoreData();
let currentPurchase = null;

// تهيئة الصفحة
window.onload = function() {
    showMainCategories();
    initAuth();
    updateUI();
    if (typeof updateAdminMenu === 'function') updateAdminMenu();
};

// دوال القائمة الجانبية
window.toggleSideMenu = function() {
    document.getElementById('sideMenu').classList.toggle('show');
};

window.toggleTheme = function() {
    document.body.classList.toggle('light-mode');
};

// دوال التنقل
window.showMainCategories = function() {
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
    document.getElementById('subContent').innerHTML = '';
    updateBreadcrumb([{ name: 'الرئيسية' }]);
};

window.showCategories = function(sectionId) {
    const section = storeData.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const container = document.getElementById('subContent');
    if (!container) return;
    
    container.innerHTML = `<h2 style="color: #fbbf24; text-align: center; margin: 15px;">${section.name}</h2>`;
    
    section.categories.forEach(cat => {
        container.innerHTML += `
            <div class="category-card" onclick="showProducts('${section.id}', '${cat.id}')">
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
};

window.showProducts = function(sectionId, categoryId) {
    const section = storeData.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const category = section.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const container = document.getElementById('subContent');
    if (!container) return;
    
    let html = `<h2 style="color: #fbbf24; text-align: center; margin: 15px;">${category.name}</h2><div class="products-grid">`;
    
    category.products.forEach(prod => {
        html += `
            <div class="product-card" onclick="openPurchaseModal('${prod.name}', ${prod.price})">
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
        { name: section.name, onclick: `showCategories('${section.id}')` },
        { name: category.name }
    ]);
};

function updateBreadcrumb(path) {
    const bc = document.getElementById('breadcrumb');
    if (!bc) return;
    
    bc.innerHTML = '<i class="fas fa-home" onclick="showMainCategories()"></i>';
    
    path.forEach((item, i) => {
        if (item.onclick) {
            bc.innerHTML += `<span onclick="${item.onclick}">${item.name}</span>`;
        } else {
            bc.innerHTML += `<span>${item.name}</span>`;
        }
        if (i < path.length - 1) bc.innerHTML += `<i class="fas fa-chevron-left"></i>`;
    });
}

window.openPurchaseModal = function(name, price) {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    currentPurchase = { name, price };
    document.getElementById('purchaseDetails').innerHTML = `<p>المنتج: ${name}</p><p>السعر: ${price}$</p>`;
    document.getElementById('purchaseModal').style.display = 'flex';
};

// دوال مساعدة
window.showToast = function(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
};

window.showAuthModal = function() {
    document.getElementById('authModal').style.display = 'flex';
};

window.showRegisterModal = function() {
    closeModal('authModal');
    document.getElementById('registerModal').style.display = 'flex';
};

window.closeModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

window.toggleDropdown = function() {
    const d = document.getElementById('userDropdown');
    if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
};

function updateUI() {
    const loginIcon = document.getElementById('loginIcon');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        if (loginIcon) loginIcon.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            if (userName) userName.textContent = currentUser.name;
        }
    } else {
        if (loginIcon) loginIcon.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// تحديث عداد السلة
setInterval(async () => {
    if (currentUser && typeof getDocs !== 'undefined' && typeof collection !== 'undefined') {
        try {
            const { getDocs, collection, query, where } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            const { db } = await import('./firebase-config.js');
            const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            document.getElementById('cartBadge').textContent = querySnapshot.size;
        } catch (e) {
            // تجاهل الأخطاء
        }
    }
}, 5000);