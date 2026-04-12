import prisma from "@/lib/prismadb";

export interface IListingsParams {
  userId?: string;
  guestCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
  // new tourist-facing filters
  minBudget?: number;
  maxBudget?: number;
  timeSlot?: string;
  languages?: string; // comma-separated, e.g. "English,French"
}

export default async function getListings(params: IListingsParams) {
  try {
    const {
      userId,
      guestCount,
      locationValue,
      startDate,
      endDate,
      category,
      minBudget,
      maxBudget,
      timeSlot,
      languages,
    } = params;

    let query: any = {};

    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (locationValue) query.locationValue = locationValue;

    if (guestCount) {
      query.guestCount = { gte: +guestCount };
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      query.price = {};
      if (minBudget) query.price.gte = +minBudget;
      if (maxBudget) query.price.lte = +maxBudget;
    }

    // Time slot filter (only applies to listings that have a timeSlot set)
    if (timeSlot) {
      query.timeSlot = timeSlot;
    }

    // Languages filter: listing must support at least one of the requested languages
    if (languages) {
      const langArray = languages.split(",").map((l) => l.trim()).filter(Boolean);
      if (langArray.length > 0) {
        query.languages = { hasSome: langArray };
      }
    }

    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            OR: [
              { endDate: { gte: startDate }, startDate: { lte: startDate } },
              { startDate: { lte: endDate }, endDate: { gte: endDate } },
            ],
          },
        },
      };
    }

    const listings = await prisma.listing.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
    });

    return listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
    }));
  } catch (error: any) {
    throw new Error(error);
  }
}
