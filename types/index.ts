import { Listing, Reservation, User } from "@prisma/client";

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
};

export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  // 履约时间字段（schema 扩展后由 prisma generate 生成）
  checkInTime?: string | null;
  checkOutTime?: string | null;
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

// 评价类型（依赖 prisma generate 后才有 Review 模型）
export interface SafeReview {
  id: string;
  userId: string;
  listingId: string;
  reservationId: string;
  rating: number;
  comment: string | null;
  isDefect: boolean;
  resolvedAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}
