import React from 'react';
import { CheckCircle2, ThumbsUp, MessageSquareReply, Calendar } from 'lucide-react';
import ReviewStars from './ReviewStars';
import type { Review } from '../types';

interface ReviewCardProps {
    review: Review;
    onHelpful?: (id: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful }) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-inner ring-4 ring-white">
                        {review.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-800 tracking-tight">{review.customer_name}</h4>
                            {review.is_verified_purchase && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-100 uppercase tracking-wider">
                                    <CheckCircle2 size={10} />
                                    Compra Verificada
                                </span>
                            )}
                        </div>
                        <ReviewStars rating={review.rating} size={14} />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Calendar size={12} />
                    {new Date(review.created_at).toLocaleDateString('pt-BR')}
                </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium bg-gray-50/30 p-4 rounded-xl border border-gray-100/50">
                "{review.comment}"
            </p>

            {review.admin_response && (
                <div className="ml-4 md:ml-8 mb-6 p-5 bg-primary/5 rounded-2xl border-l-4 border-primary relative">
                    <div className="absolute top-0 right-4 translate-y-[-50%] bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        Resposta da Loja
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquareReply size={16} className="text-primary" />
                        <span className="text-xs font-bold text-primary">Lojinha das Graças</span>
                    </div>
                    <p className="text-gray-700 text-sm italic font-medium">
                        "{review.admin_response}"
                    </p>
                    {review.admin_response_date && (
                        <div className="mt-3 text-[10px] font-bold text-gray-300 text-right">
                            Em {new Date(review.admin_response_date).toLocaleDateString('pt-BR')}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                <button
                    onClick={() => onHelpful?.(review.id)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors py-2 px-4 hover:bg-primary/5 rounded-full ring-1 ring-transparent hover:ring-primary/10"
                >
                    <ThumbsUp size={14} />
                    Esta avaliação foi útil? ({review.helpful_count})
                </button>
            </div>
        </div>
    );
};

interface ReviewSummaryProps {
    averageRating: number;
    totalReviews: number;
    stats: Record<number, number>;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ averageRating, totalReviews, stats }) => {
    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col md:flex-row gap-12 items-center md:items-stretch overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

            <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="text-7xl font-black text-gray-800 tracking-tighter mb-2">
                    {averageRating.toFixed(1)}
                </div>
                <ReviewStars rating={averageRating} size={24} className="mb-4" />
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {totalReviews} Avaliações
                </div>
            </div>

            <div className="flex-1 space-y-3 w-full max-w-sm">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats[star] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                    return (
                        <div key={star} className="flex items-center gap-4 group">
                            <div className="flex items-center gap-1 w-10">
                                <span className="text-xs font-black text-gray-400 group-hover:text-primary transition-colors">{star}</span>
                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1 h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-gray-300 w-8">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Star = ({ size, className }: { size: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
