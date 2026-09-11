/**
 * Output sanitization and safe serialization to prevent Information Disclosure
 * (Poin 7: Validasi output API).
 */

export interface SafeUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

/**
 * Strips password hash and internal fields from User model.
 */
export function serializeSafeUser(user: any): SafeUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

/**
 * Serializes order data based on viewer authorization:
 * - Admin or Owner: full details
 * - Public: masked phone & recipient name, no full shipping address
 */
export function serializeOrder(order: any, isAuthorized: boolean = false) {
  if (!order) return null;

  if (isAuthorized) {
    return order;
  }

  // Masked output for unauthenticated / semi-public view (IDOR & PII protection)
  return {
    id: order.id,
    status: order.status,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    recipientName: maskName(order.recipientName),
    shippingAddress: '*** Terlindungi ***',
    phoneNumber: maskPhone(order.phoneNumber),
    items: order.items,
  };
}

function maskName(name?: string): string {
  if (!name) return '***';
  if (name.length <= 2) return name[0] + '*';
  return name.slice(0, 2) + '*'.repeat(Math.max(1, name.length - 2));
}

function maskPhone(phone?: string): string {
  if (!phone) return '***';
  if (phone.length <= 4) return '***';
  return phone.slice(0, 3) + '****' + phone.slice(-3);
}

/**
 * Safe error response that avoids leaking database errors or internal stack traces in production.
 */
export function safeErrorMessage(err: unknown, defaultMsg: string = 'Terjadi kesalahan pada server.'): string {
  if (process.env.NODE_ENV === 'development') {
    if (err instanceof Error) return err.message;
  }
  return defaultMsg;
}
