// نظام تسجيل العملاء وتسجيل الدخول
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// إعدادات Firebase (استبدل هذه بالقيم الحقيقية من موقع Firebase)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "alzak-store.firebaseapp.com",
    projectId: "alzak-store",
    storageBucket: "alzak-store.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// البريد الإلكتروني للمالك (استبدله ببريدك أنت)
const OWNER_EMAIL = "alolao45y@gmail.com"; // ⚠️ غير هذا إلى بريدك

// حالة المستخدم الحالي
let currentUser = JSON.parse(localStorage.getItem('alzak_user')) || null;

// تحديث واجهة المستخدم حسب حالة الدخول
function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');
    
    if (currentUser) {
        // مستخدم مسجل الدخول
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userName) userName.textContent = currentUser.displayName || currentUser.email;
        
        // هل هو المالك؟ (بريده الإلكتروني)
        if (adminLink) {
            if (currentUser.email === OWNER_EMAIL) {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        }
    } else {
        // لا يوجد مستخدم
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// تسجيل الدخول بجوجل
window.loginWithGoogle = function() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            };
            localStorage.setItem('alzak_user', JSON.stringify(currentUser));
            updateUIForUser();
            showToast(`مرحباً ${user.displayName || user.email}`, 'success');
            
            // إذا كان المالك، أظهر لوحة التحكم
            if (user.email === OWNER_EMAIL) {
                showAdminPanel();
            }
        })
        .catch((error) => {
            showToast('فشل تسجيل الدخول: ' + error.message, 'error');
        });
};

// تسجيل الدخول بالبريد وكلمة السر
window.loginWithEmail = function(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((result) => {
            const user = result.user;
            currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.email.split('@')[0]
            };
            localStorage.setItem('alzak_user', JSON.stringify(currentUser));
            updateUIForUser();
            showToast('تم تسجيل الدخول بنجاح', 'success');
            
            // إذا كان المالك، أظهر لوحة التحكم
            if (user.email === OWNER_EMAIL) {
                showAdminPanel();
            }
        })
        .catch((error) => {
            showToast('فشل تسجيل الدخول: ' + error.message, 'error');
        });
};

// إنشاء حساب جديد
window.registerWithEmail = function(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((result) => {
            const user = result.user;
            currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: email.split('@')[0]
            };
            localStorage.setItem('alzak_user', JSON.stringify(currentUser));
            updateUIForUser();
            showToast('تم إنشاء الحساب بنجاح', 'success');
        })
        .catch((error) => {
            showToast('فشل إنشاء الحساب: ' + error.message, 'error');
        });
};

// تسجيل الخروج
window.logout = function() {
    signOut(auth).then(() => {
        currentUser = null;
        localStorage.removeItem('alzak_user');
        updateUIForUser();
        showToast('تم تسجيل الخروج', 'success');
    }).catch((error) => {
        showToast('فشل تسجيل الخروج', 'error');
    });
};

// التحقق من أن المستخدم الحالي هو المالك
window.isOwner = function() {
    return currentUser && currentUser.email === OWNER_EMAIL;
};

// إظهار لوحة المدير (للمالك فقط)
window.showAdminPanel = function() {
    if (isOwner()) {
        document.getElementById('adminPanel')?.classList.add('show');
    } else {
        showToast('غير مصرح لك بالدخول', 'error');
    }
};

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة عناصر واجهة المستخدم للدخول
    addAuthUI();
    updateUIForUser();
});

// إضافة عناصر تسجيل الدخول للصفحة
function addAuthUI() {
    // أضف هذا قرب أيقونة السلة في الهيدر
    const iconsContainer = document.querySelector('.icons');
    if (iconsContainer) {
        iconsContainer.innerHTML = `
            <div id="loginBtn" class="login-btn" onclick="showAuthModal()">
                <i class="fas fa-user"></i>
            </div>
            <div id="userMenu" class="user-menu" style="display: none;">
                <img id="userPhoto" src="" alt="" onerror="this.src='https://via.placeholder.com/30'">
                <span id="userName"></span>
                <div class="user-dropdown">
                    <a href="#" onclick="showMyProfile()">حسابي</a>
                    <a href="#" onclick="showMyWallet()">محفظتي</a>
                    <a href="#" onclick="showMyOrders()">طلباتي</a>
                    <a href="#" id="adminLink" style="display: none;" onclick="showAdminPanel()">لوحة المدير</a>
                    <a href="#" onclick="logout()">تسجيل خروج</a>
                </div>
            </div>
        ` + iconsContainer.innerHTML;
    }
}

// نافذة تسجيل الدخول
window.showAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('show');
    } else {
        // أنشئ النافذة
        createAuthModal();
    }
};

// إنشاء نافذة تسجيل الدخول
function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-close" onclick="this.closest('.modal').classList.remove('show')">✕</div>
            <h3 style="text-align: center; color: #fbbf24;">تسجيل الدخول</h3>
            
            <button class="google-login-btn" onclick="loginWithGoogle()">
                <i class="fab fa-google"></i> سجل بحساب جوجل
            </button>
            
            <div style="text-align: center; margin: 20px 0; color: #666;">أو</div>
            
            <input type="email" id="loginEmail" class="modal-input" placeholder="البريد الإلكتروني">
            <input type="password" id="loginPassword" class="modal-input" placeholder="كلمة السر">
            
            <button class="buy-btn" onclick="loginWithEmail(
                document.getElementById('loginEmail').value,
                document.getElementById('loginPassword').value
            )">دخول</button>
            
            <p style="text-align: center; margin-top: 15px;">
                ما عندك حساب؟ 
                <span onclick="showRegisterForm()" style="color: #fbbf24; cursor: pointer;">سجل الآن</span>
            </p>
        </div>
    `;
    document.body.appendChild(modal);
}

// إنهينا الملف
console.log('✅ نظام تسجيل العملاء جاهز');