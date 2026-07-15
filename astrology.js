// Profesyonel Astroloji Doğum Haritası
// Gerçek Astronomik Hesaplamalar ile

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

// Burç sembolleri ve renkleri
const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const zodiacNames = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];
const zodiacColors = ['#E74C3C', '#27AE60', '#F39C12', '#3498DB', '#E67E22', '#95A5A6', '#16A085', '#8E44AD', '#C0392B', '#2C3E50', '#1ABC9C', '#9B59B6'];

// Gezegen sembolleri
const planetSymbols = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇'
};

const planetColors = {
    Sun: '#FFD700',
    Moon: '#C0C0C0',
    Mercury: '#87CEEB',
    Venus: '#FF69B4',
    Mars: '#FF4500',
    Jupiter: '#FFA500',
    Saturn: '#DAA520',
    Uranus: '#00CED1',
    Neptune: '#4169E1',
    Pluto: '#8B0000'
};

// Global değişkenler
let currentChart = null;
let canvas, ctx;
let chartScale = 1;
let canvasVisible = false;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    // Swiss Ephemeris başlat
    console.log('🌟 Profesyonel astroloji sistemi başlatılıyor...');
    await initSwissEph();
    
    setupEventListeners();
    setDefaultDate();
    canvas = document.getElementById('astro-canvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        setupCanvasInteraction();
    }
    
    console.log('✅ Sistem hazır!');
});

// Event listener'ları ayarla
function setupEventListeners() {
    document.getElementById('calculate-chart').addEventListener('click', calculateBirthChart);
    document.getElementById('new-calculation').addEventListener('click', resetForm);
    document.getElementById('show-chart').addEventListener('click', toggleChartView);
    
    // Zoom kontrolleri
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const resetZoom = document.getElementById('reset-zoom');
    const downloadBtn = document.getElementById('download-chart');
    
    if (zoomIn) zoomIn.addEventListener('click', () => zoomChart(1.2));
    if (zoomOut) zoomOut.addEventListener('click', () => zoomChart(0.8));
    if (resetZoom) resetZoom.addEventListener('click', () => { chartScale = 1; drawBirthChart(); });
    if (downloadBtn) downloadBtn.addEventListener('click', downloadChart);
}

// Canvas interaksiyon
function setupCanvasInteraction() {
    // Wheel zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoomChart(delta);
    });
}

function zoomChart(factor) {
    chartScale *= factor;
    chartScale = Math.max(0.8, Math.min(chartScale, 2));
    if (currentChart) drawBirthChart();
}

function downloadChart() {
    if (!canvas || !currentChart) return;
    
    const link = document.createElement('a');
    link.download = `astroloji-haritasi-${currentChart.date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Varsayılan tarih
function setDefaultDate() {
    const dateInput = document.getElementById('birth-date');
    const timeInput = document.getElementById('birth-time');
    const cityInput = document.getElementById('birth-city');
    
    // Default: 31 Ocak 1993, 15:00, Ankara
    if (!dateInput.value) dateInput.value = '1993-01-31';
    if (!timeInput.value) timeInput.value = '15:00';
    if (!cityInput.value) cityInput.value = 'ankara';
    
    // Max tarih bugün
    const today = new Date();
    dateInput.max = today.toISOString().split('T')[0];
}

// Ana hesaplama
async function calculateBirthChart() {
    const dateInput = document.getElementById('birth-date');
    const timeInput = document.getElementById('birth-time');
    const cityInput = document.getElementById('birth-city');
    
    if (!dateInput.value || !timeInput.value || !cityInput.value) {
        alert('⚠️ Lütfen tüm alanları doldurun!');
        return;
    }
    
    // Loading göster
    const btn = document.getElementById('calculate-chart');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Hesaplanıyor...';
    btn.disabled = true;
    
    try {
        const cityData = cityCoordinates[cityInput.value];
        const [hours, minutes] = timeInput.value.split(':').map(Number);
        
        // Local tarih oluştur
        const birthDate = new Date(dateInput.value);
        birthDate.setHours(hours, minutes, 0, 0);
        
        // UTC'ye çevir
        const utcDate = new Date(birthDate.getTime() - (cityData.tz * 60 * 60 * 1000));
        
        console.log('Doğum tarihi (local):', birthDate);
        console.log('Doğum tarihi (UTC):', utcDate);
        
        // Swiss Ephemeris ile hesaplama
        console.log('🔬 Swiss Ephemeris ile profesyonel hesaplama...');
        
        // Gezegen pozisyonlarını hesapla
        const planets = await calculatePlanetsWithSwissEph(utcDate);
        if (!planets) throw new Error('Gezegenler hesaplanamadı!');
        
        // Yükselen ve evleri hesapla  
        const housesData = await calculateHousesWithSwissEph(utcDate, cityData.lat, cityData.lon);
        if (!housesData) throw new Error('Evler hesaplanamadı!');
        
        const houses = housesData.cusps;
        
        // Aspectleri hesapla
        const aspects = calculateAspects(planets);
        
        currentChart = {
            date: dateInput.value,
            time: timeInput.value,
            city: cityInput.value,
            cityData: cityData,
            birthDate: birthDate,
            utcDate: utcDate,
            planets: planets,
            houses: houses,
            aspects: aspects
        };
        
        displayResults();
        
        btn.textContent = originalText;
        btn.disabled = false;
        
    } catch (error) {
        console.error('Hesaplama hatası:', error);
        alert(`❌ Hesaplama hatası: ${error.message}\n\nDetaylar console'da.`);
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Gezegen pozisyonlarını hesapla
function calculatePlanetPositions(date) {
    const planets = {};
    
    try {
        // Astronomy Engine ile doğru API kullanımı
        const bodies = {
            Sun: 'Güneş',
            Moon: 'Ay',
            Mercury: 'Merkür',
            Venus: 'Venüs',
            Mars: 'Mars',
            Jupiter: 'Jüpiter',
            Saturn: 'Satürn',
            Uranus: 'Uranüs',
            Neptune: 'Neptün',
            Pluto: 'Plüton'
        };
        
        Object.keys(bodies).forEach(bodyName => {
            try {
                // Astronomy Engine doğru kullanımı
                const body = Astronomy.Body[bodyName];
                
                // Geocentric pozisyon al
                const geoVector = Astronomy.GeoVector(body, date, false);
                
                // Ekliptik koordinatlara çevir
                const ecliptic = Astronomy.Ecliptic(geoVector);
                
                // Longitude hesapla (0-360 derece)
                let lon = ecliptic.elon;
                if (lon < 0) lon += 360;
                
                planets[bodyName] = {
                    longitude: lon,
                    latitude: ecliptic.elat,
                    symbol: planetSymbols[bodyName],
                    name: bodies[bodyName],
                    color: planetColors[bodyName]
                };
            } catch (e) {
                console.warn(`${bodyName} hesaplanamadı:`, e);
                // Fallback basit hesaplama
                planets[bodyName] = {
                    longitude: approximatePlanetPosition(bodyName, date),
                    latitude: 0,
                    symbol: planetSymbols[bodyName],
                    name: bodies[bodyName],
                    color: planetColors[bodyName]
                };
            }
        });
        
    } catch (error) {
        console.error('Gezegen hesaplama hatası:', error);
        throw error;
    }
    
    return planets;
}

// Basit yaklaşık pozisyon hesaplama (fallback)
function approximatePlanetPosition(planet, date) {
    // J2000 epoch'tan geçen gün sayısı
    const J2000 = new Date('2000-01-01T12:00:00Z');
    const days = (date - J2000) / (1000 * 60 * 60 * 24);
    
    // Ortalama yörünge hızları (derece/gün)
    const meanMotions = {
        Sun: 0.9856,
        Moon: 13.1764,
        Mercury: 4.0923,
        Venus: 1.6021,
        Mars: 0.5240,
        Jupiter: 0.0831,
        Saturn: 0.0335,
        Uranus: 0.0117,
        Neptune: 0.0060,
        Pluto: 0.0040
    };
    
    // Başlangıç pozisyonları (2000.0 için)
    const startPositions = {
        Sun: 280.46,
        Moon: 218.32,
        Mercury: 252.25,
        Venus: 181.98,
        Mars: 355.45,
        Jupiter: 34.35,
        Saturn: 49.95,
        Uranus: 313.23,
        Neptune: 304.88,
        Pluto: 238.96
    };
    
    const motion = meanMotions[planet] || 0;
    const start = startPositions[planet] || 0;
    
    let longitude = (start + motion * days) % 360;
    if (longitude < 0) longitude += 360;
    
    return longitude;
}

function getTurkishPlanetName(planet) {
    const names = {
        Mercury: 'Merkür',
        Venus: 'Venüs',
        Mars: 'Mars',
        Jupiter: 'Jüpiter',
        Saturn: 'Satürn',
        Uranus: 'Uranüs',
        Neptune: 'Neptün',
        Pluto: 'Plüton'
    };
    return names[planet] || planet;
}

// Evleri hesapla (Placidus benzeri - basitleştirilmiş)
function calculateHouses(date, lat, lon) {
    try {
        const lst = calculateLocalSiderealTime(date, lon);
        
        // 1. Ev (Ascendant) - Doğu horizonu
        const ascendant = calculateAscendant(lst, lat);
        
        // 10. Ev (MC - Midheaven) - Üst meridyen
        const mc = (lst * 15) % 360;
        
        // 4. Ev (IC - Imum Coeli) - Alt meridyen (MC'nin 180° karşısı)
        const ic = (mc + 180) % 360;
        
        // 7. Ev (Descendant) - Batı horizonu (Ascendant'ın 180° karşısı)
        const descendant = (ascendant + 180) % 360;
        
        // Basitleştirilmiş Placidus: Ara evleri hesapla
        // MC'den ASC'ye giderken (saat yönünün tersine)
        const houses = [];
        
        houses[0] = ascendant;                    // 1. Ev (ASC)
        houses[1] = interpolateHouse(ascendant, ic, 2/3);  // 2. Ev
        houses[2] = interpolateHouse(ascendant, ic, 1/3);  // 3. Ev
        houses[3] = ic;                           // 4. Ev (IC)
        houses[4] = interpolateHouse(ic, descendant, 2/3); // 5. Ev
        houses[5] = interpolateHouse(ic, descendant, 1/3); // 6. Ev
        houses[6] = descendant;                   // 7. Ev (DSC)
        houses[7] = interpolateHouse(descendant, mc, 2/3); // 8. Ev
        houses[8] = interpolateHouse(descendant, mc, 1/3); // 9. Ev
        houses[9] = mc;                           // 10. Ev (MC)
        houses[10] = interpolateHouse(mc, ascendant, 2/3); // 11. Ev
        houses[11] = interpolateHouse(mc, ascendant, 1/3); // 12. Ev
        
        console.log('House Cusps:', {
            'ASC (1)': ascendant.toFixed(2),
            'IC (4)': ic.toFixed(2),
            'DSC (7)': descendant.toFixed(2),
            'MC (10)': mc.toFixed(2)
        });
        
        return houses;
    } catch (error) {
        console.error('Ev hesaplama hatası:', error);
        // Fallback: Equal house sistemi
        const ascendant = 0;
        return Array.from({ length: 12 }, (_, i) => (ascendant + i * 30) % 360);
    }
}

// İki nokta arasında interpolasyon (saat yönünün tersine)
function interpolateHouse(start, end, ratio) {
    let diff = end - start;
    
    // Saat yönünün tersine en kısa yolu bul
    if (diff < 0) diff += 360;
    if (diff > 180) diff -= 360;
    
    let result = start + (diff * ratio);
    result = ((result % 360) + 360) % 360;
    
    return result;
}

function calculateLocalSiderealTime(date, longitude) {
    try {
        // J2000 epoch (1 Ocak 2000, 12:00 UTC)
        const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
        
        // UTC'deki güncel zaman
        const utcTime = date.getTime();
        
        // J2000'den geçen gün sayısı (ondalıklı)
        const d = (utcTime - J2000) / (1000 * 60 * 60 * 24);
        
        // Greenwich Mean Sidereal Time (GMST) - saat cinsinden
        // Meeus formülü
        const T = d / 36525; // Julian centuries
        let gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - (T * T * T) / 38710000;
        
        // 0-360 aralığına normalize et
        gmst = ((gmst % 360) + 360) % 360;
        
        // Dereceyi saate çevir
        gmst = gmst / 15;
        
        // Local Sidereal Time (LST) hesapla
        const lst = gmst + (longitude / 15);
        
        // 0-24 aralığına normalize et
        const lstNormalized = ((lst % 24) + 24) % 24;
        
        console.log('LST Hesaplama:', {
            date: date.toISOString(),
            longitude: longitude,
            d: d.toFixed(2),
            gmst: gmst.toFixed(4),
            lst: lstNormalized.toFixed(4),
            lstHMS: `${Math.floor(lstNormalized)}:${Math.floor((lstNormalized % 1) * 60)}:${Math.floor(((lstNormalized % 1) * 60 % 1) * 60)}`
        });
        
        return lstNormalized;
    } catch (error) {
        console.error('LST hesaplama hatası:', error);
        return 0;
    }
}

function calculateAscendant(lst, latitude) {
    try {
        // LST'yi dereceye çevir (RAMC - Right Ascension of Midheaven)
        const ramc = (lst * 15) % 360;
        
        // Ekliptik eğimi (obliquity) - 2000.0 için
        const obliquity = 23.4397;
        const oblRad = obliquity * Math.PI / 180;
        
        // Enlem radyana
        const latRad = latitude * Math.PI / 180;
        
        // RAMC radyana
        const ramcRad = ramc * Math.PI / 180;
        
        // Ascendant hesaplama (standart formül)
        // tan(Asc) = -cos(RAMC) / (sin(obliquity) * tan(lat) + cos(obliquity) * sin(RAMC))
        
        const numerator = -Math.cos(ramcRad);
        const denominator = Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad);
        
        let asc = Math.atan2(numerator, denominator) * 180 / Math.PI;
        
        // 0-360 aralığına normalize et
        asc = ((asc % 360) + 360) % 360;
        
        // Ascendant burcu
        const ascSign = Math.floor(asc / 30);
        
        console.log('Ascendant Hesaplama:', {
            lst: lst.toFixed(4),
            ramc: ramc.toFixed(2),
            latitude: latitude.toFixed(4),
            ascendant: asc.toFixed(2),
            sign: zodiacNames[ascSign],
            degree: (asc % 30).toFixed(2)
        });
        
        return asc;
    } catch (error) {
        console.error('Ascendant hesaplama hatası:', error);
        return 0;
    }
}

// Aspectleri hesapla
function calculateAspects(planets) {
    const aspects = [];
    const aspectTypes = [
        { angle: 0, name: 'Conjunction', orb: 8, color: '#FFD700', strength: 'major' },
        { angle: 60, name: 'Sextile', orb: 6, color: '#4169E1', strength: 'minor' },
        { angle: 90, name: 'Square', orb: 8, color: '#E74C3C', strength: 'major' },
        { angle: 120, name: 'Trine', orb: 8, color: '#27AE60', strength: 'major' },
        { angle: 180, name: 'Opposition', orb: 8, color: '#E74C3C', strength: 'major' }
    ];
    
    const planetKeys = Object.keys(planets);
    
    for (let i = 0; i < planetKeys.length; i++) {
        for (let j = i + 1; j < planetKeys.length; j++) {
            const p1 = planetKeys[i];
            const p2 = planetKeys[j];
            const angle = Math.abs(planets[p1].longitude - planets[p2].longitude);
            const normalizedAngle = angle > 180 ? 360 - angle : angle;
            
            for (let aspectType of aspectTypes) {
                if (Math.abs(normalizedAngle - aspectType.angle) <= aspectType.orb) {
                    aspects.push({
                        planet1: p1,
                        planet2: p2,
                        type: aspectType.name,
                        angle: normalizedAngle,
                        color: aspectType.color,
                        strength: aspectType.strength
                    });
                    break;
                }
            }
        }
    }
    
    return aspects;
}

// Sonuçları göster
function displayResults() {
    document.getElementById('birth-form').style.display = 'none';
    document.getElementById('results-panel').style.display = 'block';
    document.getElementById('controls').style.display = 'grid';
    
    const { planets, houses } = currentChart;
    
    // Güneş burcu
    const sunLon = planets.Sun.longitude;
    const sunSign = Math.floor(sunLon / 30);
    document.getElementById('sun-sign').innerHTML = `
        <div style="font-size: 48px; text-align: center; margin: 15px 0;">${zodiacSymbols[sunSign]}</div>
        <p><strong>Burç:</strong> ${zodiacNames[sunSign]}</p>
        <p><strong>Derece:</strong> ${(sunLon % 30).toFixed(2)}° ${zodiacNames[sunSign]}</p>
    `;
    
    // Yükselen
    const ascSign = Math.floor(houses[0] / 30);
    document.getElementById('rising-sign').innerHTML = `
        <div style="font-size: 48px; text-align: center; margin: 15px 0;">${zodiacSymbols[ascSign]}</div>
        <p><strong>Yükselen:</strong> ${zodiacNames[ascSign]}</p>
        <p><strong>Derece:</strong> ${(houses[0] % 30).toFixed(2)}°</p>
    `;
    
    // 12 Ev
    const housesHTML = houses.map((cusp, i) => {
        const sign = Math.floor(cusp / 30);
        return `
            <div class="house-item">
                <div class="house-number">${i + 1}. Ev</div>
                <div class="house-info">
                    <div class="house-name">${(cusp % 30).toFixed(1)}°</div>
                </div>
                <div class="house-sign">${zodiacSymbols[sign]}</div>
            </div>
        `;
    }).join('');
    document.getElementById('houses').innerHTML = housesHTML;
    
    // Gezegen pozisyonları
    let planetsHTML = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">';
    Object.entries(planets).forEach(([name, data]) => {
        const sign = Math.floor(data.longitude / 30);
        const degree = (data.longitude % 30).toFixed(1);
        planetsHTML += `
            <div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px;">
                <strong>${data.symbol} ${data.name}</strong><br>
                ${zodiacSymbols[sign]} ${degree}°
            </div>
        `;
    });
    planetsHTML += '</div>';
    document.getElementById('other-positions').innerHTML = planetsHTML;
    
    anime({
        targets: '.result-card',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(100),
        easing: 'easeOutQuad'
    });
}

// Harita görünümü
function toggleChartView() {
    const chartWrapper = document.getElementById('chart-wrapper');
    const showChartBtn = document.getElementById('show-chart');
    
    if (chartWrapper.style.display === 'none') {
        chartWrapper.style.display = 'block';
        showChartBtn.textContent = '📋 Bilgilere Dön';
        initializeCanvas();
        drawBirthChart();
    } else {
        chartWrapper.style.display = 'none';
        showChartBtn.textContent = '🎨 Haritayı Göster';
    }
}

function initializeCanvas() {
    const wrapper = document.querySelector('.chart-wrapper');
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
}

// Doğum haritasını çiz
function drawBirthChart() {
    if (!currentChart || !ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const baseRadius = Math.min(w, h) * 0.42 * chartScale;
    
    // High DPI desteği
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    
    ctx.clearRect(0, 0, w, h);
    
    // Arka plan - gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(w, h));
    bgGradient.addColorStop(0, '#FAFAFA');
    bgGradient.addColorStop(1, '#F0F0F0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    const { houses } = currentChart;
    
    // 1. En dış çember (burçlar için) - kalın siyah
    const outerRadius = baseRadius * 1.05;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 2. Evler çemberi
    const houseRadius = baseRadius * 0.95;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, houseRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 3. İç çemberler - ince gri
    ctx.lineWidth = 0.8;
    [0.75, 0.55, 0.35].forEach((ratio, index) => {
        ctx.strokeStyle = index === 0 ? '#999' : '#CCC';
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * ratio, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // Merkez daire - gradient
    const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.3);
    centerGradient.addColorStop(0, '#FFFFFF');
    centerGradient.addColorStop(1, '#F5F5F5');
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 12 burç bölümü çiz
    drawZodiacSigns(baseRadius, outerRadius);
    
    // Ev çizgileri ve numaraları
    drawHouses(baseRadius, houseRadius);
    
    // Derece işaretleri
    drawDegreeMarks(baseRadius);
    
    // Aspectler (merkez bölgede)
    drawAspects(baseRadius * 0.28);
    
    // Gezegenleri çiz
    drawPlanets(baseRadius * 0.88);
    
    ctx.restore();
    
    // Legend güncelle
    updateLegend();
}

// Burç sembollerini çiz (sabit, Koç 0° = sağda başlar)
function drawZodiacSigns(baseRadius, outerRadius) {
    // Burçlar sabit pozisyonda: Koç (♈) 0°'de başlar
    for (let i = 0; i < 12; i++) {
        const signLon = i * 30; // Her burç 30°
        const startAngle = (signLon - 90) * Math.PI / 180;
        const endAngle = ((signLon + 30) - 90) * Math.PI / 180;
        const midAngle = (startAngle + endAngle) / 2;
        
        // Burç ayırıcı çizgi (ince gri)
        ctx.strokeStyle = '#CCC';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(startAngle) * baseRadius * 0.95, Math.sin(startAngle) * baseRadius * 0.95);
        ctx.lineTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);
        ctx.stroke();
        
        // Burç sembolü - daha büyük ve bold
        const textRadius = (baseRadius * 0.95 + outerRadius) / 2;
        ctx.save();
        ctx.translate(Math.cos(midAngle) * textRadius, Math.sin(midAngle) * textRadius);
        ctx.fillStyle = '#333';
        ctx.font = 'bold 22px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zodiacSymbols[i], 0, 0);
        ctx.restore();
    }
}

// Evleri çiz
function drawHouses(baseRadius, houseRadius) {
    const { houses } = currentChart;
    
    // Ascendant'ı sol tarafa (180°) yerleştirmek için offset
    // Ascendant 1. ev cusps, onu 180°'ye (sol/9 o'clock) yerleştiriyoruz
    const ascendantAngle = houses[0];
    const rotationOffset = 180 - ascendantAngle; // ASC'yi 180°'ye çevirir
    
    for (let i = 0; i < 12; i++) {
        // Ev cusps pozisyonunu rotasyon ile ayarla
        const houseLon = houses[i];
        const angle = ((houseLon + rotationOffset) - 90) * Math.PI / 180;
        
        // Ev çizgisi (önemli evler kalın)
        const isAngular = (i === 0 || i === 3 || i === 6 || i === 9); // Angular houses: 1(ASC), 4(IC), 7(DSC), 10(MC)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = isAngular ? 2.5 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * baseRadius * 0.3, Math.sin(angle) * baseRadius * 0.3);
        ctx.lineTo(Math.cos(angle) * houseRadius, Math.sin(angle) * houseRadius);
        ctx.stroke();
        
        // Bir sonraki ev cusps (evin orta noktası için)
        const nextHouseLon = houses[(i + 1) % 12];
        let midLon = (houseLon + nextHouseLon) / 2;
        
        // Saat yönünün tersine orta nokta bul
        if (nextHouseLon < houseLon) midLon += 180;
        
        const midAngle = ((midLon + rotationOffset) - 90) * Math.PI / 180;
        const textRadius = houseRadius - 20;
        
        // Ev numarası ve derecesi
        const degree = Math.floor(houseLon % 30);
        const sign = Math.floor(houseLon / 30);
        
        ctx.save();
        ctx.translate(Math.cos(midAngle) * textRadius, Math.sin(midAngle) * textRadius);
        ctx.fillStyle = isAngular ? '#000' : '#444';
        ctx.font = isAngular ? 'bold 14px Arial' : 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Ev numarası
        ctx.fillText(`${i + 1}`, 0, -8);
        
        // Derece bilgisi
        ctx.font = '9px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(`${zodiacSymbols[sign]} ${degree}°`, 0, 6);
        
        ctx.restore();
    }
    
    // Angular noktaları özel işaretle (opsiyonel)
    drawAngularPoints(houses, rotationOffset, houseRadius);
}

// Angular noktaları işaretle (ASC, IC, DSC, MC)
function drawAngularPoints(houses, rotationOffset, radius) {
    const angularPoints = [
        { index: 0, label: 'ASC', color: '#E74C3C' },
        { index: 3, label: 'IC', color: '#3498DB' },
        { index: 6, label: 'DSC', color: '#27AE60' },
        { index: 9, label: 'MC', color: '#F39C12' }
    ];
    
    angularPoints.forEach(point => {
        const houseLon = houses[point.index];
        const angle = ((houseLon + rotationOffset) - 90) * Math.PI / 180;
        const labelRadius = radius + 35;
        
        ctx.save();
        ctx.translate(Math.cos(angle) * labelRadius, Math.sin(angle) * labelRadius);
        
        // Arka plan - gölgeli
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 3;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = point.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Label
        ctx.fillStyle = point.color;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(point.label, 0, 0);
        
        ctx.restore();
    });
}

// Derece işaretlerini çiz
function drawDegreeMarks(baseRadius) {
    ctx.strokeStyle = '#999';
    ctx.fillStyle = '#666';
    ctx.font = '8px Arial';
    
    for (let deg = 0; deg < 360; deg += 5) {
        const angle = (deg - 90) * Math.PI / 180;
        const isMajor = deg % 10 === 0;
        
        const startRadius = baseRadius * 0.75;
        const endRadius = baseRadius * (isMajor ? 0.72 : 0.735);
        
        ctx.lineWidth = isMajor ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius);
        ctx.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
        ctx.stroke();
        
        // Her 10 derecede numara
        if (deg % 30 === 0 && deg % 30 === 0) {
            const textRadius = baseRadius * 0.68;
            const displayDeg = deg % 30;
            
            ctx.save();
            ctx.translate(Math.cos(angle) * textRadius, Math.sin(angle) * textRadius);
            ctx.rotate(-chartRotation * Math.PI / 180);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${displayDeg}°`, 0, 0);
            ctx.restore();
        }
    }
}

function drawAspects(radius) {
    const { planets, aspects, houses } = currentChart;
    
    // Ascendant rotation offset
    const ascendantAngle = houses[0];
    const rotationOffset = 180 - ascendantAngle;
    
    // Aspect çizgileri için stil
    const aspectStyles = {
        'Conjunction': { color: '#FFD700', width: 2.5, alpha: 0.7 },
        'Opposition': { color: '#E74C3C', width: 1.5, alpha: 0.6 },
        'Trine': { color: '#3498DB', width: 1.5, alpha: 0.6 },
        'Square': { color: '#E74C3C', width: 1.5, alpha: 0.6 },
        'Sextile': { color: '#27AE60', width: 1, alpha: 0.5 }
    };
    
    aspects.forEach(aspect => {
        if (aspect.strength !== 'major') return;
        
        const style = aspectStyles[aspect.type] || { color: '#999', width: 1, alpha: 0.4 };
        
        const p1Lon = planets[aspect.planet1].longitude;
        const p2Lon = planets[aspect.planet2].longitude;
        
        const p1Angle = ((p1Lon + rotationOffset) - 90) * Math.PI / 180;
        const p2Angle = ((p2Lon + rotationOffset) - 90) * Math.PI / 180;
        
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.width;
        ctx.globalAlpha = style.alpha;
        
        // Çizgi stili
        if (aspect.type === 'Square' || aspect.type === 'Opposition') {
            ctx.setLineDash([4, 2]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(Math.cos(p1Angle) * radius, Math.sin(p1Angle) * radius);
        ctx.lineTo(Math.cos(p2Angle) * radius, Math.sin(p2Angle) * radius);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
    });
}

function drawPlanets(radius) {
    const { planets, houses } = currentChart;
    
    // Ascendant rotation offset
    const ascendantAngle = houses[0];
    const rotationOffset = 180 - ascendantAngle;
    
    Object.entries(planets).forEach(([name, data]) => {
        // Gezegen longitude'u harita rotasyonu ile ayarla
        const planetLon = data.longitude;
        const angle = ((planetLon + rotationOffset) - 90) * Math.PI / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Gezegen pozisyon çizgisi
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (radius - 25), Math.sin(angle) * (radius - 25));
        ctx.lineTo(Math.cos(angle) * (radius + 5), Math.sin(angle) * (radius + 5));
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Gezegen sembolü
        ctx.save();
        ctx.translate(x, y);
        
        // Arka plan - gölgeli
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = data.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Sembol
        ctx.fillStyle = data.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.symbol, 0, 0);
        
        // Derece bilgisi (burç içi derece)
        const degree = Math.floor(planetLon % 30);
        const minutes = Math.floor((planetLon % 1) * 60);
        const sign = Math.floor(planetLon / 30);
        
        ctx.font = 'bold 8px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(`${zodiacSymbols[sign]}${degree}°${String(minutes).padStart(2, '0')}'`, 0, 22);
        
        ctx.restore();
    });
}

function updateLegend() {
    const legend = document.getElementById('chart-legend');
    const { aspects } = currentChart;
    
    const majorAspects = aspects.filter(a => a.strength === 'major');
    if (majorAspects.length === 0) {
        legend.innerHTML = '<strong>Aspect yok</strong>';
        return;
    }
    
    let html = '<strong>Majör Aspectler:</strong> ';
    html += majorAspects.slice(0, 5).map(a => {
        const p1 = currentChart.planets[a.planet1];
        const p2 = currentChart.planets[a.planet2];
        return `${p1.symbol}${a.type === 'Trine' ? '△' : a.type === 'Square' ? '□' : '☍'}${p2.symbol}`;
    }).join(' • ');
    
    if (majorAspects.length > 5) {
        html += ` +${majorAspects.length - 5} daha`;
    }
    
    legend.innerHTML = html;
}

// Form sıfırla
function resetForm() {
    document.getElementById('birth-form').style.display = 'block';
    document.getElementById('results-panel').style.display = 'none';
    document.getElementById('chart-wrapper').style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    currentChart = null;
    chartScale = 1;
    canvasVisible = false;
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
