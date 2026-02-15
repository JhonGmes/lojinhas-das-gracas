import React from 'react';
import { Star } from 'lucide-react';

interface ReviewStarsProps {
    rating: number;
    totalReviews?: number;
    size?: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    showText?: boolean;
    className?: string;
}

const ReviewStars: React.FC<ReviewStarsProps> = ({
    rating,
    totalReviews,
    size = 16,
    interactive = false,
    onRatingChange,
    showText = false,
    className = ""
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <div
                        key={star}
                        onClick={() => interactive && onRatingChange?.(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                    >
                        <Star
                            size={size}
                            strokeWidth={1.5}
                            className={`${(hoverRating || rating) >= star
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                    : 'fill-gray-100 text-gray-300'
                                } transition-colors`}
                        />
                    </div>
                ))}
            </div>

            {showText && (
                <span className="text-sm font-bold text-gray-800 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}

            {totalReviews !== undefined && (
                <span className="text-xs font-medium text-gray-400 border-l border-gray-200 pl-2 ml-1">
                    {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
                </span>
            )}
        </div>
    );
};

export default ReviewStars;
