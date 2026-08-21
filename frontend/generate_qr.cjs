const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const url = 'http://10.109.226.210:5173/';
const artifactDir = 'C:/Users/anuta/.gemini/antigravity/brain/7c619e93-a069-4b31-b2fd-9a40d9c0bfa8';
const outputPath = path.join(artifactDir, 'final_qr.png');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

QRCode.toString(url, { type: 'terminal', small: true }, function (err, qrString) {
  if (err) throw err;
  console.log('\n--- TERMINAL QR CODE ---');
  console.log(qrString);
  console.log('URL:', url);
});

QRCode.toFile(outputPath, url, {
  errorCorrectionLevel: 'H',
  margin: 2,
  scale: 10,
  color: {
    dark: '#0f172a',
    light: '#ffffff'
  }
}, function (err) {
  if (err) throw err;
  console.log('PNG QR Code saved to:', outputPath);
});

