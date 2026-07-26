<div align="center">

<br/>

# 🌸 Bloom Store

### Toko Bunga Premium — Advanced Software Testing & QA Project

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock)](https://greensock.com/gsap)

[![Jest](https://img.shields.io/badge/Jest-52%20Tests-C21325?style=for-the-badge&logo=jest)](https://jestjs.io)
[![Cucumber](https://img.shields.io/badge/Cucumber-37%20Scenarios-23D96C?style=for-the-badge&logo=cucumber)](https://cucumber.io)
[![Cypress](https://img.shields.io/badge/Cypress-34%20Tests-17202C?style=for-the-badge&logo=cypress)](https://cypress.io)

<br/>

> **Proyek UTS** — Advanced Software Testing and Quality Assurance  
> Universitas Muhammadiyah Makassar · Fakultas Teknik · Informatika  
> Semester VI RPL · Tahun Ajaran 2025–2026

<br/>

[🌐 Live Demo](http://168.110.205.104) · [📦 Repository](https://github.com/Kahfi10/bloom-store-project) · [📋 Dokumentasi Testing](#-dokumentasi-testing)

</div>

---

## ✨ Tentang Bloom Store

**Bloom Store** adalah aplikasi web toko bunga premium yang dikembangkan sebagai implementasi penuh dari teknik **Advanced Software Testing & Quality Assurance**. Aplikasi ini bukan sekadar toko online biasa — setiap baris kode ditulis dengan pendekatan **test-first**, setiap fitur diverifikasi dengan pengujian otomatis, dan setiap bug didokumentasikan dengan analisis mendalam.

```
🌸  9 Produk Bunga Premium     🛒  Keranjang Belanja Interaktif
👤  Auth System (bcrypt)        📦  Manajemen Pesanan Real-time
🔐  Admin Dashboard             📊  REST API 8 Endpoints
🎬  GSAP Animations             📱  Responsive Design
```

---

## 🏗️ Arsitektur & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    BLOOM STORE                          │
├──────────────────┬──────────────────────────────────────┤
│   FRONTEND       │          BACKEND                     │
│                  │                                      │
│  Next.js 16      │   Next.js API Routes                 │
│  React 19        │   Prisma ORM + SQLite                │
│  Tailwind v4     │   bcryptjs (auth)                    │
│  GSAP 3.15       │   8 REST Endpoints                   │
│  TypeScript 5    │                                      │
├──────────────────┴──────────────────────────────────────┤
│                    TESTING                              │
│                                                         │
│  Jest (TDD) · Cucumber (BDD) · Cypress (E2E + API)     │
│  52 Unit Tests · 37 BDD Scenarios · 34 Cypress Tests   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.x
npm >= 9.x
```

### Installation

```bash
# Clone repository
git clone https://github.com/Kahfi10/bloom-store-project.git
cd bloom-store-project

# Install dependencies
npm install

# Setup environment
cp .env.production.example .env.local
# Edit .env.local sesuai kebutuhan

# Setup database
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev
DATABASE_URL="file:./prisma/dev.db" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Development

```bash
npm run dev
# → http://localhost:3000
```

### Production Build

```bash
DATABASE_URL="file:./prisma/dev.db" npm run build
npm start
```

---

## 📁 Struktur Proyek

```
bloom-store/
│
├── app/                          # Next.js App Router
│   ├── (halaman utama)/          # Home, Products, Cart
│   ├── admin/                    # Dashboard Admin
│   │   ├── page.tsx              # Dashboard statistik
│   │   ├── products/             # CRUD Produk
│   │   ├── orders/               # Manajemen Pesanan
│   │   └── users/                # Sesi Pengguna
│   └── api/                      # REST API Endpoints
│       ├── products/             # CRUD /api/products
│       ├── orders/               # /api/orders
│       └── auth/                 # Login & Register
│
├── components/                   # React Components
│   ├── home/                     # Hero, Marquee, Products
│   ├── product/                  # Gallery, AddToCart
│   ├── layout/                   # Navbar, Footer
│   └── ui/                       # Shared UI Components
│
├── context/                      # React Context (State)
│   ├── CartContext.tsx           # Keranjang belanja
│   ├── OrderContext.tsx          # Pesanan + localStorage
│   ├── AuthContext.tsx           # Autentikasi
│   └── ToastContext.tsx          # Notifikasi
│
├── lib/                          # Utilities
│   ├── db.ts                     # Prisma client
│   ├── products.ts               # DB queries + fallback
│   ├── mockData.ts               # Static product data
│   ├── gsap.ts                   # GSAP plugin setup
│   └── business/                 # Business logic (TDD)
│       ├── orderTransition.ts    # validateOrderTransition
│       └── cartValidation.ts     # validateCartItem
│
├── prisma/                       # Database
│   ├── schema.prisma             # Models: Product, Order, User
│   ├── seed.ts                   # 9 produk + 2 users
│   └── migrations/               # Migration history
│
├── __tests__/                    # Jest Unit Tests
│   ├── orderTransition.test.ts   # 18 TDD tests
│   ├── cartValidation.test.ts    # 20 TDD tests
│   └── whitebox.test.ts          # 14 White-box tests
│
├── features/                     # BDD (Cucumber)
│   ├── cart.feature              # 18 scenarios
│   ├── order-status.feature      # 19 scenarios
│   └── step_definitions/         # Step implementations
│
├── cypress/                      # E2E & API Testing
│   ├── e2e/
│   │   ├── login.cy.ts           # 8 UI test cases
│   │   ├── products.cy.ts        # 8 UI test cases
│   │   └── api.cy.ts             # 18 API test cases
│   └── pages/                    # Page Object Model
│       ├── LoginPage.ts
│       ├── ProductsPage.ts
│       ├── CartPage.ts
│       └── CheckoutPage.ts
│
└── docs/testing/                 # Dokumentasi Lengkap
    ├── tdd-*.md/.docx
    ├── bdd-*.md/.docx
    ├── black-box-*.md/.docx
    ├── white-box-*.md/.docx
    └── ui-api-automation-*.md/.docx
```

---

## 🧪 Dokumentasi Testing

Bloom Store menerapkan **6 teknik pengujian** sesuai PRD:

### 1. 🔴🟢♻️ Test-Driven Development (TDD)

```bash
npm test                    # Run semua unit tests
npm run test:coverage       # Dengan coverage report
```

| Suite | Tests | Status |
|-------|-------|--------|
| `orderTransition.test.ts` | 18 | ✅ PASS |
| `cartValidation.test.ts` | 20 | ✅ PASS |
| `whitebox.test.ts` | 14 | ✅ PASS |
| **Total** | **52** | **✅ PASS** |

**Fungsi yang dikembangkan:**
- `validateOrderTransition(from, to)` — validasi transisi status pesanan
- `validateCartItem(qty, stock)` — validasi jumlah item keranjang

### 2. 🥒 Behavior-Driven Development (BDD)

```bash
npm run test:bdd            # Run semua scenarios
npm run test:bdd:report     # + Generate HTML report
```

| Feature | Scenarios | Steps |
|---------|-----------|-------|
| `cart.feature` | 18 | 67 |
| `order-status.feature` | 19 | 57 |
| **Total** | **37** | **124** |

### 3. 📊 Black-Box: State Transition Testing

Analisis transisi status pesanan `DRAFT → CONFIRMED → COMPLETED / CANCELLED`:
- **4 state** bisnis teridentifikasi
- **10 test cases** (4 valid + 6 invalid)
- Diagram & tabel transisi lengkap

📄 Lihat: `docs/testing/black-box-state-transition.md`

### 4. 🔬 White-Box: Cyclomatic Complexity

Analisis 2 fungsi dengan percabangan:

| Fungsi | CC | Paths | Tests |
|--------|-----|-------|-------|
| `validateOrderTransition` | **7** | 7 | 7 |
| `validateCartItem` | **7** | 7 | 7 |

📄 Lihat: `docs/testing/white-box-cyclomatic-complexity.md`

### 5. 🖥️ UI Automation — Cypress + POM

```bash
npm run dev                 # Start app dulu
npm run test:e2e            # Buka Cypress GUI
npm run test:e2e:run        # Headless mode
npm run test:e2e:ui         # Hanya UI tests
```

**Page Object Model:**
- `LoginPage` · `ProductsPage` · `CartPage` · `CheckoutPage`

**16 Test Cases:** TC-UI-01 s/d TC-UI-16 *(login, produk, cart, checkout)*

### 6. 🔌 API Automation — Cypress Request

```bash
npm run test:e2e:api        # 18 API test cases
```

**18 Test Cases:** TC-API-01 s/d TC-API-18

| Endpoint | Method | Tests |
|----------|--------|-------|
| `/api/products` | GET, POST, PATCH, DELETE | 8 |
| `/api/orders` | POST, GET, PATCH | 5 |
| `/api/auth` | POST (login, register) | 3 |
| **Total** | | **18** |

---

## 🌺 Fitur Aplikasi

### Customer Side
| Fitur | Detail |
|-------|--------|
| 🏠 **Homepage** | Hero video (3 video, 2× speed, crossfade), Marquee, CollectionExplorer, Product Grid |
| 🌸 **Product Detail** | Image gallery (semua foto), Flower story (sejarah, fakta, asal) |
| 🛒 **Keranjang** | Add/remove/qty stepper, validasi 1-10 unit, real-time total |
| 👤 **Auth** | Login + Register, bcrypt password, session tracking |
| 📦 **Checkout** | Form pengiriman, validasi, order creation → status DRAFT |
| 📋 **Pesanan** | Order list + detail, status timeline, transisi status |

### Admin Side (`/admin`)
| Fitur | Detail |
|-------|--------|
| 📊 **Dashboard** | Stats real-time (auto-refresh 30s), recent orders, low stock alert |
| 📦 **Products** | CRUD lengkap, search, stock indicator |
| 📋 **Orders** | Filter by status, update status, auto-refresh 15s |
| 👥 **Users** | Active sessions tracker, login history |

### Security
```
✅ 3-Factor Admin Auth (username + password + access code)
✅ Rate limiting (max 5 attempts / 15 menit)
✅ bcrypt password hashing
✅ HttpOnly cookies
✅ API authorization guards
```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| `GET` | `/api/products` | Semua produk | — |
| `GET` | `/api/products/:id` | Detail produk | — |
| `POST` | `/api/products` | Tambah produk | 🔐 Admin |
| `PATCH` | `/api/products/:id` | Update produk | 🔐 Admin |
| `DELETE` | `/api/products/:id` | Hapus produk | 🔐 Admin |
| `POST` | `/api/orders` | Buat pesanan | — |
| `GET` | `/api/orders/:id` | Detail pesanan | — |
| `PATCH` | `/api/orders/:id/status` | Update status | — |
| `POST` | `/api/auth/login` | Login | — |
| `POST` | `/api/auth/register` | Register | — |

---

## 👥 Tim Pengembang

<table>
  <tr>
    <td align="center"><b>Ashabul Kahfi</b><br/>105841108523<br/>Main Developer</td>
    <td align="center"><b>Marhepi Rahmadani</b><br/>105841109523<br/>Co-Developer</td>
    <td align="center"><b>Afra Muawiya</b><br/>105841108423<br/>Co-Developer</td>
    <td align="center"><b>Alyah Saputri Bakri</b><br/>105841107723<br/>Co-Developer</td>
  </tr>
</table>

> 📧 `105841108523@student.unismuh.ac.id`  
> 🏫 Universitas Muhammadiyah Makassar — Teknik Informatika

---

## 📜 Lisensi

Project ini dibuat untuk keperluan akademik — **UTS Advanced Software Testing and Quality Assurance**.

---

<div align="center">

Made with 🌸 by Tim Bloom Store · Unismuh Makassar 2025

</div>
