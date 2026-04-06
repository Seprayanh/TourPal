"use client";

import * as React from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

import { SafeUser } from "@/types";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  isDefect: boolean;
  user?: { id: string; name: string | null; image: string | null };
}

interface ListingReviewsProps {
  listingId: string;
  currentUser?: SafeUser | null;
  // 当前用户已完成但尚未评价的 reservationId（由父组件计算后传入）
  reviewableReservationId?: string | null;
}

const StarRating: React.FC<{ rating: number; onRate?: (r: number) => void }> = ({
  rating,
  onRate,
}) => {
  const [hover, setHover] = React.useState(0);
  const interactive = !!onRate;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (interactive ? hover || rating : rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            {filled ? (
              <AiFillStar className="text-amber-400" size={18} />
            ) : (
              <AiOutlineStar className="text-gray-300" size={18} />
            )}
          </button>
        );
      })}
    </div>
  );
};

const ListingReviews: React.FC<ListingReviewsProps> = ({
  listingId,
  currentUser,
  reviewableReservationId,
}) => {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");

  const fetchReviews = React.useCallback(async () => {
    try {
      const res = await axios.get(`/api/reviews?listingId=${listingId}`);
      setReviews(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  React.useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewableReservationId) return;

    setSubmitting(true);
    try {
      await axios.post("/api/reviews", {
        reservationId: reviewableReservationId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("评价提交成功！");
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      {/* 标题行 */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">游客评价</h2>
        {avgRating !== null && (
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <AiFillStar className="text-amber-400" size={16} />
            <span className="font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-gray-400">({reviews.length} 条)</span>
          </span>
        )}
      </div>

      {/* 写评价表单 */}
      {currentUser && reviewableReservationId && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200"
        >
          <p className="text-sm font-semibold text-gray-700 mb-3">分享您的行程体验</p>
          <div className="mb-3">
            <StarRating rating={rating} onRate={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="写下您的感受（选填）"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "提交中…" : "提交评价"}
          </button>
        </form>
      )}

      {/* 评价列表 */}
      {loading ? (
        <p className="text-sm text-gray-400">加载中…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400">暂无评价，成为第一个评价的游客吧！</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {review.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.user.image}
                    alt={review.user.name ?? "用户"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    {(review.user?.name ?? "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {review.user?.name ?? "匿名用户"}
                  </span>
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingReviews;
