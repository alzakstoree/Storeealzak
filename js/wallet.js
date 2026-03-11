// ==================== نظام المحفظة ====================
let wallets = JSON.parse(localStorage.getItem('wallets')) || {};

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
    wallet.transactions.slice(-5).reverse().forEach(t => {
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
    
    showToast('تم إرسال طلب الشحن');
    closeModal('walletModal');
}

function showOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = currentUser ? orders.filter(o => o.userEmail === currentUser.email) : [];
    showToast(`عدد طلباتك: ${userOrders.length}`);
}