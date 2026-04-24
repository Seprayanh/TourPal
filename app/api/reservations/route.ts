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
