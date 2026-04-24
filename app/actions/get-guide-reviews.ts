import prisma from "@/lib/prismadb";

export type GuideReviewListing = {
  id: string;
  title: string;
  imageSrc: string;
};

export type GuideReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  listingId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export type GuideReviewsData = {
  listings: GuideReviewListing[];
  reviews: GuideReviewItem[];
};

export default async function getGuideReviews(
  guideId: string
): Promise<GuideReviewsData> {
  const listings = await prisma.listing.findMany({
    where: { userId: guideId },
    select: { id: true, title: true, imageSrc: true },
  });

  const listingIds = listings.map((l) => l.id);

  const reviews = await prisma.review.findMany({
    where: { listingId: { in: listingIds } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return {
    listings,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      listingId: r.listingId,
      user: r.user,
    })),
  };
}
