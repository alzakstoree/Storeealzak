// ==================== دوال المحفظة والطلبات ====================
import { db } from './firebase-config.js';
import { currentUser } from './auth.js';
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===== بيانات طرق الدفع =====
const paymentMethods = [
    {
        name: 'شام كاش',
        walletNumber: '053b8f0d907772543d262622121d6df2',
        accountName: 'اسحاق وسام الاسماعيل'
    },
    {
        name: 'يا مرسال',
        walletNumber: 'TDwUTu5vTi8oscYymqbyqcK9E3aZrtiuyk',
        accountName: 'ALZAK STORE'
    },
    {
        name: 'ليرات',
        walletNumber: 'L793143293',
        accountName: 'ALZAK STORE'
    }
];

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

// ===== نافذة الإيداع الجديدة =====
window.showDepositModal = function() {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    
    let methodsHtml = '';
    paymentMethods.forEach((method) => {
        methodsHtml += `
            <div style="margin-bottom: 20px; padding: 15px; background: #1a1a1a; border-radius: 15px; border: 2px solid #fbbf24;">
                <h4 style="color: #fbbf24; margin-bottom: 10px;">💰 ${method.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0;">
                    <span>رقم المحفظة:</span>
                    <span style="color: #fbbf24; font-size: 12px; direction: ltr;">${method.walletNumber}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${method.walletNumber}')" style="background: #fbbf24; color: #000; border: none; padding: 5px 10px; border-radius: 20px; font-weight: 700;">نسخ</button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0;">
                    <span>الاسم:</span>
                    <span style="color: #fbbf24;">${method.accountName}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${method.accountName}')" style="background: #fbbf24; color: #000; border: none; padding: 5px 10px; border-radius: 20px; font-weight: 700;">نسخ</button>
                </div>
                <div style="margin-top: 10px; text-align: center;">
                    <input type="radio" name="paymentMethod" value="${method.name}" id="${method.name}" style="margin-left: 5px;">
                    <label for="${method.name}">اختيار ${method.name}</label>
                </div>
            </div>
        `;
    });
    
    const modalHtml = `
        <div id="depositModal" class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 500px;">
                <span class="close" onclick="closeModal('depositModal')">&times;</span>
                <h2 style="text-align: center; color: #fbbf24;">💰 إيداع رصيد جديد</h2>
                
                ${methodsHtml}
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px;">المبلغ الذي قمت بتحويله ($) (الحد الأدنى 2$):</label>
                    <input type="number" id="depositAmount" min="2" step="0.01" style="width: 100%; padding: 12px; background: #333; border: 1px solid #fbbf24; border-radius: 10px; color: #fff; font-size: 16px;" placeholder="أدخل المبلغ">
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px;">رقم العملية (Transaction ID):</label>
                    <input type="text" id="transactionId" style="width: 100%; padding: 12px; background: #333; border: 1px solid #fbbf24; border-radius: 10px; color: #fff; font-size: 16px;" placeholder="أدخل رقم العملية من التطبيق">
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px;">صورة الإيصال (من التطبيق):</label>
                    <input type="file" id="receiptImage" accept="image/*" style="width: 100%; padding: 12px; background: #333; border: 1px solid #fbbf24; border-radius: 10px; color: #fff;">
                </div>
                
                <button onclick="submitDeposit()" style="width: 100%; background: #fbbf24; color: #000; border: none; padding: 15px; border-radius: 30px; font-weight: 700; font-size: 16px;">📤 إرسال طلب الإيداع</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    let modalElement = document.getElementById('depositModal');
    if (modalElement) {
        modalElement.remove();
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
    
    // تحديد طريقة الدفع المختارة
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
    
    // تحويل الصورة إلى Base64
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        const imageBase64 = e.target.result.split(',')[1];
        
        try {
            // إنشاء طلب الإيداع في قاعدة البيانات
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
            
            // إرسال رسالة واتساب للمدير بكل التفاصيل
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