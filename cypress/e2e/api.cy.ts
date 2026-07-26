/**
 * cypress/e2e/api.cy.ts
 * API Automation Tests — PRD BAB V §5
 *
 * Validasi: status code, response body, content-type,
 *           required fields, data types, error messages,
 *           business rules, response time
 *
 * Test cases (18 total, min 12):
 *   TC-API-01  GET /api/products → 200, array, struktur valid
 *   TC-API-02  GET /api/products?search=anggrek → 200, filtered
 *   TC-API-03  GET /api/products/1 → 200, product dengan id 1
 *   TC-API-04  GET /api/products/999 → 404, not found message
 *   TC-API-05  GET /api/products/abc → 400, invalid ID
 *   TC-API-06  POST /api/products tanpa auth → 401 Unauthorized
 *   TC-API-07  PATCH /api/products/1 tanpa auth → 401 Unauthorized
 *   TC-API-08  DELETE /api/products/1 tanpa auth → 401 Unauthorized
 *   TC-API-09  POST /api/orders valid → 201, order DRAFT
 *   TC-API-10  POST /api/orders keranjang kosong → 400
 *   TC-API-11  POST /api/orders qty melebihi stok → 400
 *   TC-API-12  GET /api/orders/:id pesanan ada → 200
 *   TC-API-13  GET /api/orders/:id tidak ada → 404
 *   TC-API-14  PATCH /api/orders/:id/status DRAFT→CONFIRMED → 200
 *   TC-API-15  PATCH /api/orders/:id/status transisi tidak valid → 422
 *   TC-API-16  POST /api/auth/login valid → 200, user data
 *   TC-API-17  POST /api/auth/login password salah → 401
 *   TC-API-18  POST /api/auth/register duplikat username → 400
 */

describe('TC-API: Otomatisasi Pengujian RESTful API', () => {
  const BASE = 'http://localhost:3000';
  let createdOrderId: string;

  // ── TC-API-01: GET semua produk ──────────────────────────────────────────
  it('TC-API-01: GET /api/products → 200 dengan array produk valid', () => {
    const start = Date.now();
    cy.request('GET', `${BASE}/api/products`).then((res) => {
      const duration = Date.now() - start;

      // Status code
      expect(res.status).to.eq(200);

      // Response time < 3000ms
      expect(duration).to.be.lessThan(3000);

      // Content-Type
      expect(res.headers['content-type']).to.include('application/json');

      // Response body structure
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data').that.is.an('array');
      expect(res.body).to.have.property('total').that.is.a('number');
      expect(res.body.data.length).to.be.at.least(1);

      // Validasi struktur produk pertama
      const product = res.body.data[0];
      expect(product).to.have.property('id').that.is.a('number');
      expect(product).to.have.property('name').that.is.a('string').and.not.be.empty;
      expect(product).to.have.property('price').that.is.a('number').and.be.greaterThan(0);
      expect(product).to.have.property('stock').that.is.a('number').and.be.at.least(0);
      expect(product).to.have.property('slug').that.is.a('string');
      expect(product).to.have.property('images').that.is.an('array');
    });
  });

  // ── TC-API-02: GET produk dengan search filter ───────────────────────────
  it('TC-API-02: GET /api/products?search=anggrek → 200 hasil terfilter', () => {
    cy.request('GET', `${BASE}/api/products?search=anggrek`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');

      // Setiap hasil harus mengandung kata 'anggrek'
      res.body.data.forEach((p: { name: string }) => {
        expect(p.name.toLowerCase()).to.include('anggrek');
      });
    });
  });

  // ── TC-API-03: GET produk by ID valid ────────────────────────────────────
  it('TC-API-03: GET /api/products/1 → 200 dengan data produk lengkap', () => {
    cy.request('GET', `${BASE}/api/products/1`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;

      const product = res.body.data;
      expect(product.id).to.eq(1);
      expect(product.name).to.be.a('string').and.not.be.empty;
      expect(product.price).to.be.a('number').and.be.greaterThan(0);
      expect(product.stock).to.be.a('number').and.be.at.least(0);
      expect(product.category).to.be.a('string');
      expect(product.images).to.be.an('array').with.length.at.least(1);
    });
  });

  // ── TC-API-04: GET produk ID tidak ada → 404 ────────────────────────────
  it('TC-API-04: GET /api/products/999 → 404 not found', () => {
    cy.request({
      method: 'GET',
      url: `${BASE}/api/products/999`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.success).to.be.false;
      expect(res.body).to.have.property('message').that.is.not.empty;
    });
  });

  // ── TC-API-05: GET produk ID tidak valid → 400 ──────────────────────────
  it('TC-API-05: GET /api/products/abc → 400 invalid ID', () => {
    cy.request({
      method: 'GET',
      url: `${BASE}/api/products/abc`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.be.a('string').and.not.be.empty;
    });
  });

  // ── TC-API-06: POST produk tanpa auth → 401 ─────────────────────────────
  it('TC-API-06: POST /api/products tanpa auth → 401 Unauthorized', () => {
    cy.request({
      method: 'POST',
      url: `${BASE}/api/products`,
      failOnStatusCode: false,
      body: { name: 'Test', price: 100, stock: 10 },
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('ditolak');
    });
  });

  // ── TC-API-07: PATCH produk tanpa auth → 401 ────────────────────────────
  it('TC-API-07: PATCH /api/products/1 tanpa auth → 401 Unauthorized', () => {
    cy.request({
      method: 'PATCH',
      url: `${BASE}/api/products/1`,
      failOnStatusCode: false,
      body: { price: 99999 },
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.success).to.be.false;
    });
  });

  // ── TC-API-08: DELETE produk tanpa auth → 401 ───────────────────────────
  it('TC-API-08: DELETE /api/products/1 tanpa auth → 401 Unauthorized', () => {
    cy.request({
      method: 'DELETE',
      url: `${BASE}/api/products/1`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.success).to.be.false;
    });
  });

  // ── TC-API-09: POST order valid → 201 DRAFT ─────────────────────────────
  it('TC-API-09: POST /api/orders valid → 201 dengan status DRAFT', () => {
    cy.request({
      method: 'POST',
      url: `${BASE}/api/orders`,
      body: {
        items: [{ productId: 3, qty: 1 }], // Krisan, stock 20
        recipientName:   'Test Penerima',
        shippingAddress: 'Jl. Test No. 1, Makassar',
        phoneNumber:     '081234567890',
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.success).to.be.true;

      const order = res.body.data;
      expect(order).to.have.property('id').that.is.a('string').and.not.be.empty;
      expect(order.status).to.eq('DRAFT');
      expect(order.totalPrice).to.be.a('number').and.be.greaterThan(0);
      expect(order).to.have.property('recipientName', 'Test Penerima');
      expect(order.items).to.be.an('array').with.length(1);

      // Simpan ID untuk test berikutnya
      createdOrderId = order.id;
    });
  });

  // ── TC-API-10: POST order keranjang kosong → 400 ─────────────────────────
  it('TC-API-10: POST /api/orders dengan items kosong → 400', () => {
    cy.request({
      method: 'POST',
      url: `${BASE}/api/orders`,
      failOnStatusCode: false,
      body: {
        items: [],
        recipientName: 'Test', shippingAddress: 'Alamat', phoneNumber: '081234567890',
      },
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.be.a('string').and.not.be.empty;
    });
  });

  // ── TC-API-11: POST order qty melebihi stok → 400 ───────────────────────
  it('TC-API-11: POST /api/orders qty melebihi stok → 400', () => {
    cy.request({
      method: 'POST',
      url: `${BASE}/api/orders`,
      failOnStatusCode: false,
      body: {
        items: [{ productId: 7, qty: 999 }], // Red Rose, stok 5
        recipientName: 'Test', shippingAddress: 'Alamat', phoneNumber: '081234567890',
      },
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.be.a('string').and.not.be.empty;
    });
  });

  // ── TC-API-12: GET order by ID valid → 200 ──────────────────────────────
  it('TC-API-12: GET /api/orders/:id → 200 dengan data pesanan lengkap', () => {
    // Buat order baru dulu
    cy.request({
      method: 'POST',
      url: `${BASE}/api/orders`,
      body: {
        items: [{ productId: 3, qty: 1 }],
        recipientName: 'Penerima Test', shippingAddress: 'Jl. Test', phoneNumber: '08123456789',
      },
    }).then((createRes) => {
      const orderId = createRes.body.data.id;

      cy.request('GET', `${BASE}/api/orders/${orderId}`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;

        const order = res.body.data;
        expect(order.id).to.eq(orderId);
        expect(order.status).to.eq('DRAFT');
        expect(order.items).to.be.an('array');
        expect(order.recipientName).to.eq('Penerima Test');
      });
    });
  });

  // ── TC-API-13: GET order ID tidak ada → 404 ─────────────────────────────
  it('TC-API-13: GET /api/orders/invalid-id → 404 not found', () => {
    cy.request({
      method: 'GET',
      url: `${BASE}/api/orders/non-existent-order-id-12345`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.be.a('string').and.not.be.empty;
    });
  });

  // ── TC-API-14: PATCH order status DRAFT→CONFIRMED → 200 ─────────────────
  it('TC-API-14: PATCH /api/orders/:id/status DRAFT→CONFIRMED → 200', () => {
    // Buat order baru
    cy.request({
      method: 'POST',
      url: `${BASE}/api/orders`,
      body: {
        items: [{ productId: 3, qty: 1 }],
        recipientName: 'Test Status', shippingAddress: 'Jl. Test', phoneNumber: '08123456789',
      },
    }).then((createRes) => {
      const orderId = createRes.body.data.id;

      // Update status
      cy.request({
        method: 'PATCH',
        url: `${BASE}/api/orders/${orderId}/status`,
        body: { status: 'CONFIRMED' },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.status).to.eq('CONFIRMED');
        expect(res.body.message).to.include('CONFIRMED');
      });
    });
  });

  // ── TC-API-15: PATCH transisi status tidak valid → 422 ───────────────────
  it('TC-API-15: PATCH DRAFT→COMPLETED (lewati CONFIRMED) → 422 Invalid Transition', () => {
    cy.request({
      method: 'POST',
      url: `${BASE}/api/orders`,
      body: {
        items: [{ productId: 3, qty: 1 }],
        recipientName: 'Test Invalid', shippingAddress: 'Jl. Test', phoneNumber: '08123456789',
      },
    }).then((createRes) => {
      const orderId = createRes.body.data.id;

      cy.request({
        method: 'PATCH',
        url: `${BASE}/api/orders/${orderId}/status`,
        failOnStatusCode: false,
        body: { status: 'COMPLETED' }, // Tidak valid dari DRAFT
      }).then((res) => {
        expect(res.status).to.eq(422);
        expect(res.body.success).to.be.false;
        expect(res.body.message).to.be.a('string').and.not.be.empty;
      });
    });
  });

  // ── TC-API-16: POST auth/login valid → 200 ──────────────────────────────
  it('TC-API-16: POST /api/auth/login kredensial valid → 200 dengan data user', () => {
    const start = Date.now();
    cy.request({
      method: 'POST',
      url: `${BASE}/api/auth/login`,
      body: { credential: 'user', password: 'user123' },
    }).then((res) => {
      const duration = Date.now() - start;

      expect(res.status).to.eq(200);
      expect(duration).to.be.lessThan(3000);
      expect(res.body.success).to.be.true;

      const user = res.body.data;
      expect(user).to.have.property('id').that.is.a('number');
      expect(user).to.have.property('name').that.is.not.empty;
      expect(user).to.have.property('email').that.is.not.empty;
      expect(user).to.have.property('role');
      // Password tidak boleh dikembalikan
      expect(user).to.not.have.property('password');
    });
  });

  // ── TC-API-17: POST auth/login password salah → 401 ─────────────────────
  it('TC-API-17: POST /api/auth/login password salah → 401 dengan pesan error', () => {
    cy.request({
      method: 'POST',
      url: `${BASE}/api/auth/login`,
      failOnStatusCode: false,
      body: { credential: 'user', password: 'wrongpassword' },
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.be.a('string').and.not.be.empty;
      // Pastikan tidak ada data user bocor
      expect(res.body).to.not.have.property('data');
    });
  });

  // ── TC-API-18: POST auth/register duplikat username → 400 ───────────────
  it('TC-API-18: POST /api/auth/register username sudah dipakai → 400', () => {
    cy.request({
      method: 'POST',
      url: `${BASE}/api/auth/register`,
      failOnStatusCode: false,
      body: {
        name: 'Test User',
        username: 'admin', // sudah ada
        email: 'newemail@test.com',
        password: 'password123',
      },
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('digunakan');
    });
  });
});
