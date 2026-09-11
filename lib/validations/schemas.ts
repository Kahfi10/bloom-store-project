import { sanitizeHtml } from '@/lib/security/sanitize';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validates registration input with strict length bounds and sanitization.
 */
export function validateRegisterInput(body: any): ValidationResult<{
  name: string;
  username: string;
  email: string;
  password: string;
}> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Request body tidak valid.' };
  }

  const { name, username, email, password } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return { success: false, error: 'Nama wajib diisi.' };
  }
  const cleanName = sanitizeHtml(name.trim());
  if (cleanName.length < 2 || cleanName.length > 100) {
    return { success: false, error: 'Nama harus antara 2 hingga 100 karakter.' };
  }

  if (!username || typeof username !== 'string' || !username.trim()) {
    return { success: false, error: 'Username wajib diisi.' };
  }
  const cleanUsername = username.trim().toLowerCase();
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
    return { success: false, error: 'Username hanya boleh huruf, angka, underscore (3-30 karakter).' };
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return { success: false, error: 'Email wajib diisi.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Format email tidak valid.' };
  }

  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Password wajib diisi.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter.' };
  }
  if (password.length > 128) {
    return { success: false, error: 'Password maksimal 128 karakter.' };
  }

  return {
    success: true,
    data: {
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password,
    },
  };
}

/**
 * Validates order creation input, ensuring strict bounds and anti-tamper structure.
 */
export function validateOrderInput(body: any): ValidationResult<{
  items: { productId: number; qty: number }[];
  recipientName: string;
  shippingAddress: string;
  phoneNumber: string;
}> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Request body tidak valid.' };
  }

  const { items, recipientName, shippingAddress, phoneNumber } = body;

  // Recipient name
  if (!recipientName || typeof recipientName !== 'string' || !recipientName.trim()) {
    return { success: false, error: 'Nama penerima wajib diisi.' };
  }
  const cleanName = sanitizeHtml(recipientName.trim());
  if (cleanName.length < 2 || cleanName.length > 100) {
    return { success: false, error: 'Nama penerima harus antara 2 hingga 100 karakter.' };
  }

  // Shipping address
  if (!shippingAddress || typeof shippingAddress !== 'string' || !shippingAddress.trim()) {
    return { success: false, error: 'Alamat pengiriman wajib diisi.' };
  }
  const cleanAddress = sanitizeHtml(shippingAddress.trim());
  if (cleanAddress.length < 5 || cleanAddress.length > 500) {
    return { success: false, error: 'Alamat pengiriman harus antara 5 hingga 500 karakter.' };
  }

  // Phone number
  if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
    return { success: false, error: 'Nomor telepon wajib diisi.' };
  }
  const cleanPhone = phoneNumber.trim();
  if (!/^\+?[\d\s\-()]{8,20}$/.test(cleanPhone)) {
    return { success: false, error: 'Format nomor telepon tidak valid.' };
  }

  // Items validation (min 1, max 50 different items per order)
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: 'Keranjang kosong, tidak dapat membuat pesanan.' };
  }
  if (items.length > 50) {
    return { success: false, error: 'Maksimum 50 item berbeda per pesanan.' };
  }

  const sanitizedItems: { productId: number; qty: number }[] = [];
  const seenProductIds = new Set<number>();

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      return { success: false, error: 'Format item tidak valid.' };
    }

    const { productId, qty } = item;
    const cleanProductId = Number(productId);
    const cleanQty = Number(qty);

    if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
      return { success: false, error: 'ID produk harus berupa bilangan bulat positif.' };
    }

    if (seenProductIds.has(cleanProductId)) {
      return { success: false, error: 'Produk duplikat terdeteksi dalam item pesanan.' };
    }
    seenProductIds.add(cleanProductId);

    if (!Number.isInteger(cleanQty) || cleanQty < 1) {
      return { success: false, error: 'Jumlah item tidak valid. Minimum 1 unit.' };
    }
    if (cleanQty > 10) {
      return { success: false, error: 'Maksimum pembelian 10 unit per produk.' };
    }

    sanitizedItems.push({ productId: cleanProductId, qty: cleanQty });
  }

  return {
    success: true,
    data: {
      items: sanitizedItems,
      recipientName: cleanName,
      shippingAddress: cleanAddress,
      phoneNumber: cleanPhone,
    },
  };
}
