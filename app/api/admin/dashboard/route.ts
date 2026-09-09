import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET() {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [
    totalRevenue,
    previousMonthRevenue,
    totalOrders,
    previousMonthOrders,
    totalUsers,
    previousMonthUsers,
    totalProducts,
    previousMonthProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: "delivered",
        createdAt: { gte: currentMonthStart },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: "delivered",
        createdAt: { gte: lastMonthStart, lt: currentMonthStart },
      },
    }),
    prisma.order.count({
      where: { createdAt: { gte: currentMonthStart } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: lastMonthStart, lt: currentMonthStart } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: currentMonthStart } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: lastMonthStart, lt: currentMonthStart } },
    }),
    prisma.product.count({
      where: { stock: { gt: 0 }, status: "active" },
    }),
    prisma.product.count({
      where: {
        stock: { gt: 0 },
        status: "active",
        createdAt: { gte: lastMonthStart, lt: currentMonthStart },
      },
    }),
  ]);

  // Calculate percentage changes
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const revenueCurrent = Number(totalRevenue._sum.total ?? 0);
  const revenuePrevious = Number(previousMonthRevenue._sum.total ?? 0);

  // Monthly revenue for last 6 months
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyRevenueRaw = await prisma.$queryRaw<
    Array<{ month: string; revenue: bigint }>
  >`
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') as month,
      SUM(total) as revenue
    FROM orders
    WHERE status = 'delivered'
      AND created_at >= ${sixMonthsAgo}
    GROUP BY month
    ORDER BY month ASC
  `;

  const monthlyRevenue = monthlyRevenueRaw.map((row) => ({
    month: row.month,
    revenue: Number(row.revenue),
  }));

  // Orders by status
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });

  // Recent reviews
  const recentReviews = await prisma.review.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalRevenue: revenueCurrent,
        revenueChange: calcChange(revenueCurrent, revenuePrevious),
        totalOrders,
        ordersChange: calcChange(totalOrders, previousMonthOrders),
        totalUsers,
        usersChange: calcChange(totalUsers, previousMonthUsers),
        totalProducts,
        productsChange: calcChange(totalProducts, previousMonthProducts),
      },
      monthlyRevenue,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id.toString(),
        orderNumber: o.orderNumber,
        total: Number(o.total),
        status: o.status,
        userName: o.user.name,
        itemCount: o._count.items,
        createdAt: o.createdAt?.toISOString(),
      })),
      recentReviews: recentReviews.map((r) => ({
        id: r.id.toString(),
        rating: r.rating,
        title: r.title,
        content: r.content.substring(0, 100),
        productName: r.product.name,
        userName: r.user.name,
        createdAt: r.createdAt?.toISOString(),
      })),
    },
  });
}
