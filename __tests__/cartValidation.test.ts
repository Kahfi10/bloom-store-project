/**
 * TDD — Fungsi 2: validateCartItem
 *
 * Siklus:
 *   RED    → Test ini ditulis SEBELUM ada implementasi (semua gagal)
 *   GREEN  → Implementasi minimal ditulis di lib/business/cartValidation.ts
 *   REFACTOR → Kode dibersihkan, test tetap hijau
 *
 * PRD §Modul 3 — Aturan validasi keranjang belanja:
 *   - Batas bawah: 1 unit (minimum)
 *   - Batas atas : 10 unit per produk (maximum)
 *   - Tidak boleh melebihi stok yang tersedia
 *   - Menolak nilai negatif, nol, pecahan (desimal), atau bukan angka
 */

import { validateCartItem } from '@/lib/business/cartValidation';

describe('validateCartItem', () => {

  // ── Skenario POSITIF ──────────────────────────────────────────────────────

  test('✅ qty=1, stock=10 → valid (minimum quantity)', () => {
    const result = validateCartItem(1, 10);
    expect(result.valid).toBe(true);
    expect(result.message).toContain('valid');
  });

  test('✅ qty=10, stock=10 → valid (maximum quantity = boundary atas)', () => {
    const result = validateCartItem(10, 10);
    expect(result.valid).toBe(true);
  });

  test('✅ qty=5, stock=10 → valid (nilai tengah)', () => {
    const result = validateCartItem(5, 10);
    expect(result.valid).toBe(true);
  });

  test('✅ qty=1, stock=1 → valid (stok tepat sama dengan qty)', () => {
    const result = validateCartItem(1, 1);
    expect(result.valid).toBe(true);
  });

  test('✅ qty=10, stock=25 → valid (qty max, stok berlimpah)', () => {
    const result = validateCartItem(10, 25);
    expect(result.valid).toBe(true);
  });

  // ── Skenario NEGATIF — batas bawah ───────────────────────────────────────

  test('❌ qty=0 → tidak valid (nol tidak diizinkan)', () => {
    const result = validateCartItem(0, 10);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('1');
  });

  test('❌ qty=-1 → tidak valid (negatif tidak diizinkan)', () => {
    const result = validateCartItem(-1, 10);
    expect(result.valid).toBe(false);
  });

  test('❌ qty=-100 → tidak valid (negatif ekstrem)', () => {
    const result = validateCartItem(-100, 10);
    expect(result.valid).toBe(false);
  });

  // ── Skenario NEGATIF — batas atas ────────────────────────────────────────

  test('❌ qty=11 → tidak valid (melebihi maksimum 10)', () => {
    const result = validateCartItem(11, 50);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('10');
  });

  test('❌ qty=100 → tidak valid (jauh melebihi maksimum)', () => {
    const result = validateCartItem(100, 200);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('10');
  });

  // ── Skenario NEGATIF — stok tidak mencukupi ──────────────────────────────

  test('❌ qty=5, stock=3 → tidak valid (stok tidak mencukupi)', () => {
    const result = validateCartItem(5, 3);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('stok');
  });

  test('❌ qty=1, stock=0 → tidak valid (produk habis)', () => {
    const result = validateCartItem(1, 0);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('habis');
  });

  test('❌ qty=10, stock=9 → tidak valid (1 unit kurang dari cukup)', () => {
    const result = validateCartItem(10, 9);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('stok');
  });

  // ── Skenario NEGATIF — tipe data tidak valid ─────────────────────────────

  test('❌ qty=1.5 (desimal) → tidak valid (harus bilangan bulat)', () => {
    const result = validateCartItem(1.5, 10);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('bulat');
  });

  test('❌ qty=2.9 (desimal) → tidak valid', () => {
    const result = validateCartItem(2.9, 10);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('bulat');
  });

  test('❌ qty=NaN → tidak valid', () => {
    const result = validateCartItem(NaN, 10);
    expect(result.valid).toBe(false);
  });

  test('❌ qty=Infinity → tidak valid', () => {
    const result = validateCartItem(Infinity, 10);
    expect(result.valid).toBe(false);
  });

  // ── Skenario BOUNDARY (nilai batas tepat) ─────────────────────────────────

  test('🔲 Boundary bawah: qty=1 valid, qty=0 tidak valid', () => {
    expect(validateCartItem(1, 10).valid).toBe(true);
    expect(validateCartItem(0, 10).valid).toBe(false);
  });

  test('🔲 Boundary atas: qty=10 valid, qty=11 tidak valid', () => {
    expect(validateCartItem(10, 20).valid).toBe(true);
    expect(validateCartItem(11, 20).valid).toBe(false);
  });

  test('🔲 Boundary stok: qty=stock valid, qty=stock+1 tidak valid', () => {
    const stock = 5;
    expect(validateCartItem(stock,     stock).valid).toBe(true);
    expect(validateCartItem(stock + 1, stock).valid).toBe(false);
  });

});
