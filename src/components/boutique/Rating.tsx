import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showText?: boolean;
}

export function Rating({
  rating,
  reviewCount,
  size = 16,
  showText = true,
}: RatingProps) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Note : ${rating} sur 5`}>
      <div className="flex items-center gap-0.5 text-[#FFD95C]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? "fill-[#FFD95C] text-[#FFD95C]"
                : "text-gray-300 fill-gray-100"
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-xs font-semibold text-[#3B2416]/70">
          {rating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
}
