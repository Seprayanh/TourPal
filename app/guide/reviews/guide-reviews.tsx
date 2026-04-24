"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AiOutlineStar, AiFillStar, AiOutlineFileImage } from "react-icons/ai";

import { GuideReviewsData } from "@/app/actions/get-guide-reviews";
import Container from "@/components/container";
import Heading from "@/components/heading";
import Avatar from "@/components/avatar";

interface GuideReviewsProps {
  data: GuideReviewsData;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rating ? (
          <AiFillStar key={star} className="text-yellow-400" size={14} />
        ) : (
          <AiOutlineStar key={star} className="text-neutral-300" size={14} />
        )
      )}
    </div>
  );
}

const GuideReviews: React.FC<GuideReviewsProps> = ({ data }) => {
  const router = useRouter();
  const { listings, reviews } = data;

  // Group reviews by listingId
  const reviewsByListing = React.useMemo(() => {
    const map = new Map<string, typeof reviews>();
    for (const review of reviews) {
      const list = map.get(review.listingId) ?? [];
      list.push(review);
      map.set(review.listingId, list);
    }
    return map;
  }, [reviews]);

  return (
    <Container>
      <Heading
        title="我的评价"
        subtitle="游客对您旗下导览项目的所有评价"
      />

      <div className="mt-10 flex flex-col gap-10">
        {listings.map((listing) => {
          const listingReviews = reviewsByListing.get(listing.id) ?? [];
          if (listingReviews.length === 0) return null;

          const avg =
            listingReviews.reduce((sum, r) => sum + r.rating, 0) /
            listingReviews.length;

          return (
            <div key={listing.id}>
              {/* Listing header */}
              <div
                className="flex items-center gap-4 mb-4 cursor-pointer group"
                onClick={() => router.push(`/listings/${listing.id}`)}
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                  {listing.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.imageSrc}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <AiOutlineFileImage size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:underline">
                    {listing.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={Math.round(avg)} />
                    <span className="text-sm text-neutral-500">
                      {avg.toFixed(1)} 分（{listingReviews.length} 条评价）
                    </span>
                  </div>
                </div>
              </div>

              {/* Review list */}
              <div className="flex flex-col gap-3 pl-0 md:pl-18">
                {listingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar src={review.user.image} />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          {review.user.name ?? "匿名游客"}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="ml-auto text-xs text-neutral-400">
                        {format(new Date(review.createdAt), "PPP")}
                      </p>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-neutral-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default GuideReviews;
