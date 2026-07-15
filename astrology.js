// KUBEY Astroloji v4.2.0 - Astro-Seek tarzı profesyonel doğum haritası
// Gerçek astronomik hesaplamalar: JPL Kepler elemanları + gerçek Placidus ev sistemi
console.log('🌟 Astroloji v4.2.0 yükleniyor...');

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

// ---------- ANA HESAPLAMA ----------
function computeChart() {
    const dateVal = document.getElementById('birth-date').value;
    const timeVal = document.getElementById('birth-time').value;
    const sel = document.getElementById('city');
    const opt = sel.options[sel.selectedIndex];
    
    const lat = parseFloat(opt.dataset.lat);
    const lon = parseFloat(opt.dataset.lon);
    const tz = parseFloat(opt.dataset.tz);
    
    // UTC'ye çevir
    const [hh, mm] = timeVal.split(':').map(Number);
    const [Y, Mo, Dy] = dateVal.split('-').map(Number);
    const utc = new Date(Date.UTC(Y, Mo - 1, Dy, hh - tz, mm, 0));
    
    const jd = julianDate(utc);
    const gst = gmst(jd);
    const lstHours = (gst + lon / 15) % 24;
    const lstDeg = lstHours * 15;
    
    const hsys = document.getElementById('house-system').value;
    const asc = calcAscendant(lstDeg, lat);
    const mc = calcMC(lstDeg);
    const houses = calcHouses(asc, mc, lstDeg, lat, hsys);
    
    // Gezegen boylamları + retro kontrolü
    const positions = {};
    for (const key of Object.keys(PLANETS)) {
        const lonNow = geoLongitude(key, jd);
        const lonNext = geoLongitude(key, jd + 1);
        let delta = norm360(lonNext - lonNow);
        const retro = delta > 180;
        positions[key] = { lon: lonNow, retro: retro, house: 0 };
    }
    for (const key of Object.keys(positions)) {
        positions[key].house = findHouse(positions[key].lon, houses);
    }
    
    const aspects = calcAspects(positions);
    
    chart = {
        dateVal, timeVal, tz,
        city: opt.text, lat, lon,
        utc, jd, lstHours, hsys,
        asc, mc, houses, positions, aspects
    };
    
    console.log('✅ Hesaplandı — Yükselen:', fmtZodiac(asc), '| MC:', fmtZodiac(mc));
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
        `<i>${Dy} ${MONTHS_EN[Mo - 1]} ${Y} - ${c.timeVal}</i> (EET)`;
    
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

// ---------- UI ----------
function generateAll() {
    const c = computeChart();
    fillInfo(c);
    drawWheel(c);
    fillPositions(c);
    fillAspects(c);
    fillHouses(c);
    fillDominants(c);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM hazır');
    
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
    
    // İlk yükleme
    generateAll();
});
