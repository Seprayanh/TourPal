import * as React from "react";

import getCurrentUser from "@/app/actions/get-current-user";
import getListingById from "@/app/actions/get-listing-by-id";
import getReservations from "@/app/actions/get-reservations";
import prisma from "@/lib/prismadb";

import EmptyState from "@/components/empty-state";
import IndividualListing from "./individual-listing";

interface IParams {
  listingId?: string;
}

export default async function IndividualListingPage({
  params,
}: {
  params: IParams;
}) {
  const listing = await getListingById(params);
  const reservations = await getReservations(params);
  const currentUser = await getCurrentUser();

  if (!listing) {
    return <EmptyState />;
  }

  // 查找当前用户是否有可评价的已完成订单（COMPLETED 且尚无 review）
  let reviewableReservationId: string | null = null;
  if (currentUser && params.listingId) {
    const reviewable = await prisma.reservation.findFirst({
      where: {
        userId: currentUser.id,
        listingId: params.listingId,
        status: "COMPLETED",
        review: null,
      },
      select: { id: true },
    });
    reviewableReservationId = reviewable?.id ?? null;
  }

  return (
    <React.Fragment>
      <IndividualListing
        listing={listing}
        reservations={reservations}
        currentUser={currentUser}
        reviewableReservationId={reviewableReservationId}
      />
    </React.Fragment>
  );
}
