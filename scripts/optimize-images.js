const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'assets', 'images');

function getFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function optimize() {
  const files = getFiles(IMAGES_DIR);
  console.log(`Menemukan ${files.length} gambar untuk dioptimasi...`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let count = 0;

  for (const file of files) {
    const stat = fs.statSync(file);
    totalOriginal += stat.size;

    try {
      const inputBuffer = fs.readFileSync(file);
      const buffer = await sharp(inputBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true, mozjpeg: true })
        .toBuffer();

      if (buffer.length < stat.size) {
        fs.writeFileSync(file, buffer);
        totalOptimized += buffer.length;
        count++;
        const saved = (stat.size - buffer.length) / 1024;
        console.log(`[OK] ${path.basename(file)}: ${(stat.size/1024).toFixed(0)}KB -> ${(buffer.length/1024).toFixed(0)}KB (hemat ${saved.toFixed(0)}KB)`);
      } else {
        totalOptimized += stat.size;
        console.log(`[SKIP] ${path.basename(file)} sudah optimal.`);
      }
    } catch (err) {
      console.error(`[ERR] Gagal optimasi ${file}:`, err.message);
      totalOptimized += stat.size;
    }
  }

  const origMB = (totalOriginal / (1024 * 1024)).toFixed(2);
  const optMB = (totalOptimized / (1024 * 1024)).toFixed(2);
  const savedMB = ((totalOriginal - totalOptimized) / (1024 * 1024)).toFixed(2);
  const pct = (((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1);

  console.log('====================================');
  console.log(`SELESAI! ${count} gambar berhasil dioptimasi.`);
  console.log(`Ukuran sebelum : ${origMB} MB`);
  console.log(`Ukuran setelah : ${optMB} MB`);
  console.log(`Total dihemat  : ${savedMB} MB (${pct}%)`);
  console.log('====================================');
}

optimize();
