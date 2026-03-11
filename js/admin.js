// ==================== لوحة المدير المتكاملة (مع تعديل فعلي) ====================
const ADMIN_EMAIL = 'alolao45y@gmail.com';

// تحميل بيانات لوحة المدير
function loadAdminData() {
    if (currentUser?.email !== ADMIN_EMAIL) return;
    
    loadProductsManager();
    loadOrdersManager();
    loadChargesManager();
    loadStatsManager();
}

// ========== إدارة المنتجات (تعديل فعلي) ==========
function loadProductsManager() {
    const container = document.getElementById('adminProducts');
    if (!container) return;
    
    let html = '<h3>إدارة المنتجات</h3>';
    
    // جلب البيانات من storeData (الموجود في categories.js)
    if (!window.storeData) {
        container.innerHTML = '<p>خطأ: بيانات المتجر غير متوفرة</p>';
        return;
    }
    
    storeData.sections.forEach((section, sectionIndex) => {
        html += `<div style="margin: 20px 0;"><h4 style="color: #fbbf24;">${section.name}</h4>`;
        
        section.categories.forEach((category, catIndex) => {
            html += `<div style="margin-right: 20px; margin-bottom: 15px;">`;
            html += `<strong style="display: block; margin-bottom: 10px;">${category.name}</strong>`;
            
            category.products.forEach((product, prodIndex) => {
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; padding: 10px; border-radius: 8px; margin-bottom: 5px;">
                        <div>
                            <input type="text" id="prod_name_${sectionIndex}_${catIndex}_${prodIndex}" value="${product.name}" style="background: #333; color: #fff; border: 1px solid #fbbf24; border-radius: 5px; padding: 5px; margin-left: 10px;">
                            <input type="number" id="prod_price_${sectionIndex}_${catIndex}_${prodIndex}" value="${product.price}" step="0.01" style="background: #333; color: #fff; border: 1px solid #fbbf24; border-radius: 5px; padding: 5px; width: 80px;">
                        </div>
                        <div>
                            <button onclick="updateProduct(${sectionIndex}, ${catIndex}, ${prodIndex})" style="background: #22c55e; color: #fff; border: none; border-radius: 5px; padding: 5px 10px; margin-left: 5px; cursor: pointer;">💾 حفظ</button>
                            <button onclick="deleteProduct(${sectionIndex}, ${catIndex}, ${prodIndex})" style="background: #ef4444; color: #fff; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer;">🗑️ حذف</button>
                        </div>
                    </div>
                `;
            });
            
            // زر إضافة منتج جديد لهذه الفئة
            html += `
                <div style="margin-top: 10px;">
                    <input type="text" id="new_prod_name_${sectionIndex}_${catIndex}" placeholder="اسم المنتج الجديد" style="background: #333; color: #fff; border: 1px solid #fbbf24; border-radius: 5px; padding: 5px; margin-left: 5px;">
                    <input type="number" id="new_prod_price_${sectionIndex}_${catIndex}" placeholder="السعر" step="0.01" style="background: #333; color: #fff; border: 1px solid #fbbf24; border-radius: 5px; padding: 5px; width: 80px; margin-left: 5px;">
                    <button onclick="addProduct(${sectionIndex}, ${catIndex})" style="background: #fbbf24; color: #000; border: none; border-radius: 5px; padding: 5px 15px; cursor: pointer;">➕ إضافة</button>
                </div>
            `;
            
            html += `</div>`; // إغلاق div.category
        });
        
        html += `</div>`; // إغلاق div.section
    });
    
    container.innerHTML = html;
}

// ========== دوال التعديل الفعلية ==========

// تحديث منتج
function updateProduct(sectionIndex, catIndex, prodIndex) {
    const nameInput = document.getElementById(`prod_name_${sectionIndex}_${catIndex}_${prodIndex}`);
    const priceInput = document.getElementById(`prod_price_${sectionIndex}_${catIndex}_${prodIndex}`);
    
    if (!nameInput || !priceInput) return;
    
    const newName = nameInput.value.trim();
    const newPrice = parseFloat(priceInput.value);
    
    if (!newName || isNaN(newPrice)) {
        showToast('الرجاء إدخال اسم وسعر صحيح', 'error');
        return;
    }
    
    // التعديل في البيانات الأصلية
    storeData.sections[sectionIndex].categories[catIndex].products[prodIndex].name = newName;
    storeData.sections[sectionIndex].categories[catIndex].products[prodIndex].price = newPrice;
    
    // حفظ في localStorage عشان البيانات ما تضيع
    localStorage.setItem('storeData', JSON.stringify(storeData));
    
    showToast('✅ تم تعديل المنتج بنجاح');
    loadProductsManager(); // إعادة تحميل الصفحة
}

// حذف منتج
function deleteProduct(sectionIndex, catIndex, prodIndex) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    // الحذف من البيانات
    storeData.sections[sectionIndex].categories[catIndex].products.splice(prodIndex, 1);
    
    // حفظ في localStorage
    localStorage.setItem('storeData', JSON.stringify(storeData));
    
    showToast('✅ تم حذف المنتج');
    loadProductsManager();
}

// إضافة منتج جديد
function addProduct(sectionIndex, catIndex) {
    const nameInput = document.getElementById(`new_prod_name_${sectionIndex}_${catIndex}`);
    const priceInput = document.getElementById(`new_prod_price_${sectionIndex}_${catIndex}`);
    
    if (!nameInput || !priceInput) return;
    
    const newName = nameInput.value.trim();
    const newPrice = parseFloat(priceInput.value);
    
    if (!newName || isNaN(newPrice)) {
        showToast('الرجاء إدخال اسم وسعر صحيح', 'error');
        return;
    }
    
    // إضافة للبيانات
    const newProduct = {
        name: newName,
        price: newPrice
    };
    
    storeData.sections[sectionIndex].categories[catIndex].products.push(newProduct);
    
    // حفظ في localStorage
    localStorage.setItem('storeData', JSON.stringify(storeData));
    
    // تفريغ الحقول
    nameInput.value = '';
    priceInput.value = '';
    
    showToast('✅ تم إضافة المنتج');
    loadProductsManager();
}

// ========== إدارة الطلبات (مع إمكانية تغيير الحالة) ==========
function loadOrdersManager() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const container = document.getElementById('adminOrders');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p>لا توجد طلبات</p>';
        return;
    }
    
    let html = '<h3>إدارة الطلبات</h3>';
    
    orders.reverse().forEach((order, index) => {
        html += `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${order.product || 'منتج'}</strong> - ${order.price || 0}$
                        <div style="font-size: 12px; color: #666;">${order.playerId || ''} | ${new Date(order.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <select id="order_status_${index}" onchange="updateOrderStatus(${index})" style="background: #333; color: #fff; border: 1px solid #fbbf24; border-radius: 5px; padding: 5px;">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ قيد الانتظار</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>✅ مكتمل</option>
                        </select>
                    </div>
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

// ========== إدارة طلبات الشحن (مع إمكانية التأكيد) ==========
function loadChargesManager() {
    const charges = JSON.parse(localStorage.getItem('charges')) || [];
    const container = document.getElementById('adminCharges');
    if (!container) return;
    
    if (charges.length === 0) {
        container.innerHTML = '<p>لا توجد طلبات شحن</p>';
        return;
    }
    
    let html = '<h3>طلبات الشحن</h3>';
    
    charges.reverse().forEach((charge, index) => {
        html += `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${charge.userEmail || 'مستخدم'}</strong> - ${charge.amount || 0}$
                        <div style="font-size: 12px; color: #666;">${new Date(charge.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                        ${charge.status === 'pending' ? 
                            `<button onclick="confirmCharge(${index})" style="background: #22c55e; color: #fff; border: none; border-radius: 5px; padding: 5px 15px; cursor: pointer;">تأكيد الشحن</button>` : 
                            '<span style="color: #22c55e;">✅ مكتمل</span>'}
                    </div>
                </div>
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
    
    // إضافة الرصيد للمستخدم
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
    const charges = JSON.parse(localStorage.getItem('charges')) || [];
    
    const totalSales = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalCharges = charges.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.amount || 0), 0);
    
    document.getElementById('adminStats').innerHTML = `
        <h3>الإحصائيات</h3>
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

// تهيئة لوحة المدير عند تحميلها
function prepareAdminPanel() {
    if (currentUser?.email === ADMIN_EMAIL) {
        console.log('Admin panel ready');
    }
}