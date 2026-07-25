/**
 * TDD — Fungsi 1: validateOrderTransition
 *
 * Siklus:
 *   RED    → Test ini ditulis SEBELUM ada implementasi (semua gagal)
 *   GREEN  → Implementasi minimal ditulis di lib/business/orderTransition.ts
 *   REFACTOR → Kode dibersihkan, test tetap hijau
 *
 * PRD §Modul 5 — Aturan transisi status pesanan:
 *   DRAFT     → CONFIRMED atau CANCELLED
 *   CONFIRMED → COMPLETED atau CANCELLED
 *   COMPLETED → (dikunci, tidak bisa diubah)
 *   CANCELLED → (dikunci, tidak bisa diaktifkan kembali)
 */

import { validateOrderTransition } from '@/lib/business/orderTransition';

describe('validateOrderTransition', () => {

  // ── Skenario POSITIF (transisi yang diizinkan) ────────────────────────────

  test('✅ DRAFT → CONFIRMED diizinkan', () => {
    const result = validateOrderTransition('DRAFT', 'CONFIRMED');
    expect(result.valid).toBe(true);
    expect(result.message).toContain('berhasil');
  });

  test('✅ DRAFT → CANCELLED diizinkan', () => {
    const result = validateOrderTransition('DRAFT', 'CANCELLED');
    expect(result.valid).toBe(true);
    expect(result.message).toContain('berhasil');
  });

  test('✅ CONFIRMED → COMPLETED diizinkan', () => {
    const result = validateOrderTransition('CONFIRMED', 'COMPLETED');
    expect(result.valid).toBe(true);
    expect(result.message).toContain('berhasil');
  });

  test('✅ CONFIRMED → CANCELLED diizinkan', () => {
    const result = validateOrderTransition('CONFIRMED', 'CANCELLED');
    expect(result.valid).toBe(true);
    expect(result.message).toContain('berhasil');
  });

  // ── Skenario NEGATIF (transisi yang TIDAK diizinkan) ─────────────────────

  test('❌ DRAFT → COMPLETED tidak diizinkan (lewati CONFIRMED)', () => {
    const result = validateOrderTransition('DRAFT', 'COMPLETED');
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  test('❌ CONFIRMED → DRAFT tidak diizinkan (mundur)', () => {
    const result = validateOrderTransition('CONFIRMED', 'DRAFT');
    expect(result.valid).toBe(false);
  });

  test('❌ COMPLETED → CANCELLED tidak diizinkan (pesanan selesai dikunci)', () => {
    const result = validateOrderTransition('COMPLETED', 'CANCELLED');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('selesai');
  });

  test('❌ COMPLETED → CONFIRMED tidak diizinkan (pesanan selesai dikunci)', () => {
    const result = validateOrderTransition('COMPLETED', 'CONFIRMED');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('selesai');
  });

  test('❌ CANCELLED → CONFIRMED tidak diizinkan (tidak bisa diaktifkan kembali)', () => {
    const result = validateOrderTransition('CANCELLED', 'CONFIRMED');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('dibatalkan');
  });

  test('❌ CANCELLED → DRAFT tidak diizinkan (tidak bisa diaktifkan kembali)', () => {
    const result = validateOrderTransition('CANCELLED', 'DRAFT');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('dibatalkan');
  });

  // ── Skenario STATUS SAMA ──────────────────────────────────────────────────

  test('❌ DRAFT → DRAFT tidak diizinkan (status sama)', () => {
    const result = validateOrderTransition('DRAFT', 'DRAFT');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('sama');
  });

  test('❌ COMPLETED → COMPLETED tidak diizinkan (status sama + dikunci)', () => {
    const result = validateOrderTransition('COMPLETED', 'COMPLETED');
    expect(result.valid).toBe(false);
  });

  // ── Skenario STATUS TIDAK VALID ───────────────────────────────────────────

  test('❌ Status tidak dikenal sebagai "from" harus ditolak', () => {
    const result = validateOrderTransition('UNKNOWN', 'CONFIRMED');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('tidak valid');
  });

  test('❌ Status tidak dikenal sebagai "to" harus ditolak', () => {
    const result = validateOrderTransition('DRAFT', 'SHIPPED');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('tidak valid');
  });

  test('❌ String kosong harus ditolak', () => {
    const result = validateOrderTransition('', 'CONFIRMED');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('tidak valid');
  });

  // ── Skenario BOUNDARY ─────────────────────────────────────────────────────

  test('🔲 Semua transisi DRAFT yang mungkin ada 2 saja', () => {
    const allowed = ['CONFIRMED', 'CANCELLED'];
    const allStatuses = ['DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

    allStatuses.forEach((to) => {
      const result = validateOrderTransition('DRAFT', to);
      if (allowed.includes(to)) {
        expect(result.valid).toBe(true);
      } else {
        expect(result.valid).toBe(false);
      }
    });
  });

  test('🔲 COMPLETED sepenuhnya dikunci — tidak ada transisi yang valid', () => {
    const allStatuses = ['DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    allStatuses.forEach((to) => {
      const result = validateOrderTransition('COMPLETED', to);
      expect(result.valid).toBe(false);
    });
  });

  test('🔲 CANCELLED sepenuhnya dikunci — tidak ada transisi yang valid', () => {
    const allStatuses = ['DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    allStatuses.forEach((to) => {
      const result = validateOrderTransition('CANCELLED', to);
      expect(result.valid).toBe(false);
    });
  });

});
