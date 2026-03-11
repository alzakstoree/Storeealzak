// ==================== دوال مساعدة ====================

// عرض الإشعارات
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// إغلاق النوافذ المنبثقة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// نسخ النص إلى الحافظة
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ تم النسخ');
    }).catch(() => {
        showToast('❌ فشل النسخ', 'error');
    });
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}

// عرض مؤشر التحميل
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
}

// إخفاء مؤشر التحميل
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

// التبديل بين الوضع الليلي والنهاري
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.querySelector('.admin-btn i');
    if (icon) {
        if (document.body.classList.contains('light-mode')) {
            icon.className = 'fas fa-sun';
            showToast('🌞 الوضع النهاري');
        } else {
            icon.className = 'fas fa-moon';
            showToast('🌙 الوضع الليلي');
        }
    }
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// تنظيف المدخلات
function sanitizeInput(input) {
    if (!input) return '';
    return input.replace(/[<>]/g, '').trim();
}