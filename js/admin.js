// ==================== لوحة المدير المتكاملة ====================
const ADMIN_EMAIL = 'alolao45y@gmail.com';

// تحميل بيانات لوحة المدير
function loadAdminData() {
    if (currentUser?.email !== ADMIN_EMAIL) return;
    
    loadProductsManager();
    loadOrdersManager();
    loadChargesManager();
    loadUsersManager();
    loadStatsManager();
}

// ========== إدارة المنتجات ==========
function loadProductsManager() {
    const container = document.getElementById('productsManager');
    let html = '<button class="admin-add-btn" onclick="addNewProduct()"><i class="fas fa-plus"></i> إضافة منتج جديد</button>';
    
    storeData.sections.forEach(section => {
        html += `<h4>${section.name}</h4>`;
        section.categories.forEach(category => {
            html += `<div class="admin-category"><strong>${category.name}</strong>`;
            category.products.forEach((product, index) => {
                html += `
                    <div class="admin-product-item">
                        <span>${product.name} - ${product.price}$</span>
                        <div>
                            <button onclick="editProduct('${section.id}', '${category.id}', ${index})"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteProduct('${section.id}', '${category.id}', ${index})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        });
    });
    
    container.innerHTML = html;
}

// إضافة منتج جديد
function addNewProduct() {
    const name = prompt('اسم المنتج:');
    if (!name) return;
    const price = parseFloat(prompt('السعر:'));
    if (isNaN(price)) return;
    
    // هنا تحط الكود اللي يختار القسم والفئة
    showToast('تمت الإضافة (يطور لاحقاً)');
}

// تعديل منتج
function editProduct(sectionId, categoryId, productIndex) {
    const section = storeData.sections.find(s => s.id === sectionId);
    const category = section.categories.find(c => c.id === categoryId);
    const product = category.products[productIndex];
    
    const newName = prompt('تعديل اسم المنتج:', product.name);
    if (newName) product.name = newName;
    
    const newPrice = parseFloat(prompt('تعديل السعر:', product.price));
    if (!isNaN(newPrice)) product.price = newPrice;
    
    localStorage.setItem('storeData', JSON.stringify(storeData));
    loadProductsManager();
    showToast('تم التعديل');
}

// حذف منتج
function deleteProduct(sectionId, categoryId, productIndex) {
    if (!confirm('متأكد من الحذف؟')) return;
    
    const section = storeData.sections.find(s => s.id === sectionId);
    const category = section.categories.find(c => c.id === categoryId);
    category.products.splice(productIndex, 1);
    
    localStorage.setItem('storeData', JSON.stringify(storeData));
    loadProductsManager();
    showToast('تم الحذف');
}

// ========== إدارة الطلبات ==========
function loadOrdersManager() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const container = document.getElementById('ordersManager');
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد طلبات</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>المنتج</th><th>المستخدم</th><th>السعر</th><th>الحالة</th><th>تاريخ</th><th>تحكم</th></tr>';
    
    orders.reverse().forEach((order, index) => {
        html += `
            <tr>
                <td>${order.product}</td>
                <td>${order.userEmail || 'زائر'}</td>
                <td>${order.price}$</td>
                <td><span class="status-badge ${order.status}">${order.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}</span></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>
                    <button onclick="updateOrderStatus(${index})">تغيير الحالة</button>
                </td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

// تحديث حالة الطلب
function updateOrderStatus(orderIndex) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders[orderIndex].status = orders[orderIndex].status === 'pending' ? 'completed' : 'pending';
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrdersManager();
    showToast('تم التحديث');
}

// ========== إدارة طلبات الشحن ==========
function loadChargesManager() {
    const charges = JSON.parse(localStorage.getItem('charges')) || [];
    const container = document.getElementById('chargesManager');
    
    if (charges.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد طلبات شحن</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>المستخدم</th><th>المبلغ</th><th>التاريخ</th><th>الحالة</th><th>تحكم</th></tr>';
    
    charges.reverse().forEach((charge, index) => {
        html += `
            <tr>
                <td>${charge.userEmail}</td>
                <td>${charge.amount}$</td>
                <td>${new Date(charge.date).toLocaleDateString()}</td>
                <td><span class="status-badge ${charge.status}">${charge.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}</span></td>
                <td>
                    ${charge.status === 'pending' ? 
                        `<button onclick="confirmChargeFromAdmin(${index})">تأكيد وصول المبلغ</button>` : 
                        'مكتمل'}
                </td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

// تأكيد الشحن من المدير
function confirmChargeFromAdmin(chargeIndex) {
    let charges = JSON.parse(localStorage.getItem('charges')) || [];
    const charge = charges[chargeIndex];
    
    // إضافة الرصيد للمستخدم
    let wallets = JSON.parse(localStorage.getItem('wallets')) || {};
    if (!wallets[charge.userEmail]) {
        wallets[charge.userEmail] = { balance: 0, transactions: [] };
    }
    
    wallets[charge.userEmail].balance += charge.amount;
    wallets[charge.userEmail].transactions.push({
        type: 'charge',
        amount: charge.amount,
        description: 'شحن رصيد',
        date: new Date().toISOString()
    });
    
    // تحديث حالة طلب الشحن
    charges[chargeIndex].status = 'completed';
    
    localStorage.setItem('wallets', JSON.stringify(wallets));
    localStorage.setItem('charges', JSON.stringify(charges));
    
    loadChargesManager();
    showToast('تم تأكيد الشحن وإضافة الرصيد');
}

// ========== إدارة العملاء ==========
function loadUsersManager() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const container = document.getElementById('usersManager');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="no-data">لا يوجد عملاء</p>';
        return;
    }
    
    let html = '<table class="admin-table"><tr><th>الاسم</th><th>البريد</th><th>تاريخ التسجيل</th><th>مدير؟</th></tr>';
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                <td>${user.email === ADMIN_EMAIL ? 'نعم' : 'لا'}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

// ========== الإحصائيات ==========
function loadStatsManager() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const charges = JSON.parse(localStorage.getItem('charges')) || [];
    
    const totalSales = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalCharges = charges.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.amount || 0), 0);
    
    document.getElementById('statsManager').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><span class="stat-value">${orders.length}</span><span>إجمالي الطلبات</span></div>
            <div class="stat-card"><span class="stat-value">${users.length}</span><span>العملاء</span></div>
            <div class="stat-card"><span class="stat-value">${totalSales}$</span><span>مبيعات</span></div>
            <div class="stat-card"><span class="stat-value">${totalCharges}$</span><span>شحن رصيد</span></div>
        </div>
    `;
}

// التبديل بين تبويبات لوحة المدير
function showAdminTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
}

// تهيئة لوحة المدير
function prepareAdminPanel() {
    // فقط تحضير، لا نظهرها تلقائياً
    console.log('Admin panel ready');
}