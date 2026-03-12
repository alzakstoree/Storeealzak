// ==================== دوال المحفظة والطلبات ====================
import { db } from './firebase-config.js';
import { currentUser } from './auth.js';
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== المحفظة =====
export async function getWalletBalance() {
    if (!currentUser) return 0;
    const docRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.data()?.walletBalance || 0;
}

export async function updateWalletDisplay() {
    if (!currentUser) return;
    const balance = await getWalletBalance();
    document.getElementById('walletBalance').textContent = balance + '$';
    
    // جلب آخر 5 حركات
    const q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(5)
    );
    const querySnapshot = await getDocs(q);
    let html = '';
    querySnapshot.forEach(doc => {
        const t = doc.data();
        html += `<div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #333;">
            <span>${t.description}</span>
            <span style="color: ${t.type === 'charge' ? '#22c55e' : '#fbbf24'}">${t.type === 'charge' ? '+' : '-'}${t.amount}$</span>
        </div>`;
    });
    document.getElementById('walletTransactions').innerHTML = html || '<p style="text-align: center;">لا توجد حركات</p>';
}

// طلب شحن الرصيد
window.requestCharge = async function() {
    if (!currentUser) {
        showToast('❌ سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    
    const amount = parseFloat(document.getElementById('chargeAmount').value);
    if (amount < 1) {
        showToast('❌ الحد الأدنى للشحن 1$', 'error');
        return;
    }
    
    try {
        await addDoc(collection(db, 'charges'), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            amount: amount,
            status: 'pending',
            date: new Date().toISOString()
        });
        
        showToast('✅ تم إرسال طلب الشحن، انتظر تأكيد المدير');
        closeModal('walletModal');
        
        // إشعار واتساب للمدير
        const msg = `💰 طلب شحن جديد\nالمستخدم: ${currentUser.email}\nالمبلغ: ${amount}$`;
        window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (error) {
        showToast('❌ فشل إرسال الطلب', 'error');
    }
};

// تأكيد الشراء
window.confirmPurchase = async function() {
    if (!currentUser) {
        showToast('❌ سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    
    const playerId = document.getElementById('playerId').value;
    if (!playerId) {
        showToast('❌ أدخل معرف اللعبة', 'error');
        return;
    }
    
    if (!currentPurchase) {
        showToast('❌ لم يتم اختيار منتج', 'error');
        return;
    }
    
    const balance = await getWalletBalance();
    if (balance < currentPurchase.price) {
        showToast('❌ رصيد غير كافٍ', 'error');
        return;
    }
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const newBalance = userDoc.data().walletBalance - currentPurchase.price;
            transaction.update(userRef, { walletBalance: newBalance });
            
            await addDoc(collection(db, 'orders'), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                product: currentPurchase.name,
                price: currentPurchase.price,
                playerId: playerId,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            
            await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid,
                type: 'purchase',
                amount: currentPurchase.price,
                description: 'شراء ' + currentPurchase.name,
                date: new Date().toISOString()
            });
        });
        
        showToast('✅ تم الشراء بنجاح');
        closeModal('purchaseModal');
        updateWalletDisplay();
        
        // تحديث عداد السلة
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            const ordersSnap = await getDocs(query(collection(db, 'orders'), where('userId', '==', currentUser.uid)));
            cartBadge.textContent = ordersSnap.size;
        }
        
        // إشعار واتساب للمدير
        const msg = `🛒 طلب جديد\nالمنتج: ${currentPurchase.name}\nالسعر: ${currentPurchase.price}$\nالمستخدم: ${currentUser.email}\nمعرف: ${playerId}`;
        window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (error) {
        showToast('❌ فشل الشراء', 'error');
    }
};

// عرض طلبات المستخدم
window.showMyOrders = async function() {
    if (!currentUser) {
        showToast('❌ سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    
    const q = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    let html = '';
    querySnapshot.forEach(doc => {
        const o = doc.data();
        html += `
            <div style="background: #1a1a1a; border-radius: 10px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>${o.product}</span>
                    <span style="color: #fbbf24;">${o.price}$</span>
                </div>
                <div style="font-size: 12px;">معرف: ${o.playerId}</div>
                <div style="margin-top: 10px;">
                    <span style="background: ${o.status === 'pending' ? '#fbbf24' : '#22c55e'}; color: #000; padding: 5px 10px; border-radius: 20px;">${o.status === 'pending' ? '⏳ قيد الانتظار' : '✅ مكتمل'}</span>
                </div>
                <div style="font-size: 10px; color: #666; margin-top: 5px;">${new Date(o.createdAt).toLocaleString()}</div>
            </div>
        `;
    });
    
    document.getElementById('ordersList').innerHTML = html || '<p style="text-align: center;">لا توجد طلبات</p>';
    document.getElementById('ordersModal').style.display = 'flex';
};

// عرض المحفظة
window.showWallet = function() {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    updateWalletDisplay();
    document.getElementById('walletModal').style.display = 'flex';
};