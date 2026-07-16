# Kedi Jest Panosu — Web Sürümü

Masaüstü Python uygulamasının tarayıcıda çalışan hâli. Hiçbir
kurulum gerekmez — kişi linke tıklar, "Kamerayı Başlat"a basar,
elini gösterir.

Python değil, **JavaScript + MediaPipe (web sürümü)** kullanıyor,
çünkü GitHub Pages sadece statik dosya sunar, Python çalıştıramaz.
Tüm işlem ziyaretçinin kendi tarayıcısında oluyor — hiçbir görüntü
hiçbir sunucuya gönderilmiyor.

## 1. Kendi fotoğraflarını koy

`images/` klasöründeki 8 dosya şu an yer tutucu (benim çizdiğim
basit kedi resimleri). Kendi 8 fotoğrafını **aynı isimlerle**
üzerine yaz:

```
baskan.jpg   cool.jpg   endiseli.jpg   komiser.jpeg
kahkaha.jpg  komik.jpg  ogrenci.jpg    sinsi.jpg
```

## 2. GitHub'a yükle

Terminalde bu klasörün içine gir:

```bash
git init
git add .
git commit -m "ilk yukleme"
```

GitHub'da yeni bir repo oluştur (github.com → New repository,
örneğin adı `kedi-jest-panosu` olsun, boş bırak — README/lisans
ekleme). Sonra:

```bash
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/kedi-jest-panosu.git
git push -u origin main
```

## 3. GitHub Pages'i aç

1. GitHub'da reponu aç → **Settings** → sol menüden **Pages**
2. "Build and deployment" altında **Source: Deploy from a branch**
3. **Branch: main**, klasör: **/ (root)** seç → **Save**
4. Birkaç dakika bekle, sayfa yukarıda şu adreste yayınlanacak:

```
https://KULLANICI_ADIN.github.io/kedi-jest-panosu/
```

Bu linki istediğin kişiyle paylaşabilirsin.

## Güncelleme yapmak istersen

Fotoğraf değiştirmek, kural değiştirmek gibi bir düzenleme
yaptığında:

```bash
git add .
git commit -m "guncelleme"
git push
```

Site birkaç dakika içinde otomatik güncellenir.

## Dosyalar

- `index.html` — sayfa yapısı, kurallar panosu
- `style.css` — kork tahtası / polaroid görünümü
- `script.js` — kamera + MediaPipe + jest mantığı (Python
  sürümüyle birebir aynı kurallar)
- `images/` — 8 kedi fotoğrafı

## Jest mantığını değiştirmek

`script.js` içindeki `GESTURE_FILES`, `determineGesture()` ve
kalibrasyon sabitleri (`STRAIGHT_ANGLE_THRESHOLD`,
`TRIANGLE_DISTANCE`, `HEAD_ZONE_Y`) masaüstü Python sürümündeki
`main.py` / `gesture_utils.py` ile birebir aynı mantığı içerir.
Birini değiştirirsen digerini de güncellemek istersen haber ver.

## Sorun giderme

**Kamera açılmıyor / "izin reddedildi" yazıyor:**
Tarayıcı adres çubuğundaki kilit simgesine tıklayıp kamera iznini
kontrol et. HTTPS gerekiyor — GitHub Pages otomatik HTTPS sağlar,
ama `index.html`'i doğrudan dosya olarak (file://) açarsan kamera
çalışmayabilir; `python3 -m http.server` gibi yerel bir sunucudan
test et.

**Model yüklenmiyor / sayfa donuk kalıyor:**
İlk açılışta ~8 MB'lık model internetten indiriliyor, yavaş
bağlantıda birkaç saniye sürebilir. "Geliştirici bilgisi"
bölümünü açıp konsolu (F12) kontrol et.

**Jest yanlış algılanıyor:**
Sayfanın altındaki "Geliştirici bilgisi" panelini aç, canlı
parmak durumunu / el yüksekliğini gör, gerekirse `script.js`
içindeki kalibrasyon sabitlerini ayarla.
