"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

interface ReplyFormProps {
  reviewId: string;
  onReplyPosted: () => void;
  existingReply?: { id: string; content: string } | null;
  onCancel?: () => void;
}

export function ReplyForm({ reviewId, onReplyPosted, existingReply, onCancel }: ReplyFormProps) {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState(existingReply?.content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    if (!content.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = existingReply
        ? "http://localhost:4000/api/products/replies/" + existingReply.id
        : "http://localhost:4000/api/products/reviews/" + reviewId + "/replies";

      const res = await fetch(url, {
        method: existingReply ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit reply");
        return;
      }

      setContent("");
      onReplyPosted();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-2">
          {error}
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="px-3 py-1.5 text-xs bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors cursor-pointer"
        >
          {loading ? "Posting..." : existingReply ? "Update" : "Reply"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
