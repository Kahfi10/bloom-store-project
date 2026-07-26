# Otomatisasi Pengujian UI & API
## Bloom Store — Cypress dengan Page Object Model

---

## Pendahuluan

Pengujian otomatisasi UI dan API menggunakan **Cypress** — framework end-to-end testing yang memungkinkan pengujian aplikasi web secara komprehensif. Cypress mendukung pengujian UI melalui browser dan pengujian API melalui `cy.request()`.

**Arsitektur:** Page Object Model (POM)  
**Framework:** Cypress 15  
**Bahasa:** TypeScript  
**Base URL:** `http://localhost:3000`

---

## Setup & Konfigurasi

**File:** `cypress.config.ts`

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    responseTimeout: 15000,
  },
});
```

**Cara menjalankan:**
```bash
# Pastikan dev server berjalan dulu:
npm run dev

# Jalankan test:
npm run test:e2e          # Buka Cypress GUI (interaktif)
npm run test:e2e:run      # Headless — semua test
npm run test:e2e:ui       # Hanya UI tests
npm run test:e2e:api      # Hanya API tests
```

---

## Struktur Page Object Model

```
cypress/
├── e2e/
│   ├── login.cy.ts        # 8 UI test cases login
│   ├── products.cy.ts     # 8 UI test cases produk & cart
│   └── api.cy.ts          # 18 API test cases
├── pages/                 # Page Object Model
│   ├── LoginPage.ts       # Abstraksi halaman /login
│   ├── ProductsPage.ts    # Abstraksi halaman produk
│   ├── CartPage.ts        # Abstraksi halaman /cart
│   └── CheckoutPage.ts    # Abstraksi halaman /checkout
├── fixtures/
│   └── testData.json      # Data uji terstruktur
└── support/
    ├── e2e.ts             # Global support
    └── commands.ts        # Custom commands
```

---

## A. Pengujian UI — Page Object Model

### LoginPage.ts

```typescript
export class LoginPage {
  visit()               { cy.visit('/login'); }
  getCredentialInput()  { return cy.get('input[autocomplete="username"]'); }
  getPasswordInput()    { return cy.get('input[autocomplete="current-password"]'); }
  getSubmitButton()     { return cy.get('button[type="submit"]'); }
  getErrorMessage()     { return cy.get('.text-bloom-danger').first(); }
  getAdminPanelButton() { return cy.contains('a', 'Buka Panel Admin'); }

  login(credential: string, password: string) {
    this.getCredentialInput().clear().type(credential);
    this.getPasswordInput().clear().type(password);
    this.getSubmitButton().click();
  }
}
```

### ProductsPage.ts

```typescript
export class ProductsPage {
  visit()                { cy.visit('/'); }
  getProductCards()      { return cy.get('article[aria-label]'); }
  scrollToProducts()     { cy.get('#produk').scrollIntoView(); }
  addToCart(name)        {
    cy.contains('article', name).find('button').contains('Tambah').click({force:true});
  }
}
```

---

## B. Test Cases UI (16 test cases)

### `login.cy.ts` — 8 Test Cases

| TC | Tipe | Deskripsi | Assertion |
|---|---|---|---|
| TC-UI-01 | Positif | Login berhasil kredensial valid | `cy.contains('Selamat datang')` |
| TC-UI-02 | Negatif | Login gagal password salah | `getErrorMessage().should('contain', 'salah')` |
| TC-UI-03 | Negatif | Login gagal credential kosong | `getErrorMessage().should('be.visible')` |
| TC-UI-04 | Negatif | Login gagal password kosong | `cy.url().should('include', '/login')` |
| TC-UI-05 | Positif | Login admin → tombol Panel Admin tampil | `getAdminPanelButton().should('be.visible')` |
| TC-UI-06 | Positif | Tab Register bisa dibuka | `getNameInput().should('be.visible')` |
| TC-UI-07 | Negatif | Register gagal password tidak cocok | `cy.contains('tidak cocok')` |
| TC-UI-08 | Positif | Redirect ke home jika sudah login | `cy.url().should('eq', baseUrl + '/')` |

### `products.cy.ts` — 8 Test Cases

| TC | Tipe | Deskripsi | Assertion |
|---|---|---|---|
| TC-UI-09 | Positif | Daftar produk tampil di homepage | `getProductCards().should('have.length.at.least', 1)` |
| TC-UI-10 | Positif | Klik card → navigasi ke product detail | `cy.url().should('include', '/products/')` |
| TC-UI-11 | Positif | Tambah ke keranjang → badge update | `cy.get('span').should('be.visible')` |
| TC-UI-12 | Positif | Product detail menampilkan galeri & info | `cy.contains('h1', name).should('be.visible')` |
| TC-UI-13 | Positif | Keranjang kosong → empty state | `cy.contains('Keranjang Kosong')` |
| TC-UI-14 | Positif | Keranjang tampil setelah tambah produk | `cy.contains(productName).should('be.visible')` |
| TC-UI-15 | Negatif | Checkout tanpa login → redirect ke login | `cy.url().should('include', '/login')` |
| TC-UI-16 | Negatif | Qty stepper tidak bisa < 1 | `find('button').first().should('be.disabled')` |

---

## C. Test Cases API (18 test cases)

### `api.cy.ts` — Menggunakan `cy.request()`

#### Products Endpoints

| TC | Method | Endpoint | Validasi | Expected |
|---|---|---|---|---|
| TC-API-01 | GET | `/api/products` | Status, body, response time | 200, array produk, < 3000ms |
| TC-API-02 | GET | `/api/products?search=anggrek` | Filtering | 200, hanya produk matching |
| TC-API-03 | GET | `/api/products/1` | Struktur data | 200, id=1, price>0 |
| TC-API-04 | GET | `/api/products/999` | Not found | 404, pesan error |
| TC-API-05 | GET | `/api/products/abc` | Invalid ID | 400, validasi error |
| TC-API-06 | POST | `/api/products` tanpa auth | Authorization | 401, 'ditolak' |
| TC-API-07 | PATCH | `/api/products/1` tanpa auth | Authorization | 401 |
| TC-API-08 | DELETE | `/api/products/1` tanpa auth | Authorization | 401 |

#### Orders Endpoints

| TC | Method | Endpoint | Validasi | Expected |
|---|---|---|---|---|
| TC-API-09 | POST | `/api/orders` valid | Order creation | 201, status='DRAFT' |
| TC-API-10 | POST | `/api/orders` items kosong | Validation | 400, pesan error |
| TC-API-11 | POST | `/api/orders` qty > stok | Stock validation | 400, pesan error |
| TC-API-12 | GET | `/api/orders/:id` | Order detail | 200, data lengkap |
| TC-API-13 | GET | `/api/orders/invalid` | Not found | 404 |
| TC-API-14 | PATCH | `/api/orders/:id/status` DRAFT→CONFIRMED | Valid transition | 200, status='CONFIRMED' |
| TC-API-15 | PATCH | `/api/orders/:id/status` DRAFT→COMPLETED | Invalid transition | 422 |

#### Auth Endpoints

| TC | Method | Endpoint | Validasi | Expected |
|---|---|---|---|---|
| TC-API-16 | POST | `/api/auth/login` valid | Login response | 200, user data (no password) |
| TC-API-17 | POST | `/api/auth/login` salah | Credential check | 401, pesan error |
| TC-API-18 | POST | `/api/auth/register` duplikat | Uniqueness check | 400, 'digunakan' |

---

## D. Data Uji Terstruktur

**File:** `cypress/fixtures/testData.json`

```json
{
  "validUser":   { "credential": "user", "password": "user123" },
  "adminUser":   { "credential": "admin", "password": "admin123" },
  "invalidUser": { "credential": "user", "password": "wrongpassword123" },
  "products": {
    "first": { "name": "Anggrek Bulan", "slug": "anggrek-bulan", "price": "Rp 150.000" }
  },
  "shipping": {
    "recipientName": "Test Penerima",
    "address": "Jl. Test No. 1, Makassar",
    "phone": "081234567890"
  }
}
```

---

## E. Custom Commands

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('loginUI', (credential, password) => {
  cy.visit('/login');
  cy.get('input[autocomplete="username"]').type(credential);
  cy.get('input[autocomplete="current-password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('loginAPI', (credential, password) => {
  cy.request('POST', '/api/auth/login', { credential, password })
    .then(res => window.localStorage.setItem('bloom_store_user', 
      JSON.stringify(res.body.data)));
});
```

---

## Ringkasan Hasil

| Kategori | File | Test Cases | Status |
|---|---|---|---|
| UI — Login | `login.cy.ts` | 8 | Siap dieksekusi |
| UI — Produk & Cart | `products.cy.ts` | 8 | Siap dieksekusi |
| API — Semua | `api.cy.ts` | 18 | Siap dieksekusi |
| **Total** | 3 file | **34** | **✅ Siap** |

> **Catatan:** Jalankan `npm run dev` sebelum menjalankan Cypress tests.  
> Hasil eksekusi tersimpan otomatis di folder `cypress/screenshots/` (jika ada failure).
