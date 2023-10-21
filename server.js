const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/uploadsFileList', (req, res) => {
  fs.readdir(path.join(__dirname, './app'), (err, dosyalar) => {
    if (err) {
      res.status(500).send('Klasör okunurken hata oluştu');
      return;
    }
    var uploadFiles = [];
    dosyalar.map((dosya) => {
      uploadFiles.push({ dosya });
    });

    res.json(dosyalar);
  });
});

const hedefDizin = path.join(__dirname, './app');

// Multer ayarları
const yukleme = multer({ dest: hedefDizin });

app.post('/dosya-yukle', yukleme.single('dosya'), (req, res) => {
  const yuklenenDosya = req.file;

  if (!yuklenenDosya) {
    return res.status(400).send('Dosya yüklenemedi.');
  }

  // Orijinal dosya adını al
  const orijinalDosyaAdi = req.file.originalname;

  // Yeni dosya yolu ve adını oluştur
  const hedefDizin = 'uploads/';
  const yeniDosyaYolu = path.join(__dirname, hedefDizin, orijinalDosyaAdi);

  fs.rename(yuklenenDosya.path, yeniDosyaYolu, (err) => {
    if (err) {
      console.error('Dosya kaydedilirken hata oluştu:', err);
      return res.status(500).send('Dosya kaydedilemedi.');
    }
    res.send(`Dosya başarıyla kaydedildi: ${yeniDosyaYolu}`);
  });
});

// Statik dosyaları sunmak için express.static kullanıyoruz
app.use('/app', express.static(path.join(__dirname, 'app')));

// Klasör içeriğini listeleme ve dosyaları açma endpoint'i

app.get('/listele/:klasorYolu(*)', (req, res) => {
  const klasorYolu = path.join(__dirname, 'app', req.params.klasorYolu);

  fs.readdir(klasorYolu, (err, dosyalar) => {
    if (err) {
      return res.status(500).send('Klasör içeriği listelenirken hata oluştu.');
    }

    let icerik = '';

    dosyalar.forEach((dosya) => {
      const dosyaYolu = path.join(klasorYolu, dosya);
      const istatistik = fs.statSync(dosyaYolu);

      if (istatistik.isDirectory()) {
        icerik += `<p><a href="/listele/${req.params.klasorYolu}/${dosya}"><strong>Klasör: ${dosya}</strong></a></p>`;
      } else if (istatistik.isFile() && dosyaYolu.endsWith('.html')) {
        icerik += `<p><a href="/app/${req.params.klasorYolu}/${dosya}">${dosya}</a></p>`;
      }
    });

    res.send(icerik);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
