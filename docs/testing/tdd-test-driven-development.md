# Test-Driven Development (TDD)
## Bloom Store — Siklus Red → Green → Refactor

---

## Pendahuluan

Test-Driven Development (TDD) adalah pendekatan pengembangan perangkat lunak di mana **test ditulis lebih dulu** sebelum implementasi kode. Siklus TDD terdiri dari tiga fase:

1. **RED** — Tulis test yang gagal (fungsi belum ada)
2. **GREEN** — Tulis implementasi minimal agar test lulus
3. **REFACTOR** — Bersihkan kode tanpa mengubah perilaku

---

## Setup & Konfigurasi

**Framework:** Jest 30 + ts-jest  
**Bahasa:** TypeScript  
**File konfigurasi:** `jest.config.ts`

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  verbose: true,
};
export default config;
```

**Cara menjalankan:**
```bash
npm test                  # Semua test
npm run test:coverage     # Dengan coverage report
```

---

## Fungsi Target 1: `validateOrderTransition`

### Lokasi File
`lib/business/orderTransition.ts`

### PRD Reference
PRD §Modul 5 — Aturan transisi status pesanan

### Fase RED — Test yang Gagal

File: `__tests__/orderTransition.test.ts`

Test ditulis **sebelum** ada implementasi. Saat pertama kali dijalankan:
```
FAIL __tests__/orderTransition.test.ts
  ● Cannot find module '@/lib/business/orderTransition'
  Tests: 0 total
```

### Fase GREEN — Implementasi Minimal

```typescript
// lib/business/orderTransition.ts (versi minimal)
const ALLOWED = {
  DRAFT: ['CONFIRMED','CANCELLED'],
  CONFIRMED: ['COMPLETED','CANCELLED'],
  COMPLETED: [], CANCELLED: []
};
export function validateOrderTransition(from: string, to: string) {
  if (!from || !ALL.includes(from)) return { valid: false, message: '...' };
  if (!to || !ALL.includes(to))   return { valid: false, message: '...' };
  if (from === to) return { valid: false, message: '...sama...' };
  if (from === 'COMPLETED') return { valid: false, message: '...selesai...' };
  if (from === 'CANCELLED') return { valid: false, message: '...dibatalkan...' };
  if (!ALLOWED[from].includes(to)) return { valid: false, message: '...' };
  return { valid: true, message: '...berhasil...' };
}
```

Hasil setelah GREEN:
```
PASS __tests__/orderTransition.test.ts
  Tests: 18 passed, 18 total
```

### Fase REFACTOR

Perbaikan kode tanpa mengubah perilaku:
- Export konstanta `ALL_ORDER_STATUSES` dan `ALLOWED_TRANSITIONS` (reusable)
- Tambah `STATUS_LABEL` untuk pesan error yang lebih deskriptif
- Tambah JSDoc lengkap untuk setiap fungsi dan tipe

Hasil setelah REFACTOR (masih hijau):
```
PASS __tests__/orderTransition.test.ts
  Tests: 18 passed, 18 total ✅
```

### Skenario Test (18 test cases)

| # | Deskripsi | Input | Expected |
|---|---|---|---|
| 1 | DRAFT→CONFIRMED valid | `('DRAFT','CONFIRMED')` | `valid: true` |
| 2 | DRAFT→CANCELLED valid | `('DRAFT','CANCELLED')` | `valid: true` |
| 3 | CONFIRMED→COMPLETED valid | `('CONFIRMED','COMPLETED')` | `valid: true` |
| 4 | CONFIRMED→CANCELLED valid | `('CONFIRMED','CANCELLED')` | `valid: true` |
| 5 | DRAFT→COMPLETED tidak valid | `('DRAFT','COMPLETED')` | `valid: false` |
| 6 | CONFIRMED→DRAFT tidak valid | `('CONFIRMED','DRAFT')` | `valid: false` |
| 7 | COMPLETED→CANCELLED (locked) | `('COMPLETED','CANCELLED')` | `valid: false`, msg: 'selesai' |
| 8 | COMPLETED→CONFIRMED (locked) | `('COMPLETED','CONFIRMED')` | `valid: false` |
| 9 | CANCELLED→CONFIRMED (locked) | `('CANCELLED','CONFIRMED')` | `valid: false`, msg: 'dibatalkan' |
| 10 | CANCELLED→DRAFT (locked) | `('CANCELLED','DRAFT')` | `valid: false` |
| 11 | Status sama DRAFT→DRAFT | `('DRAFT','DRAFT')` | `valid: false`, msg: 'sama' |
| 12 | Status sama COMPLETED→COMPLETED | `('COMPLETED','COMPLETED')` | `valid: false` |
| 13 | `from` tidak dikenal | `('UNKNOWN','CONFIRMED')` | `valid: false`, msg: 'tidak valid' |
| 14 | `to` tidak dikenal | `('DRAFT','SHIPPED')` | `valid: false`, msg: 'tidak valid' |
| 15 | String kosong | `('','CONFIRMED')` | `valid: false` |
| 16 | Boundary DRAFT (2 transisi valid) | Semua status | Hanya CONFIRMED, CANCELLED valid |
| 17 | COMPLETED sepenuhnya locked | Semua status | Semua false |
| 18 | CANCELLED sepenuhnya locked | Semua status | Semua false |

---

## Fungsi Target 2: `validateCartItem`

### Lokasi File
`lib/business/cartValidation.ts`

### PRD Reference
PRD §Modul 3 — Validasi jumlah item keranjang belanja

### Aturan Bisnis

- Minimum: 1 unit
- Maksimum: 10 unit per produk
- Tidak boleh melebihi stok tersedia
- Menolak nilai negatif, nol, desimal, NaN, Infinity

### Fase RED
```
FAIL __tests__/cartValidation.test.ts
  ● Cannot find module '@/lib/business/cartValidation'
```

### Fase GREEN
```typescript
export function validateCartItem(qty: number, stock: number) {
  if (!Number.isFinite(qty)) return { valid: false, message: '...' };
  if (!Number.isInteger(qty)) return { valid: false, message: '...bulat...' };
  if (qty < 1)  return { valid: false, message: '...minimum 1...' };
  if (qty > 10) return { valid: false, message: '...maksimum 10...' };
  if (stock === 0) return { valid: false, message: '...habis...' };
  if (qty > stock) return { valid: false, message: '...stok...' };
  return { valid: true, message: 'valid.' };
}
```

### Fase REFACTOR
- Export `MIN_QTY = 1` dan `MAX_QTY = 10` (reusable di komponen UI)
- Pesan error lebih deskriptif dengan nilai batas yang jelas
- Tambah JSDoc dengan contoh penggunaan

### Skenario Test (20 test cases)

| # | Deskripsi | Input (qty, stock) | Expected |
|---|---|---|---|
| 1 | Qty valid (nilai normal) | `(3, 10)` | `valid: true` |
| 2 | Qty minimum (boundary bawah) | `(1, 10)` | `valid: true` |
| 3 | Qty maksimum (boundary atas) | `(10, 10)` | `valid: true` |
| 4 | Qty = stok (tepat sama) | `(1, 1)` | `valid: true` |
| 5 | Stok berlimpah | `(10, 25)` | `valid: true` |
| 6 | Qty = 0 (nol) | `(0, 10)` | `valid: false`, msg: '1' |
| 7 | Qty = -1 (negatif) | `(-1, 10)` | `valid: false` |
| 8 | Qty = -100 (negatif ekstrem) | `(-100, 10)` | `valid: false` |
| 9 | Qty = 11 (melebihi max) | `(11, 50)` | `valid: false`, msg: '10' |
| 10 | Qty = 100 (jauh di atas max) | `(100, 200)` | `valid: false`, msg: '10' |
| 11 | Qty > stok | `(5, 3)` | `valid: false`, msg: 'stok' |
| 12 | Stok habis | `(1, 0)` | `valid: false`, msg: 'habis' |
| 13 | Stok kurang 1 | `(10, 9)` | `valid: false`, msg: 'stok' |
| 14 | Desimal (1.5) | `(1.5, 10)` | `valid: false`, msg: 'bulat' |
| 15 | Desimal (2.9) | `(2.9, 10)` | `valid: false`, msg: 'bulat' |
| 16 | NaN | `(NaN, 10)` | `valid: false` |
| 17 | Infinity | `(Infinity, 10)` | `valid: false` |
| 18 | Boundary bawah (1 valid, 0 tidak) | Both | Sesuai |
| 19 | Boundary atas (10 valid, 11 tidak) | Both | Sesuai |
| 20 | Boundary stok (=stok valid, +1 tidak) | Both | Sesuai |

---

## Hasil Akhir

```
Test Suites: 3 passed, 3 total
Tests:       52 passed, 52 total
Time:        0.67s
```

| Suite | Test | Status |
|---|---|---|
| `orderTransition.test.ts` | 18 | ✅ PASS |
| `cartValidation.test.ts` | 20 | ✅ PASS |
| `whitebox.test.ts` | 14 | ✅ PASS |
| **Total** | **52** | **✅ SEMUA PASS** |
