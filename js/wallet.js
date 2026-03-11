// نظام المحفظة والرصيد للعملاء

// بيانات المحفظة (تخزين في localStorage مؤقتاً)
let userWallets = JSON.parse(localStorage.getItem('alzak_wallets')) || {};

// دالة الحصول على محفظة المستخدم
function getUserWallet(userId) {
    if (!userWallets[userId]) {
        // إنشاء محفظة جديدة للمستخدم
        userWallets[userId] = {
            balance: 0,
            transactions: [],
            createdAt: new Date().toISOString()
        };
        saveWallets();
    }
    return userWallets[userId];
}

// حفظ المحافظ
function saveWallets() {
    localStorage.setItem('alzak_wallets', JSON.stringify(userWallets));
}

// عرض رصيد المستخدم الحالي
window.showWalletBalance = function() {
    if (!currentUser) {
        showToast('الرجاء تسجيل الدخول أولاً', 'error');
        return 0;
    }
    
    const wallet = getUserWallet(currentUser.uid);
    return wallet.balance;
};

// شحن الرصيد (طلب شحن)
window.requestCharge = function(amount) {
    if (!currentUser) {
        showToast('الرجاء تسجيل الدخول أولاً', 'error');
        return;
    }
    
    if (amount < 1) {
        showToast('الحد الأدنى للشحن 1$', 'error');
        return;
    }
    
    // إنشاء طلب شحن
    const chargeRequest = {
        id: 'ch_' + Date.now(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        amount: amount,
        status: 'pending', // pending, completed, cancelled
        date: new Date().toISOString(),
        paymentMethod: 'shamcash'
    };
    
    // حفظ طلب الشحن
    let chargeRequests = JSON.parse(localStorage.getItem('alzak_charges')) || [];
    chargeRequests.push(chargeRequest);
    localStorage.setItem('alzak_charges', JSON.stringify(chargeRequests));
    
    // عرض معلومات الدفع
    showPaymentInstructions(chargeRequest);
};

// عرض تعليمات الدفع
function showPaymentInstructions(chargeRequest) {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        document.getElementById('chargeAmount').textContent = chargeRequest.amount + '$';
        document.getElementById('chargeId').textContent = chargeRequest.id;
        modal.classList.add('show');
    } else {
        createPaymentModal(chargeRequest);
    }
}

// إنشاء نافذة الدفع
function createPaymentModal(chargeRequest) {
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-close" onclick="this.closest('.modal').classList.remove('show')">✕</div>
            <h3 style="text-align: center; color: #fbbf24;">شحن الرصيد</h3>
            
            <div class="payment-info">
                <p>المبلغ المطلوب: <strong id="chargeAmount">${chargeRequest.amount}$</strong></p>
                <p>رقم الطلب: <strong id="chargeId">${chargeRequest.id}</strong></p>
                
                <h4 style="color: #fbbf24; margin: 15px 0;">حول على المحفظة التالية:</h4>
                
                <div class="wallet-row">
                    <span>رقم المحفظة:</span>
                    <span style="color: #fbbf24;">053b8f0d907772543d262622121d6df2</span>
                    <button class="copy-btn" onclick="copyToClipboard('053b8f0d907772543d262622121d6df2')">نسخ</button>
                </div>
                
                <div class="wallet-row">
                    <span>الاسم:</span>
                    <span style="color: #fbbf24;">اسحاق وسام الاسماعيل</span>
                    <button class="copy-btn" onclick="copyToClipboard('اسحاق وسام الاسماعيل')">نسخ</button>
                </div>
                
                <div style="background: #000; border-radius: 10px; padding: 15px; margin: 15px 0;">
                    <p>بعد التحويل، انتظر تأكيد المدير</p>
                    <p>سيتم إضافة الرصيد تلقائياً بعد التأكيد</p>
                </div>
                
                <button class="whatsapp-btn" onclick="sendChargeProof('${chargeRequest.id}')">
                    <i class="fab fa-whatsapp"></i> أرسل إيصال التحويل
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// إرسال إيصال الشحن على واتساب
window.sendChargeProof = function(chargeId) {
    const chargeRequests = JSON.parse(localStorage.getItem('alzak_charges')) || [];
    const charge = chargeRequests.find(c => c.id === chargeId);
    
    if (!charge) return;
    
    const message = `💰 طلب شحن رصيد
رقم الطلب: ${charge.id}
المبلغ: ${charge.amount}$
البريد: ${charge.userEmail}
الرجاء تأكيد الشحن`;
    
    window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(message)}`, '_blank');
    showToast('تم إرسال الإيصال، انتظر التأكيد');
};

// تأكيد الشحن (للمدير فقط)
window.confirmCharge = function(chargeId) {
    if (!isOwner()) {
        showToast('غير مصرح', 'error');
        return;
    }
    
    let chargeRequests = JSON.parse(localStorage.getItem('alzak_charges')) || [];
    const chargeIndex = chargeRequests.findIndex(c => c.id === chargeId);
    
    if (chargeIndex === -1) return;
    
    // تحديث حالة الطلب
    chargeRequests[chargeIndex].status = 'completed';
    chargeRequests[chargeIndex].confirmedAt = new Date().toISOString();
    localStorage.setItem('alzak_charges', JSON.stringify(chargeRequests));
    
    // إضافة الرصيد للمستخدم
    const charge = chargeRequests[chargeIndex];
    const wallet = getUserWallet(charge.userId);
    wallet.balance += parseFloat(charge.amount);
    
    // إضافة حركة
    wallet.transactions.push({
        type: 'charge',
        amount: charge.amount,
        date: new Date().toISOString(),
        chargeId: charge.id
    });
    
    saveWallets();
    
    showToast('تم تأكيد الشحن وإضافة الرصيد');
};

// الشراء باستخدام الرصيد
window.purchaseWithWallet = function(product, price, playerId) {
    if (!currentUser) {
        showToast('الرجاء تسجيل الدخول أولاً', 'error');
        return false;
    }
    
    const wallet = getUserWallet(currentUser.uid);
    
    // التحقق من الرصيد
    if (wallet.balance < price) {
        showToast('رصيدك غير كافٍ. الرجاء شحن المحفظة', 'error');
        return false;
    }
    
    // خصم الرصيد
    wallet.balance -= parseFloat(price);
    
    // إضافة حركة شراء
    wallet.transactions.push({
        type: 'purchase',
        amount: -price,
        product: product,
        playerId: playerId,
        date: new Date().toISOString()
    });
    
    saveWallets();
    
    showToast('تم الشراء بنجاح! الرصيد المتبقي: ' + wallet.balance + '$');
    return true;
};

// عرض صفحة المحفظة
window.showWalletPage = function() {
    if (!currentUser) {
        showToast('الرجاء تسجيل الدخول أولاً', 'error');
        return;
    }
    
    const wallet = getUserWallet(currentUser.uid);
    
    const modal = document.getElementById('walletModal');
    if (modal) {
        document.getElementById('walletBalance').textContent = wallet.balance + ' $';
        
        // عرض آخر الحركات
        const transactionsList = document.getElementById('walletTransactions');
        if (transactionsList) {
            transactionsList.innerHTML = wallet.transactions.slice(-5).reverse().map(t => `
                <div class="transaction-item ${t.type}">
                    <span>${t.type === 'charge' ? 'شحن' : 'شراء'}</span>
                    <span>${t.type === 'charge' ? '+' : '-'} ${Math.abs(t.amount)}$</span>
                    <span>${new Date(t.date).toLocaleDateString()}</span>
                </div>
            `).join('');
        }
        
        modal.classList.add('show');
    } else {
        createWalletModal(wallet);
    }
};

// إنشاء نافذة المحفظة
function createWalletModal(wallet) {
    const modal = document.createElement('div');
    modal.id = 'walletModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-close" onclick="this.closest('.modal').classList.remove('show')">✕</div>
            <h3 style="text-align: center; color: #fbbf24;">محفظتي</h3>
            
            <div style="background: #1a1a1a; border-radius: 20px; padding: 25px; margin: 20px 0; text-align: center;">
                <div style="color: #666; margin-bottom: 10px;">الرصيد الحالي</div>
                <div style="font-size: 36px; font-weight: 900; color: #fbbf24;" id="walletBalance">${wallet.balance} $</div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <input type="number" id="chargeAmount" class="modal-input" placeholder="مبلغ الشحن" min="1" step="1">
                <button class="buy-btn" onclick="requestCharge(document.getElementById('chargeAmount').value)">شحن</button>
            </div>
            
            <h4 style="color: #fbbf24;">آخر الحركات</h4>
            <div id="walletTransactions" style="margin-top: 10px;">
                ${wallet.transactions.slice(-5).reverse().map(t => `
                    <div class="transaction-item" style="display: flex; justify-content: space-between; padding: 10px; background: #1a1a1a; border-radius: 10px; margin-bottom: 5px;">
                        <span>${t.type === 'charge' ? '➕ شحن' : '🛒 شراء'}</span>
                        <span style="color: ${t.type === 'charge' ? '#22c55e' : '#ef4444'}">${t.type === 'charge' ? '+' : '-'} ${Math.abs(t.amount)}$</span>
                        <span style="color: #666;">${new Date(t.date).toLocaleDateString()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// تعديل دالة الشراء الحالية لاستخدام المحفظة
window.purchaseWithWalletOption = function() {
    const playerId = document.getElementById('playerId').value;
    if (!playerId) {
        showToast('أدخل معرف اللعبة أولاً', 'error');
        return;
    }
    
    const finalPrice = parseFloat(document.getElementById('finalPrice').textContent.replace('$', ''));
    
    if (purchaseWithWallet(currentGame.pack, finalPrice, playerId)) {
        // حفظ الطلب
        saveOrder();
        
        // إغلاق النافذة بعد نجاح الشراء
        setTimeout(() => {
            closeModal();
        }, 1500);
    }
};

console.log('✅ نظام المحفظة جاهز');