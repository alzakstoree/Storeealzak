// ==================== دوال المصادقة (تسجيل الدخول) ====================
import { auth, googleProvider } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from './firebase-config.js';

export let currentUser = null;
export const ADMIN_EMAIL = 'alolao45y@gmail.com';

// دالة تحديث ظهور لوحة المدير
export function updateAdminMenu() {
    const adminMenuItem = document.getElementById('adminMenuItem');
    const adminLink = document.getElementById('adminLink');
    const isAdmin = currentUser && currentUser.email === ADMIN_EMAIL;
    
    if (adminMenuItem) adminMenuItem.style.display = isAdmin ? 'block' : 'none';
    if (adminLink) adminLink.style.display = isAdmin ? 'block' : 'none';
}

// إنشاء ملف المستخدم
export async function createUserProfile(user) {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        await setDoc(userRef, {
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            createdAt: new Date().toISOString(),
            walletBalance: 0
        });
    }
}

// مراقبة حالة تسجيل الدخول
export function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email.split('@')[0]
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAdminMenu();
            await createUserProfile(user);
            
            // تحديث المحفظة إذا كانت الدالة موجودة
            if (typeof window.updateWalletDisplay === 'function') {
                window.updateWalletDisplay();
            }
            if (typeof window.updateWalletMini === 'function') {
                window.updateWalletMini();
            }
        } else {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateAdminMenu();
            
            if (typeof window.updateWalletMini === 'function') {
                window.updateWalletMini();
            }
        }
    });
}

// تسجيل الدخول بالبريد
window.loginWithEmail = async function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById('authModal').style.display = 'none';
        showToast('✅ مرحباً بعودتك');
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
};

// تسجيل جديد
window.registerWithEmail = async function() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    if (!name || !email || !password) {
        showToast('❌ املأ جميع الحقول', 'error');
        return;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        showToast('✅ تم التسجيل بنجاح');
        document.getElementById('registerModal').style.display = 'none';
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
};

// تسجيل الدخول بـ Google
window.loginWithGoogle = async function() {
    try {
        await signInWithPopup(auth, googleProvider);
        document.getElementById('authModal').style.display = 'none';
        showToast('✅ مرحباً بك');
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
};

// تسجيل الخروج
window.logout = async function() {
    await signOut(auth);
    showToast('✅ تم تسجيل الخروج');
    if (typeof window.hideAdminPanel === 'function') {
        window.hideAdminPanel();
    }
    if (typeof window.updateWalletMini === 'function') {
        window.updateWalletMini();
    }
};