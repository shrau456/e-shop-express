import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export default function ReviewSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    const reviewsData = data || [];

    // Fetch profile names for all reviewers
    const userIds = [...new Set(reviewsData.map(r => r.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      reviewsData.forEach(r => {
        (r as any).profiles = { full_name: profileMap.get(r.user_id) || null };
      });
    }

    setReviews(reviewsData as Review[]);
    if (user) {
      const existing = reviewsData.find(r => r.user_id === user.id);
      if (existing) {
        setUserReview(existing as Review);
        setRating(existing.rating);
        setComment(existing.comment || '');
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [productId, user]);

  const handleSubmit = async () => {
    if (!user) { toast.error('Please sign in to leave a review'); return; }
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);

    try {
      if (userReview) {
        await supabase.from('reviews').update({ rating, comment: comment || null }).eq('id', userReview.id);
        toast.success('Review updated');
      } else {
        await supabase.from('reviews').insert({ user_id: user.id, product_id: productId, rating, comment: comment || null });
        toast.success('Review submitted');
      }
      fetchReviews();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userReview) return;
    await supabase.from('reviews').delete().eq('id', userReview.id);
    setUserReview(null);
    setRating(0);
    setComment('');
    toast.success('Review deleted');
    fetchReviews();
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-semibold text-foreground">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
        )}
      </div>

      {/* Review form */}
      {user && (
        <div className="mb-8 rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-3">{userReview ? 'Update your review' : 'Write a review'}</h3>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
              >
                <Star className={`h-6 w-6 transition-colors ${
                  i <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                }`} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
            </Button>
            {userReview && (
              <Button variant="outline" className="text-destructive" onClick={handleDelete}>Delete</Button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded bg-muted" />)}</div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {(review as any).profiles?.full_name || 'Anonymous'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
