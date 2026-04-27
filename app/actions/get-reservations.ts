import prisma from "@/lib/prismadb";

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservations(params: IParams) {
  try {
    const { listingId, userId, authorId } = params;
    const query: any = {};

    if (listingId) {
      query.listingId = listingId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (authorId) {
      query.listing = {
        userId: authorId,
      };
    }

    // Exclude cancelled reservations and expired locks from date-blocking queries
    if (listingId && !userId && !authorId) {
      const now = new Date();
      query.OR = [
        { status: { notIn: ["CANCELLED", "LOCKED"] } },
        { status: "LOCKED", holdExpiresAt: { gt: now } },
      ];
    }

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeReservations = reservations.map((reservation) => ({
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      checkInTime: reservation.checkInTime?.toISOString() ?? null,
      checkOutTime: reservation.checkOutTime?.toISOString() ?? null,
      holdExpiresAt: reservation.holdExpiresAt?.toISOString() ?? null,
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
      },
    }));

    return safeReservations;
  } catch (error: any) {
    throw new Error(error);
  }
}
