"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { Range } from "react-date-range";
import { toast } from "react-hot-toast";
import axios from "axios";

import { SafeListing, SafeReservation, SafeUser } from "@/types";
import useLoginModal from "@/hooks/use-login-modal";

import { categories } from "@/components/navbar/categories";
import Container from "@/components/container";
import ListingHead from "@/components/listings/listing-head";
import ListingInfo from "@/components/listings/listing-info";
import ListingReservation from "@/components/listings/listing-reservation";
import ListingReviews from "@/components/listings/listing-reviews";
import PaymentModal from "@/components/modal/payment-modal";

const INITIAL_DATE_RANGE = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

interface IndividualListingProps {
  currentUser?: SafeUser | null;
  listing: SafeListing & {
    user: SafeUser;
  };
  reservations?: SafeReservation[];
  reviewableReservationId?: string | null;
}

const IndividualListing: React.FC<IndividualListingProps> = ({
  currentUser,
  listing,
  reservations = [],
  reviewableReservationId,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalPrice, setTotalPrice] = React.useState(listing.price);
  const [dateRange, setDateRange] = React.useState<Range>(INITIAL_DATE_RANGE);

  // Payment modal state
  const [showPayment, setShowPayment] = React.useState(false);
  const [pendingReservationId, setPendingReservationId] = React.useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = React.useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = React.useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const loginModal = useLoginModal();
  const reviewsRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to review section when ?review=1 is in the URL
  React.useEffect(() => {
    if (searchParams?.get("review") === "1" && reviewsRef.current) {
      const timer = setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Fetch token balance right before opening the payment modal
  const fetchBalance = React.useCallback(async () => {
    try {
      const res = await axios.get("/api/user/balance");
      setTokenBalance(res.data.tokenBalance);
    } catch {
      // balance stays 0; payment modal will show insufficient
    }
  }, []);

  const disabledDates = React.useMemo(() => {
    let dates: Date[] = [];

    reservations.forEach((reservation) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });

      dates = [...dates, ...range];
    });

    return dates;
  }, [reservations]);

  const category = React.useMemo(() => {
    return categories.find((category) => category.label === listing.category);
  }, [listing.category]);

  // Step 1: lock the guide's slot for 30 min, then open payment modal
  const onCreateHold = React.useCallback(async () => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/reservations/hold", {
        totalPrice,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id,
      });

      const { reservation, holdExpiresAt: expires } = res.data;
      setPendingReservationId(reservation.id);
      setHoldExpiresAt(expires);
      await fetchBalance();
      setShowPayment(true);
    } catch (error: any) {
      const msg = error?.response?.data?.error ?? (error as Error).message ?? "Something went wrong";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, dateRange, listing?.id, loginModal, totalPrice, fetchBalance]);

  // Step 2: deduct tokens and confirm the reservation
  const onConfirmPayment = React.useCallback(async () => {
    if (!pendingReservationId) return;

    setIsLoading(true);

    try {
      await axios.post("/api/payment", { reservationId: pendingReservationId });

      toast.success("支付成功！等待导游接单。");
      setShowPayment(false);
      setPendingReservationId(null);
      setHoldExpiresAt(null);
      setDateRange(INITIAL_DATE_RANGE);
      router.push("/trips");
    } catch (error: any) {
      const msg = error?.response?.data?.error ?? (error as Error).message ?? "Something went wrong";
      toast.error(msg);
      setShowPayment(false);
      setPendingReservationId(null);
      setHoldExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [pendingReservationId, router]);

  // Cancel: release the hold immediately so the slot becomes available again
  const onCancelPayment = React.useCallback(async () => {
    if (pendingReservationId) {
      axios.delete(`/api/reservations/${pendingReservationId}`).catch(() => {});
    }
    setShowPayment(false);
    setPendingReservationId(null);
    setHoldExpiresAt(null);
  }, [pendingReservationId]);

  React.useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInCalendarDays(
        dateRange.endDate,
        dateRange.startDate
      );

      if (dayCount && listing.price) {
        setTotalPrice(dayCount * listing.price);
      } else {
        setTotalPrice(listing.price);
      }
    }
  }, [dateRange, listing.price]);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <ListingHead
            id={listing.id}
            title={listing.title}
            imageSrc={listing.imageSrc}
            locationValue={listing.locationValue}
            currentUser={currentUser}
          />

          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            <ListingInfo
              user={listing.user}
              description={listing.description}
              locationValue={listing.locationValue}
              guestCount={listing.guestCount}
              roomCount={listing.roomCount}
              bathroomCount={listing.bathroomCount}
              category={category}
            />

            <div className="order-first md:order-last md:col-span-3 mb-10">
              <ListingReservation
                price={listing.price}
                totalPrice={totalPrice}
                dateRange={dateRange}
                disabledDates={disabledDates}
                disabled={isLoading}
                onChangeDate={(value) => setDateRange(value)}
                onSubmit={onCreateHold}
              />
            </div>
          </div>
        </div>

        <div ref={reviewsRef}>
          <ListingReviews
            listingId={listing.id}
            currentUser={currentUser}
            reviewableReservationId={reviewableReservationId}
          />
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        totalPrice={totalPrice}
        tokenBalance={tokenBalance}
        holdExpiresAt={holdExpiresAt}
        isLoading={isLoading}
        onConfirm={onConfirmPayment}
        onCancel={onCancelPayment}
      />
    </Container>
  );
};

export default IndividualListing;
