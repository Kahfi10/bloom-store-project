/**
 * lib/business/orderTransition.ts
 *
 * Business rule: validasi transisi status pesanan (PRD §Modul 5)
 *
 * TDD — REFACTOR phase:
 *   - Pisahkan konstanta ke objek yang bisa di-export (reusable)
 *   - Buat error messages lebih deskriptif
 *   - Tambah JSDoc untuk setiap fungsi & tipe
 *   - Semua 18 test harus tetap hijau setelah refactor
 */

/** Status pesanan yang valid dalam sistem */
export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

/** Hasil validasi transisi */
export interface TransitionResult {
  valid:   boolean;
  message: string;
}

/** Daftar semua status yang dikenal */
export const ALL_ORDER_STATUSES: readonly OrderStatus[] = [
  'DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED',
];

/**
 * Peta transisi yang diizinkan — sesuai PRD §Modul 5
 *
 *   DRAFT     → CONFIRMED  (pesanan dikonfirmasi)
 *   DRAFT     → CANCELLED  (pesanan dibatalkan sebelum konfirmasi)
 *   CONFIRMED → COMPLETED  (pesanan selesai)
 *   CONFIRMED → CANCELLED  (pesanan dibatalkan setelah konfirmasi)
 *   COMPLETED → (dikunci)
 *   CANCELLED → (dikunci)
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  DRAFT:     ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

/** Label yang lebih ramah untuk pesan error */
const STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT:     'Draft',
  CONFIRMED: 'Dikonfirmasi',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

/**
 * Validasi apakah transisi dari satu status ke status lain diizinkan.
 *
 * @param from  - Status saat ini
 * @param to    - Status yang ingin dituju
 * @returns     TransitionResult { valid, message }
 *
 * @example
 *   validateOrderTransition('DRAFT', 'CONFIRMED')
 *   // → { valid: true, message: 'Perubahan status berhasil: DRAFT → CONFIRMED.' }
 *
 *   validateOrderTransition('COMPLETED', 'CANCELLED')
 *   // → { valid: false, message: 'Pesanan yang sudah selesai tidak dapat diubah statusnya.' }
 */
export function validateOrderTransition(from: string, to: string): TransitionResult {
  // Guard: status tidak boleh kosong atau tidak dikenal
  if (!from || !ALL_ORDER_STATUSES.includes(from as OrderStatus)) {
    return { valid: false, message: `Status asal '${from || '(kosong)'}' tidak valid.` };
  }
  if (!to || !ALL_ORDER_STATUSES.includes(to as OrderStatus)) {
    return { valid: false, message: `Status tujuan '${to || '(kosong)'}' tidak valid.` };
  }

  const fromStatus = from as OrderStatus;
  const toStatus   = to   as OrderStatus;

  // Guard: status tidak boleh sama
  if (fromStatus === toStatus) {
    return {
      valid:   false,
      message: `Pesanan sudah berstatus ${STATUS_LABEL[fromStatus]} (status sama).`,
    };
  }

  // Guard: status yang sepenuhnya dikunci
  if (fromStatus === 'COMPLETED') {
    return {
      valid:   false,
      message: 'Pesanan yang sudah selesai tidak dapat diubah statusnya.',
    };
  }
  if (fromStatus === 'CANCELLED') {
    return {
      valid:   false,
      message: 'Pesanan yang sudah dibatalkan tidak dapat diaktifkan kembali.',
    };
  }

  // Validasi terhadap peta transisi yang diizinkan
  const allowed = ALLOWED_TRANSITIONS[fromStatus];
  if (!allowed.includes(toStatus)) {
    return {
      valid:   false,
      message: `Perubahan dari "${STATUS_LABEL[fromStatus]}" ke "${STATUS_LABEL[toStatus]}" tidak diizinkan.`,
    };
  }

  return {
    valid:   true,
    message: `Perubahan status berhasil: ${fromStatus} → ${toStatus}.`,
  };
}
