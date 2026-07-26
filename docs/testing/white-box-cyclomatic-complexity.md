# White-Box Testing: Cyclomatic Complexity
## Bloom Store — Analisis Fungsi dengan Percabangan

---

## Fungsi 1: `validateOrderTransition`

### Source Code

```typescript
// lib/business/orderTransition.ts
export function validateOrderTransition(from: string, to: string): TransitionResult {
  // N1: Start
  if (!from || !ALL_ORDER_STATUSES.includes(from as OrderStatus)) {     // D1
    return { valid: false, message: `Status asal '${from}' tidak valid.` }; // N2
  }
  if (!to || !ALL_ORDER_STATUSES.includes(to as OrderStatus)) {         // D2
    return { valid: false, message: `Status tujuan '${to}' tidak valid.` }; // N3
  }

  const fromStatus = from as OrderStatus;
  const toStatus   = to   as OrderStatus;

  if (fromStatus === toStatus) {                                          // D3
    return { valid: false, message: `...status sama...` };               // N4
  }
  if (fromStatus === 'COMPLETED') {                                      // D4
    return { valid: false, message: `...selesai tidak dapat diubah...` }; // N5
  }
  if (fromStatus === 'CANCELLED') {                                      // D5
    return { valid: false, message: `...tidak dapat diaktifkan kembali...` }; // N6
  }

  const allowed = ALLOWED_TRANSITIONS[fromStatus];
  if (!allowed.includes(toStatus)) {                                     // D6
    return { valid: false, message: `...tidak diizinkan...` };           // N7
  }

  return { valid: true, message: `...berhasil...` };                     // N8
}
```

### Control Flow Graph (CFG) Fungsi 1

```
        N1 (Start)
          │
          ▼
   D1: from invalid? ──True──► N2 (return invalid from)
          │False
          ▼
   D2: to invalid? ──True──► N3 (return invalid to)
          │False
          ▼
   D3: from === to? ──True──► N4 (return same status)
          │False
          ▼
   D4: from=COMPLETED? ──True──► N5 (return locked)
          │False
          ▼
   D5: from=CANCELLED? ──True──► N6 (return locked)
          │False
          ▼
   D6: not in allowed? ──True──► N7 (return not allowed)
          │False
          ▼
        N8 (return valid)
```

### Perhitungan Cyclomatic Complexity (CC) Fungsi 1

**Rumus: CC = E - N + 2P**

- **Nodes (N):** N1, N2, N3, N4, N5, N6, N7, N8, D1, D2, D3, D4, D5, D6 = **14 nodes**
- **Edges (E):** 14 false-edges + 6 true-edges = **20 edges**
- **P (connected components):** 1

```
CC = E - N + 2P = 20 - 14 + 2(1) = 8
```

**Atau dengan Rumus Alternatif:**
```
CC = Jumlah Decision Points + 1 = 6 + 1 = 7
```

> **CC = 7** (menggunakan rumus decision points yang lebih umum)

### Independent Paths Fungsi 1

| Path | Jalur | Test Case |
|---|---|---|
| **Path 1** | N1→D1(T)→N2 | `from` tidak valid/kosong |
| **Path 2** | N1→D1(F)→D2(T)→N3 | `to` tidak valid/kosong |
| **Path 3** | N1→D1(F)→D2(F)→D3(T)→N4 | `from === to` |
| **Path 4** | N1→D1(F)→D2(F)→D3(F)→D4(T)→N5 | `from = COMPLETED` |
| **Path 5** | N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(T)→N6 | `from = CANCELLED` |
| **Path 6** | N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(F)→D6(T)→N7 | Transisi tidak diizinkan |
| **Path 7** | N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(F)→D6(F)→N8 | Transisi valid |

### Test Cases Berdasarkan Independent Paths (Fungsi 1)

| TC | Path | Input (from, to) | Expected |
|---|---|---|---|
| TC-WB-01 | Path 1 | `('', 'CONFIRMED')` | `{ valid: false, message: "tidak valid" }` |
| TC-WB-02 | Path 2 | `('DRAFT', 'SHIPPED')` | `{ valid: false, message: "tidak valid" }` |
| TC-WB-03 | Path 3 | `('DRAFT', 'DRAFT')` | `{ valid: false, message: "sama" }` |
| TC-WB-04 | Path 4 | `('COMPLETED', 'CANCELLED')` | `{ valid: false, message: "selesai" }` |
| TC-WB-05 | Path 5 | `('CANCELLED', 'CONFIRMED')` | `{ valid: false, message: "dibatalkan" }` |
| TC-WB-06 | Path 6 | `('DRAFT', 'COMPLETED')` | `{ valid: false, message: "tidak diizinkan" }` |
| TC-WB-07 | Path 7 | `('DRAFT', 'CONFIRMED')` | `{ valid: true, message: "berhasil" }` |

---

## Fungsi 2: `validateCartItem`

### Source Code

```typescript
// lib/business/cartValidation.ts
export function validateCartItem(qty: number, stock: number): CartValidationResult {
  // N1: Start
  if (!Number.isFinite(qty)) {                    // D1
    return { valid: false, message: '...valid...' };  // N2
  }
  if (!Number.isInteger(qty)) {                   // D2
    return { valid: false, message: '...bulat...' };  // N3
  }
  if (qty < MIN_QTY) {                           // D3
    return { valid: false, message: '...minimum...' }; // N4
  }
  if (qty > MAX_QTY) {                           // D4
    return { valid: false, message: '...maksimum...' }; // N5
  }
  if (stock === 0) {                             // D5
    return { valid: false, message: '...habis...' };  // N6
  }
  if (qty > stock) {                             // D6
    return { valid: false, message: '...stok...' };   // N7
  }

  return { valid: true, message: 'valid.' };      // N8
}
```

### Control Flow Graph (CFG) Fungsi 2

```
        N1 (Start)
          │
          ▼
   D1: !isFinite(qty) ──True──► N2 (return: not finite)
          │False
          ▼
   D2: !isInteger(qty) ──True──► N3 (return: not integer)
          │False
          ▼
   D3: qty < MIN(1) ──True──► N4 (return: below minimum)
          │False
          ▼
   D4: qty > MAX(10) ──True──► N5 (return: above maximum)
          │False
          ▼
   D5: stock === 0 ──True──► N6 (return: out of stock)
          │False
          ▼
   D6: qty > stock ──True──► N7 (return: insufficient stock)
          │False
          ▼
        N8 (return: valid)
```

### Perhitungan Cyclomatic Complexity (CC) Fungsi 2

```
CC = Jumlah Decision Points + 1 = 6 + 1 = 7
```

**CC = 7**

### Independent Paths Fungsi 2

| Path | Jalur | Test Case |
|---|---|---|
| **Path 1** | N1→D1(T)→N2 | `qty = NaN` atau `Infinity` |
| **Path 2** | N1→D1(F)→D2(T)→N3 | `qty = 1.5` (desimal) |
| **Path 3** | N1→D1(F)→D2(F)→D3(T)→N4 | `qty = 0` atau negatif |
| **Path 4** | N1→D1(F)→D2(F)→D3(F)→D4(T)→N5 | `qty = 11` (> 10) |
| **Path 5** | N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(T)→N6 | `stock = 0` |
| **Path 6** | N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(F)→D6(T)→N7 | `qty > stock` |
| **Path 7** | N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(F)→D6(F)→N8 | Semua valid |

### Test Cases Berdasarkan Independent Paths (Fungsi 2)

| TC | Path | Input (qty, stock) | Expected |
|---|---|---|---|
| TC-WB-08 | Path 1 | `(NaN, 10)` | `{ valid: false, message: "valid" }` |
| TC-WB-09 | Path 2 | `(1.5, 10)` | `{ valid: false, message: "bulat" }` |
| TC-WB-10 | Path 3 | `(0, 10)` | `{ valid: false, message: "1" }` |
| TC-WB-11 | Path 4 | `(11, 50)` | `{ valid: false, message: "10" }` |
| TC-WB-12 | Path 5 | `(1, 0)` | `{ valid: false, message: "habis" }` |
| TC-WB-13 | Path 6 | `(5, 3)` | `{ valid: false, message: "stok" }` |
| TC-WB-14 | Path 7 | `(3, 10)` | `{ valid: true, message: "valid" }` |

---

## Ringkasan Cyclomatic Complexity

| Fungsi | Nodes | Edges | CC | Paths |
|---|---|---|---|---|
| `validateOrderTransition` | 14 | 20 | **7** | 7 |
| `validateCartItem` | 14 | 20 | **7** | 7 |

> **Interpretasi CC:**
> - CC = 1–5: Sederhana, risiko rendah
> - CC = 6–10: Cukup kompleks *(kedua fungsi masuk kategori ini)*
> - CC > 10: Sangat kompleks, susah ditest

CC = 7 berarti kedua fungsi **cukup kompleks** dengan 7 jalur independen masing-masing, semua harus dicover oleh test cases.

---

## Verifikasi: Test Cases Sudah Diimplementasikan

| TC | File | Status |
|---|---|---|
| TC-WB-01 s/d TC-WB-07 | `__tests__/orderTransition.test.ts` | ✅ 18 tests passing |
| TC-WB-08 s/d TC-WB-14 | `__tests__/cartValidation.test.ts` | ✅ 20 tests passing |
