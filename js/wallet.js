// ==================== نظام المحفظة ====================
let wallets = JSON.parse(localStorage.getItem('wallets')) || {};

// عرض المحفظة
function showWallet() {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    
    if (!wallets[currentUser.email]) {
        wallets[currentUser.email] = { balance: 0, transactions: [] };
    }
    
    const wallet = wallets[currentUser.email];
    document.getElementById('walletBalance').textContent = wallet.balance + ' $';
    
    let transactionsHtml = '';
    wallet.transactions.slice(-10).reverse().forEach(t => {
        transactionsHtml += `
            <div class="transaction ${t.type}">
                <span>${t.description}</span>
                <span>${t.type === 'charge' ? '+' : '-'} ${Math.abs(t.amount)}$</span>
            </div>
        `;
    });
    
    document.getElementById('transactions').innerHTML = transactionsHtml || '<p>لا توجد حركات</p>';
    document.getElementById('walletModal').style.display = 'flex';
}

// طلب شحن الرصيد
function chargeWallet(amount) {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        return;
    }
    
    let charges = JSON.parse(localStorage.getItem('charges')) || [];
    charges.push({
        userEmail: currentUser.email,
        amount: amount,
        date: new Date().toISOString(),
        status: 'pending'
    });
    
    localStorage.setItem('charges', JSON.stringify(charges));
    
    showToast('تم إرسال طلب الشحن، انتظر تأكيد المدير');
    closeModal('walletModal');
    
    // إرسال إشعار واتساب للمدير
    const message = `🔔 طلب شحن جديد\nالمستخدم: ${currentUser.email}\nالمبلغ: ${amount}$`;
    window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(message)}`, '_blank');
}

// تأكيد الشراء
function confirmPurchase() {
    if (!currentPurchase) return;
    
    const playerId = document.getElementById('playerId').value;
    if (!playerId) {
        showToast('أدخل معرف اللعبة', 'error');
        return;
    }
    
    // حفظ الطلب
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push({
        product: currentPurchase.productName,
        price: currentPurchase.price,
        category: currentPurchase.categoryName,
        userEmail: currentUser?.email || 'زائر',
        playerId: playerId,
        date: new Date().toISOString(),
        status: 'pending'
    });
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // تحديث عداد السلة
    document.getElementById('cartBadge').textContent = orders.length;
    
    showToast('تم تأكيد الطلب');
    closeModal('purchaseModal');
    
    // فتح واتساب لتأكيد الدفع
    const message = `🛍️ طلب جديد\nالمنتج: ${currentPurchase.productName}\nالسعر: ${currentPurchase.price}$\nمعرف: ${playerId}`;
    window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(message)}`, '_blank');
}

// عرض طلبات المستخدم
function showOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.userEmail === currentUser?.email);
    
    // يمكن عرضها في نافذة منبثقة أو صفحة منفصلة
    alert('عدد طلباتك: ' + userOrders.length);
}