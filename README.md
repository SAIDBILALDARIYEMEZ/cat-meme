# 🐱🖐️ Kedi Meme Panosu

**Elini kameraya göster, kedi tepki versin.**

Kurulum yok, uygulama indirme yok — link'e giriyorsun, tarayıcı
kameraya izin istiyor, elini gösteriyorsun, karşındaki kedi
fotoğrafı anlık değişiyor. Tüm işlem kendi cihazında, tarayıcının
içinde oluyor; hiçbir görüntü hiçbir sunucuya gönderilmiyor,
hiçbir yerde kaydedilmiyor.

Arka planda Google'ın **MediaPipe Hand Landmarker** modeli
çalışıyor, elin 21 noktasını (parmak eklemleri) takip ediyor;
geri kalanı basit geometri — açık/kapalı parmak, elin ekrandaki
konumu, iki elin birbirine yakınlığı.

### 👉 Hemen dene: **[saidbilaldariyemez.github.io/cat-meme](https://saidbilaldariyemez.github.io/cat-meme/)**

---

## 🖐️ El Hareketleri Rehberi

| # | Hareket | Nasıl yapılır |
|---|---|---|
| 1 | **Kafa üstü** | İki elini başının çok üstünde birleştir |
| 2 | **Üçgen** | İki elinin başparmak + işaret parmağı uçlarını birleştir |
| 3 | **Havada** | İki elini göster (yukarıdaki ikisine uymuyorsa varsayılan) |
| 4 | **Yumruk** | Tek elini yumruk yap |
| 5 | **Açık el** | Tek elinin beş parmağını da aç |
| 6 | **Tek işaret** | Sadece işaret parmağını kaldır |
| 7 | **Shaka 🤙** | Başparmak + serçe parmağını aç, diğerleri kapalı olsun |
| 8 | **Belirsiz** | El göstermezsen ya da yukarıdakilerin hiçbirine uymazsa |

---

Bu projeyi hazırlarken emeği geçen, yol gösteren **Dr. Murat
Altun**'a 🙏 teşekkür ederim.
[GitHub](https://github.com/DrMuratAltun) · [LinkedIn](https://www.linkedin.com/in/drmurataltun/)

---

*Tamamen tarayıcıda çalışır (JavaScript + MediaPipe) — Python
değil, çünkü GitHub Pages statik dosya sunar, sunucu tarafı kod
çalıştırmaz. Masaüstü Python sürümüyle aynı 8 kuralı kullanır.*

`#yapayzeka #computervision #mediapipe #javascript #webdev #girisim #btkakademi`

---

## Teknik detay (geliştiriciler için)

- `index.html` — sayfa yapısı, kurallar panosu
- `style.css` — görünüm
- `script.js` — kamera + MediaPipe + jest mantığı
- `images/` — 8 kedi fotoğrafı

Yerelde çalıştırmak için: `python3 -m http.server` ile klasörü
aç, `http://localhost:8000` adresine git (kamera erişimi için
`file://` değil, bir sunucu üzerinden açman gerekir).

Jest kurallarını değiştirmek için `script.js` içindeki
`GESTURE_FILES`, `determineGesture()` ve kalibrasyon sabitlerine
(`STRAIGHT_ANGLE_THRESHOLD`, `TRIANGLE_DISTANCE`, `HEAD_ZONE_Y`)
bak.
