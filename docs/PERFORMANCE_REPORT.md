# Bloom Store — Performance & Session Architecture Report

Dokumen ini merangkum audit performa, kompresi aset, dan perbaikan penanganan sesi pada **Bloom Store**.

---

## 1. Perbaikan Sesi (Auto-Logout Saat Tab Ditutup)

### Masalah Sebelumnya
* **Customer Auth (`AuthContext.tsx`):**  
  Data sesi disimpan dalam `localStorage`. Browser menyimpan `localStorage` secara permanen ke disk, sehingga saat pengguna menutup tab dan membuka kembali halaman, status login tetap tersimpan.
* **Admin Auth (`/api/admin/login`):**  
  Cookie `admin_session` memiliki parameter `maxAge: 60 * 60 * 8` (8 jam), yang disimpan oleh browser melintasi penutupan tab.

### Implementasi Solusi
1. **Penyimpanan Sesi Tab-Scoped (`sessionStorage`):**  
   Seluruh operasi `localStorage` untuk `bloom_store_user` dan `bloom_session_id` diubah menjadi `sessionStorage`. Saat tab atau jendela ditutup, browser secara otomatis membersihkan seluruh data sesi.
2. **Pembersihan Residu Sesi Lama:**  
   Pada inisialisasi aplikasi, `localStorage.removeItem()` dieksekusi untuk menghapus sisa data sesi dari versi sebelumnya.
3. **Session Cookie Murni untuk Admin:**  
   Parameter `maxAge` pada cookie `admin_session` dihapus. Tanpa `maxAge` dan `expires`, cookie menjadi *browser session cookie* yang hangus saat browser ditutup.

---

## 2. Hasil Kompresi & Benchmark Aset

### A. Kompresi Gambar Produk (`public/assets/images/`)
Sebelumnya, terdapat 59 file gambar beresolusi mentah (hingga 6,5 MB per file) tanpa kompresi (`unoptimized: true`).  
Seluruh gambar telah dioptimasi menggunakan Sharp (maksimal 1200px, MozJPEG kualitas 80, progressive):

* **Ukuran Sebelum:** 101,42 MB  
* **Ukuran Setelah:** 6,20 MB  
* **Penghematan:** **95,22 MB (93,9% reduksi)**  

### B. Kompresi Video Background Hero (`public/assets/videos/`)
Video hero beresolusi tinggi di-reencode ke 720p dengan H.264 CRF 26, audio track dihapus (karena muted), dan atom `moov` dipindahkan ke awal file (`+faststart`):

| File Video | Ukuran Sebelum | Ukuran Setelah | Efisiensi |
|---|---|---|---|
| `video1.mp4` | 33,29 MB | 1,26 MB | **-96,2%** |
| `video2.mp4` | 47,62 MB | 2,54 MB | **-94,7%** |
| `video3.mp4` | 135,91 MB | 2,46 MB | **-98,2%** |
| **Total Video** | **216,82 MB** | **6,26 MB** | **-97,1% (Hemat 210,56 MB)** |

* **Hero Poster Frame:** Diekstrak dari `video1.mp4` (`/assets/images/hero-poster.jpg`, 167 KB) untuk rendering instan saat video masih memuat.

### C. Total Pengurangan Beban Transfer Data
$$\text{Total Aset Sebelumnya} = 101,42 \text{ MB} + 216,82 \text{ MB} \approx 318,24 \text{ MB}$$
$$\text{Total Aset Setelah Optimasi} = 6,20 \text{ MB} + 6,26 \text{ MB} \approx 12,46 \text{ MB}$$
$$\textbf{Total Bandwidth Dihemat: } \mathbf{305,78 \text{ MB (96,1\% Lebih Ringan)}}$$

---

## 3. Arsitektur Rendering & Caching

1. **Next.js Image Pipeline:**  
   Mengaktifkan format modern AVIF & WebP otomatis dengan `minimumCacheTTL: 86400` di [`next.config.ts`](../next.config.ts).
2. **Hero Video Lazy Streaming:**  
   Video kedua tidak lagi dimuat secara agresif di awal, melainkan hanya saat mendekati transisi (`timeupdate`).
3. **Nginx Reverse Proxy Caching:**  
   Header `Cache-Control: public, max-age=2592000, immutable` diterapkan pada lokasi `/assets/`.
4. **Gzip Compression:**  
   Kompresi tingkat 6 diaktifkan untuk HTML, JSON, JS, CSS, SVG, XML, dan web fonts.
