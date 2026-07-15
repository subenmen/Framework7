// Mobil-First İnteraktif Astroloji Haritası

// Şehir koordinatları
const cityCoordinates = {
    istanbul: { lat: 41.0082, lon: 28.9784, tz: 3 },
    ankara: { lat: 39.9334, lon: 32.8597, tz: 3 },
    izmir: { lat: 38.4237, lon: 27.1428, tz: 3 },
    bursa: { lat: 40.1826, lon: 29.0665, tz: 3 },
    antalya: { lat: 36.8969, lon: 30.7133, tz: 3 },
    adana: { lat: 37.0000, lon: 35.3213, tz: 3 },
    gaziantep: { lat: 37.0662, lon: 37.3833, tz: 3 },
    konya: { lat: 37.8746, lon: 32.4932, tz: 3 },
    trabzon: { lat: 41.0027, lon: 39.7168, tz: 3 },
    diyarbakir: { lat: 37.9144, lon: 40.2306, tz: 3 }
};

// Burç bilgileri
const zodiacSigns = [
    { name: 'Koç', symbol: '♈', start: [3, 21], end: [4, 19], element: 'Ateş', quality: 'Öncü', ruler: 'Mars' },
    { name: 'Boğa', symbol: '♉', start: [4, 20], end: [5, 20], element: 'Toprak', quality: 'Sabit', ruler: 'Venüs' },
    { name: 'İkizler', symbol: '♊', start: [5, 21], end: [6, 20], element: 'Hava', quality: 'Değişken', ruler: 'Merkür' },
    { name: 'Yengeç', symbol: '♋', start: [6, 21], end: [7, 22], element: 'Su', quality: 'Öncü', ruler: 'Ay' },
    { name: 'Aslan', symbol: '♌', start: [7, 23], end: [8, 22], element: 'Ateş', quality: 'Sabit', ruler: 'Güneş' },
    { name: 'Başak', symbol: '♍', start: [8, 23], end: [9, 22], element: 'Toprak', quality: 'Değişken', ruler: 'Merkür' },
    { name: 'Terazi', symbol: '♎', start: [9, 23], end: [10, 22], element: 'Hava', quality: 'Öncü', ruler: 'Venüs' },
    { name: 'Akrep', symbol: '♏', start: [10, 23], end: [11, 21], element: 'Su', quality: 'Sabit', ruler: 'Mars/Plüton' },
    { name: 'Yay', symbol: '♐', start: [11, 22], end: [12, 21], element: 'Ateş', quality: 'Değişken', ruler: 'Jüpiter' },
    { name: 'Oğlak', symbol: '♑', start: [12, 22], end: [1, 19], element: 'Toprak', quality: 'Öncü', ruler: 'Satürn' },
    { name: 'Kova', symbol: '♒', start: [1, 20], end: [2, 18], element: 'Hava', quality: 'Sabit', ruler: 'Uranüs' },
    { name: 'Balık', symbol: '♓', start: [2, 19], end: [3, 20], element: 'Su', quality: 'Değişken', ruler: 'Neptün' }
];

// 12 Ev anlamları
const housesMeanings = [
    'Kişilik, Görünüş, Yükselen',
    'Mülkiyet, Değerler, Para',
    'İletişim, Kardeşler, Yakın Çevre',
    'Aile, Ev, Kökenler',
    'Aşk, Çocuklar, Yaratıcılık',
    'Sağlık, Günlük Rutinler, İş',
    'İlişkiler, Evlilik, Ortaklıklar',
    'Dönüşüm, Ölüm, Miras',
    'Felsefe, Yabancı, Eğitim',
    'Kariyer, Statü, Hedefler',
    'Arkadaşlar, Topluluklar, Umutlar',
    'Gizli, Bilinçaltı, Karmik'
];

// Global değişkenler
let currentBirthData = null;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    initializeStars();
    setupEventListeners();
    setDefaultDate();
});

// Yıldızları oluştur
function initializeStars() {
    const starsContainer = document.getElementById('stars-container');
    const starCount = 150;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsContainer.appendChild(star);
    }
}

// Event listener'ları ayarla
function setupEventListeners() {
    document.getElementById('calculate-chart').addEventListener('click', calculateChart);
    document.getElementById('new-calculation').addEventListener('click', resetForm);
    
    const showChartBtn = document.getElementById('show-chart');
    if (showChartBtn) {
        showChartBtn.addEventListener('click', toggleChartView);
    }
}

// Varsayılan tarih ayarla
function setDefaultDate() {
    const today = new Date();
    const dateInput = document.getElementById('birth-date');
    dateInput.value = today.toISOString().split('T')[0];
    dateInput.max = today.toISOString().split('T')[0];
}

// Güneş burcunu hesapla
function calculateSunSign(month, day) {
    for (let sign of zodiacSigns) {
        const [startMonth, startDay] = sign.start;
        const [endMonth, endDay] = sign.end;
        
        if (startMonth === endMonth) {
            if (month === startMonth && day >= startDay && day <= endDay) {
                return sign;
            }
        } else {
            if ((month === startMonth && day >= startDay) || 
                (month === endMonth && day <= endDay)) {
                return sign;
            }
        }
    }
    return zodiacSigns[0];
}

// Yükselen burcunu hesapla
function calculateRisingSign(date, time, latitude, longitude) {
    try {
        const [hours, minutes] = time.split(':').map(Number);
        const birthDate = new Date(date);
        birthDate.setHours(hours, minutes, 0, 0);
        
        // Local Sidereal Time hesapla
        const lst = calculateLocalSiderealTime(birthDate, longitude);
        
        // Ascendant derece hesapla
        const ascendantDegree = calculateAscendantDegree(lst, latitude);
        
        // Dereceyi burca çevir
        const signIndex = Math.floor(ascendantDegree / 30);
        return zodiacSigns[signIndex];
    } catch (error) {
        console.error('Yükselen hesaplama hatası:', error);
        return zodiacSigns[0];
    }
}

// Local Sidereal Time hesapla
function calculateLocalSiderealTime(date, longitude) {
    const J2000 = new Date('2000-01-01T12:00:00Z');
    const daysSinceJ2000 = (date - J2000) / (1000 * 60 * 60 * 24);
    
    const hours = date.getHours() + date.getMinutes() / 60;
    const ut = hours - 3; // UTC'ye çevir (Türkiye +3)
    
    const gmst = 18.697374558 + 24.06570982441908 * daysSinceJ2000 + ut * 1.00273790935;
    const lst = gmst + (longitude / 15);
    
    return ((lst % 24) + 24) % 24;
}

// Ascendant derece hesapla
function calculateAscendantDegree(lst, latitude) {
    const lstDegrees = lst * 15;
    const latRad = latitude * Math.PI / 180;
    
    // Basitleştirilmiş hesaplama
    const mc = lstDegrees;
    const asc = mc + 90 + (latitude / 2);
    
    return ((asc % 360) + 360) % 360;
}

// 12 evi hesapla
function calculateHouses(risingSignIndex) {
    const houses = [];
    for (let i = 0; i < 12; i++) {
        const signIndex = (risingSignIndex + i) % 12;
        houses.push({
            number: i + 1,
            sign: zodiacSigns[signIndex],
            meaning: housesMeanings[i]
        });
    }
    return houses;
}

// Ana hesaplama fonksiyonu
function calculateChart() {
    const dateInput = document.getElementById('birth-date');
    const timeInput = document.getElementById('birth-time');
    const cityInput = document.getElementById('birth-city');
    
    if (!dateInput.value || !timeInput.value || !cityInput.value) {
        alert('⚠️ Lütfen tüm alanları doldurun!');
        return;
    }
    
    const birthDate = new Date(dateInput.value);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    const cityData = cityCoordinates[cityInput.value];
    
    // Güneş burcu
    const sunSign = calculateSunSign(month, day);
    
    // Yükselen burcu
    const risingSign = calculateRisingSign(
        dateInput.value,
        timeInput.value,
        cityData.lat,
        cityData.lon
    );
    
    // 12 ev
    const risingIndex = zodiacSigns.findIndex(s => s.name === risingSign.name);
    const houses = calculateHouses(risingIndex);
    
    // Sonuçları kaydet
    currentBirthData = {
        date: dateInput.value,
        time: timeInput.value,
        city: cityInput.value,
        sunSign,
        risingSign,
        houses
    };
    
    // Sonuçları göster
    displayResults();
}

// Sonuçları göster
function displayResults() {
    const { sunSign, risingSign, houses } = currentBirthData;
    
    // Form gizle, sonuçları göster
    document.getElementById('birth-form').style.display = 'none';
    document.getElementById('results-panel').style.display = 'block';
    document.getElementById('controls').style.display = 'grid';
    
    // Güneş burcu
    document.getElementById('sun-sign').innerHTML = `
        <div style="font-size: 48px; text-align: center; margin: 15px 0;">${sunSign.symbol}</div>
        <p><strong>Burç:</strong> ${sunSign.name}</p>
        <p><strong>Element:</strong> ${sunSign.element}</p>
        <p><strong>Nitelik:</strong> ${sunSign.quality}</p>
        <p><strong>Yönetici Gezegen:</strong> ${sunSign.ruler}</p>
    `;
    
    // Yükselen burcu
    document.getElementById('rising-sign').innerHTML = `
        <div style="font-size: 48px; text-align: center; margin: 15px 0;">${risingSign.symbol}</div>
        <p><strong>Yükselen:</strong> ${risingSign.name}</p>
        <p><strong>Element:</strong> ${risingSign.element}</p>
        <p><strong>Nitelik:</strong> ${risingSign.quality}</p>
        <p style="margin-top: 12px; color: rgba(255,255,255,0.7); font-size: 14px;">
            Yükselen burcunuz dış kişiliğinizi, başkalarının sizi nasıl gördüğünü ve hayata yaklaşımınızı temsil eder.
        </p>
    `;
    
    // 12 ev
    const housesHTML = houses.map(house => `
        <div class="house-item">
            <div class="house-number">${house.number}. Ev</div>
            <div class="house-info">
                <div class="house-name">${house.meaning}</div>
            </div>
            <div class="house-sign">${house.sign.symbol}</div>
        </div>
    `).join('');
    document.getElementById('houses').innerHTML = housesHTML;
    
    // Diğer pozisyonlar
    const moonSign = zodiacSigns[(zodiacSigns.findIndex(s => s.name === sunSign.name) + 2) % 12];
    document.getElementById('other-positions').innerHTML = `
        <p><strong>🌙 Ay Burcu (Tahmini):</strong> ${moonSign.symbol} ${moonSign.name}</p>
        <p style="font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 8px;">
            * Ay burcu kesin hesaplama için doğum anındaki ay pozisyonu gereklidir.
        </p>
        <div style="margin-top: 15px; padding: 12px; background: rgba(102,126,234,0.15); border-radius: 10px;">
            <p style="font-size: 14px;"><strong>💡 İpucu:</strong></p>
            <p style="font-size: 13px; margin-top: 5px;">
                12 ev sistemi, hayatınızın farklı alanlarını temsil eder. Her ev bir burç tarafından yönetilir.
            </p>
        </div>
    `;
    
    // Animasyon
    anime({
        targets: '.result-card',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(100),
        easing: 'easeOutQuad'
    });
}

// Formu sıfırla
function resetForm() {
    document.getElementById('birth-form').style.display = 'block';
    document.getElementById('results-panel').style.display = 'none';
    document.getElementById('chart-wrapper').style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    currentBirthData = null;
    
    anime({
        targets: '.birth-info-form',
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        easing: 'easeOutQuad'
    });
}

// Harita görünümünü aç/kapat
function toggleChartView() {
    const chartWrapper = document.getElementById('chart-wrapper');
    const showChartBtn = document.getElementById('show-chart');
    
    if (chartWrapper.style.display === 'none') {
        chartWrapper.style.display = 'block';
        showChartBtn.textContent = '📋 Bilgilere Dön';
        initializeCanvas();
        initializeVisualChart();
        
        anime({
            targets: chartWrapper,
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 600,
            easing: 'easeOutQuad'
        });
    } else {
        chartWrapper.style.display = 'none';
        showChartBtn.textContent = '🎨 Haritayı Göster';
    }
}

// Canvas çizimini başlat
function initializeCanvas() {
    const canvas = document.getElementById('astro-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.chart-wrapper');
    
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;
    
    // Çemberler
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * (i / 3), 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 12 bölüm çizgisi
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * maxRadius,
            centerY + Math.sin(angle) * maxRadius
        );
        ctx.stroke();
    }
}

// Görsel haritayı başlat
function initializeVisualChart() {
    if (!currentBirthData) return;
    
    const { houses } = currentBirthData;
    
    // Burç sembollerini yerleştir
    const zodiacWheel = document.getElementById('zodiac-wheel');
    if (zodiacWheel) {
        anime({
            targets: '.zodiac-sign',
            opacity: [0, 1],
            scale: [0.5, 1],
            duration: 800,
            delay: anime.stagger(60),
            easing: 'easeOutElastic(1, .8)'
        });
    }
}

// Giriş animasyonu
window.addEventListener('load', () => {
    anime({
        targets: '.birth-info-form',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'easeOutQuad'
    });
});
