const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3001;

app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("/uploadsFileList", (req, res) => {
  fs.readdir(path.join(__dirname, "./uploads"), (err, dosyalar) => {
    if (err) {
      res.status(500).send("Klasör okunurken hata oluştu");
      return;
    }
    var uploadFiles = [];
    dosyalar.map((dosya) => {
      uploadFiles.push({ dosya });
    });

    res.json(dosyalar);
  });
});

const hedefDizin = path.join(__dirname, "./uploads");

// Multer ayarları
const yukleme = multer({ dest: hedefDizin });

app.post("/dosya-yukle", yukleme.single("dosya"), (req, res) => {
  const yuklenenDosya = req.file;

  if (!yuklenenDosya) {
    return res.status(400).send("Dosya yüklenemedi.");
  }

  // Orijinal dosya adını al
  const orijinalDosyaAdi = req.file.originalname;

  // Yeni dosya yolu ve adını oluştur
  const hedefDizin = "uploads/";
  const yeniDosyaYolu = path.join(__dirname, hedefDizin, orijinalDosyaAdi);

  fs.rename(yuklenenDosya.path, yeniDosyaYolu, (err) => {
    if (err) {
      console.error("Dosya kaydedilirken hata oluştu:", err);
      return res.status(500).send("Dosya kaydedilemedi.");
    }
    res.send(`Dosya başarıyla kaydedildi: ${yeniDosyaYolu}`);
  });
});

app.get("/listele:dosyaYolu(*)", (req, res) => {
  const dosyaYolu = path.join("li/", req.params.dosyaYolu);
  const dosyaIcerigi = listeleKlasorIcerigi(dosyaYolu);

  let icerik = "";

  dosyaIcerigi.forEach((dosya) => {
    if (dosya.tip === "klasor") {
      icerik += `<a href="/${dosya.url}"> ${dosya.isim}</a>`;
    } else if (dosya.tip === "dosya") {
      icerik += `<a href="/${dosya.url}">${dosya.isim}</a>`;
    }
  });

  res.send(icerik);
});

function listeleKlasorIcerigi(dizinYolu) {
  console.log(dizinYolu);
  const dosyalar = fs.readdirSync(dizinYolu);

  return dosyalar
    .map((dosya) => {
      const dosyaYolu = path.join(dizinYolu, dosya);
      const istatistik = fs.statSync(dosyaYolu);

      if (istatistik.isDirectory()) {
        return {
          isim: dosya,
          tip: "klasor",
          url: dosyaYolu,
          altDosyalar: listeleKlasorIcerigi(dosyaYolu),
        };
      } else if (istatistik.isFile() && dosyaYolu.endsWith(".html")) {
        return {
          isim: dosya,
          tip: "dosya",
          url: dosyaYolu, // HTML dosyalarını tarayıcıda açmak için yolu ekliyoruz
        };
      }

      return null;
    })
    .filter(Boolean);
}

app.get("app/:klasorAdi/:dosyaAdi", (req, res) => {
  const { klasorAdi, dosyaAdi } = req.params;
  const dosyaYolu = path.join(klasorAdi, "app/" + dosyaAdi);

  console.log(dosyaYolu);
  res.sendFile(dosyaYolu, { root: __dirname }, (err) => {
    if (err) {
      res.status(500).send("Dosya gönderilirken hata oluştu");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
