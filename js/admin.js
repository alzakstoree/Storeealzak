// ==================== لوحة المدير - نسخة الجوال المتكاملة ====================
const ADMIN_EMAIL = 'alolao45y@gmail.com';

// تحميل بيانات لوحة المدير
function loadAdminData() {
    if (currentUser?.email !== ADMIN_EMAIL) return;
    loadProductsManager();
    loadOrdersManager();
    loadChargesManager();
    loadStatsManager();
}

// ========== إدارة المنتجات (بتصميم كروت مناسب للجوال) ==========
function loadProductsManager() {
    const container = document.getElementById('adminProducts');
    if (!container) return;

    let html = '<h3 style="color: #fbbf24; margin-bottom: 15px;">📦 تعديل المنتجات</h3>';

    storeData.sections.forEach((section, sectionIndex) => {
        html += `<div style="margin: 20px 0; background: #1a1a1a; border-radius: 15px; padding: 15px;">`;
        html += `<h4 style="color: #fbbf24; margin-bottom: 10px;">📌 ${section.name}</h4>`;

        section.categories.forEach((category, catIndex) => {
            html += `<div style="margin: 15px 0 10px 10px;">`;
            html += `<strong style="display: block; margin-bottom: 10px;">🔹 ${category.name}</strong>`;

            category.products.forEach((product, prodIndex) => {
                html += `
                    <div style="background: #333; border-radius: 10px; padding: 12px; margin-bottom: 10px;">
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <input type="text" id="prod_name_${sectionIndex}_${catIndex}_${prodIndex}" 
                                value="${product.name}" 
                                style="flex: 2; background: #444; color: #fff; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px; font-size: 14px;">
                            <input type="number" id="prod_price_${sectionIndex}_${catIndex}_${prodIndex}" 
                                value="${product.price}" step="0.01" 
                                style="flex: 1; background: #444; color: #fff; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px; font-size: 14px;">
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button onclick="updateProduct(${sectionIndex}, ${catIndex}, ${prodIndex})" 
                                style="flex: 1; background: #22c55e; color: #fff; border: none; border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 700;">
                                💾 حفظ
                            </button>
                            <button onclick="deleteProduct(${sectionIndex}, ${catIndex}, ${prodIndex})" 
                                style="flex: 1; background: #ef4444; color: #fff; border: none; border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 700;">
                                🗑️ حذف
                            </button>
                        </div>
                    </div>
                `;
            });

            // حقل إضافة منتج جديد
            html += `
                <div style="background: #222; border-radius: 10px; padding: 15px; margin-top: 15px;">
                    <p style="color: #fbbf24; margin-bottom: 10px;">➕ إضافة منتج جديد:</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="text" id="new_prod_name_${sectionIndex}_${catIndex}" 
                            placeholder="اسم المنتج" 
                            style="flex: 2; background: #444; color: #fff; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px; font-size: 14px;">
                        <input type="number" id="new_prod_price_${sectionIndex}_${catIndex}" 
                            placeholder="السعر" step="0.01" 
                            style="flex: 1; background: #444; color: #fff; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px; font-size: 14px;">
                    </div>
                    <button onclick="addProduct(${sectionIndex}, ${catIndex})" 
                        style="width: 100%; background: #fbbf24; color: #000; border: none; border-radius: 8px; padding: 12px; font-size: 16px; font-weight: 700;">
                        ✅ إضافة المنتج
                    </button>
                </div>
            `;

            html += `</div>`; // إغلاق div.category
        });

        html += `</div>`; // إغلاق div.section
    });

    container.innerHTML = html;
}

// ========== دوال التعديل (بنفس الطريقة لكن مع رسائل أوضح) ==========
function updateProduct(sectionIndex, catIndex, prodIndex) {
    const nameInput = document.getElementById(`prod_name_${sectionIndex}_${catIndex}_${prodIndex}`);
    const priceInput = document.getElementById(`prod_price_${sectionIndex}_${catIndex}_${prodIndex}`);

    if (!nameInput || !priceInput) return;

    const newName = nameInput.value.trim();
    const newPrice = parseFloat(priceInput.value);

    if (!newName || isNaN(newPrice) || newPrice <= 0) {
        showToast('❌ اسم المنتج أو السعر غير صحيح', 'error');
        return;
    }

    storeData.sections[sectionIndex].categories[catIndex].products[prodIndex].name = newName;
    storeData.sections[sectionIndex].categories[catIndex].products[prodIndex].price = newPrice;

    localStorage.setItem('storeData', JSON.stringify(storeData));
    showToast('✅ تم تعديل المنتج بنجاح');
    loadProductsManager();
}

function deleteProduct(sectionIndex, catIndex, prodIndex) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return;

    storeData.sections[sectionIndex].categories[catIndex].products.splice(prodIndex, 1);
    localStorage.setItem('storeData', JSON.stringify(storeData));

    showToast('✅ تم حذف المنتج');
    loadProductsManager();
}

function addProduct(sectionIndex, catIndex) {
    const nameInput = document.getElementById(`new_prod_name_${sectionIndex}_${catIndex}`);
    const priceInput = document.getElementById(`new_prod_price_${sectionIndex}_${catIndex}`);

    if (!nameInput || !priceInput) return;

    const newName = nameInput.value.trim();
    const newPrice = parseFloat(priceInput.value);

    if (!newName || isNaN(newPrice) || newPrice <= 0) {
        showToast('❌ اسم المنتج أو السعر غير صحيح', 'error');
        return;
    }

    storeData.sections[sectionIndex].categories[catIndex].products.push({
        name: newName,
        price: newPrice
    });

    localStorage.setItem('storeData', JSON.stringify(storeData));

    nameInput.value = '';
    priceInput.value = '';

    showToast('✅ تم إضافة المنتج');
    loadProductsManager();
}

// ========== إدارة الطلبات (بتصميم بطاقات مناسب للجوال) ==========
function loadOrdersManager() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const container = document.getElementById('adminOrders');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">لا توجد طلبات بعد</p>';
        return;
    }

    let html = '<h3 style="color: #fbbf24; margin-bottom: 15px;">📋 الطلبات</h3>';

    orders.reverse().forEach((order, index) => {
        html += `
            <div style="background: #1a1a1a; border-radius: 15px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong>🛒 ${order.product || 'منتج'}</strong>
                    <span style="color: #fbbf24; font-weight: 900;">${order.price || 0}$</span>
                </div>
                <div style="font-size: 13px; color: #888; margin-bottom: 10px;">
                    ${order.playerId ? `🆔 ${order.playerId}` : ''}
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                    📅 ${new Date(order.date).toLocaleDateString()}
                </div>
                <div style="display: flex; gap: 10px;">
                    <select id="order_status_${index}" onchange="updateOrderStatus(${index})" 
                        style="flex: 2; background: #333; color: #fff; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px; font-size: 14px;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ قيد الانتظار</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>✅ مكتمل</option>
                    </select>
                    <button onclick="deleteOrder(${index})" 
                        style="flex: 0 0 50px; background: #ef4444; color: #fff; border: none; border-radius: 8px; font-size: 20px;">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateOrderStatus(index) {
    const select = document.getElementById(`order_status_${index}`);
    if (!select) return;

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders[index].status = select.value;
    localStorage.setItem('orders', JSON.stringify(orders));

    showToast('✅ تم تحديث حالة الطلب');
}

function deleteOrder(index) {
    if (!confirm('⚠️ حذف الطلب؟')) return;

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.splice(index, 1);
    localStorage.setItem('orders', JSON.stringify(orders));

    showToast('✅ تم حذف الطلب');
    loadOrdersManager();
    loadStatsManager();
}

// ========== إدارة طلبات الشحن ==========
function loadChargesManager() {
    const charges = JSON.parse(localStorage.getItem('charges')) || [];
    const container = document.getElementById('adminCharges');
    if (!container) return;

    if (charges.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">لا توجد طلبات شحن</p>';
        return;
    }

    let html = '<h3 style="color: #fbbf24; margin-bottom: 15px;">💰 طلبات الشحن</h3>';

    charges.reverse().forEach((charge, index) => {
        html += `
            <div style="background: #1a1a1a; border-radius: 15px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong>👤 ${charge.userEmail || 'مستخدم'}</strong>
                    <span style="color: #fbbf24; font-weight: 900;">${charge.amount || 0}$</span>
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                    📅 ${new Date(charge.date).toLocaleDateString()}
                </div>
                ${charge.status === 'pending' ? 
                    `<button onclick="confirmCharge(${index})" 
                        style="width: 100%; background: #22c55e; color: #fff; border: none; border-radius: 8px; padding: 12px; font-size: 16px; font-weight: 700;">
                        ✅ تأكيد وصول المبلغ
                    </button>` : 
                    '<span style="display: block; text-align: center; color: #22c55e;">✅ تم التأكيد</span>'}
            </div>
        `;
    });

    container.innerHTML = html;
}

function confirmCharge(index) {
    let charges = JSON.parse(localStorage.getItem('charges')) || [];
    let wallets = JSON.parse(localStorage.getItem('wallets')) || {};

    const charge = charges[index];
    if (!charge) return;

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

    charges[index].status = 'completed';

    localStorage.setItem('wallets', JSON.stringify(wallets));
    localStorage.setItem('charges', JSON.stringify(charges));

    showToast('✅ تم تأكيد الشحن وإضافة الرصيد');
    loadChargesManager();
    loadStatsManager();
}

// ========== الإحصائيات ==========
function loadStatsManager() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const totalSales = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    document.getElementById('adminStats').innerHTML = `
        <h3 style="color: #fbbf24; margin-bottom: 15px;">📊 الإحصائيات</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div style="background: #1a1a1a; border-radius: 15px; padding: 15px; text-align: center;">
                <div style="font-size: 28px; color: #fbbf24; font-weight: 900;">${orders.length}</div>
                <div style="font-size: 12px;">إجمالي الطلبات</div>
            </div>
            <div style="background: #1a1a1a; border-radius: 15px; padding: 15px; text-align: center;">
                <div style="font-size: 28px; color: #fbbf24; font-weight: 900;">${pendingOrders}</div>
                <div style="font-size: 12px;">قيد الانتظار</div>
            </div>
            <div style="background: #1a1a1a; border-radius: 15px; padding: 15px; text-align: center;">
                <div style="font-size: 28px; color: #fbbf24; font-weight: 900;">${users.length}</div>
                <div style="font-size: 12px;">العملاء</div>
            </div>
            <div style="background: #1a1a1a; border-radius: 15px; padding: 15px; text-align: center;">
                <div style="font-size: 28px; color: #fbbf24; font-weight: 900;">${totalSales}$</div>
                <div style="font-size: 12px;">إجمالي المبيعات</div>
            </div>
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