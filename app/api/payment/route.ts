import { NextResponse } from "next/server";

import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/get-current-user";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { reservationId } = body;

  if (!reservationId || typeof reservationId !== "string") {
    return NextResponse.json({ error: "缺少预约 ID" }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { listing: { select: { userId: true, title: true } } },
  });

  if (!reservation) {
    return NextResponse.json({ error: "预约不存在" }, { status: 404 });
  }

  if (reservation.userId !== currentUser.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  if (reservation.status !== "LOCKED") {
    return NextResponse.json({ error: "该预约不处于待支付状态" }, { status: 422 });
  }

  const now = new Date();
  if (reservation.holdExpiresAt && reservation.holdExpiresAt < now) {
    // Hold expired — clean up and reject
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ error: "锁定已超时，请重新选择日期" }, { status: 410 });
  }

  const cost = reservation.totalPrice;

  // Fetch fresh balance inside a transaction to avoid race conditions
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { tokenBalance: true },
  });

  if (!user || user.tokenBalance < cost) {
    return NextResponse.json(
      { error: `Token 余额不足（需要 ${cost}，当前 ${user?.tokenBalance ?? 0}）` },
      { status: 402 }
    );
  }

  // Atomic: deduct tokens, confirm reservation, record transaction
  const [updatedReservation] = await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "PENDING", holdExpiresAt: null },
    }),
    prisma.user.update({
      where: { id: currentUser.id },
      data: { tokenBalance: { decrement: cost } },
    }),
    prisma.transaction.create({
      data: {
        userId: currentUser.id,
        reservationId,
        amount: -cost,
        type: "PAYMENT",
      },
    }),
    prisma.notification.create({
      data: {
        userId: reservation.listing.userId,
        type: "NEW_BOOKING",
        message: `新订单：游客已支付并预订「${reservation.listing.title}」，请及时接单。`,
        reservationId,
        listingId: reservation.listingId,
      },
    }),
  ]);

  const newBalance = user.tokenBalance - cost;

  return NextResponse.json({ reservation: updatedReservation, newBalance });
}
