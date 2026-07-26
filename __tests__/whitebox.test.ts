/**
 * __tests__/whitebox.test.ts
 * White-Box Testing — Test cases berdasarkan Independent Paths
 *
 * Fungsi 1: validateOrderTransition (CC = 7, 7 independent paths)
 * Fungsi 2: validateCartItem        (CC = 7, 7 independent paths)
 *
 * Setiap test case meng-cover tepat satu jalur independen.
 */

import { validateOrderTransition } from '@/lib/business/orderTransition';
import { validateCartItem }        from '@/lib/business/cartValidation';

// ──────────────────────────────────────────────────────────────────────────────
// FUNGSI 1: validateOrderTransition — CC = 7
// ──────────────────────────────────────────────────────────────────────────────
describe('White-Box: validateOrderTransition (CC=7)', () => {

  /**
   * Path 1: N1→D1(True)→N2
   * Kondisi: `from` kosong/tidak dikenal → return invalid from
   */
  it('TC-WB-01 Path 1: from kosong → return invalid', () => {
    const result = validateOrderTransition('', 'CONFIRMED');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/tidak valid/i);
  });

  /**
   * Path 2: N1→D1(F)→D2(True)→N3
   * Kondisi: `to` tidak dikenal → return invalid to
   */
  it('TC-WB-02 Path 2: to tidak dikenal → return invalid', () => {
    const result = validateOrderTransition('DRAFT', 'SHIPPED');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/tidak valid/i);
  });

  /**
   * Path 3: N1→D1(F)→D2(F)→D3(True)→N4
   * Kondisi: from === to → return status sama
   */
  it('TC-WB-03 Path 3: from === to → return status sama', () => {
    const result = validateOrderTransition('DRAFT', 'DRAFT');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/sama/i);
  });

  /**
   * Path 4: N1→D1(F)→D2(F)→D3(F)→D4(True)→N5
   * Kondisi: from = COMPLETED (locked) → return locked
   */
  it('TC-WB-04 Path 4: from=COMPLETED (locked) → return locked', () => {
    const result = validateOrderTransition('COMPLETED', 'CANCELLED');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/selesai/i);
  });

  /**
   * Path 5: N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(True)→N6
   * Kondisi: from = CANCELLED (locked) → return locked
   */
  it('TC-WB-05 Path 5: from=CANCELLED (locked) → return locked', () => {
    const result = validateOrderTransition('CANCELLED', 'CONFIRMED');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/dibatalkan/i);
  });

  /**
   * Path 6: N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(F)→D6(True)→N7
   * Kondisi: transisi tidak ada di ALLOWED_TRANSITIONS → return not allowed
   */
  it('TC-WB-06 Path 6: transisi tidak diizinkan → return not allowed', () => {
    const result = validateOrderTransition('DRAFT', 'COMPLETED'); // skip CONFIRMED
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  /**
   * Path 7: N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(F)→D6(False)→N8
   * Kondisi: semua guard lolos → return valid
   */
  it('TC-WB-07 Path 7: transisi valid → return success', () => {
    const result = validateOrderTransition('DRAFT', 'CONFIRMED');
    expect(result.valid).toBe(true);
    expect(result.message).toMatch(/berhasil/i);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// FUNGSI 2: validateCartItem — CC = 7
// ──────────────────────────────────────────────────────────────────────────────
describe('White-Box: validateCartItem (CC=7)', () => {

  /**
   * Path 1: N1→D1(True)→N2
   * Kondisi: qty = NaN → return not finite
   */
  it('TC-WB-08 Path 1: qty=NaN → return not finite', () => {
    const result = validateCartItem(NaN, 10);
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  /**
   * Path 2: N1→D1(F)→D2(True)→N3
   * Kondisi: qty = 1.5 (desimal) → return not integer
   */
  it('TC-WB-09 Path 2: qty=1.5 (desimal) → return not integer', () => {
    const result = validateCartItem(1.5, 10);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/bulat/i);
  });

  /**
   * Path 3: N1→D1(F)→D2(F)→D3(True)→N4
   * Kondisi: qty = 0 < MIN(1) → return below minimum
   */
  it('TC-WB-10 Path 3: qty=0 < MIN_QTY → return minimum error', () => {
    const result = validateCartItem(0, 10);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/1/);
  });

  /**
   * Path 4: N1→D1(F)→D2(F)→D3(F)→D4(True)→N5
   * Kondisi: qty = 11 > MAX(10) → return above maximum
   */
  it('TC-WB-11 Path 4: qty=11 > MAX_QTY → return maximum error', () => {
    const result = validateCartItem(11, 50);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/10/);
  });

  /**
   * Path 5: N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(True)→N6
   * Kondisi: stock = 0 → return out of stock
   */
  it('TC-WB-12 Path 5: stock=0 → return habis', () => {
    const result = validateCartItem(1, 0);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/habis/i);
  });

  /**
   * Path 6: N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(F)→D6(True)→N7
   * Kondisi: qty > stock → return insufficient stock
   */
  it('TC-WB-13 Path 6: qty=5 > stock=3 → return stok tidak cukup', () => {
    const result = validateCartItem(5, 3);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/stok/i);
  });

  /**
   * Path 7: N1→D1(F)→D2(F)→D3(F)→D4(F)→D5(F)→D6(False)→N8
   * Kondisi: semua guard lolos → return valid
   */
  it('TC-WB-14 Path 7: semua kondisi valid → return valid', () => {
    const result = validateCartItem(3, 10);
    expect(result.valid).toBe(true);
    expect(result.message).toMatch(/valid/i);
  });
});
