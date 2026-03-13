// ==================== دوال العرض الرئيسية والعناصر المشتركة ====================
import { defaultStoreData, loadStoreData } from './store-data.js';
import { initAuth, currentUser, ADMIN_EMAIL } from './auth.js';
import { getWalletBalance } from './wallet.js';

let storeData = loadStoreData();
let currentPurchase = null;
let currentSlide = 0;
let slideInterval;

// تهيئة الصفحة
window.onload = function() {
    showMainCategories();
    initAuth();
    updateUI();
    updateWalletMini();
    if (typeof updateAdminMenu === 'function') updateAdminMenu();
    initSlider();
};

// دوال القائمة الجانبية
window.toggleSideMenu = function() {
    document.getElementById('sideMenu').classList.toggle('show');
};

window.toggleTheme = function() {
    document.body.classList.toggle('light-mode');
};

// ===== تحديث الرصيد في الهيدر =====
async function updateWalletMini() {
    const walletMini = document.getElementById('walletMini');
    if (!walletMini) return;
    
    if (currentUser) {
        const balance = await getWalletBalance();
        walletMini.textContent = balance + '$';
    } else {
        walletMini.textContent = '0$';
    }
}

// ===== تحديث معلومات المستخدم في القائمة الجانبية =====
function updateUserInfoMenu() {
    const userInfoMenu = document.getElementById('userInfoMenu');
    const menuUserName = document.getElementById('menuUserName');
    const menuUserEmail = document.getElementById('menuUserEmail');
    
    if (!userInfoMenu || !menuUserName || !menuUserEmail) return;
    
    if (currentUser) {
        menuUserName.textContent = currentUser.name;
        menuUserEmail.textContent = currentUser.email;
    }
}

// ===== دوال السلايدر =====
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (slides.length === 0) return;
    
    // إضافة الأحداث للأزرار
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // إضافة الأحداث للنقاط
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // تشغيل السلايدر التلقائي
    startSlideTimer();
}

function updateSlider() {
    const slider = document.querySelector('.slider');
    const dots = document.querySelectorAll('.dot');
    
    if (!slider) return;
    
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
    restartSlideTimer();
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
    restartSlideTimer();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    currentSlide = index;
    updateSlider();
    restartSlideTimer();
}

function startSlideTimer() {
    slideInterval = setInterval(nextSlide, 5000);
}

function restartSlideTimer() {
    clearInterval(slideInterval);
    startSlideTimer();
}

// ===== دوال الأقسام والمنتجات =====
window.showMainCategories = function() {
    const container = document.getElementById('mainCategories');
    const subContainer = document.getElementById('subContent');
    if (!container) return;
    
    container.style.display = 'grid';
    subContainer.style.display = 'none';
    
    container.innerHTML = '';
    storeData.sections.forEach(section => {
        container.innerHTML += `
            <div class="section-card" style="background-image: url('${section.image}')" onclick="showCategories('${section.id}')">
                <div class="section-overlay">
                    <i class="fas ${section.icon}"></i>
                    <span>${section.name}</span>
                </div>
            </div>
        `;
    });
};

window.showCategories = function(sectionId) {
    const section = storeData.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const mainContainer = document.getElementById('mainCategories');
    const subContainer = document.getElementById('subContent');
    
    mainContainer.style.display = 'none';
    subContainer.style.display = 'block';
    
    let html = `<div class="breadcrumb" style="margin-bottom:15px;">
        <span onclick="showMainCategories()">🔙 الرئيسية</span>
        <span>${section.name}</span>
    </div>`;
    
    // استخدام grid لعرض الفئات (3 أعمدة)
    html += `<div class="categories-grid">`;
    
    section.categories.forEach(cat => {
        html += `
            <div class="category-card" onclick="showProducts('${section.id}', '${cat.id}')" style="background-image: url('${cat.image}')">
                <div class="category-overlay">
                    <h4>${cat.name}</h4>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    subContainer.innerHTML = html;
};

window.showProducts = function(sectionId, categoryId) {
    const section = storeData.sections.find(s => s.id === sectionId);
    if (!section) return;
    const category = section.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const subContainer = document.getElementById('subContent');
    if (!subContainer) return;
    
    let html = `<div class="breadcrumb" style="margin-bottom:15px;">
        <span onclick="showCategories('${sectionId}')">🔙 رجوع</span>
        <span>${category.name}</span>
    </div>
    <div class="products-grid">`;
    
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
    subContainer.innerHTML = html;
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

function updateUI() {
    const adminLink = document.getElementById('adminLink');
    const adminMenuItem = document.getElementById('adminMenuItem');
    const guestMenu = document.getElementById('guestMenu');
    const userInfoMenu = document.getElementById('userInfoMenu');
    
    if (currentUser) {
        // مستخدم مسجل
        if (adminLink) {
            adminLink.style.display = currentUser.email === ADMIN_EMAIL ? 'block' : 'none';
        }
        if (adminMenuItem) {
            adminMenuItem.style.display = currentUser.email === ADMIN_EMAIL ? 'block' : 'none';
        }
        
        // إخفاء قائمة الضيوف وإظهار معلومات المستخدم
        if (guestMenu) guestMenu.style.display = 'none';
        if (userInfoMenu) {
            userInfoMenu.style.display = 'block';
            updateUserInfoMenu();
        }
        
        updateWalletMini();
    } else {
        // مستخدم غير مسجل
        if (adminLink) adminLink.style.display = 'none';
        if (adminMenuItem) adminMenuItem.style.display = 'none';
        
        // إظهار قائمة الضيوف وإخفاء معلومات المستخدم
        if (guestMenu) guestMenu.style.display = 'block';
        if (userInfoMenu) userInfoMenu.style.display = 'none';
        
        updateWalletMini();
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

// تحديث الرصيد بشكل دوري
setInterval(() => {
    if (currentUser) {
        updateWalletMini();
    }
}, 10000);