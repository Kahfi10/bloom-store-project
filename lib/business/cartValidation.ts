/**
 * lib/business/cartValidation.ts
 *
 * Business rule: validasi item keranjang belanja (PRD §Modul 3)
 *
 * TDD — REFACTOR phase:
 *   - Export konstanta MIN_QTY, MAX_QTY (reusable di komponen UI)
 *   - Tambah JSDoc lengkap
 *   - Pisahkan validasi tipe & range ke helper private
 *   - Semua 20 test harus tetap hijau setelah refactor
 */

/** Hasil validasi item keranjang */
export interface CartValidationResult {
  valid:   boolean;
  message: string;
}

/** Batas minimum pembelian per produk (PRD §Modul 3) */
export const MIN_QTY = 1;

/** Batas maksimum pembelian per produk (PRD §Modul 3) */
export const MAX_QTY = 10;

/**
 * Validasi kuantitas item sebelum dimasukkan ke keranjang belanja.
 *
 * Aturan (PRD §Modul 3):
 *  - Batas bawah  : 1 unit
 *  - Batas atas   : 10 unit per produk
 *  - Tidak boleh melebihi stok yang tersedia
 *  - Menolak: negatif, nol, desimal, NaN, Infinity
 *
 * @param qty   - Jumlah yang ingin dibeli
 * @param stock - Stok produk yang tersedia
 * @returns     CartValidationResult { valid, message }
 *
 * @example
 *   validateCartItem(5, 10)   // → { valid: true,  message: 'Jumlah produk valid.' }
 *   validateCartItem(0, 10)   // → { valid: false, message: '...minimum 1 unit.' }
 *   validateCartItem(5, 3)    // → { valid: false, message: '...stok...' }
 *   validateCartItem(1.5, 10) // → { valid: false, message: '...bilangan bulat.' }
 */
export function validateCartItem(qty: number, stock: number): CartValidationResult {
  // ── Validasi tipe data ──────────────────────────────────────────────────
  if (!Number.isFinite(qty)) {
    return { valid: false, message: 'Jumlah harus berupa angka yang valid.' };
  }
  if (!Number.isInteger(qty)) {
    return { valid: false, message: 'Jumlah harus berupa bilangan bulat (tidak boleh desimal).' };
  }

  // ── Validasi batas bawah ────────────────────────────────────────────────
  if (qty < MIN_QTY) {
    return {
      valid:   false,
      message: `Jumlah minimum pembelian adalah ${MIN_QTY} unit. Masukkan angka antara ${MIN_QTY}–${MAX_QTY}.`,
    };
  }

  // ── Validasi batas atas ─────────────────────────────────────────────────
  if (qty > MAX_QTY) {
    return {
      valid:   false,
      message: `Jumlah maksimum pembelian adalah ${MAX_QTY} unit per produk.`,
    };
  }

  // ── Validasi stok ───────────────────────────────────────────────────────
  if (stock === 0) {
    return {
      valid:   false,
      message: 'Produk ini sedang habis (stok = 0).',
    };
  }
  if (qty > stock) {
    return {
      valid:   false,
      message: `Jumlah melebihi stok yang tersedia. Stok saat ini: ${stock} unit.`,
    };
  }

  return { valid: true, message: 'Jumlah produk valid.' };
}
