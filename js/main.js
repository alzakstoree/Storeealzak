let currentGame = {};
let currentDiscount = 0;
let lastPlayerId = localStorage.getItem('lastPlayerId') || '';

window.onload = function() {
    loadPacks();
    updateAdminPanel();
    updateCartBadge();
    startCountdown();
    loadLastPlayerId();
    loadCachedData();
    playSuccessSound('welcome');
    showToast('✨ مرحباً بك في ALZAK STORE');
};

function loadLastPlayerId() {
    document.getElementById('playerId').value = lastPlayerId;
}

function loadCachedData() {
    const cached = getCachedData('gamesData');
    if (!cached) {
        cacheData('gamesData', gamesData);
    }
}

function loadPacks() {
    for (let game in gamesData) {
        const container = document.getElementById(`${game}PacksGrid`);
        if (!container) continue;
        
        container.innerHTML = '';
        gamesData[game].forEach(pack => {
            container.innerHTML += `
                <div class="pack-card">
                    <span class="pack-badge">${pack.badge}</span>
                    <div class="pack-icon"><i class="fas ${pack.icon}"></i></div>
                    <div class="pack-name">${pack.name}</div>
                    <div class="pack-rating">
                        <i class="fas fa-star"></i> ${pack.rating} (${pack.reviews})
                    </div>
                    <div class="pack-price">$${pack.price}</div>
                    <button class="buy-btn" onclick="openPurchaseModal('${gameName(game)}', '${pack.name.replace(/'/g, "\\'")}', '${pack.price}')">
                        <i class="fas fa-shopping-cart"></i> اشتري
                    </button>
                </div>
            `;
        });
    }
}

function showPacks(game) {
    hideAllPacks();
    const packsSection = document.getElementById(game + 'Packs');
    if (packsSection) {
        packsSection.classList.add('show');
    }
}

function hidePacks(game) {
    const packsSection = document.getElementById(game + 'Packs');
    if (packsSection) {
        packsSection.classList.remove('show');
    }
}

function hideAllPacks() {
    document.querySelectorAll('.packs-section').forEach(s => s.classList.remove('show'));
}

function filterGames(game, element) {
    document.querySelectorAll('.cat').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    
    hideAllPacks();
    
    document.querySelectorAll('.game-card').forEach(card => {
        card.style.display = 'block';
    });
}

document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const games = document.querySelectorAll('.game-card');
    
    games.forEach(game => {
        const gameName = game.querySelector('h3').textContent.toLowerCase();
        if (gameName.includes(searchTerm) || searchTerm === '') {
            game.style.display = 'block';
        } else {
            game.style.display = 'none';
        }
    });
});

function openPurchaseModal(game, pack, price) {
    showLoading();
    setTimeout(() => {
        currentGame = { game, pack, price };
        currentDiscount = 0;
        document.getElementById('modalGameName').textContent = game;
        document.getElementById('modalGamePack').textContent = pack;
        document.getElementById('modalGamePrice').textContent = '$' + price;
        document.getElementById('finalPrice').textContent = '$' + price;
        document.getElementById('playerId').value = localStorage.getItem('lastPlayerId') || '';
        document.getElementById('couponCode').value = '';
        document.getElementById('progressFill').style.width = '25%';
        document.getElementById('purchaseModal').classList.add('show');
        hideLoading();
    }, 500);
}

function closeModal() {
    document.getElementById('purchaseModal').classList.remove('show');
}

function applyCoupon() {
    const code = document.getElementById('couponCode').value.toUpperCase().trim();
    
    if (coupons[code]) {
        currentDiscount = coupons[code];
        const originalPrice = parseFloat(currentGame.price);
        const newPrice = originalPrice * (1 - currentDiscount/100);
        document.getElementById('finalPrice').textContent = '$' + newPrice.toFixed(2);
        showToast(`🎉 تم تطبيق خصم ${currentDiscount}%`);
        playSuccessSound('success');
    } else {
        showToast('❌ كوبون غير صالح', 'error');
    }
}

function sendToWhatsApp() {
    const playerId = sanitizeInput(document.getElementById('playerId').value);
    
    if (!playerId) {
        showToast('❌ أدخل معرف اللعبة أولاً', 'error');
        return;
    }
    
    if (!validatePlayerId(currentGame.game, playerId)) {
        showToast('❌ المعرف غير صحيح للعبة المختارة', 'error');
        return;
    }

    const finalPrice = parseFloat(currentGame.price) * (1 - currentDiscount/100);
    const message = `🛍️ طلب جديد من ALZAK STORE
اللعبة: ${currentGame.game}
الباقة: ${currentGame.pack}
معرف اللعبة: ${playerId}
المبلغ الأصلي: $${currentGame.price}
الخصم: ${currentDiscount}%
المبلغ النهائي: $${finalPrice.toFixed(2)}`;

    window.open(`https://wa.me/9630982251929?text=${encodeURIComponent(message)}`, '_blank');
    
    document.getElementById('progressFill').style.width = '75%';
    
    saveOrder();
    showToast('✅ تم فتح واتساب، أرسل الإيصال');
    playSuccessSound('success');
}

function confirmOrder() {
    const playerId = sanitizeInput(document.getElementById('playerId').value);
    
    if (!playerId) {
        showToast('❌ أدخل معرف اللعبة أولاً', 'error');
        return;
    }
    
    if (!validatePlayerId(currentGame.game, playerId)) {
        showToast('❌ المعرف غير صحيح للعبة المختارة', 'error');
        return;
    }

    localStorage.setItem('lastPlayerId', playerId);
    
    showLoading();
    
    setTimeout(() => {
        saveOrder();
        document.getElementById('progressFill').style.width = '100%';
        showToast('✅ تم حفظ الطلب بنجاح');
        playSuccessSound('success');
        hideLoading();
        
        setTimeout(() => {
            closeModal();
            document.getElementById('progressFill').style.width = '0%';
        }, 1500);
    }, 1000);
}

function saveOrder() {
    const playerId = sanitizeInput(document.getElementById('playerId').value);
    const finalPrice = (parseFloat(currentGame.price) * (1 - currentDiscount/100)).toFixed(2);
    
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        game: currentGame.game,
        pack: currentGame.pack,
        price: currentGame.price,
        playerId: playerId,
        finalPrice: finalPrice,
        discount: currentDiscount,
        date: new Date().toLocaleString(),
        dateObj: new Date().toISOString(),
        status: 'pending'
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    updateCartBadge();
    updateAdminPanel();
}

function updateCartBadge() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    document.getElementById('cartBadge').textContent = orders.length;
}

function showMyOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const myOrdersList = document.getElementById('myOrdersList');
    
    if (orders.length === 0) {
        myOrdersList.innerHTML = '<p style