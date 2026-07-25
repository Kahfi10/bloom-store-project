# features/cart.feature
# BDD — Keranjang Belanja (PRD §Modul 3)
# Min 5 skenario: positif, negatif, boundary, Scenario Outline

Feature: Validasi Keranjang Belanja
  Sebagai pelanggan Bloom Store
  Saya ingin dapat menambahkan bunga ke keranjang dengan jumlah yang valid
  Agar saya bisa memesan produk sesuai kebutuhan

  # ─── Skenario Positif ──────────────────────────────────────────────────────

  Scenario: Menambahkan produk dengan jumlah valid
    Given stok produk "Anggrek Bulan" tersedia sebanyak 15 unit
    When pelanggan ingin membeli 3 unit
    Then sistem menerima penambahan ke keranjang
    And pesan "valid" ditampilkan

  Scenario: Membeli tepat 1 unit (batas minimum)
    Given stok produk "Red Rose" tersedia sebanyak 5 unit
    When pelanggan ingin membeli 1 unit
    Then sistem menerima penambahan ke keranjang

  Scenario: Membeli tepat 10 unit (batas maksimum)
    Given stok produk "Lavender" tersedia sebanyak 20 unit
    When pelanggan ingin membeli 10 unit
    Then sistem menerima penambahan ke keranjang

  # ─── Skenario Negatif ──────────────────────────────────────────────────────

  Scenario: Menolak jumlah nol
    Given stok produk "Krisan" tersedia sebanyak 20 unit
    When pelanggan ingin membeli 0 unit
    Then sistem menolak penambahan ke keranjang
    And pesan error mengandung kata "1"

  Scenario: Menolak jumlah negatif
    Given stok produk "Krisan" tersedia sebanyak 20 unit
    When pelanggan ingin membeli -5 unit
    Then sistem menolak penambahan ke keranjang

  Scenario: Menolak jumlah melebihi batas maksimum 10
    Given stok produk "Lavender" tersedia sebanyak 50 unit
    When pelanggan ingin membeli 11 unit
    Then sistem menolak penambahan ke keranjang
    And pesan error mengandung kata "10"

  Scenario: Menolak pembelian saat stok habis
    Given stok produk "Hydrangea" tersedia sebanyak 0 unit
    When pelanggan ingin membeli 1 unit
    Then sistem menolak penambahan ke keranjang
    And pesan error mengandung kata "habis"

  Scenario: Menolak jumlah melebihi stok yang tersedia
    Given stok produk "Baby's Breath" tersedia sebanyak 3 unit
    When pelanggan ingin membeli 5 unit
    Then sistem menolak penambahan ke keranjang
    And pesan error mengandung kata "stok"

  Scenario: Menolak jumlah desimal
    Given stok produk "Lili Putih" tersedia sebanyak 12 unit
    When pelanggan ingin membeli 2.5 unit
    Then sistem menolak penambahan ke keranjang
    And pesan error mengandung kata "bulat"

  # ─── Scenario Outline — Batas Kuantitas (boundary + valid/invalid) ─────────

  Scenario Outline: Validasi berbagai jumlah pembelian terhadap batas sistem
    Given stok produk tersedia sebanyak <stok> unit
    When pelanggan ingin membeli <qty> unit
    Then hasil validasi adalah <hasil>

    Examples:
      | qty | stok | hasil   |
      | 1   | 10   | valid   |
      | 10  | 10   | valid   |
      | 5   | 10   | valid   |
      | 0   | 10   | invalid |
      | -1  | 10   | invalid |
      | 11  | 10   | invalid |
      | 5   | 3    | invalid |
      | 1   | 0    | invalid |
