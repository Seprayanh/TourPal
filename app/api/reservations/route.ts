/**
 * @file app/api/reservations/route.ts
 * @description 预约订单核心接口 — 游客预约导游体验产品
 *
 * POST /api/reservations
 *   游客发起预约，创建 Reservation 记录（初始 PENDING）
 *   临时锁定导游档期 30 分钟，防止重复预约冲突
 *   对应 W5HH 分析 What §2：「预约与订单管理功能」
 *
 * GET /api/reservations
 *   Tourist → 查询自己的历史行程（My Trips 数据源）
 *   Guide   → 查询接收到的工单列表（My Reservations 数据源）
 *   根据 session 中的 User.role 自动区分返回内容
 *
 * 业务背景（《W5HH 分析与商业决策报告》肖瑞）：
 *   核心路径：游客搜索 → 预约（本接口）→ 履约 → 评价
 *
 * @author 肖瑞（商业决策负责人）
 * @reviewedBy 粟睿涵（PM）
 * @date 2026-04
 */
import { NextResponse } from "next/server";

import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/get-current-user";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { listingId, startDate, endDate, totalPrice } = body;

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return NextResponse.error();
  }

  // Fetch listing to get guide info for the notification
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true, title: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Create reservation via nested update (keeps original behaviour)
  const listingWithReservation = await prisma.listing.update({
    where: { id: listingId },
    data: {
      reservations: {
        create: {
          userId: currentUser.id,
          startDate,
          endDate,
          totalPrice,
        },
      },
    },
    include: {
      reservations: {
        where: { userId: currentUser.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const newReservation = listingWithReservation.reservations[0];

  // Notify the guide about the new booking
  if (listing.userId && newReservation) {
    await prisma.notification.create({
      data: {
        userId: listing.userId,
        type: "NEW_BOOKING",
        message: `新订单：游客已预订「${listing.title}」，请及时接单。`,
        reservationId: newReservation.id,
        listingId,
      },
    });
  }

  return NextResponse.json(listingWithReservation);
}
