import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET() {
  try {
    const [totalUsers, totalListings, totalReservations] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.reservation.count(),
    ]);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [newUsersThisMonth, newReservationsThisMonth] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
      prisma.reservation.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [recentUsers, recentReservations] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.reservation.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, totalPrice: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const MONTHS_ZH = ["一月","二月","三月","四月","五月","六月",
                       "七月","八月","九月","十月","十一月","十二月"];

    const monthlyMap: Record<string, { users: number; reservations: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyMap[key] = { users: 0, reservations: 0 };
    }

    recentUsers.forEach(({ createdAt }) => {
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (monthlyMap[key]) monthlyMap[key].users += 1;
    });

    recentReservations.forEach(({ createdAt }) => {
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (monthlyMap[key]) monthlyMap[key].reservations += 1;
    });

    const chartData = Object.entries(monthlyMap).map(([key, val]) => {
      const [, month] = key.split("-").map(Number);
      return {
        name: MONTHS_ZH[month],
        新增用户: val.users,
        新增预订: val.reservations,
      };
    });

    const recentActivity = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
    });

    const topListings = await prisma.listing.findMany({
      take: 5,
      orderBy: { reservations: { _count: "desc" } },
      select: {
        id: true,
        title: true,
        price: true,
        _count: { select: { reservations: true } },
      },
    });

    // 质量指标：评价与 DRE（需 prisma db push 后才有 Review 集合，否则降级为空数据）
    let qualityMetrics = {
      totalReviews: 0,
      avgRating: null as number | null,
      defectCount: 0,
      resolvedDefects: 0,
      DRE: 100,
      defectRate: 0,
    };
    let fulfillmentStats: Record<string, number> = {
      PENDING: 0, ACCEPTED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0,
    };

    try {
      const [allReviews, resolvedDefects, fulfillmentCounts, recentDefects] = await Promise.all([
        (prisma as any).review.findMany({ select: { rating: true, isDefect: true } }),
        (prisma as any).review.count({ where: { isDefect: true, resolvedAt: { not: null } } }),
        prisma.reservation.groupBy({ by: ["status"] as any, _count: { status: true } as any }),
        (prisma as any).review.findMany({
          where: { isDefect: true },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user:    { select: { name: true, email: true } },
            listing: { select: { title: true } },
          },
        }),
      ]);

      const totalReviews = allReviews.length;
      const defectCount = allReviews.filter((r: any) => r.isDefect).length;
      const avgRating =
        totalReviews > 0
          ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
          : null;

      qualityMetrics = {
        totalReviews,
        avgRating: avgRating !== null ? Math.round(avgRating * 10) / 10 : null,
        defectCount,
        resolvedDefects,
        DRE: defectCount > 0 ? Math.round((resolvedDefects / defectCount) * 100) : 100,
        defectRate: totalReviews > 0 ? Math.round((defectCount / totalReviews) * 100) : 0,
      };

      fulfillmentCounts.forEach(({ status, _count }: any) => {
        if (status in fulfillmentStats) fulfillmentStats[status] = _count.status;
      });

      qualityMetrics = {
        ...qualityMetrics,
        recentDefectReviews: recentDefects.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment ?? "",
          resolvedAt: r.resolvedAt?.toISOString() ?? null,
          createdAt: r.createdAt.toISOString(),
          reviewer: r.user?.name ?? r.user?.email ?? "Guest",
          listingTitle: r.listing?.title ?? "Unknown",
        })),
      } as any;
    } catch {
      // Review collection not yet created (schema not migrated), return empty data
    }

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        totalReservations,
        newUsersThisMonth,
        newReservationsThisMonth,
      },
      chartData,
      recentActivity: recentActivity.map((r) => ({
        id: r.id,
        listingTitle: r.listing?.title ?? "未知体验",
        userName: r.user?.name ?? r.user?.email ?? "访客",
        totalPrice: r.totalPrice,
        createdAt: r.createdAt.toISOString(),
      })),
      topListings: topListings.map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        reservationCount: l._count.reservations,
      })),
      qualityMetrics,
      fulfillmentStats,
    });
  } catch (error) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "获取统计数据失败，请检查数据库连接" },
      { status: 500 }
    );
  }
}
