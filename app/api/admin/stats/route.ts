// 放置路径: app/api/admin/stats/route.ts

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
    });
  } catch (error) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "获取统计数据失败，请检查数据库连接" },
      { status: 500 }
    );
  }
}
