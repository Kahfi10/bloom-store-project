import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalProducts, totalOrders, activeSessions, recentOrders, ordersByStatus] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.userSession.count({ where: { isActive: true } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { items: { include: { product: true } } },
        }),
        prisma.order.groupBy({
          by:       ['status'],
          _count:   { id: true },
        }),
      ]);

    const totalRevenue = await prisma.order.aggregate({
      _sum:   { totalPrice: true },
      where:  { status: { in: ['CONFIRMED', 'COMPLETED'] } },
    });

    const lowStockProducts = await prisma.product.findMany({
      where:   { stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
      take:    5,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        activeSessions,
        totalRevenue:    totalRevenue._sum.totalPrice ?? 0,
        ordersByStatus,
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/stats]', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil statistik.' }, { status: 500 });
  }
}
