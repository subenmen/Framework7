// Profesyonel Astroloji Haritası JavaScript

// Global değişkenler
let chartData = {
    name: '',
    birthDate: '',
    birthTime: '',
    city: '',
    latitude: 0,
    longitude: 0,
    planets: {},
    houses: [],
    ascendant: 0,
    midheaven: 0,
    aspects: []
};

let wheelRotation = 0;
let showAspects = true;
let showHouses = true;

// Burç bilgileri (0° Koç = 0°)
const zodiacSigns = [
    { name: 'Koç', symbol: '♈', start: 0, key: 'aries' },
    { name: 'Boğa', symbol: '♉', start: 30, key: 'taurus' },
    { name: 'İkizler', symbol: '♊', start: 60, key: 'gemini' },
    { name: 'Yengeç', symbol: '♋', start: 90, key: 'cancer' },
    { name: 'Aslan', symbol: '♌', start: 120, key: 'leo' },
    { name: 'Başak', symbol: '♍', start: 150, key: 'virgo' },
    { name: 'Terazi', symbol: '♎', start: 180, key: 'libra' },
    { name: 'Akrep', symbol: '♏', start: 210, key: 'scorpio' },
    { name: 'Yay', symbol: '♐', start: 240, key: 'sagittarius' },
    { name: 'Oğlak', symbol: '♑', start: 270, key: 'capricorn' },
    { name: 'Kova', symbol: '♒', start: 300, key: 'aquarius' },
    { name: 'Balık', symbol: '♓', start: 330, key: 'pisces' }
];

// Gezegen bilgileri
const planetInfo = {
    sun: { name: 'Güneş', symbol: '☉', color: '#FFD700', meaning: 'Ego, kimlik, yaşam gücü' },
    moon: { name: 'Ay', symbol: '☽', color: '#C0C0C0', meaning: 'Duygular, içgüdüler, alışkanlıklar' },
    mercury: { name: 'Merkür', symbol: '☿', color: '#A9A9A9', meaning: 'İletişim, zeka, düşünce' },
    venus: { name: 'Venüs', symbol: '♀', color: '#FFB6C1', meaning: 'Aşk, güzellik, uyum' },
    mars: { name: 'Mars', symbol: '♂', color: '#FF4500', meaning: 'Enerji, cesaret, hırs' },
    jupiter: { name: 'Jüpiter', symbol: '♃', color: '#FFA500', meaning: 'Şans, genişleme, bilgelik' },
    saturn: { name: 'Satürn', symbol: '♄', color: '#DAA520', meaning: 'Disiplin, sorumluluk, sınırlar' },
    uranus: { name: 'Uranüs', symbol: '♅', color: '#00CED1', meaning: 'Devrim, özgünlük, değişim' },
    neptune: { name: 'Neptün', symbol: '♆', color: '#4169E1', meaning: 'Rüyalar, hayal, sezgi' },
    pluto: { name: 'Plüton', symbol: '♇', color: '#8B0000', meaning: 'Dönüşüm, güç, yeniden doğuş' }
};

// Aspect tipleri
const aspectTypes = {
    conjunction: { angle: 0, orb: 8, name: 'Kavuşum', symbol: '☌', color: '#FFD700', meaning: 'Güçlü birleşme' },
    opposition: { angle: 180, orb: 8, name: 'Karşıtlık', symbol: '☍', color: '#FF0000', meaning: 'Gerilim, denge arayışı' },
    trine: { angle: 120, orb: 8, name: 'Uyum', symbol: '△', color: '#00FF00', meaning: 'Kolay akış, yetenek' },
    square: { angle: 90, orb: 8, name: 'Kare', symbol: '□', color: '#FF0000', meaning: 'Zorluk, büyüme fırsatı' },
    sextile: { angle: 60, orb: 6, name: 'Altılı', symbol: '⚹', color: '#00BFFF', meaning: 'Fırsat, kolaylık' }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Uygulama başlatılıyor...');
    
    // Anime.js kontrol
    if (typeof anime === 'undefined') {
        console.error('❌ Anime.js yüklenmedi! Animasyonlar çalışmayacak.');
    } else {
        console.log('✅ Anime.js yüklendi');
    }
    
    initializeStars();
    initializeCanvas();
    initializeControls();
    initializeZodiacWheel();
    
    // Global fonksiyonlar (onclick için)
    window.generateChartNow = function() {
        console.log('🎯 Harita Oluştur butonuna tıklandı!');
        generateChart();
    };
    
    window.testChartNow = function() {
        console.log('🧪 Test butonu tıklandı!');
        const testData = {
            name: 'Test Haritası',
            birthDate: '1993-01-31',
            birthTime: '15:00',
            city: 'Ankara',
            latitude: 39.93,
            longitude: 32.85
        };
        calculateChart(testData);
    };
    
    // Buton event listeners (yedek)
    const generateBtn = document.getElementById('generate-chart');
    const testBtn = document.getElementById('test-chart');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            console.log('📍 Event listener - Harita oluştur');
            generateChart();
        });
        console.log('✅ Harita oluştur butonu event listener eklendi');
    } else {
        console.error('❌ generate-chart butonu bulunamadı!');
    }
    
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            console.log('📍 Event listener - Test haritası');
            window.testChartNow();
        });
        console.log('✅ Test butonu event listener eklendi');
    } else {
        console.error('❌ test-chart butonu bulunamadı!');
    }
    
    // Başlangıçta örnek harita göster
    console.log('📊 Başlangıç haritası yükleniyor...');
    setTimeout(() => {
        loadExampleChart();
    }, 500);
});

// Örnek harita yükle
function loadExampleChart() {
    const citySelect = document.getElementById('city');
    const selectedOption = citySelect.options[citySelect.selectedIndex];
    
    const formData = {
        name: selectedOption.text,
        birthDate: document.getElementById('birth-date').value,
        birthTime: document.getElementById('birth-time').value,
        city: selectedOption.text,
        latitude: parseFloat(selectedOption.dataset.lat),
        longitude: parseFloat(selectedOption.dataset.lon)
    };
    
    calculateChart(formData);
}

// Harita oluştur
function generateChart() {
    console.log('🔄 Harita oluşturuluyor...');
    
    const citySelect = document.getElementById('city');
    const selectedOption = citySelect.options[citySelect.selectedIndex];
    
    const formData = {
        name: selectedOption.text,
        birthDate: document.getElementById('birth-date').value,
        birthTime: document.getElementById('birth-time').value,
        city: selectedOption.text,
        latitude: parseFloat(selectedOption.dataset.lat),
        longitude: parseFloat(selectedOption.dataset.lon)
    };
    
    console.log('📋 Form verileri:', formData);
    
    if (!formData.birthDate || !formData.birthTime) {
        alert('Lütfen doğum tarihi ve saati girin!');
        return;
    }
    
    calculateChart(formData);
    
    console.log('✅ Harita hesaplandı');
    
    // Form animasyonu
    anime({
        targets: '#birth-form',
        opacity: [1, 0.5],
        scale: [1, 0.98],
        duration: 500,
        easing: 'easeInOutQuad'
    });
    
    // Harita animasyonu
    anime({
        targets: '#chart-wrapper',
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutElastic(1, .8)'
    });
}

// Harita hesaplamaları
function calculateChart(formData) {
    console.log('🎨 Harita hesaplanıyor...', formData);
    
    chartData.name = formData.name;
    chartData.birthDate = formData.birthDate;
    chartData.birthTime = formData.birthTime;
    chartData.city = formData.city;
    chartData.latitude = formData.latitude;
    chartData.longitude = formData.longitude;
    
    // Basitleştirilmiş astrolojik hesaplamalar
    const birthDateTime = new Date(`${formData.birthDate}T${formData.birthTime}`);
    const dayOfYear = getDayOfYear(birthDateTime);
    const timeDecimal = getTimeDecimal(formData.birthTime);
    
    // Ascendant hesapla (basitleştirilmiş)
    chartData.ascendant = ((dayOfYear * 0.986 + timeDecimal * 15 + formData.longitude) % 360);
    
    // Midheaven hesapla
    chartData.midheaven = (chartData.ascendant + 90) % 360;
    
    console.log('📐 Ascendant:', chartData.ascendant.toFixed(2), '°');
    
    // Evleri hesapla (Placidus sistemi - basitleştirilmiş)
    calculateHouses();
    
    // Gezegen pozisyonlarını hesapla
    calculatePlanetPositions(birthDateTime);
    
    console.log('🪐 Gezegenler hesaplandı:', Object.keys(chartData.planets).length);
    
    // Aspectleri hesapla
    calculateAspects();
    
    console.log('⭐ Aspectler:', chartData.aspects.length);
    
    // Haritayı çiz
    drawChart();
    
    console.log('✅ Harita çizildi!');
    
    // Bilgi panelini güncelle
    updateInfoPanel();
}

// Yılın gününü hesapla
function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

// Saati ondalık formata çevir
function getTimeDecimal(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
}

// Evleri hesapla
function calculateHouses() {
    chartData.houses = [];
    const ascendant = chartData.ascendant;
    
    // Placidus sistemi basitleştirilmiş (Eşit ev sistemi kullanıyoruz)
    for (let i = 0; i < 12; i++) {
        const houseCusp = (ascendant + (i * 30)) % 360;
        chartData.houses.push({
            number: i + 1,
            cusp: houseCusp,
            sign: getZodiacSign(houseCusp)
        });
    }
}

// Gezegen pozisyonlarını hesapla
function calculatePlanetPositions(birthDate) {
    // Basitleştirilmiş hesaplamalar (gerçek astronomik hesaplamalar için Swiss Ephemeris gerekir)
    const daysSinceEpoch = (birthDate - new Date('2000-01-01')) / (1000 * 60 * 60 * 24);
    
    // Güneş
    const sunLongitude = (280.46 + 0.9856474 * daysSinceEpoch) % 360;
    chartData.planets.sun = { longitude: sunLongitude, sign: getZodiacSign(sunLongitude) };
    
    // Ay (hızlı hareket)
    const moonLongitude = (218.32 + 13.176396 * daysSinceEpoch) % 360;
    chartData.planets.moon = { longitude: moonLongitude, sign: getZodiacSign(moonLongitude) };
    
    // Merkür
    const mercuryLongitude = (sunLongitude + (Math.sin(daysSinceEpoch * 0.1) * 28)) % 360;
    chartData.planets.mercury = { longitude: mercuryLongitude, sign: getZodiacSign(mercuryLongitude) };
    
    // Venüs
    const venusLongitude = (sunLongitude + (Math.sin(daysSinceEpoch * 0.05) * 47)) % 360;
    chartData.planets.venus = { longitude: venusLongitude, sign: getZodiacSign(venusLongitude) };
    
    // Mars
    const marsLongitude = (sunLongitude + (daysSinceEpoch * 0.524) % 360);
    chartData.planets.mars = { longitude: marsLongitude, sign: getZodiacSign(marsLongitude) };
    
    // Jüpiter
    const jupiterLongitude = (34.40 + 0.083091 * daysSinceEpoch) % 360;
    chartData.planets.jupiter = { longitude: jupiterLongitude, sign: getZodiacSign(jupiterLongitude) };
    
    // Satürn
    const saturnLongitude = (50.08 + 0.033371 * daysSinceEpoch) % 360;
    chartData.planets.saturn = { longitude: saturnLongitude, sign: getZodiacSign(saturnLongitude) };
    
    // Uranüs
    const uranusLongitude = (314.05 + 0.011609 * daysSinceEpoch) % 360;
    chartData.planets.uranus = { longitude: uranusLongitude, sign: getZodiacSign(uranusLongitude) };
    
    // Neptün
    const neptuneLongitude = (304.35 + 0.006027 * daysSinceEpoch) % 360;
    chartData.planets.neptune = { longitude: neptuneLongitude, sign: getZodiacSign(neptuneLongitude) };
    
    // Plüton
    const plutoLongitude = (238.96 + 0.003974 * daysSinceEpoch) % 360;
    chartData.planets.pluto = { longitude: plutoLongitude, sign: getZodiacSign(plutoLongitude) };
}

// Burç belirle
function getZodiacSign(longitude) {
    const normalizedLong = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLong / 30);
    const degree = Math.floor(normalizedLong % 30);
    const minutes = Math.floor(((normalizedLong % 30) - degree) * 60);
    
    return {
        name: zodiacSigns[signIndex].name,
        symbol: zodiacSigns[signIndex].symbol,
        degree: degree,
        minutes: minutes
    };
}

// Aspectleri hesapla
function calculateAspects() {
    chartData.aspects = [];
    const planetKeys = Object.keys(chartData.planets);
    
    for (let i = 0; i < planetKeys.length; i++) {
        for (let j = i + 1; j < planetKeys.length; j++) {
            const planet1 = planetKeys[i];
            const planet2 = planetKeys[j];
            const long1 = chartData.planets[planet1].longitude;
            const long2 = chartData.planets[planet2].longitude;
            
            let angle = Math.abs(long1 - long2);
            if (angle > 180) angle = 360 - angle;
            
            // Her aspect tipini kontrol et
            for (const [aspectKey, aspectData] of Object.entries(aspectTypes)) {
                if (Math.abs(angle - aspectData.angle) <= aspectData.orb) {
                    chartData.aspects.push({
                        planet1: planet1,
                        planet2: planet2,
                        type: aspectKey,
                        angle: angle,
                        name: aspectData.name,
                        symbol: aspectData.symbol,
                        color: aspectData.color
                    });
                    break;
                }
            }
        }
    }
}

// Haritayı çiz
function drawChart() {
    console.log('🎨 Harita çiziliyor...');
    drawMainCircles();
    drawHouses();
    drawZodiacSigns();
    drawPlanets();
    drawAspects();
    drawSpecialPoints();
    console.log('✨ Harita çizimi tamamlandı!');
}

// Ana çemberleri çiz
function drawMainCircles() {
    const canvas = document.getElementById('astro-canvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.chart-wrapper');
    
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ana çemberler
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.lineWidth = 1;
    
    const circles = [250, 280, 310];
    circles.forEach(radius => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Evleri çiz
function drawHouses() {
    if (!showHouses) return;
    
    const canvas = document.getElementById('astro-canvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
    ctx.lineWidth = 2;
    
    chartData.houses.forEach((house, index) => {
        const angle = (house.cusp - 90) * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * 310,
            centerY + Math.sin(angle) * 310
        );
        ctx.stroke();
        
        // Ev numarasını yaz
        const textAngle = (house.cusp + 15 - 90) * Math.PI / 180;
        const textX = centerX + Math.cos(textAngle) * 200;
        const textY = centerY + Math.sin(textAngle) * 200;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(house.number, textX, textY);
    });
}

// Burç sembollerini çiz
function drawZodiacSigns() {
    console.log('🌟 Burçlar çiziliyor...');
    
    const wrapper = document.querySelector('.chart-wrapper');
    if (!wrapper) {
        console.error('❌ chart-wrapper bulunamadı!');
        return;
    }
    
    const center = wrapper.offsetWidth / 2 || 350;
    let drawnCount = 0;
    
    zodiacSigns.forEach((sign, index) => {
        const angle = (sign.start + 15 - chartData.ascendant - 90) * Math.PI / 180;
        const signElement = document.querySelector(`[data-sign="${sign.key}"]`);
        
        if (signElement) {
            const radius = 290;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            
            signElement.style.left = x + 'px';
            signElement.style.top = y + 'px';
            signElement.style.transform = 'translate(-50%, -50%)';
            drawnCount++;
        } else {
            console.warn('⚠️ Burç elementi bulunamadı:', sign.key);
        }
    });
    
    console.log('✅ Burçlar çizildi:', drawnCount + '/12');
}

// Gezegenleri çiz
function drawPlanets() {
    console.log('🪐 Gezegenler çiziliyor...');
    
    const wrapper = document.querySelector('.chart-wrapper');
    if (!wrapper) {
        console.error('❌ chart-wrapper bulunamadı!');
        return;
    }
    
    const center = wrapper.offsetWidth / 2 || 350;
    let drawnCount = 0;
    
    Object.entries(chartData.planets).forEach(([planetKey, planetData]) => {
        const planetElement = document.getElementById(planetKey);
        if (!planetElement) {
            console.warn('⚠️ Gezegen elementi bulunamadı:', planetKey);
            return;
        }
        
        const angle = (planetData.longitude - chartData.ascendant - 90) * Math.PI / 180;
        const radius = 265;
        
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        
        planetElement.style.left = x + 'px';
        planetElement.style.top = y + 'px';
        planetElement.style.transform = 'translate(-50%, -50%)';
        planetElement.style.display = 'flex';
        
        // Derece bilgisini güncelle
        const degreeElement = planetElement.querySelector('.planet-degree');
        if (degreeElement) {
            degreeElement.textContent = `${planetData.sign.degree}°${planetData.sign.symbol}`;
        }
        
        // Renk
        planetElement.style.borderColor = planetInfo[planetKey].color;
        planetElement.style.boxShadow = `0 0 20px ${planetInfo[planetKey].color}`;
        
        // Click event
        planetElement.onclick = () => showPlanetInfo(planetKey);
        
        drawnCount++;
    });
    
    console.log('✅ Gezegenler çizildi:', drawnCount + '/10');
}

// Aspectleri çiz
function drawAspects() {
    if (!showAspects) return;
    
    const canvas = document.getElementById('aspects-canvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.chart-wrapper');
    
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 265;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    chartData.aspects.forEach(aspect => {
        const planet1Data = chartData.planets[aspect.planet1];
        const planet2Data = chartData.planets[aspect.planet2];
        
        const angle1 = (planet1Data.longitude - chartData.ascendant - 90) * Math.PI / 180;
        const angle2 = (planet2Data.longitude - chartData.ascendant - 90) * Math.PI / 180;
        
        const x1 = centerX + Math.cos(angle1) * radius;
        const y1 = centerY + Math.sin(angle1) * radius;
        const x2 = centerX + Math.cos(angle2) * radius;
        const y2 = centerY + Math.sin(angle2) * radius;
        
        ctx.strokeStyle = aspect.color;
        ctx.lineWidth = aspect.type === 'conjunction' || aspect.type === 'opposition' ? 2 : 1;
        ctx.setLineDash(aspect.type === 'sextile' ? [5, 3] : []);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        ctx.setLineDash([]);
    });
    
    updateAspectsTable();
}

// Özel noktaları çiz (AC, MC)
function drawSpecialPoints() {
    const wrapper = document.querySelector('.chart-wrapper');
    const center = wrapper.offsetWidth / 2 || 350;
    
    // Ascendant
    const ascElement = document.getElementById('ascendant');
    const ascAngle = (-90) * Math.PI / 180;
    const ascX = center + Math.cos(ascAngle) * 310;
    const ascY = center + Math.sin(ascAngle) * 310;
    ascElement.style.left = ascX + 'px';
    ascElement.style.top = ascY + 'px';
    ascElement.style.transform = 'translate(-50%, -50%)';
    
    // Midheaven
    const mcElement = document.getElementById('midheaven');
    const mcAngle = (0) * Math.PI / 180;
    const mcX = center + Math.cos(mcAngle) * 310;
    const mcY = center + Math.sin(mcAngle) * 310;
    mcElement.style.left = mcX + 'px';
    mcElement.style.top = mcY + 'px';
    mcElement.style.transform = 'translate(-50%, -50%)';
}

// Burç çemberini başlat
function initializeZodiacWheel() {
    const wheel = document.getElementById('zodiac-wheel');
    wheel.innerHTML = '';
    
    zodiacSigns.forEach((sign, index) => {
        const signDiv = document.createElement('div');
        signDiv.className = 'zodiac-sign';
        signDiv.dataset.sign = sign.key;
        signDiv.innerHTML = `
            <div class="sign-content">
                <span class="sign-symbol">${sign.symbol}</span>
                <span class="sign-name">${sign.name}</span>
            </div>
        `;
        wheel.appendChild(signDiv);
    });
}

// Gezegen bilgisini göster
function showPlanetInfo(planetKey) {
    const planet = chartData.planets[planetKey];
    const info = planetInfo[planetKey];
    
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = `
        <h4 style="color: ${info.color}">${info.symbol} ${info.name}</h4>
        <p><strong>Pozisyon:</strong> ${planet.sign.degree}° ${planet.sign.symbol} ${planet.sign.name}</p>
        <p><strong>Anlamı:</strong> ${info.meaning}</p>
    `;
    
    anime({
        targets: '#info-panel',
        scale: [0.95, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

// Bilgi panelini güncelle
function updateInfoPanel() {
    const infoContent = document.getElementById('info-content');
    const ascSign = getZodiacSign(chartData.ascendant);
    
    infoContent.innerHTML = `
        <h4>${chartData.name} - Doğum Haritası</h4>
        <p><strong>Tarih:</strong> ${chartData.birthDate} ${chartData.birthTime}</p>
        <p><strong>Yer:</strong> ${chartData.city}</p>
        <p><strong>Yükselen:</strong> ${ascSign.degree}° ${ascSign.symbol} ${ascSign.name}</p>
        <p><strong>Toplam Aspect:</strong> ${chartData.aspects.length}</p>
    `;
}

// Aspects tablosunu güncelle
function updateAspectsTable() {
    const aspectsList = document.getElementById('aspects-list');
    aspectsList.innerHTML = '';
    
    chartData.aspects.forEach(aspect => {
        const aspectDiv = document.createElement('div');
        aspectDiv.className = 'aspect-item';
        aspectDiv.style.borderLeft = `3px solid ${aspect.color}`;
        aspectDiv.innerHTML = `
            <span>${planetInfo[aspect.planet1].symbol} ${aspect.symbol} ${planetInfo[aspect.planet2].symbol}</span>
            <span style="color: ${aspect.color}">${aspect.name}</span>
        `;
        aspectsList.appendChild(aspectDiv);
    });
}

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

// Canvas başlangıç
function initializeCanvas() {
    console.log('🎨 Canvas başlatılıyor...');
    
    const wrapper = document.querySelector('.chart-wrapper');
    if (!wrapper) {
        console.error('❌ chart-wrapper bulunamadı!');
        return;
    }
    
    const astroCanvas = document.getElementById('astro-canvas');
    const aspectsCanvas = document.getElementById('aspects-canvas');
    
    if (!astroCanvas || !aspectsCanvas) {
        console.error('❌ Canvas elementleri bulunamadı!');
        return;
    }
    
    const size = wrapper.offsetWidth || 700;
    
    astroCanvas.width = size;
    astroCanvas.height = size;
    aspectsCanvas.width = size;
    aspectsCanvas.height = size;
    
    console.log('✅ Canvas başlatıldı:', size + 'x' + size);
}

// Kontrol butonları
function initializeControls() {
    document.getElementById('rotate-left').addEventListener('click', () => rotateWheel(-30));
    document.getElementById('rotate-right').addEventListener('click', () => rotateWheel(30));
    document.getElementById('reset-chart').addEventListener('click', () => {
        wheelRotation = 0;
        drawChart();
    });
    document.getElementById('toggle-aspects').addEventListener('click', () => {
        showAspects = !showAspects;
        drawAspects();
    });
    document.getElementById('toggle-houses').addEventListener('click', () => {
        showHouses = !showHouses;
        drawChart();
    });
}

// Çarkı döndür
function rotateWheel(degrees) {
    wheelRotation += degrees;
    chartData.ascendant = (chartData.ascendant - degrees + 360) % 360;
    drawChart();
}

// Giriş animasyonu
window.addEventListener('load', () => {
    anime({
        targets: '.zodiac-sign',
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 800,
        delay: anime.stagger(50),
        easing: 'easeOutElastic(1, .8)'
    });
});
