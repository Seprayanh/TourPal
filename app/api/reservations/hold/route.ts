import { NextResponse } from "next/server";

import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/get-current-user";

const HOLD_MINUTES = 30;

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { listingId, startDate, endDate, totalPrice } = body;

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Check for conflicting active reservations or live holds on the same listing
  const conflict = await prisma.reservation.findFirst({
    where: {
      listingId,
      status: {
        in: ["LOCKED", "PENDING", "ACCEPTED", "IN_PROGRESS"],
      },
      OR: [
        // Expired LOCKED holds are treated as released
        {
          status: { not: "LOCKED" },
          startDate: { lte: end },
          endDate: { gte: start },
        },
        {
          status: "LOCKED",
          holdExpiresAt: { gt: now }, // only live locks block dates
          startDate: { lte: end },
          endDate: { gte: start },
        },
      ],
    },
  });

  if (conflict) {
    return NextResponse.json(
      { error: "该时间段已被预订或锁定，请选择其他日期" },
      { status: 409 }
    );
  }

  const holdExpiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

  const reservation = await prisma.reservation.create({
    data: {
      userId: currentUser.id,
      listingId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "LOCKED",
      holdExpiresAt,
    },
  });

  return NextResponse.json({ reservation, holdExpiresAt });
}
