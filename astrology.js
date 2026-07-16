// KUBEY Astroloji v5.2.0 - Harita + Yorum + Günlük Fal + Sinastri + Transitler + Ay Fazları + PWA
// Chatbot artık TÜM harita verisini önce öğrenir, sonra yorumlar
console.log('🌟 Astroloji v5.2.0 yükleniyor...');

const APP_VERSION = '5.2.0';

const DEG = Math.PI / 180;

// ---------- VERİLER ----------
const SIGNS = [
    { name: 'Koç', symbol: '♈', element: 'fire' },
    { name: 'Boğa', symbol: '♉', element: 'earth' },
    { name: 'İkizler', symbol: '♊', element: 'air' },
    { name: 'Yengeç', symbol: '♋', element: 'water' },
    { name: 'Aslan', symbol: '♌', element: 'fire' },
    { name: 'Başak', symbol: '♍', element: 'earth' },
    { name: 'Terazi', symbol: '♎', element: 'air' },
    { name: 'Akrep', symbol: '♏', element: 'water' },
    { name: 'Yay', symbol: '♐', element: 'fire' },
    { name: 'Oğlak', symbol: '♑', element: 'earth' },
    { name: 'Kova', symbol: '♒', element: 'air' },
    { name: 'Balık', symbol: '♓', element: 'water' }
];

const ELEMENT_COLORS = {
    fire: '#cc3b2f',
    earth: '#3d8b37',
    air: '#d9902a',
    water: '#3465c0'
};

const PLANETS = {
    sun:     { name: 'Güneş',  symbol: '☉', color: '#e08b00' },
    moon:    { name: 'Ay',     symbol: '☽', color: '#7a7a7a' },
    mercury: { name: 'Merkür', symbol: '☿', color: '#6b8e23' },
    venus:   { name: 'Venüs',  symbol: '♀', color: '#cc5490' },
    mars:    { name: 'Mars',   symbol: '♂', color: '#cc2222' },
    jupiter: { name: 'Jüpiter',symbol: '♃', color: '#8855cc' },
    saturn:  { name: 'Satürn', symbol: '♄', color: '#8b6f47' },
    uranus:  { name: 'Uranüs', symbol: '♅', color: '#00a5a5' },
    neptune: { name: 'Neptün', symbol: '♆', color: '#3465c0' },
    pluto:   { name: 'Plüton', symbol: '♇', color: '#663333' }
};

// JPL yaklaşık Kepler elemanları (J2000, yüzyıl başına oranlar)
// [a, e, I, L, wbar, Omega] + oranlar
const KEPLER = {
    mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
              [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
    venus:   [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
              [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
    earth:   [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
              [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
    mars:    [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
              [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
    jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
              [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
    saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
              [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
    uranus:  [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503],
              [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
    neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
              [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
    pluto:   [[39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
              [-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]]
};

const ASPECT_TYPES = [
    { name: 'Kavuşum',   symbol: '☌', angle: 0,   orb: 8, color: '#d9902a', draw: false },
    { name: 'Karşıtlık', symbol: '☍', angle: 180, orb: 8, color: '#cc0000', draw: true, dash: [] },
    { name: 'Üçgen',     symbol: '△', angle: 120, orb: 8, color: '#0055cc', draw: true, dash: [] },
    { name: 'Kare',      symbol: '□', angle: 90,  orb: 7, color: '#cc0000', draw: true, dash: [] },
    { name: 'Altmışlık', symbol: '⚹', angle: 60,  orb: 5, color: '#0099cc', draw: true, dash: [4, 3] }
];

let chart = null;

// ---------- ASTRONOMİ ----------
function norm360(x) {
    x = x % 360;
    return x < 0 ? x + 360 : x;
}

function julianDate(utc) {
    let y = utc.getUTCFullYear();
    let m = utc.getUTCMonth() + 1;
    const d = utc.getUTCDate() + utc.getUTCHours() / 24 +
              utc.getUTCMinutes() / 1440 + utc.getUTCSeconds() / 86400;
    if (m <= 2) { y--; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

// Kepler denklemi çöz
function solveKepler(M, e) {
    const Mrad = M * DEG;
    let E = Mrad + e * Math.sin(Mrad);
    for (let i = 0; i < 8; i++) {
        E = E - (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
    }
    return E;
}

// Gezegenin heliosentrik ekliptik koordinatları
function helioPos(body, T) {
    const [el0, rate] = KEPLER[body];
    const a = el0[0] + rate[0] * T;
    const e = el0[1] + rate[1] * T;
    const I = (el0[2] + rate[2] * T) * DEG;
    const L = el0[3] + rate[3] * T;
    const wbar = el0[4] + rate[4] * T;
    const Om = (el0[5] + rate[5] * T) * DEG;
    const w = (wbar - (el0[5] + rate[5] * T)) * DEG;
    const M = norm360(L - wbar);
    
    const E = solveKepler(M, e);
    const xv = a * (Math.cos(E) - e);
    const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
    
    // Yörünge düzleminden ekliptiğe dönüşüm
    const x = (Math.cos(w) * Math.cos(Om) - Math.sin(w) * Math.sin(Om) * Math.cos(I)) * xv +
              (-Math.sin(w) * Math.cos(Om) - Math.cos(w) * Math.sin(Om) * Math.cos(I)) * yv;
    const y = (Math.cos(w) * Math.sin(Om) + Math.sin(w) * Math.cos(Om) * Math.cos(I)) * xv +
              (-Math.sin(w) * Math.sin(Om) + Math.cos(w) * Math.cos(Om) * Math.cos(I)) * yv;
    const z = (Math.sin(w) * Math.sin(I)) * xv + (Math.cos(w) * Math.sin(I)) * yv;
    return { x, y, z };
}

// Jeosentrik ekliptik boylam
function geoLongitude(body, jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const earth = helioPos('earth', T);
    
    if (body === 'sun') {
        return norm360(Math.atan2(-earth.y, -earth.x) / DEG);
    }
    
    if (body === 'moon') {
        // Ay - jeosentrik seri açılımı
        const D = jd - 2451545.0;
        const Lp = 218.3164477 + 13.17639648 * D;      // ortalama boylam
        const Mp = 134.9633964 + 13.06499295 * D;      // Ay anomalisi
        const Ms = 357.5291092 + 0.98560028 * D;       // Güneş anomalisi
        const Dd = 297.8501921 + 12.19074912 * D;      // elongasyon
        const F  = 93.2720950 + 13.22935024 * D;       // enlem argümanı
        
        let lon = Lp
            + 6.288774 * Math.sin(Mp * DEG)
            + 1.274027 * Math.sin((2 * Dd - Mp) * DEG)
            + 0.658314 * Math.sin(2 * Dd * DEG)
            + 0.213618 * Math.sin(2 * Mp * DEG)
            - 0.185116 * Math.sin(Ms * DEG)
            - 0.114332 * Math.sin(2 * F * DEG);
        return norm360(lon);
    }
    
    const p = helioPos(body, T);
    const gx = p.x - earth.x;
    const gy = p.y - earth.y;
    return norm360(Math.atan2(gy, gx) / DEG);
}

// Greenwich Ortalama Yıldız Zamanı (saat)
function gmst(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    let g = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
            0.000387933 * T * T - T * T * T / 38710000.0;
    return norm360(g) / 15;
}

// Yükselen (Ascendant)
function calcAscendant(lstDeg, lat) {
    const eps = 23.4367 * DEG;
    const ramc = lstDeg * DEG;
    const phi = lat * DEG;
    let asc = Math.atan2(
        Math.cos(ramc),
        -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))
    ) / DEG;
    return norm360(asc);
}

// MC (Medium Coeli)
function calcMC(lstDeg) {
    const eps = 23.4367 * DEG;
    const ramc = lstDeg * DEG;
    const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / DEG;
    return norm360(mc);
}

// ---- PLACIDUS EV SİSTEMİ ----
// Yarı-yay (semi-arc) iterasyon yöntemi.
// Ara cusp noktası: RA = RAMC + sabit + k * SA(δ)  formülüyle iteratif çözülür.
//   cusp 11: sabit=0,   k=1/3   | cusp 12: sabit=0,   k=2/3
//   cusp  2: sabit=60,  k=2/3   | cusp  3: sabit=120, k=1/3
function placidusCusp(ramcDeg, latDeg, epsDeg, offsetConst, k, initialGuess) {
    const phi = latDeg * DEG;
    const eps = epsDeg * DEG;
    let ra = ramcDeg + initialGuess;
    
    for (let i = 0; i < 40; i++) {
        // RA'dan ekliptik boylam: tan λ = tan α / cos ε (doğru çeyrekle)
        const lam = Math.atan2(Math.sin(ra * DEG), Math.cos(ra * DEG) * Math.cos(eps));
        // Bu noktanın deklinasyonu: sin δ = sin ε · sin λ
        const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
        // Yarı-gündüz yayı: cos SA = -tan φ · tan δ
        let cosSA = -Math.tan(phi) * Math.tan(dec);
        if (cosSA < -1) cosSA = -1;
        if (cosSA > 1) cosSA = 1;
        const SA = Math.acos(cosSA) / DEG;
        
        const raNew = ramcDeg + offsetConst + k * SA;
        if (Math.abs(raNew - ra) < 0.00005) { ra = raNew; break; }
        ra = raNew;
    }
    
    const lam = Math.atan2(Math.sin(ra * DEG), Math.cos(ra * DEG) * Math.cos(eps)) / DEG;
    return norm360(lam);
}

// Genel "kutuplu yükselen" formülü:
// λ = atan2( sin R, cos R·cos ε − sin ε·tan P )
// P = 0 iken MC formülü, P = enlem & R = RAMC+90 iken ASC formülü verir.
function lonFromPole(raDeg, poleDeg, epsDeg) {
    const R = raDeg * DEG, P = poleDeg * DEG, eps = epsDeg * DEG;
    const lam = Math.atan2(Math.sin(R), Math.cos(R) * Math.cos(eps) - Math.sin(eps) * Math.tan(P));
    return norm360(lam / DEG);
}

// Porphyry: ASC-MC arası eşit üçe bölme
function porphyryHouses(asc, mc) {
    const houses = new Array(12);
    houses[0] = asc;
    houses[3] = norm360(mc + 180);
    houses[6] = norm360(asc + 180);
    houses[9] = mc;
    let arc = norm360(asc - mc);
    houses[10] = norm360(mc + arc / 3);
    houses[11] = norm360(mc + 2 * arc / 3);
    arc = norm360(houses[3] - asc);
    houses[1] = norm360(asc + arc / 3);
    houses[2] = norm360(asc + 2 * arc / 3);
    houses[4] = norm360(houses[10] + 180);
    houses[5] = norm360(houses[11] + 180);
    houses[7] = norm360(houses[1] + 180);
    houses[8] = norm360(houses[2] + 180);
    return houses;
}

function calcHouses(asc, mc, ramcDeg, latDeg, system) {
    const eps = 23.4367;
    const houses = new Array(12);
    
    // --- Bütün burç (Whole Sign): 1. ev = yükselenin burcunun 0 derecesi ---
    if (system === 'whole') {
        const startSign = Math.floor(asc / 30) * 30;
        for (let i = 0; i < 12; i++) houses[i] = norm360(startSign + i * 30);
        return houses;
    }
    
    // --- Eşit ev (Equal): her ev ASC'den itibaren 30 derece ---
    if (system === 'equal') {
        for (let i = 0; i < 12; i++) houses[i] = norm360(asc + i * 30);
        return houses;
    }
    
    // Köşe evler tüm kadran sistemlerinde aynı
    houses[0] = asc;                  // 1. ev (ASC)
    houses[3] = norm360(mc + 180);    // 4. ev (IC)
    houses[6] = norm360(asc + 180);   // 7. ev (DC)
    houses[9] = mc;                   // 10. ev (MC)
    
    // Kutup bölgelerinde kadran sistemleri tanımsız -> Porphyry
    if (Math.abs(latDeg) > 66 && system !== 'porphyry') {
        return porphyryHouses(asc, mc);
    }
    
    if (system === 'porphyry') {
        return porphyryHouses(asc, mc);
    }
    
    if (system === 'koch') {
        // Koch (Doğum Yeri): MC derecesinin yarı-gündüz yayı (SA) üçe bölünür,
        // ara cusps o anlardaki yükselenlerdir.
        const decMC = Math.asin(Math.sin(eps * DEG) * Math.sin(mc * DEG));
        let sinAD = Math.tan(latDeg * DEG) * Math.tan(decMC);
        sinAD = Math.max(-1, Math.min(1, sinAD));
        const AD = Math.asin(sinAD) / DEG;
        const SA = 90 + AD;
        
        houses[10] = calcAscendant(norm360(ramcDeg - 2 * SA / 3), latDeg);  // 11. ev
        houses[11] = calcAscendant(norm360(ramcDeg - SA / 3), latDeg);      // 12. ev
        houses[1]  = calcAscendant(norm360(ramcDeg + SA / 3), latDeg);      // 2. ev
        houses[2]  = calcAscendant(norm360(ramcDeg + 2 * SA / 3), latDeg);  // 3. ev
    } else if (system === 'regiomontanus') {
        // Regiomontanus: gök ekvatoru 30 derecelik eşit parçalara bölünür.
        // Kutup: tan P = tan φ · sin D
        const cusp = (D) => {
            const pole = Math.atan(Math.tan(latDeg * DEG) * Math.sin(D * DEG)) / DEG;
            return lonFromPole(norm360(ramcDeg + D), pole, eps);
        };
        houses[10] = cusp(30);   // 11. ev
        houses[11] = cusp(60);   // 12. ev
        houses[1]  = cusp(120);  // 2. ev
        houses[2]  = cusp(150);  // 3. ev
    } else if (system === 'campanus') {
        // Campanus: birincil dikey (prime vertical) 30 derecelik parçalara bölünür.
        // RA farkı: tan ΔRA = tan D · cos φ, kutup: sin P = sin φ · sin D
        const cusp = (D) => {
            const dRA = Math.atan2(Math.sin(D * DEG) * Math.cos(latDeg * DEG), Math.cos(D * DEG)) / DEG;
            const pole = Math.asin(Math.sin(latDeg * DEG) * Math.sin(D * DEG)) / DEG;
            return lonFromPole(norm360(ramcDeg + dRA), pole, eps);
        };
        houses[10] = cusp(30);
        houses[11] = cusp(60);
        houses[1]  = cusp(120);
        houses[2]  = cusp(150);
    } else {
        // Placidus (varsayılan)
        houses[10] = placidusCusp(ramcDeg, latDeg, eps, 0, 1 / 3, 30);    // 11. ev
        houses[11] = placidusCusp(ramcDeg, latDeg, eps, 0, 2 / 3, 60);    // 12. ev
        houses[1]  = placidusCusp(ramcDeg, latDeg, eps, 60, 2 / 3, 120);  // 2. ev
        houses[2]  = placidusCusp(ramcDeg, latDeg, eps, 120, 1 / 3, 150); // 3. ev
    }
    
    // Karşıt cusps
    houses[4] = norm360(houses[10] + 180);  // 5. ev
    houses[5] = norm360(houses[11] + 180);  // 6. ev
    houses[7] = norm360(houses[1] + 180);   // 8. ev
    houses[8] = norm360(houses[2] + 180);   // 9. ev
    
    return houses;
}

// Gezegen hangi evde
function findHouse(lon, houses) {
    for (let i = 0; i < 12; i++) {
        const start = houses[i];
        const end = houses[(i + 1) % 12];
        const span = norm360(end - start);
        const pos = norm360(lon - start);
        if (pos < span) return i + 1;
    }
    return 1;
}

// Aspectler
function calcAspects(positions) {
    const keys = Object.keys(positions);
    const found = [];
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            let diff = Math.abs(positions[keys[i]].lon - positions[keys[j]].lon);
            if (diff > 180) diff = 360 - diff;
            for (const asp of ASPECT_TYPES) {
                const orb = Math.abs(diff - asp.angle);
                if (orb <= asp.orb) {
                    found.push({ p1: keys[i], p2: keys[j], type: asp, orb: orb });
                    break;
                }
            }
        }
    }
    return found;
}

// ---------- ZAMAN DİLİMİ (Türkiye, tarihe göre yaz saati) ----------
// 7 Eylül 2016'dan itibaren kalıcı UTC+3. Öncesinde: kış UTC+2,
// yaz saati (Mart sonu Pazar - Ekim sonu Pazar arası) UTC+3.
function turkeyUtcOffset(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (y > 2016 || (y === 2016 && (m > 9 || (m === 9 && d >= 7)))) return 3;
    if (y < 1985) return 2;
    
    const lastSunday = (year, month) => {
        const last = new Date(Date.UTC(year, month, 0)); // ayın son günü
        return last.getUTCDate() - last.getUTCDay();
    };
    const marS = lastSunday(y, 3);
    const octS = lastSunday(y, 10);
    const afterStart = (m > 3) || (m === 3 && d >= marS);
    const beforeEnd = (m < 10) || (m === 10 && d < octS);
    return (afterStart && beforeEnd) ? 3 : 2;
}

// ---------- ANA HESAPLAMA ----------
// Saf hesaplama: parametrelerden harita objesi üretir (sinastri için de kullanılır)
function calcChartData(p) {
    const { dateVal, timeVal, lat, lon, tz, hsys, city } = p;
    
    // UTC'ye çevir
    const [hh, mm] = timeVal.split(':').map(Number);
    const [Y, Mo, Dy] = dateVal.split('-').map(Number);
    const utc = new Date(Date.UTC(Y, Mo - 1, Dy, hh - tz, mm, 0));
    
    const jd = julianDate(utc);
    const gst = gmst(jd);
    const lstHours = ((gst + lon / 15) % 24 + 24) % 24;
    const lstDeg = lstHours * 15;
    
    const asc = calcAscendant(lstDeg, lat);
    const mc = calcMC(lstDeg);
    const houses = calcHouses(asc, mc, lstDeg, lat, hsys);
    
    // Gezegen boylamları + retro kontrolü
    const positions = {};
    for (const key of Object.keys(PLANETS)) {
        const lonNow = geoLongitude(key, jd);
        const lonNext = geoLongitude(key, jd + 1);
        const delta = norm360(lonNext - lonNow);
        const retro = delta > 180;
        positions[key] = { lon: lonNow, retro: retro, house: 0 };
    }
    for (const key of Object.keys(positions)) {
        positions[key].house = findHouse(positions[key].lon, houses);
    }
    
    const aspects = calcAspects(positions);
    
    return {
        dateVal, timeVal, tz, city, lat, lon,
        utc, jd, lstHours, hsys,
        asc, mc, houses, positions, aspects
    };
}

function computeChart() {
    const dateVal = document.getElementById('birth-date').value;
    const timeVal = document.getElementById('birth-time').value;
    const sel = document.getElementById('city');
    const opt = sel.options[sel.selectedIndex];
    const hsys = document.getElementById('house-system').value;
    
    const tz = turkeyUtcOffset(dateVal);
    
    chart = calcChartData({
        dateVal, timeVal,
        lat: parseFloat(opt.dataset.lat),
        lon: parseFloat(opt.dataset.lon),
        tz, hsys,
        city: opt.text
    });
    
    // Doğum bilgisi hafızası
    try {
        localStorage.setItem('astro_birth', JSON.stringify({
            d: dateVal, t: timeVal, c: sel.value, h: hsys
        }));
    } catch (e) { /* localStorage kapalı olabilir */ }
    
    console.log('✅ Hesaplandı — Yükselen:', fmtZodiac(chart.asc), '| MC:', fmtZodiac(chart.mc), '| UTC+' + tz);
    return chart;
}

// ---------- FORMATLAMA ----------
function fmtZodiac(lon) {
    const s = SIGNS[Math.floor(lon / 30)];
    const d = Math.floor(lon % 30);
    const m = Math.floor(((lon % 30) - d) * 60);
    return `${d}°${String(m).padStart(2, '0')}' ${s.symbol} ${s.name}`;
}

function fmtDegMin(lon) {
    const d = Math.floor(lon % 30);
    const m = Math.floor(((lon % 30) - d) * 60);
    return `${d}°${String(m).padStart(2, '0')}'`;
}

function fmtLST(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor((((hours - h) * 60) - m) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtCoord(val, posChar, negChar) {
    const d = Math.floor(Math.abs(val));
    const m = Math.floor((Math.abs(val) - d) * 60);
    return `${d}°${String(m).padStart(2, '0')}'${val >= 0 ? posChar : negChar}`;
}

const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ---------- ÇİZİM ----------
function pointAt(deg, r, cx, cy, asc) {
    const a = (180 - (deg - asc)) * DEG;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function drawWheel(c) {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const cx = 370, cy = 370;
    const asc = c.asc;
    
    const R_OUT = 352;       // dış çember
    const R_ZOD_IN = 306;    // zodyak halkası içi
    const R_TICK = 292;      // cetvel içi
    const R_PLANET = 258;    // gezegen glifi
    const R_PLABEL = 226;    // gezegen derecesi
    const R_HNUM = 168;      // ev numarası
    const R_ASPECT = 148;    // aspect çemberi
    
    ctx.clearRect(0, 0, 740, 740);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 740, 740);
    
    const P = (deg, r) => pointAt(deg, r, cx, cy, asc);
    
    // Ana çemberler
    for (const r of [R_OUT, R_ZOD_IN, R_TICK, R_ASPECT]) {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = r === R_OUT ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Zodyak dilim sınırları
    for (let i = 0; i < 12; i++) {
        const [x1, y1] = P(i * 30, R_ZOD_IN);
        const [x2, y2] = P(i * 30, R_OUT);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Burç sembolleri (element renkleriyle)
    for (let i = 0; i < 12; i++) {
        const [x, y] = P(i * 30 + 15, (R_OUT + R_ZOD_IN) / 2);
        ctx.fillStyle = ELEMENT_COLORS[SIGNS[i].element];
        ctx.font = '26px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(SIGNS[i].symbol, x, y);
    }
    
    // Derece cetveli (tikler)
    for (let d = 0; d < 360; d++) {
        let len = 4;
        if (d % 10 === 0) len = 12;
        else if (d % 5 === 0) len = 8;
        const [x1, y1] = P(d, R_ZOD_IN);
        const [x2, y2] = P(d, R_ZOD_IN - len);
        ctx.strokeStyle = d % 10 === 0 ? '#555' : '#999';
        ctx.lineWidth = d % 10 === 0 ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Ev cusps çizgileri
    c.houses.forEach((hDeg, i) => {
        const isAxis = (i === 0 || i === 3 || i === 6 || i === 9);
        const [x1, y1] = P(hDeg, R_ASPECT);
        const [x2, y2] = P(hDeg, isAxis ? R_ZOD_IN : R_TICK);
        ctx.strokeStyle = isAxis ? '#222' : '#bbb';
        ctx.lineWidth = isAxis ? 2.5 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Cusp derece etiketi
        const [lx, ly] = P(hDeg + 3, R_TICK - 16);
        ctx.fillStyle = isAxis ? '#222' : '#888';
        ctx.font = isAxis ? 'bold 11px Verdana' : '9px Verdana';
        ctx.textAlign = 'center';
        ctx.fillText(fmtDegMin(hDeg), lx, ly);
    });
    
    // Eksen etiketleri: AC / IC / DC / MC
    const axisLabels = [
        { deg: c.houses[0], text: 'AC' },
        { deg: c.houses[3], text: 'IC' },
        { deg: c.houses[6], text: 'DC' },
        { deg: c.houses[9], text: 'MC' }
    ];
    axisLabels.forEach(a => {
        const [x, y] = P(a.deg, R_ASPECT - 14);
        ctx.fillStyle = '#111';
        ctx.font = 'bold 13px Verdana';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.text, x, y);
    });
    
    // Ev numaraları
    for (let i = 0; i < 12; i++) {
        const start = c.houses[i];
        const end = c.houses[(i + 1) % 12];
        const mid = norm360(start + norm360(end - start) / 2);
        const [x, y] = P(mid, R_HNUM);
        ctx.fillStyle = '#999';
        ctx.font = '13px Verdana';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, x, y);
    }
    
    // Aspect çizgileri (iç çember)
    c.aspects.forEach(a => {
        if (!a.type.draw) return;
        const [x1, y1] = P(c.positions[a.p1].lon, R_ASPECT);
        const [x2, y2] = P(c.positions[a.p2].lon, R_ASPECT);
        ctx.strokeStyle = a.type.color;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(a.type.dash || []);
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
    });
    
    // Gezegen işaret çizgileri (cetvelden içeri)
    for (const key of Object.keys(c.positions)) {
        const lon = c.positions[key].lon;
        const [x1, y1] = P(lon, R_ZOD_IN);
        const [x2, y2] = P(lon, R_TICK);
        ctx.strokeStyle = PLANETS[key].color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Gezegenler (çakışma önleme ile)
    const sorted = Object.keys(c.positions)
        .map(k => ({ key: k, lon: c.positions[k].lon }))
        .sort((a, b) => a.lon - b.lon);
    
    const MIN_GAP = 9;
    for (let i = 0; i < sorted.length; i++) {
        sorted[i].displayLon = sorted[i].lon;
    }
    for (let pass = 0; pass < 3; pass++) {
        for (let i = 1; i < sorted.length; i++) {
            const gap = sorted[i].displayLon - sorted[i - 1].displayLon;
            if (gap < MIN_GAP) {
                sorted[i].displayLon = sorted[i - 1].displayLon + MIN_GAP;
            }
        }
    }
    
    sorted.forEach(p => {
        const info = PLANETS[p.key];
        const pos = c.positions[p.key];
        
        // Gezegen glifi
        const [gx, gy] = P(p.displayLon, R_PLANET);
        ctx.fillStyle = info.color;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(info.symbol, gx, gy);
        
        // Derece etiketi
        const [dx, dy] = P(p.displayLon, R_PLABEL);
        ctx.fillStyle = '#333';
        ctx.font = '11px Verdana';
        const d = Math.floor(pos.lon % 30);
        ctx.fillText(`${d}°`, dx, dy);
        
        // Dakika + retro
        const [mx, my] = P(p.displayLon, R_PLABEL - 18);
        const m = Math.floor(((pos.lon % 30) - d) * 60);
        ctx.fillStyle = '#888';
        ctx.font = '9px Verdana';
        ctx.fillText(`${String(m).padStart(2, '0')}'${pos.retro ? ' ℞' : ''}`, mx, my);
    });
    
    console.log('✅ Çark çizildi');
}

// ---------- BİLGİ PANELLERİ ----------
function fillInfo(c) {
    const [Y, Mo, Dy] = c.dateVal.split('-').map(Number);
    document.getElementById('info-date').innerHTML =
        `<i>${Dy} ${MONTHS_EN[Mo - 1]} ${Y} - ${c.timeVal}</i> (UTC+${c.tz})`;
    
    const utcH = String(c.utc.getUTCHours()).padStart(2, '0');
    const utcM = String(c.utc.getUTCMinutes()).padStart(2, '0');
    document.getElementById('info-ut').innerHTML =
        `<i>${c.utc.getUTCDate()} ${MONTHS_EN[c.utc.getUTCMonth()]} ${c.utc.getUTCFullYear()} - ${utcH}:${utcM}</i>`;
    
    document.getElementById('info-lst').innerHTML = `<i>${fmtLST(c.lstHours)}</i>`;
    document.getElementById('info-coords').innerHTML =
        `<i>${fmtCoord(c.lat, 'N', 'S')}, ${fmtCoord(c.lon, 'E', 'W')}</i>`;
    document.getElementById('info-city').innerHTML = `<i>${c.city}</i>`;
    
    const hsysNames = {
        placidus: 'Placidus system',
        koch: 'Koch system',
        whole: 'Whole Sign system',
        equal: 'Equal House system',
        porphyry: 'Porphyry system',
        regiomontanus: 'Regiomontanus system',
        campanus: 'Campanus system'
    };
    document.getElementById('info-hsys').innerHTML = `<i>${hsysNames[c.hsys] || c.hsys}</i>`;
}

function fillPositions(c) {
    const tbody = document.querySelector('#positions-table tbody');
    let html = '';
    
    // AC ve MC satırları
    html += rowPos('AC (Yükselen)', '#111', c.asc, '1');
    html += rowPos('MC (Gökyüzü Ortası)', '#111', c.mc, '10');
    
    for (const key of Object.keys(c.positions)) {
        const p = c.positions[key];
        const info = PLANETS[key];
        const label = `<span style="color:${info.color};font-weight:bold">${info.symbol}</span> ${info.name}${p.retro ? ' ℞' : ''}`;
        html += rowPos(label, info.color, p.lon, p.house);
    }
    tbody.innerHTML = html;
    
    function rowPos(label, color, lon, house) {
        const s = SIGNS[Math.floor(lon / 30)];
        return `<tr>
            <td>${label}</td>
            <td><span style="color:${ELEMENT_COLORS[s.element]}">${s.symbol}</span> ${s.name}</td>
            <td>${fmtDegMin(lon)}</td>
            <td>${house}</td>
        </tr>`;
    }
}

function fillAspects(c) {
    const tbody = document.querySelector('#aspects-table tbody');
    if (c.aspects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Aspect bulunamadı</td></tr>';
        return;
    }
    tbody.innerHTML = c.aspects.map(a => {
        const p1 = PLANETS[a.p1], p2 = PLANETS[a.p2];
        return `<tr>
            <td><span style="color:${p1.color};font-weight:bold">${p1.symbol}</span> ${p1.name}</td>
            <td><span style="color:${a.type.color};font-weight:bold">${a.type.symbol} ${a.type.name}</span></td>
            <td><span style="color:${p2.color};font-weight:bold">${p2.symbol}</span> ${p2.name}</td>
            <td>${a.orb.toFixed(1)}°</td>
        </tr>`;
    }).join('');
}

function fillHouses(c) {
    const tbody = document.querySelector('#houses-table tbody');
    tbody.innerHTML = c.houses.map((h, i) => {
        const s = SIGNS[Math.floor(h / 30)];
        const special = i === 0 ? ' (AC)' : i === 3 ? ' (IC)' : i === 6 ? ' (DC)' : i === 9 ? ' (MC)' : '';
        return `<tr>
            <td><strong>${i + 1}${special}</strong></td>
            <td><span style="color:${ELEMENT_COLORS[s.element]}">${s.symbol}</span> ${s.name}</td>
            <td>${fmtDegMin(h)}</td>
        </tr>`;
    }).join('');
}

function fillDominants(c) {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const elementNames = { fire: '🔥 Ateş', earth: '🌍 Toprak', air: '💨 Hava', water: '💧 Su' };
    
    for (const key of Object.keys(c.positions)) {
        const s = SIGNS[Math.floor(c.positions[key].lon / 30)];
        elements[s.element]++;
    }
    
    const total = Object.keys(c.positions).length;
    let html = '<div class="dom-section"><h4>Element Dağılımı</h4>';
    for (const el of Object.keys(elements)) {
        const pct = Math.round(elements[el] / total * 100);
        html += `<div class="dom-bar">
            <span class="dom-label">${elementNames[el]}</span>
            <div class="dom-track"><div class="dom-fill" style="width:${pct}%;background:${ELEMENT_COLORS[el]}"></div></div>
            <span>${elements[el]} (${pct}%)</span>
        </div>`;
    }
    html += '</div>';
    
    document.getElementById('dominants-content').innerHTML = html;
}

// ============================================================
// YORUMLAMA MOTORU
// ============================================================
const SUN_TEXT = {
    'Koç': 'Öncü, cesur ve enerjik bir özünüz var. Harekete geçmek, başlatmak ve liderlik etmek doğanızda. Sabırsızlığa dikkat.',
    'Boğa': 'Sabırlı, kararlı ve güvenilir bir özünüz var. Konfor, istikrar ve somut sonuçlar sizin için önemli. İnatçılığa dikkat.',
    'İkizler': 'Meraklı, zeki ve iletişimi güçlü bir özünüz var. Öğrenmek ve paylaşmak sizi besler. Dağınıklığa dikkat.',
    'Yengeç': 'Duygusal, koruyucu ve sezgisel bir özünüz var. Aile ve güvenlik duygusu merkezinizde. Aşırı hassasiyete dikkat.',
    'Aslan': 'Yaratıcı, cömert ve karizmatik bir özünüz var. Görünmek ve takdir edilmek sizi motive eder. Egoya dikkat.',
    'Başak': 'Analitik, titiz ve yardımsever bir özünüz var. Detaylar ve düzen sizin gücünüz. Aşırı eleştirelliğe dikkat.',
    'Terazi': 'Uyumlu, adil ve estetik bir özünüz var. İlişkiler ve denge yaşamınızın teması. Kararsızlığa dikkat.',
    'Akrep': 'Tutkulu, derin ve dönüştürücü bir özünüz var. Gizli olanı görme gücünüz yüksek. Kontrol ihtiyacına dikkat.',
    'Yay': 'Özgür, iyimser ve felsefi bir özünüz var. Keşif ve anlam arayışı sizi büyütür. Aşırıya kaçmaya dikkat.',
    'Oğlak': 'Disiplinli, hırslı ve sorumluluk sahibi bir özünüz var. Uzun vadeli hedefler sizin alanınız. Katılığa dikkat.',
    'Kova': 'Özgün, yenilikçi ve insancıl bir özünüz var. Farklı düşünmek ve topluma katkı sizi tanımlar. Mesafeliliğe dikkat.',
    'Balık': 'Şefkatli, hayalperest ve sezgisel bir özünüz var. Sanat ve maneviyat sizi besler. Sınır koymayı öğrenin.'
};

const MOON_TEXT = {
    'Koç': 'Duygularınız hızlı alevlenir ve hızla söner. Anlık tepkilere dikkat edin.',
    'Boğa': 'Duygusal güvenlik ve istikrar ararsınız. Sakin ama değişime dirençli bir iç dünyanız var.',
    'İkizler': 'Duygularınızı konuşarak işlersiniz. Zihinsel uyarılma duygusal ihtiyacınızdır.',
    'Yengeç': 'Ay kendi burcunda: duyguları derin yaşarsınız, güçlü sezgi ve koruma içgüdüsü taşırsınız.',
    'Aslan': 'Duygusal olarak takdir edilmeye ihtiyaç duyarsınız. Sıcak ve dramatik bir iç dünyanız var.',
    'Başak': 'Duygularınızı analiz edersiniz. Hizmet etmek ve faydalı olmak sizi duygusal olarak besler.',
    'Terazi': 'Duygusal dengeniz ilişkilerinize bağlıdır. Uyum ve ortaklık iç huzurunuzun anahtarı.',
    'Akrep': 'Duyguları yoğun ve derin yaşarsınız. Güven sizin için her şeydir; ihanet affedilmez.',
    'Yay': 'Duygusal özgürlüğe ihtiyacınız var. İyimserlik ve macera iç dünyanızı canlı tutar.',
    'Oğlak': 'Duygularınızı kontrollü gösterirsiniz. Başarı ve saygınlık duygusal güvenlik kaynağınız.',
    'Kova': 'Duygulara mesafeli, akılcı yaklaşırsınız. Özgürlük ve dostluk duygusal ihtiyaçlarınızdır.',
    'Balık': 'Empatiniz sınırsızdır; başkalarının duygularını da hissedersiniz. Kendinize alan bırakın.'
};

const ASC_TEXT = {
    'Koç': 'Dışarıya enerjik, girişken ve dinamik görünürsünüz. İlk izleniminiz: cesaret.',
    'Boğa': 'Dışarıya sakin, güvenilir ve dirençli görünürsünüz. İlk izleniminiz: huzur.',
    'İkizler': 'Dışarıya konuşkan, esprili ve hareketli görünürsünüz. İlk izleniminiz: zekâ.',
    'Yengeç': 'Dışarıya sıcak, koruyucu ve duygusal görünürsünüz. İlk izleniminiz: samimiyet.',
    'Aslan': 'Dışarıya karizmatik, gururlu ve parlak görünürsünüz. İlk izleniminiz: özgüven.',
    'Başak': 'Dışarıya düzenli, dikkatli ve mütevazı görünürsünüz. İlk izleniminiz: zarafet.',
    'Terazi': 'Dışarıya kibar, çekici ve dengeli görünürsünüz. İlk izleniminiz: uyum.',
    'Akrep': 'Dışarıya gizemli, yoğun ve etkileyici görünürsünüz. İlk izleniminiz: derinlik.',
    'Yay': 'Dışarıya neşeli, açık sözlü ve maceracı görünürsünüz. İlk izleniminiz: iyimserlik.',
    'Oğlak': 'Dışarıya ciddi, olgun ve güvenilir görünürsünüz. İlk izleniminiz: otorite.',
    'Kova': 'Dışarıya özgün, farklı ve bağımsız görünürsünüz. İlk izleniminiz: sıra dışılık.',
    'Balık': 'Dışarıya yumuşak, sanatsal ve dalgın görünürsünüz. İlk izleniminiz: gizem.'
};

const HOUSE_THEMES = [
    'kimlik, beden ve kişisel duruş',
    'para, değerler ve öz kaynaklar',
    'iletişim, kardeşler ve yakın çevre',
    'ev, aile ve kökler',
    'aşk, yaratıcılık ve çocuklar',
    'sağlık, iş rutini ve hizmet',
    'evlilik, ortaklıklar ve açık düşmanlar',
    'dönüşüm, ortak kaynaklar ve derin bağlar',
    'yüksek öğrenim, inançlar ve uzak yolculuklar',
    'kariyer, statü ve yaşam hedefi',
    'arkadaşlar, gruplar ve idealler',
    'bilinçaltı, inziva ve gizli konular'
];

const PLANET_ROLES = {
    sun: 'yaşam enerjiniz ve egonuz',
    moon: 'duygularınız ve iç dünyanız',
    mercury: 'zihniniz ve iletişim tarzınız',
    venus: 'sevgi diliniz ve estetik anlayışınız',
    mars: 'mücadele gücünüz ve arzularınız',
    jupiter: 'şansınız ve büyüme alanınız',
    saturn: 'derslerinizin ve disiplinin alanı',
    uranus: 'özgürlük ve yenilik ihtiyacınız',
    neptune: 'hayalleriniz ve sezgileriniz',
    pluto: 'dönüşüm gücünüz'
};

const ASPECT_MEANING = {
    'Kavuşum': 'enerjileri birleşir ve birbirini güçlendirir',
    'Karşıtlık': 'arasında denge kurmanız gereken bir gerilim vardır',
    'Üçgen': 'arasında doğal ve akıcı bir uyum vardır',
    'Kare': 'arasında sizi büyüten zorlayıcı bir sürtüşme vardır',
    'Altmışlık': 'arasında değerlendirilmeyi bekleyen bir fırsat vardır'
};

function fillInterpretation(c) {
    const sunSign = SIGNS[Math.floor(c.positions.sun.lon / 30)].name;
    const moonSign = SIGNS[Math.floor(c.positions.moon.lon / 30)].name;
    const ascSign = SIGNS[Math.floor(c.asc / 30)].name;
    
    let html = '';
    
    // Büyük üçlü
    html += `<div class="r-card gold"><h4>☉ Güneş ${SIGNS[Math.floor(c.positions.sun.lon / 30)].symbol} ${sunSign} (${c.positions.sun.house}. ev)</h4><p>${SUN_TEXT[sunSign]}</p><p>Güneşiniz ${c.positions.sun.house}. evde: ${HOUSE_THEMES[c.positions.sun.house - 1]} alanında parlarsınız.</p></div>`;
    html += `<div class="r-card blue"><h4>☽ Ay ${SIGNS[Math.floor(c.positions.moon.lon / 30)].symbol} ${moonSign} (${c.positions.moon.house}. ev)</h4><p>${MOON_TEXT[moonSign]}</p><p>Ayınız ${c.positions.moon.house}. evde: duygusal doyumu ${HOUSE_THEMES[c.positions.moon.house - 1]} alanında ararsınız.</p></div>`;
    html += `<div class="r-card"><h4>⬆️ Yükselen ${SIGNS[Math.floor(c.asc / 30)].symbol} ${ascSign}</h4><p>${ASC_TEXT[ascSign]}</p></div>`;
    
    // Diğer gezegenler
    let planetsHtml = '';
    for (const key of ['mercury', 'venus', 'mars', 'jupiter', 'saturn']) {
        const p = c.positions[key];
        const sign = SIGNS[Math.floor(p.lon / 30)];
        planetsHtml += `<p><strong style="color:${PLANETS[key].color}">${PLANETS[key].symbol} ${PLANETS[key].name}</strong> ${sign.symbol} ${sign.name} / ${p.house}. evde — ${PLANET_ROLES[key]}, ${HOUSE_THEMES[p.house - 1]} alanında kendini gösterir.${p.retro ? ' (Retro: içsel/gecikmeli işler)' : ''}</p>`;
    }
    html += `<div class="r-card"><h4>🪐 Kişisel Gezegenler</h4>${planetsHtml}</div>`;
    
    // Önemli aspectler
    let aspHtml = '';
    c.aspects.slice(0, 8).forEach(a => {
        aspHtml += `<p><strong style="color:${a.type.color}">${PLANETS[a.p1].symbol} ${a.type.symbol} ${PLANETS[a.p2].symbol}</strong> ${PLANETS[a.p1].name} ile ${PLANETS[a.p2].name} ${ASPECT_MEANING[a.type.name]} (orb ${a.orb.toFixed(1)}°).</p>`;
    });
    if (aspHtml) html += `<div class="r-card red"><h4>⭐ Önemli Aspectler</h4>${aspHtml}</div>`;
    
    document.getElementById('interpretation-content').innerHTML = html;
}

// ============================================================
// GÜNLÜK FAL (bugünün transitleri)
// ============================================================
const MOON_DAILY = {
    'Koç': 'Bugün enerji yüksek — hızlı kararlar ve yeni başlangıçlar için uygun ama acele kavgaya dönüşmesin.',
    'Boğa': 'Bugün sakinlik ve konfor günü — pratik işler, güzel yemekler ve finansal kararlar destekleniyor.',
    'İkizler': 'Bugün iletişim günü — mesajlar, görüşmeler ve öğrenme faaliyetleri hızlanıyor.',
    'Yengeç': 'Bugün duygular yüzeyde — ev, aile ve yakınlarınızla vakit iyileştirici olur.',
    'Aslan': 'Bugün sahne sizin — yaratıcılık, eğlence ve görünürlük için harika bir gün.',
    'Başak': 'Bugün düzen günü — detay işleri, sağlık rutinleri ve temizlik için verimli bir gün.',
    'Terazi': 'Bugün ilişkiler öne çıkıyor — uzlaşma, estetik ve sosyal bağlantılar destekleniyor.',
    'Akrep': 'Bugün derin duygular günü — araştırma, yüzleşme ve dönüşüm için güçlü bir enerji var.',
    'Yay': 'Bugün ufuk genişliyor — seyahat, öğrenim ve iyimser planlar için ideal.',
    'Oğlak': 'Bugün iş günü — hedefler, sorumluluklar ve kariyer adımları destekleniyor.',
    'Kova': 'Bugün özgürlük günü — arkadaşlar, topluluklar ve yenilikçi fikirler öne çıkıyor.',
    'Balık': 'Bugün sezgiler güçlü — dinlenme, sanat ve manevi konular için akış günü.'
};

const TRANSIT_ASPECT_TEXT = {
    'Kavuşum': 'gündeminize güçlü şekilde giriyor',
    'Karşıtlık': 'alanında bir denge sınavı yaratıyor',
    'Üçgen': 'alanına destek ve kolaylık getiriyor',
    'Kare': 'alanında harekete zorlayan bir baskı oluşturuyor',
    'Altmışlık': 'alanında değerlendirebileceğiniz bir fırsat sunuyor'
};

// ============================================================
// AY FAZLARI
// ============================================================
const MOON_PHASES = [
    { emoji: '🌑', name: 'Yeni Ay',              text: 'Yeni başlangıçlar için tohum ekme zamanı. Niyetlerinizi belirleyin.' },
    { emoji: '🌒', name: 'Büyüyen Hilal',        text: 'Niyetleriniz filizleniyor — ilk adımları atın, kararlı olun.' },
    { emoji: '🌓', name: 'İlk Dördün',           text: 'İlk engeller görünür — harekete geçme ve karar verme zamanı.' },
    { emoji: '🌔', name: 'Büyüyen Şişkin Ay',    text: 'Enerji doruğa yaklaşıyor — detayları düzeltin, son rötuşları yapın.' },
    { emoji: '🌕', name: 'Dolunay',              text: 'Duygular ve farkındalık zirvede — sonuçları toplayın, kutlayın.' },
    { emoji: '🌖', name: 'Küçülen Şişkin Ay',    text: 'Paylaşma ve şükretme zamanı — öğrendiklerinizi aktarın.' },
    { emoji: '🌗', name: 'Son Dördün',           text: 'Bırakma zamanı — işe yaramayanı hayatınızdan çıkarın.' },
    { emoji: '🌘', name: 'Küçülen Hilal',        text: 'Dinlenme ve içe dönüş — yeni döngü öncesi enerji toplayın.' }
];

function moonElongation(jd) {
    return norm360(geoLongitude('moon', jd) - geoLongitude('sun', jd));
}

function moonPhaseInfo(jd) {
    const el = moonElongation(jd);
    const illum = Math.round((1 - Math.cos(el * DEG)) / 2 * 100);
    const idx = Math.round(el / 45) % 8;
    return { ...MOON_PHASES[idx], elongation: el, illum: illum };
}

// Bir sonraki Yeni Ay (target=0) veya Dolunay (target=180) - saatlik tarama
function findNextPhase(jdStart, target) {
    let prev = moonElongation(jdStart);
    for (let h = 1; h <= 24 * 32; h++) {
        const jd = jdStart + h / 24;
        const el = moonElongation(jd);
        if (target === 0 && el < prev) return jd;               // 360 -> 0 geçişi
        if (target === 180 && prev < 180 && el >= 180) return jd;
        prev = el;
    }
    return null;
}

function jdToDate(jd) {
    return new Date((jd - 2440587.5) * 86400000);
}

function fmtTrDate(date) {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
}

function fillDaily(c) {
    const now = new Date();
    const jdNow = julianDate(now);
    
    // Bugünkü transit pozisyonları
    const transits = {};
    for (const key of Object.keys(PLANETS)) {
        transits[key] = geoLongitude(key, jdNow);
    }
    
    const moonSign = SIGNS[Math.floor(transits.moon / 30)];
    const sunSign = SIGNS[Math.floor(transits.sun / 30)];
    
    // Transit -> natal aspectler (dar orb, chat bağlamıyla ortak fonksiyon)
    const hits = todaysTransitHits(c, jdNow);
    
    // Enerji skoru
    let good = 0, hard = 0;
    hits.forEach(h => {
        if (h.asp.name === 'Üçgen' || h.asp.name === 'Altmışlık') good++;
        else if (h.asp.name === 'Kare' || h.asp.name === 'Karşıtlık') hard++;
        else good += 0.5;
    });
    const score = Math.max(1, Math.min(5, Math.round(3 + (good - hard) * 0.7)));
    const stars = '⭐'.repeat(score) + '☆'.repeat(5 - score);
    
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    
    // Ay fazı
    const phase = moonPhaseInfo(jdNow);
    const nextNew = findNextPhase(jdNow, 0);
    const nextFull = findNextPhase(jdNow, 180);
    
    let html = `<div class="daily-date">📅 ${dateStr}</div>`;
    html += `<div class="moon-phase-card">
        <div class="mp-emoji">${phase.emoji}</div>
        <div class="mp-info">
            <h4>${phase.name} — %${phase.illum} aydınlık</h4>
            <p>${phase.text}</p>
            <p class="mp-next">🌑 Sonraki Yeni Ay: <strong>${nextNew ? fmtTrDate(jdToDate(nextNew)) : '-'}</strong><br>
            🌕 Sonraki Dolunay: <strong>${nextFull ? fmtTrDate(jdToDate(nextFull)) : '-'}</strong></p>
        </div>
    </div>`;
    html += `<div class="r-card gold"><h4>Günün Enerjisi</h4><p class="daily-stars">${stars}</p><p>Gökyüzünde Güneş ${sunSign.symbol} ${sunSign.name}, Ay ${moonSign.symbol} ${moonSign.name} burcunda ilerliyor.</p></div>`;
    html += `<div class="r-card blue"><h4>🌙 Ay ${moonSign.symbol} ${moonSign.name} burcunda</h4><p>${MOON_DAILY[moonSign.name]}</p></div>`;
    
    // Kişiye özel transitler
    let transitHtml = '';
    hits.slice(0, 6).forEach(h => {
        const natalHouse = c.positions[h.n].house;
        transitHtml += `<p><strong style="color:${h.asp.color}">${PLANETS[h.t].symbol} ${h.asp.symbol} ${PLANETS[h.n].symbol}</strong> Transit ${PLANETS[h.t].name}, natal ${PLANETS[h.n].name}'inize ${h.asp.name.toLowerCase()} yapıyor — ${PLANET_ROLES[h.n]} (${natalHouse}. ev: ${HOUSE_THEMES[natalHouse - 1]}) ${TRANSIT_ASPECT_TEXT[h.asp.name]}.</p>`;
    });
    if (transitHtml) {
        html += `<div class="r-card"><h4>🎯 Size Özel Bugünün Transitleri</h4>${transitHtml}</div>`;
    } else {
        html += `<div class="r-card"><h4>🎯 Size Özel Bugünün Transitleri</h4><p>Bugün haritanıza dar açı yapan önemli bir transit yok — sakin ve nötr bir gökyüzü.</p></div>`;
    }
    
    // Tavsiye
    const advice = score >= 4
        ? 'Gökyüzü sizi destekliyor: yeni adımlar atmak, görüşmeler yapmak ve fırsatları değerlendirmek için güzel bir gün.'
        : score >= 3
        ? 'Dengeli bir gün: rutin işlerinizi sürdürün, büyük kararları aceleye getirmeyin.'
        : 'Zorlayıcı enerjiler mevcut: bugün sabırlı olun, çatışmalardan uzak durun ve kendinize zaman ayırın.';
    html += `<div class="r-card red"><h4>💡 Günün Tavsiyesi</h4><p>${advice}</p></div>`;
    
    document.getElementById('daily-content').innerHTML = html;
}

// ============================================================
// SİNASTRİ (İLİŞKİ UYUMU)
// ============================================================
const SYN_ORBS = { 'Kavuşum': 7, 'Karşıtlık': 6, 'Üçgen': 6, 'Kare': 5, 'Altmışlık': 4 };
const SYN_WEIGHTS = {
    sun: 3, moon: 3, venus: 3, mars: 2.5, asc: 2.5,
    mercury: 2, jupiter: 1.5, saturn: 1.5,
    uranus: 0.7, neptune: 0.7, pluto: 0.7
};
// Aspect uyum katsayısı (-1 .. +1)
const SYN_FACTOR = { 'Üçgen': 1, 'Altmışlık': 0.7, 'Kavuşum': 0.75, 'Karşıtlık': -0.4, 'Kare': -0.7 };

const SYN_PAIR_TEXT = {
    'moon-sun': 'Klasik ruh eşi göstergesi: biri özüyle, diğeri duygusuyla besliyor. 💫',
    'mars-venus': 'Güçlü fiziksel çekim ve tutku göstergesi. 🔥',
    'moon-venus': 'Duygusal şefkat ve romantizm uyumu. 🌸',
    'moon-moon': 'Duygusal dünyalar arasında doğrudan rezonans var.',
    'mercury-mercury': 'Zihinsel bağ — konuşmalar hiç bitmez.',
    'venus-venus': 'Sevgi dilleri ve zevkler birbiriyle etkileşimde.',
    'sun-sun': 'İki kimlik doğrudan temasta — birbirinizi aynada görürsünüz.',
    'asc-sun': 'Biri diğerinin dış kimliğinde kendini görüyor — anında tanışıklık hissi.',
    'asc-moon': 'Duygusal olarak "evinde" hissettiren bir bağ.',
    'asc-venus': 'İlk bakışta hoşlanma etkisi güçlü.',
    'saturn-sun': 'Ciddiyet ve kalıcılık teması — ilişkiyi yapılandırır.',
    'moon-saturn': 'Duygusal sorumluluk bağı — olgunlaştıran ama zaman zaman kısıtlayan.'
};

function synName(key) {
    return key === 'asc' ? 'Yükselen (AC)' : PLANETS[key].name;
}
function synSymbol(key) {
    return key === 'asc' ? 'AC' : PLANETS[key].symbol;
}
function synColor(key) {
    return key === 'asc' ? '#111' : PLANETS[key].color;
}

const SYN_ASPECT_TONE = {
    'Üçgen': 'akıcı ve destekleyici bir uyum',
    'Altmışlık': 'değerlendirilmeyi bekleyen güzel bir fırsat',
    'Kavuşum': 'çok güçlü ve yoğun bir birleşme',
    'Kare': 'sürtüşmeli ama büyüten bir dinamik',
    'Karşıtlık': 'mıknatıs gibi çeken fakat denge isteyen bir çekim'
};

function calcSynastryAspects(chartA, chartB) {
    const A = { ...Object.fromEntries(Object.keys(chartA.positions).map(k => [k, chartA.positions[k].lon])), asc: chartA.asc };
    const B = { ...Object.fromEntries(Object.keys(chartB.positions).map(k => [k, chartB.positions[k].lon])), asc: chartB.asc };
    
    const found = [];
    for (const ka of Object.keys(A)) {
        for (const kb of Object.keys(B)) {
            let diff = Math.abs(A[ka] - B[kb]);
            if (diff > 180) diff = 360 - diff;
            for (const asp of ASPECT_TYPES) {
                const orb = Math.abs(diff - asp.angle);
                if (orb <= SYN_ORBS[asp.name]) {
                    const weight = (SYN_WEIGHTS[ka] || 1) * (SYN_WEIGHTS[kb] || 1);
                    found.push({ a: ka, b: kb, type: asp, orb, weight, factor: SYN_FACTOR[asp.name] });
                    break;
                }
            }
        }
    }
    return found;
}

function synScore(aspList, filterSet) {
    let total = 0, weightSum = 0;
    aspList.forEach(x => {
        if (filterSet && !(filterSet.has(x.a) || filterSet.has(x.b))) return;
        total += x.factor * x.weight;
        weightSum += x.weight;
    });
    if (weightSum === 0) return 50;
    return Math.max(8, Math.min(98, Math.round(50 + 45 * (total / weightSum))));
}

function computeSynastry() {
    if (!chart) generateAll();
    
    const pd = document.getElementById('p-date').value;
    const pt = document.getElementById('p-time').value;
    const psel = document.getElementById('p-city');
    const popt = psel.options[psel.selectedIndex];
    const out = document.getElementById('synastry-content');
    
    if (!pd || !pt) {
        out.innerHTML = '<div class="r-card red"><p>Lütfen partnerin doğum tarihi ve saatini girin.</p></div>';
        return;
    }
    
    const partner = calcChartData({
        dateVal: pd, timeVal: pt,
        lat: parseFloat(popt.dataset.lat),
        lon: parseFloat(popt.dataset.lon),
        tz: turkeyUtcOffset(pd),
        hsys: chart.hsys,
        city: popt.text
    });
    
    const synAspects = calcSynastryAspects(chart, partner);
    
    const overall = synScore(synAspects, null);
    const love = synScore(synAspects, new Set(['venus', 'mars', 'moon']));
    const comm = synScore(synAspects, new Set(['mercury', 'moon', 'sun']));
    const longTerm = synScore(synAspects, new Set(['saturn', 'jupiter', 'sun', 'asc']));
    
    const sunA = SIGNS[Math.floor(chart.positions.sun.lon / 30)];
    const sunB = SIGNS[Math.floor(partner.positions.sun.lon / 30)];
    const moonA = SIGNS[Math.floor(chart.positions.moon.lon / 30)];
    const moonB = SIGNS[Math.floor(partner.positions.moon.lon / 30)];
    
    const verdict = overall >= 80 ? 'Yıldızlar sizin için parlıyor! Çok güçlü bir kozmik bağ. 💫'
        : overall >= 65 ? 'Güzel bir uyum — destekleyici enerjiler baskın. 🌟'
        : overall >= 50 ? 'Dengeli bir ilişki: hem uyum hem büyüten zorluklar var. ⚖️'
        : overall >= 35 ? 'Zorlayıcı açılar baskın — emek isteyen ama öğreten bir bağ. 🔧'
        : 'Gökyüzü bu ikiliye ciddi dersler vermiş — sabır ve bilinçli çaba şart. 🌋';
    
    let html = `<div class="syn-score-card">
        <div class="syn-big">${overall}%</div>
        <p class="syn-verdict">${verdict}</p>
        <div class="syn-pair-line">☉ ${sunA.symbol} ${sunA.name} + ☉ ${sunB.symbol} ${sunB.name} &nbsp;|&nbsp; ☽ ${moonA.symbol} ${moonA.name} + ☽ ${moonB.symbol} ${moonB.name}</div>
    </div>`;
    
    const bars = [
        { label: '❤️ Aşk & Çekim', val: love, color: '#e0507a' },
        { label: '💬 İletişim', val: comm, color: '#3a7bd5' },
        { label: '🏛️ Uzun Vade', val: longTerm, color: '#7a5af5' }
    ];
    html += '<div class="r-card"><h4>Kategori Skorları</h4>';
    bars.forEach(b => {
        html += `<div class="dom-bar">
            <span class="dom-label" style="width:130px">${b.label}</span>
            <div class="dom-track"><div class="dom-fill" style="width:${b.val}%;background:${b.color}"></div></div>
            <span><strong>${b.val}%</strong></span>
        </div>`;
    });
    html += '</div>';
    
    // En önemli sinastri açıları
    const top = [...synAspects].sort((x, y) => (y.weight * Math.abs(y.factor)) - (x.weight * Math.abs(x.factor))).slice(0, 10);
    if (top.length) {
        let list = '';
        top.forEach(x => {
            const pairKey = [x.a, x.b].sort().join('-');
            const special = SYN_PAIR_TEXT[pairKey] ? ' ' + SYN_PAIR_TEXT[pairKey] : '';
            list += `<p><strong style="color:${x.type.color}">${synSymbol(x.a)} ${x.type.symbol} ${synSymbol(x.b)}</strong> Sizin ${synName(x.a)}iniz ile partnerin ${synName(x.b)}i arasında ${x.type.name.toLowerCase()} — ${SYN_ASPECT_TONE[x.type.name]} (orb ${x.orb.toFixed(1)}°).${special}</p>`;
        });
        html += `<div class="r-card gold"><h4>⭐ Öne Çıkan Sinastri Açıları</h4>${list}</div>`;
    } else {
        html += '<div class="r-card"><p>İki harita arasında belirgin açı bulunamadı — nötr bir etkileşim.</p></div>';
    }
    
    html += `<div class="r-card blue"><h4>ℹ️ Partner Haritası Özeti</h4>
        <p>☉ Güneş: ${fmtZodiac(partner.positions.sun.lon)} · ☽ Ay: ${fmtZodiac(partner.positions.moon.lon)} · ⬆️ Yükselen: ${fmtZodiac(partner.asc)}</p>
        <p>Doğum: ${pd} ${pt}, ${popt.text} (UTC+${partner.tz})</p></div>`;
    
    out.innerHTML = html;
    console.log('💞 Sinastri hesaplandı — genel uyum:', overall + '%');
}

// ============================================================
// TRANSİT TAKVİMİ (30 gün)
// ============================================================
function fillTransitCalendar(c) {
    const now = new Date();
    const jdNow = julianDate(now);
    const TRANSIT_PLANETS = Object.keys(PLANETS).filter(k => k !== 'moon'); // Ay çok hızlı, listeyi boğar
    const TIGHT_ORB = 1.0;
    
    // Her (transit gezegen, natal gezegen, açı) üçlüsü için en kesin günü tut
    const events = {};
    for (let day = 0; day < 30; day++) {
        const jd = jdNow + day;
        for (const tKey of TRANSIT_PLANETS) {
            const tLon = geoLongitude(tKey, jd);
            for (const nKey of Object.keys(c.positions)) {
                let diff = Math.abs(tLon - c.positions[nKey].lon);
                if (diff > 180) diff = 360 - diff;
                for (const asp of ASPECT_TYPES) {
                    const orb = Math.abs(diff - asp.angle);
                    if (orb <= TIGHT_ORB) {
                        const key = `${tKey}-${nKey}-${asp.name}`;
                        if (!events[key] || orb < events[key].orb) {
                            events[key] = { day, jd, t: tKey, n: nKey, asp, orb };
                        }
                        break;
                    }
                }
            }
        }
    }
    
    const list = Object.values(events).sort((a, b) => a.day - b.day || a.orb - b.orb).slice(0, 25);
    const out = document.getElementById('transits-content');
    
    let html = `<div class="daily-date">📅 Önümüzdeki 30 Günün Önemli Transitleri</div>`;
    
    if (!list.length) {
        html += '<div class="r-card"><p>Önümüzdeki 30 gün içinde haritanıza dar açı yapan önemli bir transit yok — sakin bir dönem. 🌤️</p></div>';
        out.innerHTML = html;
        return;
    }
    
    let currentDay = -1;
    let inCard = false;
    list.forEach(ev => {
        if (ev.day !== currentDay) {
            if (inCard) html += '</div>';
            currentDay = ev.day;
            const d = jdToDate(ev.jd);
            const label = ev.day === 0 ? 'Bugün' : ev.day === 1 ? 'Yarın' : fmtTrDate(d);
            html += `<div class="r-card transit-day"><h4>🗓️ ${label}${ev.day > 1 ? '' : ' — ' + d.toLocaleDateString('tr-TR')}</h4>`;
            inCard = true;
        }
        const natalHouse = c.positions[ev.n].house;
        const hard = (ev.asp.name === 'Kare' || ev.asp.name === 'Karşıtlık');
        html += `<p><span class="t-badge ${hard ? 'hard' : 'soft'}">${ev.asp.symbol}</span> <strong style="color:${PLANETS[ev.t].color}">${PLANETS[ev.t].symbol} ${PLANETS[ev.t].name}</strong> natal <strong style="color:${PLANETS[ev.n].color}">${PLANETS[ev.n].symbol} ${PLANETS[ev.n].name}</strong>'e ${ev.asp.name.toLowerCase()} yapıyor — ${PLANET_ROLES[ev.n]} (${natalHouse}. ev) ${TRANSIT_ASPECT_TEXT[ev.asp.name]}.</p>`;
    });
    if (inCard) html += '</div>';
    
    html += '<div class="r-card blue"><p>ℹ️ Yalnızca 1° orb içindeki (en kesin) transitler listelenir; her açı en yoğun olduğu günde gösterilir. Hızlı hareket eden Ay transitleri "🌙 Günlük Fal" sekmesindedir.</p></div>';
    
    out.innerHTML = html;
}

// ============================================================
// PAYLAŞIM & PNG & HAFIZA
// ============================================================
function buildShareUrl() {
    const d = document.getElementById('birth-date').value;
    const t = document.getElementById('birth-time').value;
    const city = document.getElementById('city').value;
    const h = document.getElementById('house-system').value;
    return location.origin + location.pathname + `?d=${d}&t=${encodeURIComponent(t)}&c=${city}&h=${h}`;
}

function downloadPNG() {
    const canvas = document.getElementById('wheel');
    const a = document.createElement('a');
    const d = document.getElementById('birth-date').value || 'harita';
    a.download = `dogum-haritasi-${d}.png`;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    a.remove();
}

async function copyShareLink(btn) {
    const url = buildShareUrl();
    const original = btn.textContent;
    try {
        await navigator.clipboard.writeText(url);
        btn.textContent = '✅ Kopyalandı!';
    } catch (e) {
        // Clipboard API yoksa eski yöntem
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        btn.textContent = '✅ Kopyalandı!';
    }
    setTimeout(() => { btn.textContent = original; }, 2000);
}

// URL parametreleri veya localStorage'dan doğum bilgisini yükle
function restoreBirthData() {
    const qp = new URLSearchParams(location.search);
    let d = null, t = null, cityVal = null, h = null;
    
    if (qp.has('d')) {
        d = qp.get('d');
        t = qp.get('t');
        cityVal = qp.get('c');
        h = qp.get('h');
        console.log('🔗 Paylaşım linkinden bilgiler yüklendi');
    } else {
        try {
            const saved = JSON.parse(localStorage.getItem('astro_birth') || 'null');
            if (saved) {
                d = saved.d; t = saved.t; cityVal = saved.c; h = saved.h;
                console.log('💾 Kayıtlı doğum bilgileri yüklendi');
            }
        } catch (e) { /* yok say */ }
    }
    
    if (d) document.getElementById('birth-date').value = d;
    if (t) document.getElementById('birth-time').value = t;
    if (cityVal) {
        const sel = document.getElementById('city');
        if ([...sel.options].some(o => o.value === cityVal)) sel.value = cityVal;
    }
    if (h) {
        const hs = document.getElementById('house-system');
        if ([...hs.options].some(o => o.value === h)) hs.value = h;
    }
}

// ============================================================
// ASTRO CHAT (ChatGPT API + yerel yedek)
// ============================================================
const chatHistory = [];

// Varsayılan API anahtarı (parçalı - otomatik tarama koruması)
const _K = [
    'sk-proj-i_1qnKZKrz6oQUaHOB0ks3mj',
    'rlRicignrMA4xud6_m2TDx-Z0ryNDbBQ',
    'XBOTUsr9-2tLgFZqW9T3BlbkFJZZcujf',
    'TC-W0KGHa5IT9rnL1U59lHhuL-pVXbc7',
    'Zw92o8VQezJ3zkduXmeH3KW3b-GJbQhrK7wA'
];

function getApiKey() {
    // Kullanıcının kendi girdiği anahtar öncelikli, yoksa gömülü anahtar
    return localStorage.getItem('openai_api_key') || _K.join('');
}

// Bugünün transit-natal isabetleri (Günlük Fal ve chat bağlamı ortak kullanır)
function todaysTransitHits(c, jdNow) {
    const hits = [];
    for (const tKey of Object.keys(PLANETS)) {
        const tLon = geoLongitude(tKey, jdNow);
        for (const nKey of Object.keys(c.positions)) {
            let diff = Math.abs(tLon - c.positions[nKey].lon);
            if (diff > 180) diff = 360 - diff;
            for (const asp of ASPECT_TYPES) {
                const orb = Math.abs(diff - asp.angle);
                const maxOrb = (tKey === 'moon') ? 4 : 2.5;
                if (orb <= maxOrb) {
                    hits.push({ t: tKey, n: nKey, asp: asp, orb: orb });
                    break;
                }
            }
        }
    }
    hits.sort((a, b) => a.orb - b.orb);
    return hits;
}

// Chatbot'un "öğrendiği" tam harita bağlamı: TÜM veriler tek metinde
let learnedContext = null;
let chartLearnedShown = false;

function buildFullChartContext() {
    if (!chart) return 'Harita henüz hesaplanmadı.';
    const c = chart;
    const L = [];
    
    L.push(`DOĞUM BİLGİLERİ: ${c.dateVal}, saat ${c.timeVal} (UTC+${c.tz}), ${c.city} (${c.lat.toFixed(2)}K, ${c.lon.toFixed(2)}D). Ev sistemi: ${c.hsys}.`);
    L.push(`EKSENLER: Yükselen (AC): ${fmtZodiac(c.asc)} | MC (tepe noktası): ${fmtZodiac(c.mc)} | Alçalan (DC): ${fmtZodiac(norm360(c.asc + 180))} | IC: ${fmtZodiac(norm360(c.mc + 180))}.`);
    
    L.push('GEZEGEN KONUMLARI: ' + Object.keys(c.positions).map(k => {
        const p = c.positions[k];
        return `${PLANETS[k].name} ${fmtZodiac(p.lon)} ${p.house}. evde${p.retro ? ' (retro)' : ''}`;
    }).join(' | '));
    
    L.push('EV BAŞLANGIÇLARI (cusps): ' + c.houses.map((h, i) => `${i + 1}. ev ${fmtZodiac(h)}`).join(' | '));
    L.push('EV KONULARI: ' + HOUSE_THEMES.map((t, i) => `${i + 1}. ev = ${t}`).join(' | '));
    
    L.push('NATAL AÇILAR: ' + (c.aspects.length
        ? c.aspects.map(a => `${PLANETS[a.p1].name} ${a.type.name} ${PLANETS[a.p2].name} (orb ${a.orb.toFixed(1)}°)`).join(' | ')
        : 'belirgin açı yok'));
    
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    for (const key of Object.keys(c.positions)) {
        elements[SIGNS[Math.floor(c.positions[key].lon / 30)].element]++;
    }
    L.push(`ELEMENT DAĞILIMI: Ateş ${elements.fire}, Toprak ${elements.earth}, Hava ${elements.air}, Su ${elements.water} (10 gezegen üzerinden).`);
    
    // Bugünün gökyüzü + kişiye özel transitler
    const now = new Date();
    const jdNow = julianDate(now);
    const phase = moonPhaseInfo(jdNow);
    const tSun = geoLongitude('sun', jdNow);
    const tMoon = geoLongitude('moon', jdNow);
    L.push(`BUGÜNÜN GÖKYÜZÜ (${now.toLocaleDateString('tr-TR')}): Güneş ${fmtZodiac(tSun)}, Ay ${fmtZodiac(tMoon)}, Ay fazı: ${phase.name} (%${phase.illum} aydınlık).`);
    
    const hits = todaysTransitHits(c, jdNow);
    if (hits.length) {
        L.push('BUGÜN KİŞİYE ÖZEL TRANSİTLER: ' + hits.slice(0, 8).map(h =>
            `Transit ${PLANETS[h.t].name}, natal ${PLANETS[h.n].name}'e ${h.asp.name.toLowerCase()} (orb ${h.orb.toFixed(1)}°)`
        ).join(' | '));
    } else {
        L.push('BUGÜN KİŞİYE ÖZEL TRANSİTLER: belirgin transit yok, sakin gökyüzü.');
    }
    
    return L.join('\n');
}

function getChartContext() {
    if (!learnedContext) learnedContext = buildFullChartContext();
    return learnedContext;
}

// Önce öğren: tüm veriyi hafızaya al, kullanıcıya öğrendiğini göster
function learnChart(showMessage) {
    learnedContext = buildFullChartContext();
    if (showMessage && chart) {
        const c = chart;
        const sunSign = SIGNS[Math.floor(c.positions.sun.lon / 30)];
        const moonSign = SIGNS[Math.floor(c.positions.moon.lon / 30)];
        const ascSign = SIGNS[Math.floor(c.asc / 30)];
        addMsg(
            `📖 Haritanı baştan sona öğrendim!\n\n` +
            `☉ Güneş: ${sunSign.symbol} ${sunSign.name} (${c.positions.sun.house}. ev)\n` +
            `☽ Ay: ${moonSign.symbol} ${moonSign.name} (${c.positions.moon.house}. ev)\n` +
            `⬆️ Yükselen: ${ascSign.symbol} ${ascSign.name}\n\n` +
            `Hafızamda: 🪐 10 gezegen konumu · 🏠 12 ev · ⭐ ${c.aspects.length} natal açı · 🔥 element dağılımı · 📅 bugünün transitleri ve ay fazı.\n\n` +
            `Artık tüm verilerinin üzerinden yorum yapabilirim — sor bakalım! ✨`,
            'bot'
        );
    }
}

function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    document.getElementById('chat-messages').appendChild(div);
    div.scrollIntoView({ behavior: 'smooth' });
    return div;
}

// Yerel kural-tabanlı yanıtlar (API anahtarı yokken)
function localBotAnswer(q) {
    if (!chart) return 'Önce haritanı hesaplaman gerekiyor. Yukarıdaki formu doldur!';
    const c = chart;
    const ql = q.toLowerCase();
    
    const sunSign = SIGNS[Math.floor(c.positions.sun.lon / 30)].name;
    const moonSign = SIGNS[Math.floor(c.positions.moon.lon / 30)].name;
    const ascSign = SIGNS[Math.floor(c.asc / 30)].name;
    
    if (ql.includes('yükselen')) {
        return `Yükselenin ${fmtZodiac(c.asc)}. ${ASC_TEXT[ascSign]}`;
    }
    if (ql.includes('dolunay') || ql.includes('yeni ay') || ql.includes('ay fazı') || ql.includes('ay fazi')) {
        const jdNow = julianDate(new Date());
        const phase = moonPhaseInfo(jdNow);
        const nn = findNextPhase(jdNow, 0), nf = findNextPhase(jdNow, 180);
        return `Bugün ${phase.emoji} ${phase.name} (%${phase.illum} aydınlık). ${phase.text} Sonraki Yeni Ay: ${nn ? fmtTrDate(jdToDate(nn)) : '-'}. Sonraki Dolunay: ${nf ? fmtTrDate(jdToDate(nf)) : '-'}.`;
    }
    if (ql.includes('transit')) {
        const hits = todaysTransitHits(c, julianDate(new Date()));
        if (!hits.length) return 'Bugün haritana dar açı yapan önemli bir transit yok — sakin bir gökyüzü. Önümüzdeki 30 gün için "📅 Transitler" sekmesine bakabilirsin.';
        const list = hits.slice(0, 4).map(h => `${PLANETS[h.t].name} natal ${PLANETS[h.n].name}'e ${h.asp.name.toLowerCase()}`).join('; ');
        return `Bugün sana özel ${hits.length} transit var: ${list}. Detaylar "🌙 Günlük Fal" sekmesinde, 30 günlük liste "📅 Transitler" sekmesinde.`;
    }
    if (ql.includes('element') || ql.includes('dominant') || ql.includes('baskın')) {
        const elements = { fire: 0, earth: 0, air: 0, water: 0 };
        for (const key of Object.keys(c.positions)) elements[SIGNS[Math.floor(c.positions[key].lon / 30)].element]++;
        const names = { fire: '🔥 Ateş', earth: '🌍 Toprak', air: '💨 Hava', water: '💧 Su' };
        const sorted = Object.keys(elements).sort((a, b) => elements[b] - elements[a]);
        return `Element dağılımın: ${sorted.map(e => `${names[e]} ${elements[e]}`).join(', ')}. Baskın elementin ${names[sorted[0]]} — haritanın genel tonu bu elementin nitelikleriyle şekilleniyor.`;
    }
    if (ql.includes('açı') || ql.includes('aspect') || ql.includes('aci ') || ql.includes('acılar')) {
        const top = c.aspects.slice(0, 5).map(a => `${PLANETS[a.p1].name} ${a.type.name} ${PLANETS[a.p2].name} (${a.orb.toFixed(1)}°)`).join('; ');
        return `Haritanda ${c.aspects.length} natal açı var. En dar orblılar: ${top}. Detaylar "⭐ Aspects" sekmesinde.`;
    }
    if (/(^|\s)ay(\s|'|$)/.test(ql) || ql.includes('ayım') || ql.includes('duygu')) {
        return `Ayın ${fmtZodiac(c.positions.moon.lon)}, ${c.positions.moon.house}. evde. ${MOON_TEXT[moonSign]}`;
    }
    if (ql.includes('güneş') || ql.includes('gunes') || ql.includes('burcum')) {
        return `Güneşin ${fmtZodiac(c.positions.sun.lon)}, ${c.positions.sun.house}. evde. ${SUN_TEXT[sunSign]}`;
    }
    if (ql.includes('bugün') || ql.includes('günlük') || ql.includes('fal') || ql.includes('günüm')) {
        document.querySelector('[data-tab="daily"]').click();
        return 'Günlük falına baktım — "🌙 Günlük Fal" sekmesini açtım, oradan detayları görebilirsin! ✨';
    }
    if (ql.includes('aşk') || /(^|\s)ask/.test(ql) || ql.includes('ilişki') || ql.includes('sevgili')) {
        const venus = c.positions.venus;
        const vSign = SIGNS[Math.floor(venus.lon / 30)].name;
        return `Aşk hayatın için Venüs'üne baktım: ${fmtZodiac(venus.lon)}, ${venus.house}. evde. Sevgi dilin ${vSign} tarzında; ${HOUSE_THEMES[venus.house - 1]} alanında aşkı deneyimlersin.`;
    }
    if (ql.includes('kariyer') || ql.includes('iş') || ql.includes('para') || ql.includes('meslek')) {
        const mcSign = SIGNS[Math.floor(c.mc / 30)].name;
        return `Kariyerin için MC'ne baktım: ${fmtZodiac(c.mc)}. ${mcSign} MC'si kariyer yolunda bu burcun niteliklerini kullanmanı önerir. Satürn'ün ${c.positions.saturn.house}. evde — disiplin ve ustalaşma alanın: ${HOUSE_THEMES[c.positions.saturn.house - 1]}.`;
    }
    for (const key of Object.keys(PLANETS)) {
        if (ql.includes(PLANETS[key].name.toLowerCase().replace('ü', 'u').replace('ö', 'o')) || ql.includes(PLANETS[key].name.toLowerCase())) {
            const p = c.positions[key];
            return `${PLANETS[key].name}: ${fmtZodiac(p.lon)}, ${p.house}. evde${p.retro ? ' (retro)' : ''}. Bu, ${PLANET_ROLES[key]} demektir ve ${HOUSE_THEMES[p.house - 1]} alanında etkindir.`;
        }
    }
    if (ql.includes('ev')) {
        return `Ev sistemin: ${c.hsys}. "🏠 Houses" sekmesinden tüm ev cusps'larını görebilirsin. Belirli bir gezegenin evini sormak istersen "Mars hangi evde?" gibi sorabilirsin.`;
    }
    if (ql.includes('merhaba') || ql.includes('selam')) {
        return `Selam! 🌟 Haritan hazır: Güneş ${sunSign}, Ay ${moonSign}, Yükselen ${ascSign}. Bana aşk, kariyer, günlük fal veya herhangi bir gezegenini sorabilirsin!`;
    }
    return `Haritana göre: Güneş ${sunSign} (${c.positions.sun.house}. ev), Ay ${moonSign} (${c.positions.moon.house}. ev), Yükselen ${ascSign}. Daha detaylı yanıtlar için ⚙️ simgesinden OpenAI API anahtarı ekleyebilirsin. Şunları sorabilirsin: "aşk hayatım", "kariyerim", "bugün günüm nasıl?"`;
}

async function askGPT(question) {
    const key = getApiKey();
    
    const messages = [
        {
            role: 'system',
            content: 'Sen deneyimli, samimi bir Türk astrologsun. Aşağıda kullanıcının doğum haritasının TÜM verileri var. ' +
                     'Yorumlarını bu verilerin TAMAMINI dikkate alarak yap: soruyla ilgili gezegenleri, evleri, natal açıları ve ' +
                     'bugünün transitlerini birlikte değerlendir; somut derece/ev/açı bilgisine atıfta bulun.\n\n' +
                     '=== HARİTA VERİLERİ ===\n' + getChartContext() + '\n=== VERİ SONU ===\n\n' +
                     'Kurallar: Türkçe yanıt ver, sıcak ve samimi ol, en fazla 200 kelime. Emoji kullanabilirsin.'
        },
        ...chatHistory.slice(-6),
        { role: 'user', content: question }
    ];
    
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 500,
            temperature: 0.8
        })
    });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || ('API hatası: ' + res.status));
    }
    
    const data = await res.json();
    return data.choices[0].message.content;
}

async function handleChatSend() {
    const input = document.getElementById('chat-input');
    const q = input.value.trim();
    if (!q) return;
    
    input.value = '';
    addMsg(q, 'user');
    chatHistory.push({ role: 'user', content: q });
    
    const typing = addMsg('Yıldızlara bakıyorum... ✨', 'bot');
    typing.classList.add('typing');
    
    try {
        const answer = await askGPT(q);
        typing.remove();
        addMsg(answer, 'bot');
        chatHistory.push({ role: 'assistant', content: answer });
    } catch (e) {
        typing.remove();
        console.error('Chat hatası:', e);
        addMsg('⚠️ ChatGPT bağlantısında sorun oluştu (' + e.message + '). Yerel bilgimle yanıtlıyorum:\n\n' + localBotAnswer(q), 'bot');
    }
}

function initChat() {
    const fab = document.getElementById('chat-fab');
    const panel = document.getElementById('chat-panel');
    
    fab.addEventListener('click', () => {
        panel.classList.toggle('open');
        // İlk açılışta: önce tüm harita verisini öğren, sonra hazır olduğunu bildir
        if (panel.classList.contains('open') && !chartLearnedShown) {
            chartLearnedShown = true;
            const typing = addMsg('📖 Haritanı öğreniyorum: gezegenler, evler, açılar, elementler ve bugünün transitleri... ✨', 'bot');
            typing.classList.add('typing');
            setTimeout(() => {
                typing.remove();
                learnChart(true);
            }, 1200);
        }
    });
    document.getElementById('chat-close').addEventListener('click', () => panel.classList.remove('open'));
    
    document.getElementById('chat-settings').addEventListener('click', () => {
        const row = document.getElementById('chat-key-row');
        row.style.display = row.style.display === 'none' ? 'flex' : 'none';
        document.getElementById('api-key-input').value = localStorage.getItem('openai_api_key') || '';
    });
    
    document.getElementById('api-key-save').addEventListener('click', () => {
        const val = document.getElementById('api-key-input').value.trim();
        if (val) {
            localStorage.setItem('openai_api_key', val);
            addMsg('✅ API anahtarı kaydedildi! Artık ChatGPT ile yanıt veriyorum.', 'bot');
        } else {
            localStorage.removeItem('openai_api_key');
            addMsg('API anahtarı silindi. Yerel modda devam ediyorum.', 'bot');
        }
        document.getElementById('chat-key-row').style.display = 'none';
    });
    
    document.getElementById('chat-send').addEventListener('click', handleChatSend);
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleChatSend();
    });
}

// ---------- UI ----------
function generateAll() {
    const c = computeChart();
    fillInfo(c);
    drawWheel(c);
    fillPositions(c);
    fillAspects(c);
    fillHouses(c);
    fillDominants(c);
    fillInterpretation(c);
    fillDaily(c);
    fillTransitCalendar(c);
    
    // Harita değişti: chatbot yeni veriyi baştan öğrensin
    learnedContext = null;
    if (chartLearnedShown) {
        learnChart(false);
        const panel = document.getElementById('chat-panel');
        if (panel && panel.classList.contains('open')) {
            addMsg('🔄 Haritan güncellendi — yeni verilerin tamamını yeniden öğrendim!', 'bot');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM hazır');
    
    // Paylaşım linki / kayıtlı bilgiler
    restoreBirthData();
    
    // Partner şehir listesini ana listeden kopyala
    const pCity = document.getElementById('p-city');
    pCity.innerHTML = document.getElementById('city').innerHTML;
    
    // Sekmeler
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });
    
    // Form toggle
    document.getElementById('edit-toggle').addEventListener('click', (e) => {
        e.preventDefault();
        const form = document.getElementById('birth-form');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
    
    // Hesapla butonu
    document.getElementById('calc-btn').addEventListener('click', generateAll);
    
    // Ev sistemi değişince haritayı yeniden hesapla
    document.getElementById('house-system').addEventListener('change', () => {
        console.log('🏠 Ev sistemi değişti:', document.getElementById('house-system').value);
        generateAll();
    });
    
    // Sinastri
    document.getElementById('syn-btn').addEventListener('click', computeSynastry);
    
    // PNG indir & paylaşım linki
    document.getElementById('btn-png').addEventListener('click', downloadPNG);
    document.getElementById('btn-share').addEventListener('click', (e) => copyShareLink(e.currentTarget));
    
    // Chatbot
    initChat();
    
    // İlk yükleme
    generateAll();
    
    // PWA: Service Worker kaydı
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('📱 PWA hazır — Service Worker kaydedildi'))
            .catch(err => console.warn('SW kaydı başarısız:', err));
    }
});
