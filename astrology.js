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
let chartRotation = 0;
let chartScale = 1;
let isDragging = false;
let lastX, lastY;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setDefaultDate();
    canvas = document.getElementById('astro-canvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        setupCanvasInteraction();
    }
});

// Event listener'ları ayarla
function setupEventListeners() {
    document.getElementById('calculate-chart').addEventListener('click', calculateBirthChart);
    document.getElementById('new-calculation').addEventListener('click', resetForm);
    document.getElementById('show-chart').addEventListener('click', toggleChartView);
    
    // Zoom kontrolleri
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const rotateChart = document.getElementById('rotate-chart');
    
    if (zoomIn) zoomIn.addEventListener('click', () => zoomChart(1.2));
    if (zoomOut) zoomOut.addEventListener('click', () => zoomChart(0.8));
    if (rotateChart) rotateChart.addEventListener('click', () => rotateChartBy(30));
}

// Canvas interaksiyon
function setupCanvasInteraction() {
    // Mouse events
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);
    
    // Touch events
    canvas.addEventListener('touchstart', startDrag);
    canvas.addEventListener('touchmove', drag);
    canvas.addEventListener('touchend', endDrag);
    
    // Wheel zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoomChart(delta);
    });
}

function startDrag(e) {
    isDragging = true;
    const pos = getEventPosition(e);
    lastX = pos.x;
    lastY = pos.y;
}

function drag(e) {
    if (!isDragging || !currentChart) return;
    e.preventDefault();
    
    const pos = getEventPosition(e);
    const dx = pos.x - lastX;
    
    chartRotation += dx * 0.5;
    lastX = pos.x;
    lastY = pos.y;
    
    drawBirthChart();
}

function endDrag() {
    isDragging = false;
}

function getEventPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

function zoomChart(factor) {
    chartScale *= factor;
    chartScale = Math.max(0.5, Math.min(chartScale, 3));
    if (currentChart) drawBirthChart();
}

function rotateChartBy(degrees) {
    chartRotation += degrees;
    if (currentChart) drawBirthChart();
}

// Varsayılan tarih
function setDefaultDate() {
    const today = new Date();
    const dateInput = document.getElementById('birth-date');
    dateInput.value = today.toISOString().split('T')[0];
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
    
    const cityData = cityCoordinates[cityInput.value];
    const [hours, minutes] = timeInput.value.split(':').map(Number);
    
    // UTC tarih oluştur
    const birthDate = new Date(dateInput.value);
    birthDate.setHours(hours - cityData.tz, minutes, 0, 0);
    
    try {
        // Gezegen pozisyonlarını hesapla
        const planets = calculatePlanetPositions(birthDate);
        
        // Yükselen ve evleri hesapla
        const houses = calculateHouses(birthDate, cityData.lat, cityData.lon);
        
        // Aspectleri hesapla
        const aspects = calculateAspects(planets);
        
        currentChart = {
            date: dateInput.value,
            time: timeInput.value,
            city: cityInput.value,
            cityData: cityData,
            planets: planets,
            houses: houses,
            aspects: aspects
        };
        
        displayResults();
        
    } catch (error) {
        console.error('Hesaplama hatası:', error);
        alert('❌ Hesaplama sırasında bir hata oluştu!');
    }
}

// Gezegen pozisyonlarını hesapla
function calculatePlanetPositions(date) {
    const observer = new Astronomy.Observer(39.9334, 32.8597, 0);
    const planets = {};
    
    // Güneş
    const sun = Astronomy.SunPosition(date);
    planets.Sun = {
        longitude: Astronomy.EclipticLongitude(Astronomy.Body.Sun, date),
        symbol: planetSymbols.Sun,
        name: 'Güneş',
        color: planetColors.Sun
    };
    
    // Ay
    planets.Moon = {
        longitude: Astronomy.EclipticLongitude(Astronomy.Body.Moon, date),
        symbol: planetSymbols.Moon,
        name: 'Ay',
        color: planetColors.Moon
    };
    
    // Diğer gezegenler
    const bodies = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    bodies.forEach(body => {
        try {
            planets[body] = {
                longitude: Astronomy.EclipticLongitude(Astronomy.Body[body], date),
                symbol: planetSymbols[body],
                name: getTurkishPlanetName(body),
                color: planetColors[body]
            };
        } catch (e) {
            console.warn(`${body} hesaplanamadı:`, e);
        }
    });
    
    return planets;
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

// Evleri hesapla (Placidus sistemi)
function calculateHouses(date, lat, lon) {
    const lst = calculateLocalSiderealTime(date, lon);
    const houses = [];
    
    // Basitleştirilmiş Placidus hesabı
    const ascendant = calculateAscendant(lst, lat);
    const mc = (lst * 15) % 360;
    
    houses.push(ascendant); // 1. Ev (Ascendant)
    
    for (let i = 1; i < 12; i++) {
        let cusp;
        if (i === 9) {
            cusp = mc; // 10. Ev (MC)
        } else if (i < 3 || i > 9) {
            // 2, 3, 11, 12. evler - basit interpolasyon
            cusp = (ascendant + (i * 30)) % 360;
        } else {
            // 4-9 arası evler
            cusp = (mc + ((i - 9) * 30)) % 360;
        }
        houses.push(cusp);
    }
    
    return houses;
}

function calculateLocalSiderealTime(date, longitude) {
    const J2000 = new Date('2000-01-01T12:00:00Z');
    const daysSinceJ2000 = (date - J2000) / (1000 * 60 * 60 * 24);
    const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
    const gmst = 18.697374558 + 24.06570982441908 * daysSinceJ2000 + hours * 1.00273790935;
    const lst = gmst + (longitude / 15);
    return ((lst % 24) + 24) % 24;
}

function calculateAscendant(lst, latitude) {
    const lstDegrees = lst * 15;
    const latRad = latitude * Math.PI / 180;
    const obliquity = 23.4397;
    const oblRad = obliquity * Math.PI / 180;
    
    const y = Math.sin(lstDegrees * Math.PI / 180);
    const x = Math.cos(lstDegrees * Math.PI / 180) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad);
    
    let asc = Math.atan2(y, x) * 180 / Math.PI;
    asc = ((asc % 360) + 360) % 360;
    
    return asc;
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
    const baseRadius = Math.min(w, h) * 0.4 * chartScale;
    
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(chartRotation * Math.PI / 180);
    
    // Arka plan
    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Dış çember
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // İç çemberler
    ctx.lineWidth = 1;
    [0.3, 0.6, 0.85].forEach(ratio => {
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * ratio, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // 12 burç bölümü
    const { houses } = currentChart;
    for (let i = 0; i < 12; i++) {
        const angle = (houses[i] - 90) * Math.PI / 180;
        
        // Ev çizgileri
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * baseRadius, Math.sin(angle) * baseRadius);
        ctx.stroke();
        
        // Burç sembolleri
        const midAngle = angle + (15 * Math.PI / 180);
        const textRadius = baseRadius * 0.93;
        const sign = Math.floor(houses[i] / 30);
        
        ctx.save();
        ctx.translate(Math.cos(midAngle) * textRadius, Math.sin(midAngle) * textRadius);
        ctx.rotate(-chartRotation * Math.PI / 180);
        ctx.fillStyle = zodiacColors[sign];
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zodiacSymbols[sign], 0, 0);
        ctx.restore();
    }
    
    // Aspectler (önce çiz ki üstte kalmasın)
    drawAspects(baseRadius * 0.25);
    
    // Gezegenleri çiz
    drawPlanets(baseRadius * 0.7);
    
    ctx.restore();
    
    // Legend güncelle
    updateLegend();
}

function drawAspects(radius) {
    const { planets, aspects } = currentChart;
    
    aspects.forEach(aspect => {
        if (aspect.strength !== 'major') return; // Sadece major aspectler
        
        const p1Angle = (planets[aspect.planet1].longitude - 90) * Math.PI / 180;
        const p2Angle = (planets[aspect.planet2].longitude - 90) * Math.PI / 180;
        
        ctx.strokeStyle = aspect.color;
        ctx.lineWidth = aspect.type === 'Conjunction' ? 2 : 1;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(p1Angle) * radius, Math.sin(p1Angle) * radius);
        ctx.lineTo(Math.cos(p2Angle) * radius, Math.sin(p2Angle) * radius);
        ctx.stroke();
        ctx.globalAlpha = 1;
    });
}

function drawPlanets(radius) {
    const { planets } = currentChart;
    
    Object.entries(planets).forEach(([name, data]) => {
        const angle = (data.longitude - 90) * Math.PI / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Gezegen sembolü
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-chartRotation * Math.PI / 180);
        
        // Arka plan
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = data.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Sembol
        ctx.fillStyle = data.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.symbol, 0, 0);
        
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
    chartRotation = 0;
    chartScale = 1;
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
