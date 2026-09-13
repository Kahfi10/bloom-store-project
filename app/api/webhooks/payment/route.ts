import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || process.env.ADMIN_SECRET_KEY || 'bloom_webhook_secret_key_default';
const MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000; // 5 minutes max tolerance against Replay Attacks

/**
 * Verifies HMAC-SHA256 signature of the webhook payload.
 */
export function verifyWebhookSignature(
  rawBody: string,
  timestamp: string,
  providedSignature: string,
  secret: string
): boolean {
  if (!rawBody || !timestamp || !providedSignature || !secret) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const providedBuf = Buffer.from(providedSignature, 'utf-8');
  const expectedBuf = Buffer.from(expectedSignature, 'utf-8');

  if (providedBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * POST /api/webhooks/payment
 * Industrial-standard secure payment webhook callback handler.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature') || '';
    const timestampHeader = req.headers.get('x-timestamp') || '';

    if (!signature || !timestampHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Header x-signature dan x-timestamp wajib disertakan.' },
        { status: 401 }
      );
    }

    // ── 1. Replay Attack Prevention ─────────────────────────────────────────
    const timestampMs = parseInt(timestampHeader, 10);
    const now = Date.now();
    if (isNaN(timestampMs) || Math.abs(now - timestampMs) > MAX_TIMESTAMP_DRIFT_MS) {
      return NextResponse.json(
        { success: false, error: 'Request Expired', message: 'Timestamp webhook kedaluwarsa atau terjadi replay attack.' },
        { status: 400 }
      );
    }

    // ── 2. Signature Verification (HMAC-SHA256) ─────────────────────────────
    const isValid = verifyWebhookSignature(rawBody, timestampHeader, signature, WEBHOOK_SECRET);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid Signature', message: 'Verifikasi tanda tangan webhook gagal.' },
        { status: 401 }
      );
    }

    // ── 3. Parse JSON Body ──────────────────────────────────────────────────
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Bad Request', message: 'Payload JSON tidak valid.' },
        { status: 400 }
      );
    }

    const { orderId, event, amount } = body;
    if (!orderId || !event) {
      return NextResponse.json(
        { success: false, error: 'Bad Request', message: 'orderId dan event wajib disertakan dalam body.' },
        { status: 400 }
      );
    }

    // ── 4. Verify Order and Prevent Price Tampering ─────────────────────────
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Not Found', message: `Pesanan ${orderId} tidak ditemukan.` },
        { status: 404 }
      );
    }

    if (event === 'payment.success') {
      // Anti-tamper: verify amount matches order.totalPrice
      if (typeof amount === 'number' && amount !== order.totalPrice) {
        return NextResponse.json(
          {
            success: false,
            error: 'Price Mismatch',
            message: `Nominal pembayaran (${amount}) tidak cocok dengan total pesanan (${order.totalPrice}).`,
          },
          { status: 400 }
        );
      }

      // Transition to CONFIRMED
      if (order.status === 'DRAFT') {
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        });
        return NextResponse.json({
          success: true,
          message: `Pembayaran berhasil diverifikasi. Pesanan ${orderId} berstatus CONFIRMED.`,
          data: updated,
        });
      } else if (order.status === 'CONFIRMED' || order.status === 'COMPLETED') {
        // Idempotent response
        return NextResponse.json({
          success: true,
          message: `Pesanan sudah diproses sebelumnya (status: ${order.status}).`,
          data: order,
        });
      }
    } else if (event === 'payment.failed') {
      if (order.status === 'DRAFT') {
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        });
        return NextResponse.json({
          success: true,
          message: `Pembayaran gagal. Pesanan ${orderId} dibatalkan.`,
          data: updated,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Event webhook diterima.' });
  } catch (err) {
    console.error('[POST /api/webhooks/payment]', err);
    return NextResponse.json(
      { success: false, error: 'Server Error', message: 'Gagal memproses webhook pembayaran.' },
      { status: 500 }
    );
  }
}
