// نظام المحفظة
let wallets = JSON.parse(localStorage.getItem('wallets')) || {};

// عرض المحفظة
function showWallet() {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        showAuthModal();
        return;
    }
    
    const wallet = wallets[currentUser.email] || { balance: 0, transactions: [] };
    
    document.getElementById('walletBalance').textContent = wallet.balance + ' $';
    
    let transactionsHtml = '';
    wallet.transactions.slice(-5).reverse().forEach(t => {
        transactionsHtml += `
            <div class="transaction ${t.type}">
                <span>${t.description}</span>
                <span>${t.amount} $</span>
            </div>
        `;
    });
    
    document.getElementById('transactions').innerHTML = transactionsHtml || '<p>لا توجد حركات</p>';
    document.getElementById('walletModal').style.display = 'flex';
}

// شحن الرصيد
function chargeWallet(amount) {
    if (!currentUser) {
        showToast('سجل دخول أولاً', 'error');
        return;
    }
    
    if (!wallets[currentUser.email]) {
        wallets[currentUser.email] = { balance: 0, transactions: [] };
    }
    
    // هنا تضيف طلب الشحن للمدير
    let charges = JSON.parse(localStorage.getItem('charges')) || [];
    charges.push({
        user: currentUser.email,
        amount: amount,
        date: new Date().toISOString(),
        status: 'pending'
    });
    localStorage.setItem('charges', JSON.stringify(charges));
    
    showToast('طلب شحن قيد المراجعة');
    closeModal('walletModal');
    
    // إرسال إشعار للمدير
    if (currentUser.email !== 'admin@alzak.com') {
        // رسالة واتساب للمدير
        const message = `طلب شحن جديد\nالمستخدم: ${currentUser.email}\nالمبلغ: ${amount}$`;
        window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(message)}`, '_blank');
    }
}

// تأكيد الشحن (للمدير)
function confirmCharge(userEmail, amount) {
    if (currentUser?.email !== 'admin@alzak.com') return;
    
    if (!wallets[userEmail]) {
        wallets[userEmail] = { balance: 0, transactions: [] };
    }
    
    wallets[userEmail].balance += amount;
    wallets[userEmail].transactions.push({
        type: 'charge',
        amount: amount,
        description: 'شحن رصيد',
        date: new Date().toISOString()
    });
    
    localStorage.setItem('wallets', JSON.stringify(wallets));
    showToast('تم تأكيد الشحن');
}

// الشراء من المحفظة
function purchaseWithWallet(amount, item) {
    if (!currentUser) return false;
    
    const wallet = wallets[currentUser.email];
    if (!wallet || wallet.balance < amount) {
        showToast('الرصيد غير كافٍ', 'error');
        return false;
    }
    
    wallet.balance -= amount;
    wallet.transactions.push({
        type: 'purchase',
        amount: -amount,
        description: 'شراء ' + item,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('wallets', JSON.stringify(wallets));
    return true;
}