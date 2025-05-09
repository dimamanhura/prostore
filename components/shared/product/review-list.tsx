'use client';

import { Review } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewForm from "./review-form";
import { getAllProductReviews } from "@/lib/actions/review.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, UserIcon } from "lucide-react";
import Rating from "@/components/rating";

interface ReviewListProps {
  userId: string;
  productId: string;
  productSlug: string;
};

const ReviewList = ({ userId, productId, productSlug }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getAllProductReviews({ productId });
      setReviews(res.data);
    };
    loadReviews();
  }, [productId]);

  const reload = async () => {
    const res = await getAllProductReviews({ productId });
    setReviews(res.data);
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 && (
        <div>No reviews yet</div>
      )}
      {userId ? (
        <ReviewForm productId={productId} userId={userId} onReviewSubmitted={reload} />
      ) : (
        <div>
          Please <Link className="text-blue-700 px-2" href={`/sign-in?callbackUrl=/products/${productSlug}`}>Sign In</Link> to write a review
        </div>
      )}
      <div className="flex flex-col gap-3">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex-between">
                <CardTitle>
                  {review.title}
                </CardTitle>
              </div>
              <CardDescription>
                {review.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Rating value={Number(review.rating)} />
                 </div>
                <div className="flex items-center">
                  <UserIcon className="mr-1 h-3 w-3" />
                  {review.user?.name || 'Deleted user'}
                </div>
                 <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {review.createdAt.toISOString()}
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
