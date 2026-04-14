import { NextResponse } from "next/server";

import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/get-current-user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return NextResponse.json({ error: "缺少 listingId" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { listingId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { reservationId, rating, comment } = body;

  if (!reservationId || !rating) {
    return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "评分须为 1-5 整数" }, { status: 400 });
  }

  // 检查预订是否存在且属于当前用户
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return NextResponse.json({ error: "预订不存在" }, { status: 404 });
  }

  if (reservation.userId !== currentUser.id) {
    return NextResponse.json({ error: "无权评价此订单" }, { status: 403 });
  }

  if (reservation.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "只有已完成的行程才可以评价" },
      { status: 422 }
    );
  }

  // 防止重复评价
  const existing = await prisma.review.findUnique({
    where: { reservationId },
  });

  if (existing) {
    return NextResponse.json({ error: "该订单已评价" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      userId: currentUser.id,
      listingId: reservation.listingId,
      reservationId,
      rating,
      comment: comment ?? null,
      isDefect: rating <= 2,
    },
  });

  return NextResponse.json(review);
}
