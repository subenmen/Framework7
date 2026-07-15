// Profesyonel Astroloji Haritası v3.1.0
// Gerçek Astronomik Hesaplamalar

console.log('🌟 Astroloji Haritası v3.1.0 - Astronomik Hesaplamalar');

// Burç verileri (Tropik zodyak, 0° Koç = İlkbahar Ekinoksu)
const ZODIAC_SIGNS = [
    { name: 'Koç', symbol: '♈', start: 0 },
    { name: 'Boğa', symbol: '♉', start: 30 },
    { name: 'İkizler', symbol: '♊', start: 60 },
    { name: 'Yengeç', symbol: '♋', start: 90 },
    { name: 'Aslan', symbol: '♌', start: 120 },
    { name: 'Başak', symbol: '♍', start: 150 },
    { name: 'Terazi', symbol: '♎', start: 180 },
    { name: 'Akrep', symbol: '♏', start: 210 },
    { name: 'Yay', symbol: '♐', start: 240 },
    { name: 'Oğlak', symbol: '♑', start: 270 },
    { name: 'Kova', symbol: '♒', start: 300 },
    { name: 'Balık', symbol: '♓', start: 330 }
];

// Gezegen renkleri ve sembolleri
const PLANETS = {
    sun: { name: 'Güneş', symbol: '☉', color: '#FF6B00' },
    moon: { name: 'Ay', symbol: '☽', color: '#9B9B9B' },
    mercury: { name: 'Merkür', symbol: '☿', color: '#6B8E23' },
    venus: { name: 'Venüs', symbol: '♀', color: '#FF69B4' },
    mars: { name: 'Mars', symbol: '♂', color: '#DC143C' },
    jupiter: { name: 'Jüpiter', symbol: '♃', color: '#DAA520' },
    saturn: { name: 'Satürn', symbol: '♄', color: '#8B4513' },
    uranus: { name: 'Uranüs', symbol: '♅', color: '#00CED1' },
    neptune: { name: 'Neptün', symbol: '♆', color: '#4169E1' },
    pluto: { name: 'Plüton', symbol: '♇', color: '#8B0000' }
};

let chartData = null;

// Ana fonksiyon
function generateChart() {
    console.log('📊 Harita oluşturuluyor...');
    
    const dateInput = document.getElementById('birth-date').value;
    const timeInput = document.getElementById('birth-time').value;
    const citySelect = document.getElementById('city');
    const option = citySelect.options[citySelect.selectedIndex];
    
    const birthData = {
        date: dateInput,
        time: timeInput,
        lat: parseFloat(option.dataset.lat),
        lon: parseFloat(option.dataset.lon),
        tz: parseInt(option.dataset.tz),
        city: option.text
    };
    
    // Hesaplamalar
    chartData = calculateChart(birthData);
    
    // Çizim
    drawChart(chartData);
    
    // Bilgileri göster
    displayInfo(chartData);
    
    console.log('✅ Harita tamamlandı!', chartData);
}

// Harita hesapla
function calculateChart(birth) {
    console.log('🧮 Astronomik hesaplamalar başlıyor...');
    
    // UTC tarih-saat
    const localDate = new Date(`${birth.date}T${birth.time}`);
    const utcDate = new Date(localDate.getTime() - (birth.tz * 60 * 60 * 1000));
    
    // Julian Date
    const jd = getJulianDate(utcDate);
    
    // Greenwich Sidereal Time
    const gst = getGMST(jd);
    
    // Local Sidereal Time
    const lst = (gst + birth.lon / 15) % 24;
    
    // Ascendant ve MC
    const asc = calculateAscendant(lst, birth.lat);
    const mc = calculateMC(lst);
    
    // Evler (Placidus)
    const houses = calculateHouses(asc, mc, birth.lat);
    
    // Gezegenler
    const planets = calculatePlanets(jd);
    
    // Aspectler
    const aspects = calculateAspects(planets);
    
    console.log('✅ Hesaplamalar tamamlandı');
    console.log('Yükselen:', getZodiacPosition(asc));
    console.log('MC:', getZodiacPosition(mc));
    
    return {
        birth,
        jd,
        lst,
        asc,
        mc,
        houses,
        planets,
        aspects
    };
}

// Julian Date hesapla
function getJulianDate(date) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    
    let jy = y;
    let jm = m;
    if (m <= 2) {
        jy--;
        jm += 12;
    }
    
    const a = Math.floor(jy / 100);
    const b = 2 - a + Math.floor(a / 4);
    
    const jd = Math.floor(365.25 * (jy + 4716)) + 
               Math.floor(30.6001 * (jm + 1)) + 
               d + h / 24 + b - 1524.5;
    
    return jd;
}

// Greenwich Mean Sidereal Time
function getGMST(jd) {
    const t = (jd - 2451545.0) / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
               0.000387933 * t * t - t * t * t / 38710000.0;
    gmst = gmst % 360;
    if (gmst < 0) gmst += 360;
    return gmst / 15; // Saate çevir
}

// Ascendant hesapla (Yengeç = 90°-120° arası)
function calculateAscendant(lst, lat) {
    // LST'yi dereceye çevir
    const lstDeg = lst * 15;
    
    // MC (RAMC - Right Ascension of Midheaven)
    const mc = lstDeg;
    
    // Ascendant için iterasyon (basitleştirilmiş Placidus)
    const latRad = lat * Math.PI / 180;
    const obliquity = 23.4367; // Ekliptiğin eğimi
    const oblRad = obliquity * Math.PI / 180;
    
    // ASC yaklaşık hesaplama
    let asc = Math.atan2(Math.cos(lstDeg * Math.PI / 180), 
              -Math.sin(lstDeg * Math.PI / 180) * Math.cos(oblRad) - 
              Math.tan(latRad) * Math.sin(oblRad)) * 180 / Math.PI;
    
    asc = (asc + 360) % 360;
    
    return asc;
}

// MC (Midheaven) hesapla  
function calculateMC(lst) {
    return (lst * 15) % 360;
}

// Evleri hesapla (Placidus - basitleştirilmiş)
function calculateHouses(asc, mc, lat) {
    const houses = [];
    
    // 1. Ev = Ascendant
    houses[0] = asc;
    
    // 10. Ev = MC
    houses[9] = mc;
    
    // Basit ev hesaplama (eşit bölme)
    for (let i = 1; i < 12; i++) {
        if (i === 0) continue; // 1. ev zaten var
        if (i === 9) continue; // 10. ev zaten var
        houses[i] = (asc + i * 30) % 360;
    }
    
    return houses;
}

// Gezegen pozisyonları (basitleştirilmiş)
function calculatePlanets(jd) {
    const t = (jd - 2451545.0) / 36525.0;
    const planets = {};
    
    // Güneş (daha doğru)
    const L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    const M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    const MRad = M * Math.PI / 180;
    const C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(MRad) +
              (0.019993 - 0.000101 * t) * Math.sin(2 * MRad) +
              0.000289 * Math.sin(3 * MRad);
    planets.sun = (L0 + C) % 360;
    
    // Ay (ortalama boylam)
    planets.moon = (218.316 + 13.176396 * (jd - 2451545.0)) % 360;
    
    // İç gezegenler (Güneş'e göre)
    planets.mercury = (planets.sun + Math.sin(t * 4.09) * 28) % 360;
    planets.venus = (planets.sun + Math.sin(t * 1.6) * 47) % 360;
    
    // Mars
    planets.mars = (355.45 + 0.524 * (jd - 2451545.0)) % 360;
    
    // Dış gezegenler
    planets.jupiter = (34.40 + 0.083 * (jd - 2451545.0)) % 360;
    planets.saturn = (50.08 + 0.033 * (jd - 2451545.0)) % 360;
    planets.uranus = (314.05 + 0.012 * (jd - 2451545.0)) % 360;
    planets.neptune = (304.35 + 0.006 * (jd - 2451545.0)) % 360;
    planets.pluto = (238.96 + 0.004 * (jd - 2451545.0)) % 360;
    
    return planets;
}

// Aspectleri hesapla
function calculateAspects(planets) {
    const aspects = [];
    const keys = Object.keys(planets);
    const aspectTypes = [
        { name: 'Conjunction', angle: 0, orb: 8, color: '#FFD700' },
        { name: 'Opposition', angle: 180, orb: 8, color: '#FF0000' },
        { name: 'Trine', angle: 120, orb: 8, color: '#00FF00' },
        { name: 'Square', angle: 90, orb: 8, color: '#FF0000' },
        { name: 'Sextile', angle: 60, orb: 6, color: '#0000FF' }
    ];
    
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            let diff = Math.abs(planets[keys[i]] - planets[keys[j]]);
            if (diff > 180) diff = 360 - diff;
            
            for (let aspect of aspectTypes) {
                if (Math.abs(diff - aspect.angle) <= aspect.orb) {
                    aspects.push({
                        p1: keys[i],
                        p2: keys[j],
                        type: aspect.name,
                        angle: diff,
                        color: aspect.color
                    });
                    break;
                }
            }
        }
    }
    
    return aspects;
}

// Burç pozisyonu al
function getZodiacPosition(deg) {
    const signIndex = Math.floor(deg / 30);
    const degInSign = Math.floor(deg % 30);
    const sign = ZODIAC_SIGNS[signIndex];
    return `${degInSign}° ${sign.symbol} ${sign.name}`;
}

// Haritayı çiz
function drawChart(data) {
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    const center = 400;
    
    // Temizle
    ctx.clearRect(0, 0, 800, 800);
    
    // Arka plan çember
    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath();
    ctx.arc(center, center, 380, 0, Math.PI * 2);
    ctx.fill();
    
    // Çemberler
    const radii = [100, 180, 250, 320, 360];
    radii.forEach(r => {
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // Evler (radyal çizgiler)
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    data.houses.forEach((houseDeg, i) => {
        const angle = (houseDeg - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(center + Math.cos(angle) * 360, center + Math.sin(angle) * 360);
        ctx.stroke();
        
        // Ev numarası
        const textAngle = (houseDeg + 15 - 90) * Math.PI / 180;
        const textX = center + Math.cos(textAngle) * 140;
        const textY = center + Math.sin(textAngle) * 140;
        ctx.fillStyle = '#999';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i + 1, textX, textY);
    });
    
    // Burçlar
    ZODIAC_SIGNS.forEach(sign => {
        const angle = (sign.start + 15 - data.asc - 90) * Math.PI / 180;
        const x = center + Math.cos(angle) * 340;
        const y = center + Math.sin(angle) * 340;
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sign.symbol, x, y);
    });
    
    // Aspectler
    data.aspects.forEach(aspect => {
        const p1Deg = data.planets[aspect.p1];
        const p2Deg = data.planets[aspect.p2];
        
        const angle1 = (p1Deg - data.asc - 90) * Math.PI / 180;
        const angle2 = (p2Deg - data.asc - 90) * Math.PI / 180;
        
        const x1 = center + Math.cos(angle1) * 230;
        const y1 = center + Math.sin(angle1) * 230;
        const x2 = center + Math.cos(angle2) * 230;
        const y2 = center + Math.sin(angle2) * 230;
        
        ctx.strokeStyle = aspect.color;
        ctx.lineWidth = aspect.type === 'Trine' ? 2 : 1;
        ctx.setLineDash(aspect.type === 'Sextile' ? [5, 3] : []);
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
    });
    
    // Gezegenler
    Object.keys(data.planets).forEach(key => {
        const deg = data.planets[key];
        const angle = (deg - data.asc - 90) * Math.PI / 180;
        const x = center + Math.cos(angle) * 270;
        const y = center + Math.sin(angle) * 270;
        
        // Gezegen sembolü
        ctx.fillStyle = PLANETS[key].color;
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(PLANETS[key].symbol, x, y);
        
        // Derece
        ctx.font = '10px Arial';
        ctx.fillStyle = '#666';
        const degInSign = Math.floor(deg % 30);
        ctx.fillText(`${degInSign}°`, x, y + 18);
    });
    
    console.log('✅ Çizim tamamlandı');
}

// Bilgileri göster
function displayInfo(data) {
    // Genel bilgiler
    document.getElementById('chart-info').innerHTML = `
        <p><strong>Tarih:</strong> ${data.birth.date}</p>
        <p><strong>Saat:</strong> ${data.birth.time} (Yerel)</p>
        <p><strong>Yer:</strong> ${data.birth.city}</p>
        <p><strong>LST:</strong> ${data.lst.toFixed(2)} saat</p>
        <p><strong>Yükselen (ASC):</strong> ${getZodiacPosition(data.asc)}</p>
        <p><strong>Gökyüzü Ortası (MC):</strong> ${getZodiacPosition(data.mc)}</p>
    `;
    
    // Gezegenler
    let planetsHTML = '';
    Object.keys(data.planets).forEach(key => {
        planetsHTML += `<p>${PLANETS[key].symbol} ${PLANETS[key].name}: ${getZodiacPosition(data.planets[key])}</p>`;
    });
    document.getElementById('planets-info').innerHTML = planetsHTML;
    
    // Aspectler
    let aspectsHTML = '';
    data.aspects.forEach(asp => {
        aspectsHTML += `<p style="color:${asp.color}">${PLANETS[asp.p1].symbol} ${asp.type} ${PLANETS[asp.p2].symbol}</p>`;
    });
    document.getElementById('aspects-info').innerHTML = aspectsHTML || '<p>Aspect bulunamadı</p>';
}

// Otomatik yükle
window.addEventListener('load', () => {
    console.log('✅ Sayfa hazır');
    setTimeout(generateChart, 300);
});
