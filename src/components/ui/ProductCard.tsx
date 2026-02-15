import { Link } from 'react-router-dom';
import { useState, useEffect, memo } from 'react';
import type { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Combine main image with gallery images
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const currentPrice = product.promotionalPrice || product.price;

    useEffect(() => {
        let interval: any;

        if (isHovered && allImages.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
            }, 1000);
        } else {
            setCurrentImageIndex(0);
        }

        return () => clearInterval(interval);
    }, [isHovered, allImages.length]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product, 1);
    };

    return (
        <div
            className="group bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm shadow-soft hover:shadow-soft-lg transition-all duration-400 flex flex-col h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-900/50 block group/img">
                {/* Desktop View: Auto Cycle on Hover */}
                <div className="hidden md:block w-full h-full">
                    <img
                        src={allImages[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                        loading="lazy"
                    />
                </div>

                {/* Mobile View: Manual Swipe */}
                <div
                    className="md:hidden flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    onScroll={(e) => {
                        const scrollLeft = e.currentTarget.scrollLeft;
                        const width = e.currentTarget.offsetWidth;
                        const newIndex = Math.round(scrollLeft / width);
                        if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
                    }}
                >
                    {allImages.map((img, idx) => (
                        <div key={idx} className="flex-none w-full h-full snap-center">
                            <img src={img} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                {/* Progress Indicators */}
                {allImages.length > 1 && (
                    <div className={`absolute bottom-2 left-0 right-0 flex justify-center gap-1 px-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-100 md:opacity-0'}`}>
                        {allImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-0.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-3 bg-brand-gold shadow-[0_0_4px_rgba(245,158,11,0.6)]' : 'w-1 bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}

                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-white font-bold bg-stone-800/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.15em] border border-white/10">Esgotado</span>
                    </div>
                )}

                {product.promotionalPrice && product.stock > 0 && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        <div className="bg-brand-gold text-brand-wood text-[8px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm uppercase tracking-wider">
                            Oferta
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm text-brand-gold text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-sm border border-brand-gold/20">
                            -{Math.round(((product.price - product.promotionalPrice) / product.price) * 100)}%
                        </div>
                    </div>
                )}
            </Link>

            <div className="p-2 md:p-3 flex flex-col flex-1">
                <div className="mb-0.5 text-[8px] text-brand-gold font-bold uppercase tracking-[0.05em]">{product.category}</div>
                <Link to={`/product/${product.id}`} className="block mb-1.5">
                    <h3 className="font-display font-medium text-xs md:text-sm text-stone-800 dark:text-stone-100 mb-0.5 leading-snug group-hover:text-brand-gold transition-colors duration-400 line-clamp-2 h-8 md:h-10">{product.name}</h3>
                </Link>

                <div className="mt-auto pt-2 flex items-center justify-between border-t border-stone-100/30 dark:border-stone-700/20">
                    <div className="flex flex-col">
                        {product.promotionalPrice && (
                            <span className="text-[8px] text-stone-400 font-bold line-through mb-0">{formatCurrency(product.price)}</span>
                        )}
                        <span className="text-sm md:text-base font-bold text-stone-800 dark:text-white">
                            {formatCurrency(currentPrice)}
                        </span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="p-2 bg-brand-gold text-brand-wood rounded-sm hover:bg-brand-gold-light disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-400 shadow-soft flex items-center justify-center"
                        aria-label="Adicionar ao carrinho"
                    >
                        <ShoppingCart size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
});
