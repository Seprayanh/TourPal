import prisma from "@/lib/prismadb";

export type MyReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
};

export default async function getMyReviews(userId: string): Promise<MyReview[]> {
  const reviews = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, imageSrc: true } },
    },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    listing: r.listing,
  }));
}
