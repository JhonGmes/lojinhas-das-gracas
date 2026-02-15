import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface WishlistButtonProps {
    productId: string;
    size?: number;
    className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
    productId,
    size = 20,
    className = ""
}) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [active, setActive] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setActive(isInWishlist(productId));
    }, [productId, isInWishlist]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        if (active) {
            removeFromWishlist(productId);
            setActive(false);
        } else {
            addToWishlist(productId);
            setActive(true);
        }
    };

    return (
        <button
            onClick={handleToggle}
            title={active ? "Remover da Lista de Desejos" : "Adicionar à Lista de Desejos"}
            className={`relative group flex items-center justify-center p-2.5 rounded-full transition-all ring-offset-2 hover:scale-110 active:scale-95 ${active
                    ? 'bg-red-50 text-red-500 ring-2 ring-red-100'
                    : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 border border-gray-100 shadow-sm'
                } ${isAnimating ? 'animate-bounce' : ''} ${className}`}
        >
            <Heart
                size={size}
                strokeWidth={2}
                className={`transition-all duration-300 ${active ? 'fill-red-500 scale-110' : 'fill-none'
                    }`}
            />

            {!active && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Favoritar
                </div>
            )}
        </button>
    );
};

export default WishlistButton;
