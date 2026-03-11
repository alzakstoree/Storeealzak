function cacheData(key, data) {
    sessionStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data: data
    }));
}

function getCachedData(key, maxAge = 3600000) {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) {
        sessionStorage.removeItem(key);
        return null;
    }
    return data;
}

function playSuccessSound(type = 'success') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'success') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        } else if (type === 'welcome') {
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch(e) {
        console.log('Audio not supported');
    }
}

function gameName(game) {
    return game === 'pubg' ? 'PUBG Mobile' : 'Free Fire';
}

function validatePlayerId(game, id) {
    if (!id) return false;
    
    if (game.includes('PUBG')) {
        return id.length >= 6 && id.length <= 12 && /^\d+$/.test(id);
    } else if (game.includes('Free Fire')) {
        return id.length >= 4 && id.length <= 12 && /^[a-zA-Z0-9]+$/.test(id);
    }
    return true;
}

function sanitizeInput(input) {
    return input.replace(/[<>]/g, '').trim();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ تم النسخ إلى الحافظة');
        playSuccessSound('success');
    }).catch(() => {
        showToast('❌ فشل النسخ', 'error');
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function startCountdown() {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    
    function updateCountdown() {
        const now = new Date();
        const diff = endTime - now;
        
        if (diff <= 0) {
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.querySelector('.admin-btn i');
    if (document.body.classList.contains('light-mode')) {
        icon.className = 'fas fa-sun';
        showToast('🌞 الوضع النهاري');
    } else {
        icon.className = 'fas fa-moon';
        showToast('🌙 الوضع الليلي');
    }
}