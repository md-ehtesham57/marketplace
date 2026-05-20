"use client";

import { apiUrl } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { ReviewForm } from "./review-form";
import { ReplyForm } from "./reply-form";

interface ReviewUser {
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: ReviewUser;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  likeCount: number;
  dislikeCount: number;
  _count: { replies: number };
  userLike: string | null;
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
  const { isAuthenticated, token, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [userReview, setUserReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

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
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = "Bearer " + token;

      const res = await fetch(
        apiUrl("/api/products/") + productId + "/reviews?page=" + page + "&limit=5",
        { headers }
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
        apiUrl("/api/products/") + productId + "/reviews/me",
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
      await fetch(apiUrl("/api/products/reviews/") + userReview.id, {
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

  const handleToggleLike = async (reviewId: string, type: string) => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(apiUrl("/api/products/reviews/") + reviewId + "/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id !== reviewId) return r;
            const wasLike = r.userLike === "LIKE";
            const wasDislike = r.userLike === "DISLIKE";
            const isLike = type === "LIKE";
            const isDislike = type === "DISLIKE";
            let likeDelta = 0;
            let dislikeDelta = 0;

            if (data.action === "removed") {
              if (wasLike) likeDelta = -1;
              if (wasDislike) dislikeDelta = -1;
            } else if (data.action === "added") {
              if (isLike) likeDelta = 1;
              if (isDislike) dislikeDelta = 1;
            } else if (data.action === "switched") {
              if (wasLike) { likeDelta = -1; dislikeDelta = 1; }
              if (wasDislike) { dislikeDelta = -1; likeDelta = 1; }
            }

            return {
              ...r,
              userLike: data.type,
              likeCount: r.likeCount + likeDelta,
              dislikeCount: r.dislikeCount + dislikeDelta,
            };
          })
        );
      }
    } catch (error) {
      console.error("ToggleLike error:", error);
    }
  };

  const handleDeleteReply = async (replyId: string, reviewId: string) => {
    try {
      await fetch(apiUrl("/api/products/replies/") + replyId, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      fetchReplies(reviewId);
    } catch (error) {
      console.error("DeleteReply error:", error);
    }
  };

  const fetchReplies = async (reviewId: string) => {
    try {
      const res = await fetch(apiUrl("/api/products/reviews/") + reviewId + "/replies");
      const data = await res.json();
      setReplies((prev) => ({ ...prev, [reviewId]: data.replies || [] }));
    } catch (error) {
      console.error("FetchReplies error:", error);
    }
  };

  const toggleReplies = (reviewId: string) => {
    const next = new Set(expandedReplies);
    if (next.has(reviewId)) {
      next.delete(reviewId);
    } else {
      next.add(reviewId);
      if (!replies[reviewId]) fetchReplies(reviewId);
    }
    setExpandedReplies(next);
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
            {reviews.map((review) => {
              const isOwner = userReview?.id === review.id;

              return (
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
                            {review.updatedAt && new Date(review.updatedAt).getTime() > new Date(review.createdAt).getTime() + 1000 && (
                              <span className="ml-1.5 text-xs text-slate-400 italic">(edited)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>

                    {editingReviewId === review.id ? (
                      <ReviewForm
                        productId={productId}
                        existingReview={review}
                        onReviewSubmitted={() => {
                          setEditingReviewId(null);
                          fetchReviews();
                        }}
                      />
                    ) : (
                      <>
                        {review.comment && (
                          <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                        )}

                        {/* Actions bar */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                          {/* Like */}
                          <button
                            onClick={() => handleToggleLike(review.id, "LIKE")}
                            className={"flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer " + (review.userLike === "LIKE" ? "text-sky-500" : "text-slate-400 hover:text-sky-500")}
                          >
                            <svg className="w-4 h-4" fill={review.userLike === "LIKE" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                            </svg>
                            {review.likeCount > 0 && <span>{review.likeCount}</span>}
                          </button>

                          {/* Dislike */}
                          <button
                            onClick={() => handleToggleLike(review.id, "DISLIKE")}
                            className={"flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer " + (review.userLike === "DISLIKE" ? "text-red-500" : "text-slate-400 hover:text-red-500")}
                          >
                            <svg className="w-4 h-4" fill={review.userLike === "DISLIKE" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
                            </svg>
                            {review.dislikeCount > 0 && <span>{review.dislikeCount}</span>}
                          </button>

                          {/* Reply */}
                          <button
                            onClick={() => setShowReplyForm(showReplyForm === review.id ? null : review.id)}
                            className={"flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer " + (showReplyForm === review.id ? "text-sky-500" : "text-slate-400 hover:text-sky-500")}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Reply
                            {review._count.replies > 0 && <span>({review._count.replies})</span>}
                          </button>

                          {/* Edit (owner only) */}
                          {isOwner && (
                            <button
                              onClick={() => setEditingReviewId(review.id)}
                              className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          )}
                        </div>
                      </>
                    )}

                  {/* Reply form */}
                  {showReplyForm === review.id && (
                    <ReplyForm
                      reviewId={review.id}
                      onReplyPosted={() => {
                        setShowReplyForm(null);
                        fetchReplies(review.id);
                        fetchReviews();
                      }}
                      onCancel={() => setShowReplyForm(null)}
                    />
                  )}

                  {/* Replies */}
                  {review._count.replies > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleReplies(review.id)}
                        className="text-xs text-sky-500 hover:text-sky-600 font-medium transition-colors cursor-pointer"
                      >
                        {expandedReplies.has(review.id) ? "Hide replies" : "View " + review._count.replies + " " + (review._count.replies === 1 ? "reply" : "replies")}
                      </button>

                      {expandedReplies.has(review.id) && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-100">
                          {(replies[review.id] || []).map((reply) => {
                            const isReplyOwner = user?.firstName === reply.user.firstName && user?.lastName === reply.user.lastName;

                            return editingReplyId === reply.id ? (
                              <ReplyForm
                                key={reply.id}
                                reviewId={review.id}
                                existingReply={reply}
                                onReplyPosted={() => {
                                  setEditingReplyId(null);
                                  fetchReplies(review.id);
                                }}
                                onCancel={() => setEditingReplyId(null)}
                              />
                            ) : (
                              <div key={reply.id} className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-slate-500">
                                    {reply.user.firstName.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-700">
                                      {reply.user.firstName} {reply.user.lastName}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {new Date(reply.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "short", year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-0.5">{reply.content}</p>
                                  {isReplyOwner && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <button
                                        onClick={() => setEditingReplyId(reply.id)}
                                        className="text-xs text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReply(reply.id, review.id)}
                                        className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
