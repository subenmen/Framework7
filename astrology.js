// İnteraktif Astroloji Haritası JavaScript

// Global değişkenler
let isDragging = false;
let currentElement = null;
let offsetX = 0;
let offsetY = 0;
let wheelRotation = 0;
let isAnimating = true;

// Burç bilgileri
const zodiacInfo = {
    aries: { name: 'Koç', dates: '21 Mart - 20 Nisan', element: 'Ateş', ruler: 'Mars' },
    taurus: { name: 'Boğa', dates: '21 Nisan - 21 Mayıs', element: 'Toprak', ruler: 'Venüs' },
    gemini: { name: 'İkizler', dates: '22 Mayıs - 21 Haziran', element: 'Hava', ruler: 'Merkür' },
    cancer: { name: 'Yengeç', dates: '22 Haziran - 22 Temmuz', element: 'Su', ruler: 'Ay' },
    leo: { name: 'Aslan', dates: '23 Temmuz - 22 Ağustos', element: 'Ateş', ruler: 'Güneş' },
    virgo: { name: 'Başak', dates: '23 Ağustos - 22 Eylül', element: 'Toprak', ruler: 'Merkür' },
    libra: { name: 'Terazi', dates: '23 Eylül - 22 Ekim', element: 'Hava', ruler: 'Venüs' },
    scorpio: { name: 'Akrep', dates: '23 Ekim - 22 Kasım', element: 'Su', ruler: 'Mars/Plüton' },
    sagittarius: { name: 'Yay', dates: '23 Kasım - 21 Aralık', element: 'Ateş', ruler: 'Jüpiter' },
    capricorn: { name: 'Oğlak', dates: '22 Aralık - 20 Ocak', element: 'Toprak', ruler: 'Satürn' },
    aquarius: { name: 'Kova', dates: '21 Ocak - 19 Şubat', element: 'Hava', ruler: 'Satürn/Uranüs' },
    pisces: { name: 'Balık', dates: '20 Şubat - 20 Mart', element: 'Su', ruler: 'Jüpiter/Neptün' }
};

// Gezegen bilgileri
const planetInfo = {
    mercury: { name: 'Merkür', meaning: 'İletişim, zeka, düşünce', orbit: 88 },
    venus: { name: 'Venüs', meaning: 'Aşk, güzellik, uyum', orbit: 225 },
    mars: { name: 'Mars', meaning: 'Enerji, cesaret, hırs', orbit: 687 },
    jupiter: { name: 'Jüpiter', meaning: 'Şans, genişleme, bilgelik', orbit: 4333 },
    saturn: { name: 'Satürn', meaning: 'Disiplin, sorumluluk, sınırlar', orbit: 10759 },
    moon: { name: 'Ay', meaning: 'Duygular, içgüdüler, alışkanlıklar', orbit: 27 }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    initializeStars();
    initializeDragAndDrop();
    initializeControls();
    initializeCanvas();
    startAnimations();
});

// Yıldızları oluştur
function initializeStars() {
    const starsContainer = document.getElementById('stars-container');
    const starCount = 200;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        starsContainer.appendChild(star);
    }
}

// Canvas çemberleri çiz
function initializeCanvas() {
    const canvas = document.getElementById('astro-canvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.chart-wrapper');
    
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Çemberler çiz
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.lineWidth = 1;
    
    const circles = [100, 150, 200, 250, 300];
    circles.forEach(radius => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // Radyal çizgiler
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * 300,
            centerY + Math.sin(angle) * 300
        );
        ctx.stroke();
    }
}

// Drag & Drop işlevleri
function initializeDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable');
    
    draggables.forEach(element => {
        // Mouse events
        element.addEventListener('mousedown', startDrag);
        element.addEventListener('click', showInfo);
        
        // Touch events
        element.addEventListener('touchstart', startDrag);
    });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    currentElement = e.target.closest('.draggable');
    currentElement.classList.add('dragging');
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const rect = currentElement.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
}

function drag(e) {
    if (!isDragging || !currentElement) return;
    e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    // Sadece gezegenler ve merkez güneş hareket edebilir
    if (currentElement.classList.contains('planet') || currentElement.id === 'center-sun') {
        currentElement.style.position = 'absolute';
        currentElement.style.left = `${clientX - offsetX}px`;
        currentElement.style.top = `${clientY - offsetY}px`;
        currentElement.style.transform = 'none';
    }
}

function endDrag() {
    if (currentElement) {
        currentElement.classList.remove('dragging');
    }
    isDragging = false;
    currentElement = null;
}

// Bilgi paneli göster
function showInfo(e) {
    const element = e.target.closest('.sign-content, .planet');
    if (!element) return;
    
    const infoContent = document.getElementById('info-content');
    let html = '';
    
    // Burç bilgisi
    const signElement = element.closest('.zodiac-sign');
    if (signElement) {
        const sign = signElement.dataset.sign;
        const info = zodiacInfo[sign];
        html = `
            <h4>${info.name} Burcu</h4>
            <p><strong>Tarih:</strong> ${info.dates}</p>
            <p><strong>Element:</strong> ${info.element}</p>
            <p><strong>Yönetici Gezegen:</strong> ${info.ruler}</p>
        `;
    }
    
    // Gezegen bilgisi
    if (element.classList.contains('planet')) {
        const planet = element.dataset.planet;
        const info = planetInfo[planet];
        html = `
            <h4>${info.name}</h4>
            <p><strong>Anlamı:</strong> ${info.meaning}</p>
            <p><strong>Yörünge Süresi:</strong> ${info.orbit} gün</p>
        `;
    }
    
    if (html) {
        infoContent.innerHTML = html;
        anime({
            targets: '#info-panel',
            scale: [0.95, 1],
            opacity: [0.7, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }
}

// Kontrol butonları
function initializeControls() {
    const rotateLeft = document.getElementById('rotate-left');
    const rotateRight = document.getElementById('rotate-right');
    const resetChart = document.getElementById('reset-chart');
    const toggleAnimation = document.getElementById('toggle-animation');
    
    rotateLeft.addEventListener('click', () => rotateWheel(-30));
    rotateRight.addEventListener('click', () => rotateWheel(30));
    resetChart.addEventListener('click', resetEverything);
    toggleAnimation.addEventListener('click', toggleAnimations);
}

// Burç çemberini döndür
function rotateWheel(degrees) {
    wheelRotation += degrees;
    const wheel = document.getElementById('zodiac-wheel');
    
    anime({
        targets: wheel,
        rotate: wheelRotation,
        duration: 1000,
        easing: 'easeInOutQuad'
    });
}

// Her şeyi sıfırla
function resetEverything() {
    // Burç çemberini sıfırla
    wheelRotation = 0;
    const wheel = document.getElementById('zodiac-wheel');
    anime({
        targets: wheel,
        rotate: 0,
        duration: 1000,
        easing: 'easeOutElastic(1, .6)'
    });
    
    // Gezegenleri başlangıç pozisyonlarına döndür
    const planets = document.querySelectorAll('.planet');
    planets.forEach(planet => {
        planet.style.position = '';
        planet.style.left = '';
        planet.style.top = '';
        planet.style.transform = '';
    });
    
    // Merkez güneşi sıfırla
    const sun = document.getElementById('center-sun');
    sun.style.position = '';
    sun.style.left = '';
    sun.style.top = '';
    sun.style.transform = '';
    
    // Animasyon efekti
    anime({
        targets: '.planet, .sign-content',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(50),
        easing: 'easeOutElastic(1, .8)'
    });
    
    // Info panelini sıfırla
    document.getElementById('info-content').innerHTML = '<p>Bir burç veya gezegen üzerine tıklayın</p>';
}

// Animasyonları aç/kapat
function toggleAnimations() {
    isAnimating = !isAnimating;
    const btn = document.getElementById('toggle-animation');
    
    if (isAnimating) {
        btn.textContent = '⏸️ Duraklat';
        startAnimations();
    } else {
        btn.textContent = '▶️ Başlat';
        anime.remove('.planet, .sign-content');
    }
}

// Sürekli animasyonları başlat
function startAnimations() {
    if (!isAnimating) return;
    
    // Gezegenlerin yörünge hareketi
    anime({
        targets: '.planet',
        translateY: [0, -10, 0],
        duration: 3000,
        delay: anime.stagger(300),
        easing: 'easeInOutQuad',
        loop: true
    });
    
    // Burç sembolleri parıldama
    anime({
        targets: '.sign-content',
        boxShadow: [
            '0 0 10px rgba(102, 126, 234, 0.3)',
            '0 0 30px rgba(102, 126, 234, 0.6)',
            '0 0 10px rgba(102, 126, 234, 0.3)'
        ],
        duration: 2000,
        delay: anime.stagger(100),
        easing: 'easeInOutQuad',
        loop: true
    });
}

// Giriş animasyonu
window.addEventListener('load', () => {
    // Burçları sırayla göster
    anime({
        targets: '.zodiac-sign',
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 800,
        delay: anime.stagger(80),
        easing: 'easeOutElastic(1, .8)'
    });
    
    // Gezegenleri göster
    anime({
        targets: '.planet',
        opacity: [0, 1],
        scale: [0, 1],
        duration: 1000,
        delay: anime.stagger(150, {start: 800}),
        easing: 'easeOutElastic(1, .6)'
    });
    
    // Kontrolleri göster
    anime({
        targets: '.control-btn',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(100, {start: 1500}),
        easing: 'easeOutQuad'
    });
});

// Klavye kısayolları
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            rotateWheel(-30);
            break;
        case 'ArrowRight':
            rotateWheel(30);
            break;
        case 'r':
        case 'R':
            resetEverything();
            break;
        case ' ':
            e.preventDefault();
            toggleAnimations();
            break;
    }
});
