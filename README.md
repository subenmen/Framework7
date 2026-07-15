# KUBEY - Animasyon Projeleri

Modern ve profesyonel animasyon projeleri koleksiyonu. KUBEY yazılım firması için Anime.js kütüphanesi kullanılarak geliştirilmiştir.

## 📂 Projeler

1. **Logo Animasyonu** (`index.html`)
2. **İnteraktif Astroloji Haritası** (`astrology.html`)

## 🚀 Özellikler

- **SVG Tabanlı Logo**: Özel tasarım K harfi
- **Anime.js Animasyonları**: Akıcı ve profesyonel animasyon geçişleri
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **İnteraktif Öğeler**: Hover efektleri ve tekrar oynatma butonu
- **Modern UI**: Glassmorphism efekti ve gradient arka plan
- **Partiküller**: Dinamik parçacık efektleri

## 📦 Animasyon Özellikleri

1. **K Harfi Çizimi**: Stroke-dasharray ile çizim animasyonu
2. **Dekoratif Daireler**: Scale ve opacity animasyonları
3. **360° Dönüş**: Logo tam dönüş efekti
4. **Harf Animasyonu**: 3D transform ile KUBEY yazısı
5. **Alt Başlık**: Software Solutions yazısı fade-in
6. **Partiküller**: 8 adet dinamik parçacık efekti
7. **Sürekli Animasyon**: Logo yavaş sallanma (floating)
8. **Pulse Efekt**: Dairelerde sürekli pulse animasyonu

## 🎯 Kullanım

Projeyi çalıştırmak için herhangi bir web sunucusu kullanabilirsiniz:

```bash
# Python ile
python -m http.server 8000

# Node.js ile (http-server)
npx http-server

# PHP ile
php -S localhost:8000
```

Ardından tarayıcınızda `http://localhost:8000` adresine gidin.

## 🎨 Teknolojiler

- HTML5
- CSS3 (Glassmorphism, Gradients, Animations)
- JavaScript (ES6+)
- Anime.js 3.2.1

## 📱 Responsive

Proje 768px breakpoint ile mobil cihazlara optimize edilmiştir.

## 🔄 İnteraktif Özellikler

- **Hover Efekti**: Her harfin üzerine gelince büyüme ve renk değişimi
- **Replay Butonu**: Animasyonu istediğiniz zaman tekrar oynatın

## 📄 Lisans

Bu proje KUBEY yazılım firması için geliştirilmiştir.

---

## 🌌 Profesyonel Astroloji Haritası

### ✨ Ana Özellikler

#### 📋 Doğum Bilgileri Formu
- **Ad Soyad**: Kişisel bilgi
- **Doğum Tarihi & Saati**: Tarih ve saat seçimi
- **Konum**: Şehir, enlem ve boylam
- **Dinamik Hesaplama**: Gerçek zamanlı harita oluşturma

#### 🏠 12 Ev Sistemi (Houses)
- **Placidus Sistemi**: Profesyonel ev hesaplamaları
- **Görsel Temsil**: Her evin net çizimi
- **Ev Numaraları**: 1-12 arası ev işaretleri
- **Açık/Kapalı**: Evleri göster/gizle özelliği

#### ⭐ Aspectler (Gezegen Açıları)
- **Conjunction** ☌ (0°) - Kavuşum, güçlü birleşme
- **Opposition** ☍ (180°) - Karşıtlık, gerilim
- **Trine** △ (120°) - Uyum, kolay akış
- **Square** □ (90°) - Zorluk, büyüme fırsatı
- **Sextile** ⚹ (60°) - Fırsat, kolaylık
- **Renkli Çizgiler**: Her aspect tipi farklı renkte
- **Aspect Tablosu**: Detaylı liste görünümü
- **Açık/Kapalı**: Aspectleri göster/gizle

#### 🪐 10 Gezegen & Gök Cismi
- **☉ Güneş** - Ego, kimlik, yaşam gücü
- **☽ Ay** - Duygular, içgüdüler, alışkanlıklar
- **☿ Merkür** - İletişim, zeka, düşünce
- **♀ Venüs** - Aşk, güzellik, uyum
- **♂ Mars** - Enerji, cesaret, hırs
- **♃ Jüpiter** - Şans, genişleme, bilgelik
- **♄ Satürn** - Disiplin, sorumluluk, sınırlar
- **♅ Uranüs** - Devrim, özgünlük, değişim
- **♆ Neptün** - Rüyalar, hayal, sezgi
- **♇ Plüton** - Dönüşüm, güç, yeniden doğuş

#### 📍 Özel Noktalar
- **AC (Ascendant)** - Yükselen burç, kişilik maskesi
- **MC (Midheaven)** - Orta gökyüzü, kariyer ve yaşam yolu

#### 📊 Derece ve Pozisyon Bilgileri
- Her gezegenin burçtaki derece konumu
- Örnek: 14° ♒ Kova - 14 derece Kova burcunda
- Dakika hassasiyetinde gösterim

### 🎯 Kullanım Rehberi

1. **Bilgileri Girin**: Doğum bilgilerini forma yazın
2. **Harita Oluştur**: "✨ Harita Oluştur" butonuna tıklayın
3. **Keşfedin**: Gezegenlere tıklayarak detaylı bilgi görün
4. **Özelleştirin**: Kontrol butonları ile görünümü ayarlayın
5. **İnceleyin**: Aspect tablosunu ve ev sistemini inceleyin

### 🎮 İnteraktif Kontroller

- **↶/↷ Döndürme**: Haritayı 30° döndür
- **🔄 Sıfırla**: Başlangıç konumuna dön
- **🔗 Aspectler**: Aspect çizgilerini göster/gizle
- **🏠 Evler**: Ev sistemini göster/gizle
- **🖱️ Tıklama**: Gezegen bilgilerini görüntüle

### 🔢 Astrolojik Hesaplamalar

#### Gezegen Pozisyonları
- Doğum tarih ve saatine göre gezegen konumları
- 360 derece ekliptik üzerinde konumlandırma
- Burç ve derece hesaplamaları

#### Ascendant Hesaplama
```
Ascendant = (GünSayısı × 0.986 + SaatOndalık × 15 + Boylam) % 360
```

#### Midheaven
```
Midheaven = (Ascendant + 90) % 360
```

#### Ev Sistemi
- Placidus bazlı (basitleştirilmiş)
- Ascendant'tan başlayarak 30° aralıklarla
- Her ev bir burç aralığını kapsar

#### Aspect Hesaplama
- İki gezegen arasındaki açı farkı
- Orb toleransı (6-8 derece)
- Tip belirleme (conjunction, trine, vb.)

### 🎨 Görsel Tasarım

#### Renk Kodları
- **Güneş**: Altın (#FFD700)
- **Ay**: Gümüş (#C0C0C0)
- **Merkür**: Gri (#A9A9A9)
- **Venüs**: Pembe (#FFB6C1)
- **Mars**: Kırmızı (#FF4500)
- **Jüpiter**: Turuncu (#FFA500)
- **Satürn**: Altın Sarısı (#DAA520)
- **Uranüs**: Turkuaz (#00CED1)
- **Neptün**: Kraliyet Mavisi (#4169E1)
- **Plüton**: Koyu Kırmızı (#8B0000)

#### Aspect Renkleri
- **Conjunction**: Altın (#FFD700)
- **Opposition**: Kırmızı (#FF0000)
- **Trine**: Yeşil (#00FF00)
- **Square**: Kırmızı (#FF0000)
- **Sextile**: Açık Mavi (#00BFFF)

### 💡 Özellik Detayları

#### Canvas Çizimleri
- Ana dairesel çizgiler (3 katman)
- Ev ayırıcı çizgiler
- Aspect bağlantı çizgileri
- Radyal yörünge hatları

#### Animasyonlar (Anime.js)
- Gezegen hover efektleri
- Form geçiş animasyonları
- Burç parıldama efektleri
- Harita dönme animasyonları

#### Responsive Tasarım
- Mobil optimizasyonu (768px breakpoint)
- Dokunmatik ekran desteği
- Dinamik boyutlandırma
- Grid tabanlı form düzeni

### 📱 Responsive Özellikler

**Desktop (>768px)**
- 700×700px harita
- 6 sütunlu form grid
- Büyük gezegen sembolleri

**Mobile (≤768px)**
- Ekran genişliğine göre harita (max 500px)
- Tek sütunlu form
- Optimize edilmiş yazı boyutları

### 🔬 Teknik Detaylar

#### Veri Yapısı
```javascript
chartData = {
    name: String,
    birthDate: String,
    birthTime: String,
    city: String,
    latitude: Number,
    longitude: Number,
    planets: {
        [planetKey]: {
            longitude: Number,
            sign: {
                name: String,
                symbol: String,
                degree: Number,
                minutes: Number
            }
        }
    },
    houses: Array[12],
    ascendant: Number,
    midheaven: Number,
    aspects: Array
}
```

#### JavaScript Modülleri
- `calculateChart()` - Ana hesaplama fonksiyonu
- `calculatePlanetPositions()` - Gezegen konumları
- `calculateHouses()` - Ev hesaplamaları
- `calculateAspects()` - Aspect analizi
- `drawChart()` - Canvas çizim sistemi

### 📚 Referanslar

Bu harita şunları içerir:
- ✅ Placidus ev sistemi
- ✅ 10 ana gök cismi
- ✅ 5 ana aspect tipi
- ✅ Ascendant ve MC hesaplamaları
- ✅ Burç derece pozisyonları
- ✅ Görsel aspect çizgileri

### ⚠️ Önemli Notlar

**Hesaplama Hassasiyeti**: 
Bu uygulama eğitim amaçlı basitleştirilmiş hesaplamalar kullanır. Profesyonel astroloji için Swiss Ephemeris gibi astronomik kütüphaneler önerilir.

**Timezone**: 
Şu anki sürüm timezone dönüşümlerini içermez. UTC ve yerel saat manuel olarak girilmelidir.

**Gerçek Zamanlı Veriler**: 
Gezegen pozisyonları matematiksel yaklaşımlarla hesaplanır, NASA JPL verileri kullanılmaz.

---

**Geliştirici Notu**: Tüm animasyonlar optimize edilmiş ve performans odaklıdır. 60 FPS akıcılığı hedeflenmiştir. Touch ve mouse olayları desteklenir.
