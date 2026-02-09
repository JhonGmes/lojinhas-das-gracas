import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function ProductCard({ product }: { product: Product }) {
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
            className="group glass-card premium-shadow rounded-2xl overflow-hidden transition-all duration-500 flex flex-col h-full border-none hover:-translate-y-2 active:scale-[0.98]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-stone-100 dark:bg-stone-900/50 block group/img">
                {/* Desktop View: Auto Cycle on Hover */}
                <div className="hidden md:block w-full h-full">
                    <img
                        src={allImages[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
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
                    <div className={`absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-100 md:opacity-0'}`}>
                        {allImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-brand-gold shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'w-1 bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}

                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white font-bold bg-stone-800/80 backdrop-blur-md px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] border border-white/10">Esgotado</span>
                    </div>
                )}

                {product.promotionalPrice && product.stock > 0 && (
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        <div className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-widest animate-pulse">
                            Oferta
                        </div>
                    </div>
                )}
            </Link>

            <div className="p-5 flex flex-col flex-1">
                <div className="mb-2 text-[10px] text-brand-gold dark:text-amber-400/80 font-bold uppercase tracking-[0.15em] opacity-80">{product.category}</div>
                <Link to={`/product/${product.id}`} className="block mb-3">
                    <h3 className="font-display font-bold text-lg text-stone-800 dark:text-stone-100 mb-1 leading-tight group-hover:text-brand-gold transition-colors line-clamp-2">{product.name}</h3>
                </Link>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-stone-100/50 dark:border-stone-700/30">
                    <div className="flex flex-col">
                        {product.promotionalPrice && (
                            <span className="text-[10px] text-stone-400 font-bold line-through mb-0.5">{formatCurrency(product.price)}</span>
                        )}
                        <span className="text-xl font-bold bg-gradient-to-r from-stone-800 to-stone-600 dark:from-white dark:to-stone-400 bg-clip-text text-transparent">
                            {formatCurrency(currentPrice)}
                        </span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="p-3 bg-stone-900 dark:bg-amber-600 text-white rounded-xl hover:bg-brand-gold dark:hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-brand-gold/20 transform active:scale-90 flex items-center justify-center"
                        aria-label="Adicionar ao carrinho"
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
