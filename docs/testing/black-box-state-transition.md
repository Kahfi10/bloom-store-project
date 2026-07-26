# Black-Box Testing: State Transition Testing
## Bloom Store — Modul Status Pesanan (PRD §Modul 5)

---

## 1. Identifikasi State Bisnis

Sistem pesanan Bloom Store memiliki **4 state** yang mungkin:

| State | Keterangan | Kondisi |
|---|---|---|
| **DRAFT** | Pesanan baru dibuat | Status awal setiap pesanan baru |
| **CONFIRMED** | Pesanan dikonfirmasi oleh admin | Stok sudah dikurangi, pesanan diproses |
| **COMPLETED** | Pesanan selesai & diterima | Status terminal — tidak dapat diubah |
| **CANCELLED** | Pesanan dibatalkan | Status terminal — stok dikembalikan |

---

## 2. Event / Pemicu Perubahan State

| Event | Deskripsi | Dilakukan Oleh |
|---|---|---|
| `konfirmasi` | Admin mengkonfirmasi pesanan | Admin |
| `selesaikan` | Admin menandai pesanan selesai | Admin |
| `batalkan` | Admin atau customer membatalkan | Admin / Customer |

---

## 3. Diagram State Transition

```
                    [konfirmasi]
    ┌─────────────────────────────────────────────┐
    │                                             ▼
  DRAFT ─────────────────────────────────────► CONFIRMED ──[selesaikan]──► COMPLETED
    │                                             │                           (locked)
    │                                             │
    └──────[batalkan]──────┐     ┌──[batalkan]────┘
                           ▼     ▼
                         CANCELLED
                          (locked)

  COMPLETED → * = DITOLAK (dikunci)
  CANCELLED → * = DITOLAK (dikunci)
  DRAFT → COMPLETED = DITOLAK (tidak boleh skip CONFIRMED)
```

---

## 4. Tabel Transisi Status

### 4a. Transisi VALID

| Dari (Current) | Event | Ke (Next) | Catatan |
|---|---|---|---|
| DRAFT | konfirmasi | CONFIRMED | Alur normal |
| DRAFT | batalkan | CANCELLED | Batal sebelum konfirmasi |
| CONFIRMED | selesaikan | COMPLETED | Pesanan selesai |
| CONFIRMED | batalkan | CANCELLED | Batal setelah konfirmasi |

### 4b. Transisi TIDAK VALID

| Dari (Current) | Event | Ke (Next) | Alasan Penolakan |
|---|---|---|---|
| DRAFT | selesaikan | COMPLETED | Harus melewati CONFIRMED dulu |
| DRAFT | — | DRAFT | Status sama, tidak berubah |
| CONFIRMED | konfirmasi | CONFIRMED | Status sama, tidak berubah |
| CONFIRMED | — | DRAFT | Tidak boleh mundur |
| COMPLETED | batalkan | CANCELLED | Status terminal, dikunci |
| COMPLETED | konfirmasi | CONFIRMED | Status terminal, dikunci |
| COMPLETED | — | COMPLETED | Status sama, tidak berubah |
| CANCELLED | konfirmasi | CONFIRMED | Tidak bisa diaktifkan kembali |
| CANCELLED | selesaikan | COMPLETED | Tidak bisa diaktifkan kembali |
| CANCELLED | batalkan | CANCELLED | Status sama, tidak berubah |

---

## 5. Test Cases

### TC-STT-01: Transisi Valid — DRAFT ke CONFIRMED
- **Kondisi Awal:** Pesanan berstatus DRAFT
- **Event:** Admin melakukan konfirmasi
- **Expected Result:** Status berubah menjadi CONFIRMED, pesan sukses dikembalikan
- **Actual Result:** ✅ PASS

### TC-STT-02: Transisi Valid — CONFIRMED ke COMPLETED
- **Kondisi Awal:** Pesanan berstatus CONFIRMED
- **Event:** Admin menandai pesanan selesai
- **Expected Result:** Status berubah menjadi COMPLETED
- **Actual Result:** ✅ PASS

### TC-STT-03: Transisi Valid — DRAFT ke CANCELLED
- **Kondisi Awal:** Pesanan berstatus DRAFT
- **Event:** Pembatalan dilakukan
- **Expected Result:** Status berubah menjadi CANCELLED, stok produk dikembalikan
- **Actual Result:** ✅ PASS

### TC-STT-04: Transisi Valid — CONFIRMED ke CANCELLED
- **Kondisi Awal:** Pesanan berstatus CONFIRMED
- **Event:** Pembatalan setelah konfirmasi
- **Expected Result:** Status berubah menjadi CANCELLED
- **Actual Result:** ✅ PASS

### TC-STT-05: Transisi TIDAK VALID — DRAFT ke COMPLETED
- **Kondisi Awal:** Pesanan berstatus DRAFT
- **Event:** Mencoba langsung selesaikan (skip CONFIRMED)
- **Expected Result:** Ditolak, status tidak berubah, pesan error
- **Actual Result:** ✅ PASS (422 Invalid Transition)

### TC-STT-06: Transisi TIDAK VALID — COMPLETED ke CANCELLED (Locked)
- **Kondisi Awal:** Pesanan berstatus COMPLETED
- **Event:** Mencoba membatalkan pesanan yang sudah selesai
- **Expected Result:** Ditolak dengan pesan "Pesanan selesai tidak dapat diubah"
- **Actual Result:** ✅ PASS

### TC-STT-07: Transisi TIDAK VALID — CANCELLED ke CONFIRMED (Locked)
- **Kondisi Awal:** Pesanan berstatus CANCELLED
- **Event:** Mencoba mengaktifkan kembali pesanan yang dibatalkan
- **Expected Result:** Ditolak dengan pesan "tidak dapat diaktifkan kembali"
- **Actual Result:** ✅ PASS

### TC-STT-08: Transisi TIDAK VALID — Status Sama
- **Kondisi Awal:** Pesanan berstatus DRAFT
- **Event:** Mencoba mengubah ke DRAFT (sama)
- **Expected Result:** Ditolak dengan pesan bahwa status sudah sama
- **Actual Result:** ✅ PASS

### TC-STT-09: Transisi TIDAK VALID — CONFIRMED ke DRAFT (Mundur)
- **Kondisi Awal:** Pesanan berstatus CONFIRMED
- **Event:** Mencoba mundur ke DRAFT
- **Expected Result:** Ditolak, tidak boleh mundur
- **Actual Result:** ✅ PASS

### TC-STT-10: Validasi Status Tidak Dikenal
- **Kondisi Awal:** Pesanan berstatus DRAFT
- **Event:** Mengubah ke status 'SHIPPED' (tidak ada di sistem)
- **Expected Result:** Ditolak dengan pesan "status tidak valid"
- **Actual Result:** ✅ PASS

---

## 6. Ringkasan Eksekusi

| Kategori | Jumlah | Status |
|---|---|---|
| Transisi Valid | 4 | ✅ Semua PASS |
| Transisi Tidak Valid | 6 | ✅ Semua PASS |
| **Total** | **10** | **10/10 PASS** |

---

## 7. Referensi Implementasi

Test cases ini telah diimplementasikan dan diverifikasi di:
- `__tests__/orderTransition.test.ts` (Jest TDD) — 18 unit tests
- `features/order-status.feature` (Cucumber BDD) — 19 scenarios
- `cypress/e2e/api.cy.ts` (Cypress API) — TC-API-14, TC-API-15

Fungsi yang diuji: `lib/business/orderTransition.ts`
API yang diuji: `PATCH /api/orders/:id/status`
