"use client";

import { useState } from "react";
import { reviewSchema, type Review } from "@/schemas/review";
import { toFieldErrors } from "@/schemas/booking";
import { Button, inputClass } from "./ui";

type Props = {
  title: string;
  review?: Review;
  editable: boolean;
  onSubmit: (review: Review) => void;
};

export function RatingForm({ title, review, editable, onSubmit }: Props) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string>();

  if (review) {
    return (
      <div>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="text-xl text-amber-500" aria-label={`${review.stars} sao`}>
          {"★".repeat(review.stars)}
          <span className="text-slate-300">{"★".repeat(5 - review.stars)}</span>
        </p>
        {review.comment && <p className="text-sm text-slate-600">“{review.comment}”</p>}
      </div>
    );
  }

  if (!editable) {
    return (
      <div>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="text-sm text-slate-400">Chưa đánh giá</p>
      </div>
    );
  }

  function submit() {
    const result = reviewSchema.safeParse({ stars, comment });
    if (!result.success) return setError(Object.values(toFieldErrors(result.error))[0]);
    onSubmit(result.data);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Số sao">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} sao`}
            onClick={() => setStars(n)}
            className={`text-3xl ${n <= stars ? "text-amber-500" : "text-slate-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        className={inputClass}
        placeholder="Nhận xét ngắn..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      <Button onClick={submit}>Gửi đánh giá</Button>
    </div>
  );
}
