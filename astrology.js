// KUBEY Astroloji Haritası v3.0.0
console.log('🚀 Astroloji Haritası v3.0.0 başlatılıyor...');

// Burç verileri
const zodiacSigns = [
    { name: 'Koç', symbol: '♈', deg: 0 },
    { name: 'Boğa', symbol: '♉', deg: 30 },
    { name: 'İkizler', symbol: '♊', deg: 60 },
    { name: 'Yengeç', symbol: '♋', deg: 90 },
    { name: 'Aslan', symbol: '♌', deg: 120 },
    { name: 'Başak', symbol: '♍', deg: 150 },
    { name: 'Terazi', symbol: '♎', deg: 180 },
    { name: 'Akrep', symbol: '♏', deg: 210 },
    { name: 'Yay', symbol: '♐', deg: 240 },
    { name: 'Oğlak', symbol: '♑', deg: 270 },
    { name: 'Kova', symbol: '♒', deg: 300 },
    { name: 'Balık', symbol: '♓', deg: 330 }
];

// Gezegen verileri
const planets = {
    sun: { name: 'Güneş', symbol: '☉', color: '#FFD700' },
    moon: { name: 'Ay', symbol: '☽', color: '#C0C0C0' },
    mercury: { name: 'Merkür', symbol: '☿', color: '#A9A9A9' },
    venus: { name: 'Venüs', symbol: '♀', color: '#FFB6C1' },
    mars: { name: 'Mars', symbol: '♂', color: '#FF4500' },
    jupiter: { name: 'Jüpiter', symbol: '♃', color: '#FFA500' },
    saturn: { name: 'Satürn', symbol: '♄', color: '#DAA520' },
    uranus: { name: 'Uranüs', symbol: '♅', color: '#00CED1' },
    neptune: { name: 'Neptün', symbol: '♆', color: '#4169E1' },
    pluto: { name: 'Plüton', symbol: '♇', color: '#8B0000' }
};

// Global değişkenler
let chartData = null;

// Harita oluştur
function createChart() {
    console.log('📊 Harita oluşturuluyor...');
    
    // Form verilerini al
    const date = document.getElementById('birth-date').value;
    const time = document.getElementById('birth-time').value;
    const citySelect = document.getElementById('city');
    const selectedCity = citySelect.options[citySelect.selectedIndex];
    
    const data = {
        date: date,
        time: time,
        city: selectedCity.text,
        lat: parseFloat(selectedCity.dataset.lat),
        lon: parseFloat(selectedCity.dataset.lon)
    };
    
    console.log('📋 Veri:', data);
    
    // Hesapla
    chartData = calculatePlanets(data);
    
    // Çiz
    drawChart(chartData);
    
    // Bilgi güncelle
    updateInfo(chartData);
    
    console.log('✅ Harita oluşturuldu!');
}

// Gezegen pozisyonlarını hesapla (basitleştirilmiş)
function calculatePlanets(data) {
    console.log('🧮 Gezegenler hesaplanıyor...');
    
    const birthDate = new Date(`${data.date}T${data.time}`);
    const dayOfYear = Math.floor((birthDate - new Date(birthDate.getFullYear(), 0, 0)) / 86400000);
    
    // Basit hesaplama (gerçek astronomik değil, demo için)
    const positions = {};
    
    positions.sun = (280 + dayOfYear * 0.98) % 360;
    positions.moon = (218 + dayOfYear * 13.17) % 360;
    positions.mercury = (positions.sun + (Math.sin(dayOfYear * 0.1) * 28)) % 360;
    positions.venus = (positions.sun + (Math.sin(dayOfYear * 0.05) * 47)) % 360;
    positions.mars = (positions.sun + dayOfYear * 0.52) % 360;
    positions.jupiter = (34 + dayOfYear * 0.08) % 360;
    positions.saturn = (50 + dayOfYear * 0.03) % 360;
    positions.uranus = (314 + dayOfYear * 0.01) % 360;
    positions.neptune = (304 + dayOfYear * 0.006) % 360;
    positions.pluto = (239 + dayOfYear * 0.004) % 360;
    
    // Ascendant
    const timeDecimal = parseInt(data.time.split(':')[0]) + parseInt(data.time.split(':')[1]) / 60;
    const ascendant = ((dayOfYear * 0.98 + timeDecimal * 15 + data.lon) % 360);
    
    console.log('✅ Hesaplamalar tamamlandı');
    
    return {
        data: data,
        positions: positions,
        ascendant: ascendant
    };
}

// Haritayı çiz
function drawChart(chartData) {
    console.log('🎨 Harita çiziliyor...');
    
    const canvas = document.getElementById('chart-canvas');
    const ctx = canvas.getContext('2d');
    const center = 300;
    
    // Temizle
    ctx.clearRect(0, 0, 600, 600);
    
    // Çemberler
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let r = 100; r <= 250; r += 50) {
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Radyal çizgiler (12 ev)
    ctx.strokeStyle = '#d0d0d0';
    for (let i = 0; i < 12; i++) {
        const angle = (chartData.ascendant + i * 30 - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(center + Math.cos(angle) * 250, center + Math.sin(angle) * 250);
        ctx.stroke();
    }
    
    // Elementleri temizle ve yeniden oluştur
    const elementsDiv = document.getElementById('chart-elements');
    elementsDiv.innerHTML = '';
    
    // Burçları çiz
    zodiacSigns.forEach((sign, i) => {
        const angle = (sign.deg + 15 - chartData.ascendant - 90) * Math.PI / 180;
        const x = center + Math.cos(angle) * 230 - 30;
        const y = center + Math.sin(angle) * 230 - 30;
        
        const signDiv = document.createElement('div');
        signDiv.className = 'zodiac';
        signDiv.innerHTML = sign.symbol;
        signDiv.style.left = x + 'px';
        signDiv.style.top = y + 'px';
        signDiv.title = sign.name;
        
        elementsDiv.appendChild(signDiv);
    });
    
    // Gezegenleri çiz
    Object.keys(chartData.positions).forEach(planetKey => {
        const deg = chartData.positions[planetKey];
        const angle = (deg - chartData.ascendant - 90) * Math.PI / 180;
        const x = center + Math.cos(angle) * 150 - 25;
        const y = center + Math.sin(angle) * 150 - 25;
        
        const planetDiv = document.createElement('div');
        planetDiv.className = 'planet';
        planetDiv.innerHTML = planets[planetKey].symbol;
        planetDiv.style.left = x + 'px';
        planetDiv.style.top = y + 'px';
        planetDiv.style.borderColor = planets[planetKey].color;
        planetDiv.title = `${planets[planetKey].name}: ${Math.round(deg)}°`;
        planetDiv.onclick = () => showPlanetInfo(planetKey, deg);
        
        elementsDiv.appendChild(planetDiv);
    });
    
    console.log('✅ Çizim tamamlandı');
}

// Gezegen bilgisi göster
function showPlanetInfo(planetKey, deg) {
    const planet = planets[planetKey];
    const signIndex = Math.floor(deg / 30);
    const sign = zodiacSigns[signIndex];
    const degInSign = Math.floor(deg % 30);
    
    document.getElementById('info-title').textContent = `${planet.symbol} ${planet.name}`;
    document.getElementById('info-content').innerHTML = `
        <p><strong>Pozisyon:</strong> ${degInSign}° ${sign.symbol} ${sign.name}</p>
        <p><strong>Toplam Derece:</strong> ${Math.round(deg)}°</p>
    `;
}

// Bilgiyi güncelle
function updateInfo(chartData) {
    const ascSign = zodiacSigns[Math.floor(chartData.ascendant / 30)];
    const ascDeg = Math.floor(chartData.ascendant % 30);
    
    document.getElementById('info-title').textContent = '🔮 Doğum Haritası';
    document.getElementById('info-content').innerHTML = `
        <p><strong>Tarih:</strong> ${chartData.data.date} ${chartData.data.time}</p>
        <p><strong>Yer:</strong> ${chartData.data.city}</p>
        <p><strong>Yükselen (ASC):</strong> ${ascDeg}° ${ascSign.symbol} ${ascSign.name}</p>
        <p><em>Gezegenlere tıklayarak detay görebilirsiniz.</em></p>
    `;
}

// Sayfa yüklendiğinde otomatik harita oluştur
window.addEventListener('load', () => {
    console.log('✅ Sayfa yüklendi');
    setTimeout(() => {
        console.log('🎬 Otomatik harita oluşturuluyor...');
        createChart();
    }, 500);
});

console.log('✨ Script hazır');
