const filesElement = document.getElementById('files');

function getUploadsFile() {
  fetch('/uploadsFileList', {
    method: 'get',
  })
    .then((response) => response.text())
    .then((data) => {
      data = JSON.parse(data);
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        const box = document.createElement('div');
        box.innerText = data[i];
        box.classList.add('box');
        filesElement.appendChild(box);
      }
    })
    .catch((error) => console.error('Hata:', error));
}
getUploadsFile();

document.getElementById('dosyaYuklemeButonu').addEventListener('click', function () {
  const dosyaSecimi = document.getElementById('dosyaSecimi');
  const dosya = dosyaSecimi.files[0];

  if (dosya) {
    const formData = new FormData();
    formData.append('dosya', dosya);

    fetch('/dosya-yukle', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => alert(data))
      .catch((error) => console.error('Hata:', error));
  }
});
