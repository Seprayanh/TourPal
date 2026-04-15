"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import { AiOutlineFileImage } from "react-icons/ai";

import { MyReview } from "@/app/actions/get-my-reviews";
import Container from "@/components/container";
import Heading from "@/components/heading";

interface MyFeedbackProps {
  reviews: MyReview[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rating ? (
          <AiFillStar key={star} className="text-yellow-400" size={16} />
        ) : (
          <AiOutlineStar key={star} className="text-neutral-300" size={16} />
        )
      )}
      <span className="ml-1 text-sm text-neutral-500">{rating} / 5</span>
    </div>
  );
}

const MyFeedback: React.FC<MyFeedbackProps> = ({ reviews }) => {
  const router = useRouter();

  return (
    <Container>
      <Heading
        title="My Feedback"
        subtitle="All the reviews you've left after your tours"
      />

      <div className="mt-10 flex flex-col gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex gap-4 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/listings/${review.listing.id}`)}
          >
            {/* Listing thumbnail */}
            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-neutral-100">
              {review.listing.imageSrc ? (
                review.listing.imageSrc.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.listing.imageSrc}
                    alt={review.listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.listing.imageSrc}
                    alt={review.listing.title}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <AiOutlineFileImage size={28} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {review.listing.title}
              </p>
              <div className="mt-1">
                <StarRating rating={review.rating} />
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
                  {review.comment}
                </p>
              )}
              <p className="mt-2 text-xs text-neutral-400">
                {format(new Date(review.createdAt), "PPP")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default MyFeedback;
