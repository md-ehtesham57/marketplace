"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { ReviewForm } from "./review-form";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { firstName: string; lastName: string; avatar?: string };
}

interface ReviewsListProps {
  productId: string;
  initialReviews?: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={"w-4 h-4 " + (star <= rating ? "text-amber-400" : "text-slate-200")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsList({ productId, initialReviews = [] }: ReviewsListProps) {
  const { isAuthenticated, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [userReview, setUserReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [page]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserReview();
    }
  }, [isAuthenticated, token]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:4000/api/products/" + productId + "/reviews?page=" + page + "&limit=5"
      );
      const data = await res.json();
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("FetchReviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const res = await fetch(
        "http://localhost:4000/api/products/" + productId + "/reviews/me",
        { headers: { Authorization: "Bearer " + token } }
      );
      const data = await res.json();
      setUserReview(data.review);
    } catch (error) {
      console.error("FetchUserReview error:", error);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    setDeleting(true);
    try {
      await fetch("http://localhost:4000/api/products/reviews/" + userReview.id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      setUserReview(null);
      fetchReviews();
    } catch (error) {
      console.error("DeleteReview error:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Write / Edit Review */}
      <ReviewForm
        productId={productId}
        existingReview={userReview}
        onReviewSubmitted={() => {
          fetchReviews();
          fetchUserReview();
        }}
      />

      {/* User's existing review actions */}
      {userReview && (
        <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
          <p className="text-sm text-sky-700 font-medium">You have reviewed this product</p>
          <button
            onClick={handleDeleteReview}
            disabled={deleting}
            className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-60 transition-colors cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete Review"}
          </button>
        </div>
      )}

      {/* Reviews */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Customer Reviews {reviews.length > 0 && "(" + reviews.length + ")"}
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-4xl mb-2">No reviews yet</p>
            <p className="text-sm">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sky-600 font-bold text-sm">
                        {review.user.firstName.charAt(0)}{review.user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-500 hover:border-sky-400 hover:text-sky-500 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600 font-medium">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-500 hover:border-sky-400 hover:text-sky-500 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}