"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  existingReview?: { id: string; rating: number; comment: string } | null;
}

export function ReviewForm({ productId, onReviewSubmitted, existingReview }: ReviewFormProps) {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/products/" + productId);
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = existingReview
        ? "http://localhost:4000/api/products/reviews/" + existingReview.id
        : "http://localhost:4000/api/products/" + productId + "/reviews";

      const res = await fetch(url, {
        method: existingReview ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit review");
        return;
      }

      onReviewSubmitted();
      if (!existingReview) {
        setRating(0);
        setComment("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-4">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Star Rating Input */}
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-600 mb-2">Your Rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
            >
              <svg
                className={"w-8 h-8 transition-colors " + (star <= (hovered || rating) ? "text-amber-400" : "text-slate-200")}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-slate-600">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-600 mb-2">Your Review (optional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
      >
        {loading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
      </button>

      {!isAuthenticated && (
        <p className="text-xs text-slate-400 text-center mt-2">
          Please{" "}
          <a href={"/login?redirect=/products/" + productId} className="text-sky-500 hover:text-sky-600">
            login
          </a>
          {" "}to write a review
        </p>
      )}
    </div>
  );
}