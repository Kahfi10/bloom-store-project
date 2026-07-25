# features/order-status.feature
# BDD — Status Pesanan (PRD §Modul 5)
# Min 5 skenario: positif, negatif, boundary, status changes, Scenario Outline

Feature: Transisi Status Pesanan
  Sebagai pelanggan Bloom Store
  Saya ingin status pesanan saya dapat diubah sesuai alur yang benar
  Agar proses pemesanan berjalan dengan tertib dan transparan

  # ─── Skenario Positif (transisi yang diizinkan) ────────────────────────────

  Scenario: Mengkonfirmasi pesanan yang baru dibuat
    Given pesanan berada pada status "DRAFT"
    When admin mengubah status menjadi "CONFIRMED"
    Then sistem menerima perubahan status
    And status pesanan menjadi "CONFIRMED"

  Scenario: Menyelesaikan pesanan yang sudah dikonfirmasi
    Given pesanan berada pada status "CONFIRMED"
    When admin mengubah status menjadi "COMPLETED"
    Then sistem menerima perubahan status
    And status pesanan menjadi "COMPLETED"

  Scenario: Membatalkan pesanan yang masih Draft
    Given pesanan berada pada status "DRAFT"
    When admin mengubah status menjadi "CANCELLED"
    Then sistem menerima perubahan status
    And status pesanan menjadi "CANCELLED"

  Scenario: Membatalkan pesanan yang sudah dikonfirmasi
    Given pesanan berada pada status "CONFIRMED"
    When admin mengubah status menjadi "CANCELLED"
    Then sistem menerima perubahan status

  # ─── Skenario Negatif (transisi yang TIDAK diizinkan) ─────────────────────

  Scenario: Menolak pesanan Draft langsung ke Completed (lewati Confirmed)
    Given pesanan berada pada status "DRAFT"
    When admin mengubah status menjadi "COMPLETED"
    Then sistem menolak perubahan status
    And pesan penolakan tidak kosong

  Scenario: Menolak perubahan status pesanan yang sudah selesai
    Given pesanan berada pada status "COMPLETED"
    When admin mengubah status menjadi "CANCELLED"
    Then sistem menolak perubahan status
    And pesan penolakan mengandung kata "selesai"

  Scenario: Menolak mengaktifkan kembali pesanan yang dibatalkan
    Given pesanan berada pada status "CANCELLED"
    When admin mengubah status menjadi "CONFIRMED"
    Then sistem menolak perubahan status
    And pesan penolakan mengandung kata "dibatalkan"

  Scenario: Menolak mundur dari Confirmed ke Draft
    Given pesanan berada pada status "CONFIRMED"
    When admin mengubah status menjadi "DRAFT"
    Then sistem menolak perubahan status

  # ─── Skenario Status Sama ─────────────────────────────────────────────────

  Scenario: Menolak perubahan ke status yang sama
    Given pesanan berada pada status "DRAFT"
    When admin mengubah status menjadi "DRAFT"
    Then sistem menolak perubahan status
    And pesan penolakan mengandung kata "sama"

  # ─── Scenario Outline — Semua Transisi Valid dan Tidak Valid ──────────────

  Scenario Outline: Validasi berbagai kombinasi transisi status pesanan
    Given pesanan berada pada status "<dari>"
    When admin mengubah status menjadi "<ke>"
    Then hasil transisi adalah <hasil>

    Examples:
      | dari      | ke        | hasil   |
      | DRAFT     | CONFIRMED | valid   |
      | DRAFT     | CANCELLED | valid   |
      | CONFIRMED | COMPLETED | valid   |
      | CONFIRMED | CANCELLED | valid   |
      | DRAFT     | COMPLETED | invalid |
      | DRAFT     | DRAFT     | invalid |
      | CONFIRMED | DRAFT     | invalid |
      | COMPLETED | CONFIRMED | invalid |
      | COMPLETED | CANCELLED | invalid |
      | CANCELLED | DRAFT     | invalid |
      | CANCELLED | CONFIRMED | invalid |
