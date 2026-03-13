// ==================== دوال المحفظة والطلبات ====================
import { db } from './firebase-config.js';
import { currentUser } from './auth.js';
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== بيانات طرق الدفع مع إضافة روابط الصور =====
const paymentMethods = [
    {
        name: 'شام كاش',
        walletNumber: '053b8f0d907772543d262622121d6df2',
        image: 'https://via.placeholder.com/80/1a1a1a/fbbf24?text=شام' // رابط الصورة
    },
    {
        name: 'يا مرسال',
        walletNumber: 'TDwUTu5vTi8oscYymqbyqcK9E3aZrtiuyk',
        image: 'https://via.placeholder.com/80/1a1a1a/fbbf24?text=مرسال' // رابط الصورة
    },
    {
        name: 'ليرات',
        walletNumber: 'L793143293',
        image: 'https://via.placeholder.com/80/1a1a1a/fbbf24?text=ليرات' // رابط الصورة
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

// دالة لتحديد طريقة الدفع
function selectPaymentMethod(methodName) {
    // إزالة التحديد السابق
    document.querySelectorAll('.payment-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // تحديد الكارد المختار
    const selectedCard = Array.from(document.querySelectorAll('.payment-card')).find(
        card => card.getAttribute('data-method') === methodName
    );
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // تحديث الراديو المخفي
    let radio = document.querySelector(`input[value="${methodName}"]`);
    if (!radio) {
        radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'paymentMethod';
        radio.value = methodName;
        radio.style.display = 'none';
        document.getElementById('depositModal').appendChild(radio);
    }
    radio.checked = true;
}

// ===== نافذة الإيداع الجديدة (كروت 3 في السطر) =====
window.showDepositModal = function() {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    
    let methodsHtml = '';
    paymentMethods.forEach((method) => {
        methodsHtml += `
            <div class="payment-card" data-method="${method.name}" onclick="selectPaymentMethod('${method.name}')">
                <div class="payment-image">
                    <img src="${method.image}" alt="${method.name}">
                </div>
                <h4 class="payment-name">${method.name}</h4>
                <div class="payment-number">${method.walletNumber}</div>
                <button class="copy-btn" onclick="copyToClipboard('${method.walletNumber}'); event.stopPropagation();">📋 نسخ</button>
            </div>
        `;
    });
    
    const modalHtml = `
        <div id="depositModal" class="modal" style="display: flex; align-items: flex-start; overflow-y: auto;">
            <div class="modal-content" style="max-width: 550px; margin: 20px auto; max-height: 90vh; overflow-y: auto;">
                <span class="close" onclick="closeModal('depositModal')" style="position: sticky; top: 0;">&times;</span>
                <h2 style="text-align: center; color: #fbbf24; margin-top: 0;">💰 إيداع رصيد جديد</h2>
                
                <div class="payment-grid">
                    ${methodsHtml}
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px;">المبلغ الذي قمت بتحويله ($) (الحد الأدنى 2$):</label>
                    <input type="number" id="depositAmount" min="2" step="0.01" style="width: 100%; padding: 15px; background: #333; border: 1px solid #fbbf24; border-radius: 10px; color: #fff; font-size: 16px;" placeholder="أدخل المبلغ">
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px;">رقم العملية (Transaction ID):</label>
                    <input type="text" id="transactionId" style="width: 100%; padding: 15px; background: #333; border: 1px solid #fbbf24; border-radius: 10px; color: #fff; font-size: 16px;" placeholder="أدخل رقم العملية من التطبيق">
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px;">صورة الإيصال (من التطبيق):</label>
                    <input type="file" id="receiptImage" accept="image/*" style="width: 100%; padding: 15px; background: #333; border: 1px solid #fbbf24; border-radius: 10px; color: #fff;">
                </div>
                
                <button onclick="submitDeposit()" style="width: 100%; background: #fbbf24; color: #000; border: none; padding: 15px; border-radius: 30px; font-weight: 700; font-size: 16px; margin-bottom: 10px;">📤 إرسال طلب الإيداع</button>
            </div>
        </div>
    `;
    
    let oldModal = document.getElementById('depositModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// نسخ النص إلى الحافظة
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ تم النسخ إلى الحافظة');
    }).catch(() => {
        showToast('❌ فشل النسخ', 'error');
    });
};

// إرسال طلب الإيداع
window.submitDeposit = async function() {
    if (!currentUser) {
        showToast('❌ سجل دخول أولاً', 'error');
        return;
    }
    
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedMethod) {
        showToast('❌ اختر طريقة الدفع أولاً', 'error');
        return;
    }
    const methodName = selectedMethod.value;
    
    const amount = parseFloat(document.getElementById('depositAmount')?.value);
    const transactionId = document.getElementById('transactionId')?.value.trim();
    const fileInput = document.getElementById('receiptImage');
    
    if (!amount || amount < 2) {
        showToast('❌ الحد الأدنى للإيداع 2$', 'error');
        return;
    }
    
    if (!transactionId) {
        showToast('❌ يرجى إدخال رقم العملية', 'error');
        return;
    }
    
    if (!fileInput || fileInput.files.length === 0) {
        showToast('❌ يرجى رفع صورة الإيصال', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        const imageBase64 = e.target.result.split(',')[1];
        
        try {
            const depositRef = await addDoc(collection(db, 'charges'), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: currentUser.name,
                amount: amount,
                method: methodName,
                transactionId: transactionId,
                status: 'pending',
                date: new Date().toISOString(),
                imageBase64: imageBase64,
                fileName: file.name,
                fileType: file.type
            });
            
            const msg = `💰 طلب إيداع جديد
════════════════
👤 المستخدم: ${currentUser.name}
📧 البريد: ${currentUser.email}
💵 المبلغ: ${amount}$
💳 طريقة الدفع: ${methodName}
🔢 رقم العملية: ${transactionId}
🆔 رقم الطلب: ${depositRef.id}
📅 التاريخ: ${new Date().toLocaleString()}
════════════════
📎 الصورة مرفقة: ${file.name}`;
            
            window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(msg)}`, '_blank');
            
            showToast('✅ تم إرسال طلب الإيداع، سيتم مراجعته قريباً');
            closeModal('depositModal');
            
        } catch (error) {
            showToast('❌ فشل إرسال الطلب: ' + error.message, 'error');
        }
    };
    
    reader.readAsDataURL(file);
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