import { NextResponse } from "next/server";

import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/get-current-user";

interface IParams {
  reservationId?: string;
}

// 状态流转规则
const TRANSITIONS: Record<string, { nextStatus: string; requiresOwner: boolean }> = {
  accept:   { nextStatus: "ACCEPTED",    requiresOwner: true  },
  start:    { nextStatus: "IN_PROGRESS", requiresOwner: true  },
  complete: { nextStatus: "COMPLETED",   requiresOwner: true  },
  cancel:   { nextStatus: "CANCELLED",   requiresOwner: false },
};

const VALID_FROM: Record<string, string[]> = {
  accept:   ["PENDING"],
  start:    ["ACCEPTED"],
  complete: ["IN_PROGRESS"],
  cancel:   ["PENDING", "ACCEPTED"],
};

function buildNotification(
  action: string,
  title: string,
  isOwnerCancelling: boolean
): { type: string; message: string } | null {
  if (action === "accept") {
    return {
      type: "RESERVATION_ACCEPTED",
      message: `Your booking for "${title}" has been accepted! Your guide is ready.`,
    };
  }
  if (action === "start") {
    return {
      type: "TOUR_STARTED",
      message: `Your tour "${title}" has started. Have a great experience!`,
    };
  }
  if (action === "complete") {
    return {
      type: "TOUR_COMPLETED",
      message: `Your tour "${title}" is complete. We'd love your feedback!`,
    };
  }
  if (action === "cancel" && isOwnerCancelling) {
    return {
      type: "RESERVATION_CANCELLED",
      message: `Your booking for "${title}" was cancelled by the guide.`,
    };
  }
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { reservationId } = params;

  if (!reservationId || typeof reservationId !== "string") {
    return NextResponse.json({ error: "无效的预订 ID" }, { status: 400 });
  }

  const body = await request.json();
  const { action } = body;

  if (!action || !TRANSITIONS[action]) {
    return NextResponse.json({ error: "无效的操作" }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { listing: { select: { userId: true, title: true } } },
  });

  if (!reservation) {
    return NextResponse.json({ error: "预订不存在" }, { status: 404 });
  }

  const transition = TRANSITIONS[action];

  // 权限校验：accept/start/complete 只有向导（listing owner）可操作
  if (transition.requiresOwner && reservation.listing.userId !== currentUser.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  // cancel 允许游客或向导操作
  const isGuide = reservation.listing.userId === currentUser.id;
  if (action === "cancel") {
    const isGuest = reservation.userId === currentUser.id;
    if (!isGuest && !isGuide) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }
  }

  // 状态流转合法性校验
  if (!VALID_FROM[action].includes(reservation.status)) {
    return NextResponse.json(
      { error: `当前状态 ${reservation.status} 不可执行 ${action}` },
      { status: 422 }
    );
  }

  const now = new Date();
  const updateData: Record<string, unknown> = { status: transition.nextStatus };

  if (action === "start")    updateData.checkInTime  = now;
  if (action === "complete") updateData.checkOutTime = now;

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: updateData,
  });

  // Create notification for the tourist (not when tourist self-cancels)
  const isOwnerCancelling = action === "cancel" && isGuide;
  const notif = buildNotification(action, reservation.listing.title, isOwnerCancelling);

  if (notif) {
    await prisma.notification.create({
      data: {
        userId: reservation.userId,
        type: notif.type,
        message: notif.message,
        reservationId,
        listingId: reservation.listingId,
      },
    });
  }

  return NextResponse.json(updated);
}
