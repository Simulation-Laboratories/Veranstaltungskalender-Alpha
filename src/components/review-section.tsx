"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StarIcon, UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
};

export function ReviewSection({ eventId, locationId, canReview }: { eventId?: string, locationId?: string, canReview: boolean }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const endpoint = eventId ? `/api/events/${eventId}/reviews` : `/api/locations/${locationId}/reviews`;

  const fetchReviews = async () => {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to load reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId || locationId) fetchReviews();
  }, [eventId, locationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Bitte melde dich an, um eine Bewertung abzugeben.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post review");
      }

      toast.success("Bewertung gespeichert!");
      setComment("");
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bewertungen</h2>
        <div className="flex items-center gap-1 text-yellow-500 font-bold">
          <StarIcon className="w-5 h-5 fill-current" />
          {reviews.length > 0 
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
            : "-"}
          <span className="text-muted-foreground text-sm font-normal ml-1">({reviews.length})</span>
        </div>
      </div>

      {canReview && (
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">Wie fandest du es hier?</h3>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <StarIcon className={`w-8 h-8 ${rating >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
          <textarea
            className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Ein kurzes Fazit... (max 280 Zeichen)"
            maxLength={280}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" disabled={submitting || !session}>
            {session ? "Bewertung abgeben" : "Anmelden zum Bewerten"}
          </Button>
        </form>
      )}

      {!canReview && eventId && (
        <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-dashed">
          Bewertungen können erst abgegeben werden, nachdem das Event gestartet ist.
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-muted-foreground text-sm">Lade Bewertungen...</div>
        ) : reviews.length === 0 ? (
          <div className="text-muted-foreground text-sm">Noch keine Bewertungen vorhanden.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {review.user.image ? (
                      <img src={review.user.image} alt={review.user.name || "User"} />
                    ) : (
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{review.user.name || "Anonym"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star} 
                      className={`w-4 h-4 ${review.rating >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} 
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-muted-foreground text-sm mt-2">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
