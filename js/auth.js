// ==================== نظام تسجيل الدخول ====================
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
const ADMIN_EMAIL = 'alolao45y@gmail.com';

// فتح نافذة تسجيل الدخول
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

// إغلاق النوافذ
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// تسجيل الدخول
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.length === 0) {
        users.push({
            name: 'المدير',
            email: ADMIN_EMAIL,
            password: 'admin123',
            isAdmin: true
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal('authModal');
        updateUI();
        showToast(`مرحباً ${user.name}`);
    } else {
        showToast('بريد أو كلمة سر خطأ', 'error');
    }
}

// تسجيل جديد
function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (!name || !email || !password) {
        showToast('املأ جميع الحقول', 'error');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.email === email)) {
        showToast('البريد موجود مسبقاً', 'error');
        return;
    }
    
    const newUser = {
        name, email, password,
        isAdmin: email === ADMIN_EMAIL,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('تم التسجيل بنجاح');
    closeModal('registerModal');
    showAuthModal();
}

// تسجيل الخروج
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('adminPanel').style.display = 'none';
    updateUI();
    showToast('تم تسجيل الخروج');
}

// تحديث واجهة المستخدم
function updateUI() {
    const loginIcon = document.getElementById('loginIcon');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');
    
    if (currentUser) {
        loginIcon.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = currentUser.name;
        
        if (currentUser.email === ADMIN_EMAIL) {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginIcon.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

// إظهار لوحة المدير
function showAdminPanel() {
    if (currentUser?.email === ADMIN_EMAIL) {
        document.getElementById('adminPanel').style.display = 'block';
        if (typeof loadAdminData === 'function') loadAdminData();
    }
}

function hideAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

function showRegister() {
    closeModal('authModal');
    document.getElementById('registerModal').style.display = 'flex';
}

// تهيئة
document.addEventListener('DOMContentLoaded', updateUI);