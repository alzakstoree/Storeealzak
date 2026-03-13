// ==================== دوال العرض الرئيسية والعناصر المشتركة ====================
import { defaultStoreData, loadStoreData } from './store-data.js';
import { initAuth, currentUser } from './auth.js';

let storeData = loadStoreData();
let currentPurchase = null;
let currentSlide = 0;
let slideInterval;

// تهيئة الصفحة
window.onload = function() {
    showMainCategories();
    initAuth();
    updateUI();
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

// ===== دوال السلايدر (مبسطة ومضمونة) =====
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
    
    section.categories.forEach(cat => {
        html += `
            <div class="category-card" onclick="showProducts('${section.id}', '${cat.id}')">
                <div class="category-image" style="background-image: url('${cat.image}')">
                    <div class="category-overlay">
                        <h4>${cat.name}</h4>
                    </div>
                </div>
            </div>
        `;
    });
    
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