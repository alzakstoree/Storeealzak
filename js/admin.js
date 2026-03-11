function showAdminLogin() {
    document.getElementById('adminLogin').classList.add('show');
}

function closeAdminLogin() {
    document.getElementById('adminLogin').classList.remove('show');
    document.getElementById('adminPassword').value = '';
}

function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        closeAdminLogin();
        toggleAdminPanel();
        showToast('✅ مرحباً بالمدير');
    } else {
        showToast('❌ كلمة سر خطأ', 'error');
    }
}

function toggleAdminPanel() {
    document.getElementById('adminPanel').classList.toggle('show');
    if (document.getElementById('adminPanel').classList.contains('show')) {
        updateAdminPanel();
    }
}

function updateAdminPanel() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    let adminPanelHTML = `
        <h3 style="color: #fbbf24; margin-bottom: 15px;">📊 إحصائيات المتجر</h3>
        <div class="admin-stats">
            <div class="stat-box">
                <div class="number" id="totalOrders">${orders.length}</div>
                <div>إجمالي الطلبات</div>
            </div>
            <div class="stat-box">
                <div class="number" id="pendingOrders">${orders.filter(o => o.status === 'pending').length}</div>
                <div>قيد الانتظار</div>
            </div>
            <div class="stat-box">
                <div class="number" id="totalRevenue">$${orders.reduce((sum, o) => sum + parseFloat(o.finalPrice || o.price), 0).toFixed(2)}</div>
                <div>الإيرادات</div>
            </div>
        </div>
    `;

    const today = new Date().toDateString();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    adminPanelHTML += `
        <div class="admin-stats">
            <div class="stat-box">
                <div class="number">${orders.filter(o => new Date(o.date).toDateString() === today).length}</div>
                <div>طلبات اليوم</div>
            </div>
            <div class="stat-box">
                <div class="number">${orders.filter(o => new Date(o.date) >= weekAgo).length}</div>
                <div>هذا الأسبوع</div>
            </div>
            <div class="stat-box">
                <div class="number">${orders.filter(o => new Date(o.date) >= monthAgo).length}</div>
                <div>هذا الشهر</div>
            </div>
        </div>

        <h4 style="color: #fbbf24; margin: 15px 0;">📋 آخر الطلبات</h4>
        <div class="orders-table" id="ordersTable">
            <div class="order-row header">
                <span>اللعبة</span>
                <span>الباقة</span>
                <span>المعرف</span>
                <span>المبلغ</span>
                <span>الحالة</span>
            </div>
            <div id="ordersList">
    `;

    orders.slice(-5).reverse().forEach(o => {
        adminPanelHTML += `
            <div class="order-row" onclick="markAsCompleted('${o.date}')" style="cursor: pointer;">
                <span>${o.game}</span>
                <span>${o.pack}</span>
                <span>${o.playerId}</span>
                <span>$${o.finalPrice || o.price}</span>
                <span class="status ${o.status}">${o.status === 'pending' ? '⏳' : '✅'}</span>
            </div>
        `;
    });

    adminPanelHTML += `
            </div>
        </div>
    `;

    document.getElementById('adminPanel').innerHTML = adminPanelHTML;
}

function markAsCompleted(date) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o.date === date);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = orders[orderIndex].status === 'pending' ? 'completed' : 'pending';
        localStorage.setItem('orders', JSON.stringify(orders));
        updateAdminPanel();
        showToast('✅ تم تحديث حالة الطلب');
    }
}