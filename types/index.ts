import { Listing, Reservation, Review, User } from "@prisma/client";

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
};

export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "startDate" | "endDate" | "checkInTime" | "checkOutTime" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  listing: SafeListing;
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};

export type SafeReview = Omit<Review, "createdAt" | "resolvedAt"> & {
  createdAt: string;
  resolvedAt: string | null;
  user?: Pick<User, "id" | "name" | "image">;
};
