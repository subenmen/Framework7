// Swiss Ephemeris ile Profesyonel Astroloji Hesaplamaları

let swe = null;
let sweReady = false;

// Swiss Ephemeris başlat
async function initSwissEph() {
    try {
        console.log('Swiss Ephemeris başlatılıyor...');
        
        // Global SwissEphemeris sınıfı
        if (typeof SwissEphemeris !== 'undefined') {
            swe = new SwissEphemeris();
            await swe.init();
            sweReady = true;
            console.log('✅ Swiss Ephemeris hazır!');
            return true;
        } else {
            console.error('SwissEphemeris yüklenemedi!');
            return false;
        }
    } catch (error) {
        console.error('Swiss Ephemeris başlatma hatası:', error);
        return false;
    }
}

// Tarih → Julian Day dönüşümü
function dateToJulianDay(date) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const h = date.getUTCHours();
    const min = date.getUTCMinutes();
    const s = date.getUTCSeconds();
    
    let a = Math.floor((14 - m) / 12);
    let y2 = y + 4800 - a;
    let m2 = m + 12 * a - 3;
    
    let jdn = d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
    let jd = jdn + (h - 12) / 24 + min / 1440 + s / 86400;
    
    return jd;
}

// Swiss Ephemeris ile gezegen pozisyonları
async function calculatePlanetsWithSwissEph(date) {
    if (!sweReady) {
        console.error('Swiss Ephemeris hazır değil!');
        return null;
    }
    
    try {
        const jd = dateToJulianDay(date);
        console.log('Julian Day:', jd);
        
        const planets = {};
        
        // Planet enum değerleri
        const planetIds = {
            Sun: 0,
            Moon: 1,
            Mercury: 2,
            Venus: 3,
            Mars: 4,
            Jupiter: 5,
            Saturn: 6,
            Uranus: 7,
            Neptune: 8,
            Pluto: 9
        };
        
        const planetNames = {
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
        
        for (const [name, id] of Object.entries(planetIds)) {
            try {
                const result = swe.calculatePosition(jd, id);
                planets[name] = {
                    longitude: result.longitude,
                    latitude: result.latitude,
                    distance: result.distance,
                    speed: result.longitudeSpeed,
                    symbol: planetSymbols[name],
                    name: planetNames[name],
                    color: planetColors[name]
                };
                
                console.log(`${name}: ${result.longitude.toFixed(4)}°`);
            } catch (e) {
                console.warn(`${name} hesaplanamadı:`, e);
            }
        }
        
        return planets;
    } catch (error) {
        console.error('Gezegen hesaplama hatası:', error);
        return null;
    }
}

// Swiss Ephemeris ile evler ve Ascendant
async function calculateHousesWithSwissEph(date, lat, lon) {
    if (!sweReady) {
        console.error('Swiss Ephemeris hazır değil!');
        return null;
    }
    
    try {
        const jd = dateToJulianDay(date);
        
        // HouseSystem: 'P' = Placidus
        const housesResult = swe.calculateHouses(jd, lat, lon, 'P');
        
        console.log('Swiss Ephemeris Houses:', {
            ascendant: housesResult.ascendant.toFixed(4),
            mc: housesResult.mc.toFixed(4),
            armc: housesResult.armc.toFixed(4),
            vertex: housesResult.vertex.toFixed(4)
        });
        
        // Ascendant burcu
        const ascSign = Math.floor(housesResult.ascendant / 30);
        console.log(`Yükselen: ${zodiacNames[ascSign]} (${(housesResult.ascendant % 30).toFixed(2)}°)`);
        
        return {
            cusps: housesResult.cusps,
            ascendant: housesResult.ascendant,
            mc: housesResult.mc,
            ic: (housesResult.mc + 180) % 360,
            descendant: (housesResult.ascendant + 180) % 360,
            armc: housesResult.armc,
            vertex: housesResult.vertex
        };
    } catch (error) {
        console.error('Ev hesaplama hatası:', error);
        return null;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.initSwissEph = initSwissEph;
    window.calculatePlanetsWithSwissEph = calculatePlanetsWithSwissEph;
    window.calculateHousesWithSwissEph = calculateHousesWithSwissEph;
    window.dateToJulianDay = dateToJulianDay;
}
