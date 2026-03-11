// ==================== لوحة المدير ====================
const ADMIN_EMAIL = 'alolao45y@gmail.com';

function loadAdminData() {
    if (currentUser?.email !== ADMIN_EMAIL) return;
    
    loadProductsManager();
    loadOrdersManager();
    loadChargesManager();
    loadUsersManager();
    loadStatsManager();
}

function loadProductsManager() {
    const container = document.getElementById('adminProducts');
    let html = '<h3>إدارة المنتجات</h3>';
    
    storeData.sections.forEach(section => {
        html += `<h4>${section.name}</h4>`;
        section.categories.forEach(category => {
            html += `<div class="admin-category"><strong>${category.name}</strong>`;
            category.products.forEach((product, index) => {
                html += `
                    <div class="admin-product-item">
                        <span>${product.name} - ${product.price}$</span>
                        <div>
                            <button onclick="editProduct('${section.id}', '${category.id}', ${index})">✏️</button>
                            <button onclick="deleteProduct('${section.id}', '${category.id}', ${index})">🗑️</button>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        });
    });
    
    html += '<button class="admin-add-btn" onclick="addNewProduct()">➕ إضافة منتج جديد</button>';
    container.innerHTML = html;
}

function loadOrdersManager() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const container = document.getElementById('adminOrders');
    
    if (orders.length === 0) {
        container.innerHTML = '<p>لا توجد طلبات</p>';
        return;
    }
    
    let html = '<h3>إدارة الطلبات</h3><table class="admin-table"><tr><th>المنتج</th><th>السعر</th><th>الحالة</th><th>تحكم</th></tr>';
    
    orders.reverse().forEach((order, index) => {
        html += `
            <tr>
                <td>${order.product}</td>
                <td>${order.price}$</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td><button onclick="updateOrderStatus(${index})">تغيير</button></td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

function loadChargesManager() {
    const charges = JSON.parse(localStorage.getItem('charges')) || [];
    const container = document.getElementById('adminCharges');
    
    if (charges.length === 0) {
        container.innerHTML = '<p>لا توجد طلبات شحن</p>';
        return;
    }
    
    let html = '<h3>طلبات الشحن</h3><table class="admin-table"><tr><th>المستخدم</th><th>المبلغ</th><th>الحالة</th><th>تحكم</th></tr>';
    
    charges.reverse().forEach((charge, index) => {
        html += `
            <tr>
                <td>${charge.userEmail}</td>
                <td>${charge.amount}$</td>
                <td><span class="status-badge ${charge.status}">${charge.status}</span></td>
                <td>
                    ${charge.status === 'pending' ? 
                        `<button onclick="confirmChargeFromAdmin(${index})">تأكيد</button>` : 
                        'مكتمل'}
                </td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

function loadUsersManager() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const container = document.getElementById('adminUsers');
    
    let html = '<h3>العملاء</h3><table class="admin-table"><tr><th>الاسم</th><th>البريد</th><th>مدير؟</th></tr>';
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.email === ADMIN_EMAIL ? 'نعم' : 'لا'}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

function loadStatsManager() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const totalSales = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    
    document.getElementById('adminStats').innerHTML = `
        <h3>الإحصائيات</h3>
        <div class="stats-grid">
            <div class="stat-card"><span class="stat-value">${orders.length}</span><span>إجمالي الطلبات</span></div>
            <div class="stat-card"><span class="stat-value">${users.length}</span><span>العملاء</span></div>
            <div class="stat-card"><span class="stat-value">${totalSales}$</span><span>إجمالي المبيعات</span></div>
        </div>
    `;
}

function showAdminTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
}

function updateOrderStatus(index) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders[index].status = orders[index].status === 'pending' ? 'completed' : 'pending';
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrdersManager();
    showToast('تم التحديث');
}

function confirmChargeFromAdmin(index) {
    let charges = JSON.parse(localStorage.getItem('charges')) || [];
    charges[index].status = 'completed';
    localStorage.setItem('charges', JSON.stringify(charges));
    loadChargesManager();
    showToast('تم تأكيد الشحن');
}

function addNewProduct() {
    showToast('قريباً - إضافة منتج');
}

function editProduct(sectionId, categoryId, productIndex) {
    showToast('قريباً - تعديل منتج');
}

function deleteProduct(sectionId, categoryId, productIndex) {
    showToast('قريباً - حذف منتج');
}