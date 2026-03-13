// ==================== دوال المحفظة والطلبات ====================
import { db } from './firebase-config.js';
import { currentUser } from './auth.js';
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== بيانات طرق الدفع مع الصور الحقيقية (تُستخدم في الصفحات الجديدة) =====
export const paymentMethods = [
    {
        name: 'شام كاش',
        walletNumber: '053b8f0d907772543d262622121d6df2',
        image: 'https://i.ibb.co/5XhmqrJq/Screenshot-20260313-152931.jpg',
        accountName: 'اسحاق وسام الاسماعيل'
    },
    {
        name: 'يا مرسال',
        walletNumber: 'TDwUTu5vTi8oscYymqbyqcK9E3aZrtiuyk',
        image: 'https://i.ibb.co/4ZcSH80M/Screenshot-20260313-152751.jpg',
        accountName: 'ALZAK STORE'
    },
    {
        name: 'ليرات',
        walletNumber: 'L793143293',
        image: 'https://i.ibb.co/5hm3cHSk/Screenshot-20260313-153215.jpg',
        accountName: 'ALZAK STORE'
    }
];

// ===== المحفظة (عرض الرصيد) =====
export async function getWalletBalance() {
    if (!currentUser) return 0;
    const docRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.data()?.walletBalance || 0;
}

// تحديث الرصيد في الهيدر والقائمة الجانبية
export async function updateWalletBalance() {
    if (!currentUser) return;
    const balance = await getWalletBalance();
    
    // تحديث الرصيد في الهيدر
    const walletMini = document.getElementById('walletMini');
    if (walletMini) {
        walletMini.textContent = balance + '$';
    }
    
    // تحديث الرصيد في نافذة المحفظة
    const walletBalance = document.getElementById('walletBalance');
    if (walletBalance) {
        walletBalance.textContent = balance + '$';
    }
}

export async function updateWalletDisplay() {
    if (!currentUser) return;
    await updateWalletBalance();
    
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

// ===== دوال الانتقال بين الصفحات =====

// فتح صفحة طرق الدفع (بدل النافذة المنبثقة)
window.showDepositModal = function() {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    window.location.href = 'payment-methods.html';
};

// نسخ النص إلى الحافظة
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ تم النسخ إلى الحافظة');
    }).catch(() => {
        showToast('❌ فشل النسخ', 'error');
    });
};

// إرسال طلب الإيداع (يُستدعى من صفحة payment-confirm.html)
window.submitDeposit = async function(amount, transactionId, imageBase64, fileName, fileType) {
    if (!currentUser) {
        showToast('❌ سجل دخول أولاً', 'error');
        return false;
    }
    
    try {
        const depositRef = await addDoc(collection(db, 'charges'), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.name,
            amount: amount,
            method: localStorage.getItem('selectedPaymentMethod'),
            transactionId: transactionId,
            status: 'pending',
            date: new Date().toISOString(),
            imageBase64: imageBase64,
            fileName: fileName,
            fileType: fileType
        });
        
        const msg = `💰 طلب إيداع جديد
════════════════
👤 المستخدم: ${currentUser.name}
📧 البريد: ${currentUser.email}
💵 المبلغ: ${amount}$
💳 طريقة الدفع: ${localStorage.getItem('selectedPaymentMethod')}
🔢 رقم العملية: ${transactionId}
🆔 رقم الطلب: ${depositRef.id}
📅 التاريخ: ${new Date().toLocaleString()}
════════════════
📎 الصورة مرفقة: ${fileName}`;
        
        window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(msg)}`, '_blank');
        
        return true;
    } catch (error) {
        console.error('خطأ في إرسال الطلب:', error);
        return false;
    }
};

// ===== دوال الطلبات (السلة) =====
window.showMyOrders = async function() {
    if (!currentUser) {
        showToast('❌ سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    
    try {
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        let html = '';
        if (querySnapshot.empty) {
            html = '<p style="text-align: center;">لا توجد طلبات</p>';
        } else {
            querySnapshot.forEach(doc => {
                const o = doc.data();
                const statusText = o.status === 'pending' ? '⏳ قيد الانتظار' : '✅ مكتمل';
                const statusColor = o.status === 'pending' ? '#fbbf24' : '#22c55e';
                
                html += `
                    <div style="background: #1a1a1a; border-radius: 10px; padding: 15px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-weight: 700;">${o.product}</span>
                            <span style="color: #fbbf24; font-weight: 900;">${o.price}$</span>
                        </div>
                        <div style="font-size: 12px; color: #888; margin-bottom: 5px;">معرف: ${o.playerId || 'غير محدد'}</div>
                        <div style="margin-top: 10px;">
                            <span style="background: ${statusColor}; color: #000; padding: 5px 10px; border-radius: 20px; font-size: 12px;">${statusText}</span>
                        </div>
                        <div style="font-size: 10px; color: #666; margin-top: 5px;">${new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                `;
            });
        }
        
        document.getElementById('ordersList').innerHTML = html;
        document.getElementById('ordersModal').style.display = 'flex';
    } catch (error) {
        showToast('❌ فشل تحميل الطلبات: ' + error.message, 'error');
    }
};

// دالة عرض المحفظة
window.showWallet = function() {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    updateWalletDisplay();
    document.getElementById('walletModal').style.display = 'flex';
};

// دالة لتأكيد الشحن من المدير (تستخدم في admin.js)
export async function confirmCharge(chargeId, userId, amount) {
    try {
        const userRef = doc(db, 'users', userId);
        const chargeRef = doc(db, 'charges', chargeId);
        
        const userDoc = await getDoc(userRef);
        const newBalance = (userDoc.data().walletBalance || 0) + amount;
        
        await updateDoc(userRef, { walletBalance: newBalance });
        await updateDoc(chargeRef, { status: 'completed' });
        
        await addDoc(collection(db, 'transactions'), {
            userId: userId,
            type: 'charge',
            amount: amount,
            description: 'شحن رصيد',
            date: new Date().toISOString()
        });
        
        // تحديث الرصيد في الواجهة إذا كان المستخدم الحالي هو نفسه
        if (currentUser && currentUser.uid === userId) {
            updateWalletBalance();
        }
        
        return true;
    } catch (error) {
        console.error('خطأ في تأكيد الشحن:', error);
        return false;
    }
}