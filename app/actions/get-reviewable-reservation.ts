import prisma from "@/lib/prismadb";

export default async function getReviewableReservation(
  userId: string,
  listingId: string
): Promise<string | null> {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        userId,
        listingId,
        status: "COMPLETED",
        review: null,
      },
      select: { id: true },
    });
    return reservation?.id ?? null;
  } catch {
    return null;
  }
}
