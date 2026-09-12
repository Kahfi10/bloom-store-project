# SECURITY AUDIT & ACCESS CONTROL MATRIX — BLOOM STORE

Dokumen ini memetakan spesifikasi keamanan seluruh 11 API endpoints, proteksi rute halaman, metode autentikasi, rate limit, dan pertahanan terhadap serangan siber (OWASP Top 10 & 20 Security Checklist).

---

## 1. Matriks Akses Endpoint RESTful API

| No | Endpoint Route | HTTP Method | Tingkat Akses | Autentikasi / Otorisasi | Rate Limit | Proteksi Khusus |
|---|---|---|---|---|---|---|
| **1** | `/api/products` | `GET` | Publik | Bebas akses | 60 req/min (via Nginx & General) | Query param sanitization, slug validation |
| **2** | `/api/products` | `POST` | Admin | Wajib `admin_session` cookie (HMAC) | 10 req/min | Validasi schema, sanitasi path gambar dari traversal |
| **3** | `/api/products/:id` | `GET` | Publik | Bebas akses | 60 req/min | Integer parameter validation |
| **4** | `/api/products/:id` | `PATCH` / `PUT` | Admin | Wajib `admin_session` cookie (HMAC) | 10 req/min | Whitelist fields, validasi tipe data & batas harga/stok |
| **5** | `/api/products/:id` | `DELETE` | Admin | Wajib `admin_session` cookie (HMAC) | 10 req/min | Integer ID check, penanganan foreign key |
| **6** | `/api/orders` | `POST` | Pelanggan / Publik | Bebas (checkout toko) | 10 req/min (In-Memory IP Limiter) | Validasi schema input, sanitasi XSS nama/alamat, **re-fetch harga DB (anti-tamper)**, transaksi atomik untuk stok |
| **7** | `/api/orders` | `GET` | **Admin Only** | Wajib `admin_session` cookie (HMAC) | 60 req/min | **Proteksi IDOR**: Mencegah pihak luar membaca daftar seluruh pemesan toko |
| **8** | `/api/orders/:id` | `GET` | Pelanggan / Admin | Bebas (by ID) / Admin | 60 req/min | Proteksi IDOR, validasi parameter cuid/string, safe serialization |
| **9** | `/api/orders/:id/status` | `PATCH` / `PUT` | **Admin / Webhook** | Wajib `admin_session` cookie atau Webhook signature | 20 req/min | Cegah pemalsuan status bayar (payment spoofing), rollback stok atomik saat CANCELLED |
| **10** | `/api/auth/login` | `POST` | Publik | Bebas | 5 attempt / 15 min | Rate limit brute-force, bcrypt comparison, secure signed HMAC cookie |
| **11** | `/api/auth/register` | `POST` | Publik | Bebas | 3 attempt / 1 hour | Rate limit spam akun, regex email & username ketat, sanitasi nama |
| **12** | `/api/admin/login` | `POST` | Publik (Admin form) | Kredensial Admin + Access Code | 5 attempt / 15 min (DB + In-memory + Nginx) | Timing-safe credential comparison (`crypto.timingSafeEqual`), token HMAC 8 jam |
| **13** | `/api/admin/logout` | `POST` | Admin | Bebas | - | Clears cookie session dengan maxAge: 0 |
| **14** | `/api/admin/stats` | `GET` | **Admin Only** | Wajib `admin_session` cookie (HMAC) | 30 req/min | **Proteksi Rute Admin**: Mengunci statistik omset, pesanan, dan sesi pengguna |
| **15** | `/api/sessions` | `GET` | **Admin Only** | Wajib `admin_session` cookie (HMAC) | 30 req/min | Akses sesi hanya untuk admin |
| **16** | `/api/sessions` | `POST` | Pelanggan | Bebas (login tracking) | 30 req/min | Bounded input lengths |
| **17** | `/api/sessions` | `PATCH` | Pelanggan | Bebas (logout tracking) | 30 req/min | Validasi keberadaan sessionId |
| **18** | `/api/webhooks/payment` | `POST` | Payment Gateway | Verifikasi HMAC-SHA256 Signature (`X-Signature`) | 30 req/min | Replay attack guard (timestamp drift < 5 menit), idempotensi transaksi |

---

## 2. Pemetaan Terhadap 20 Poin Keamanan

1. **Rate Limit API**: Aktif pada seluruh rute sensitif (`/api/auth/login`, `/api/auth/register`, `/api/orders`, `/api/admin/login`) dan Nginx limit_req.
2. **CORS Ketat**: Origin verification terdaftar di `middleware.ts`, disallow credentials on wildcards.
3. **Proteksi CSRF**: Penolakan request lintas domain (`sec-fetch-site: cross-site`, origin mismatch) pada seluruh HTTP mutation methods (`POST`, `PUT`, `PATCH`, `DELETE`).
4. **Cegah SSRF**: `lib/security/ssrfGuard.ts` memblokir private IPs dan Oracle Cloud Metadata IP `169.254.169.254`.
5. **Path Traversal**: Sanitasi `lib/security/sanitize.ts` memblokir `../`, `%00`, dan null byte pada path file dan aset.
6. **Validasi Input API**: Bounded input strings (nama <= 100, alamat <= 500, phone regex, price/qty integer positif).
7. **Validasi Output API**: `serializeSafeUser` membuang hash password; `serializeOrder` membatasi eksposur data pribadi.
8. **Admin Route Aman**: `middleware.ts` aktif menjaga seluruh rute `/admin/*` dan `/api/admin/*`; verifikasi token HMAC bertanda tangan waktu.
9. **Ganti Default Pass**: Kredensial hardcoded dihapus dari `ecosystem.config.js` dan `prisma/seed.ts`. Tersedia generator secret berkekuatan tinggi di `scripts/generate-secrets.ts`.
10. **Audit Endpoint**: Matriks izin akses terdokumentasi lengkap dan diuji.
11. **Verifikasi Webhook**: HMAC-SHA256 signature check dengan timestamp replay protection pada `/api/webhooks/payment`.
12. **Cek Payment Server**: Pengubahan status ke `CONFIRMED` / `COMPLETED` dikunci hanya untuk admin terverifikasi atau webhook payment gateway.
13. **Harga Anti-Tamper**: Total harga dihitung 100% dari database produk di server di dalam transaksi Prisma atomik.
14. **Cek IDOR**: `GET /api/orders` dikunci hanya untuk admin; `GET /api/orders/:id` memvalidasi otorisasi.
15. **Log Jangan Bocor**: Logger menyensor data sensitif (password, accessCode, token, email, no telp).
16. **Private Source Map**: `productionBrowserSourceMaps: false` di `next.config.ts`, file `.map` ditolak di Nginx.
17. **Update Dependency**: Audit dependensi, pembaruan versi paket rentan.
18. **Tes Restore Backup**: Skrip backup otomatis SQLite (`scripts/backup-db.sh`, `scripts/restore-db.sh`, `scripts/test-restore.ts`).
19. **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy di Next.js dan Nginx.
20. **Tes Security Live**: Automated regression security test suite (`__tests__/securityAudit.test.ts`).
