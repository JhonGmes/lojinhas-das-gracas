import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Share2, Compass, Bell, BellOff, Tag, Package } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { Helmet } from 'react-helmet-async';

export const Wishlist: React.FC = () => {
    const { items, removeFromWishlist, updatePreferences, loading } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (product: any) => {
        addToCart(product, 1);
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Link da lista copiado! 📋');
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-stone-400 font-bold uppercase tracking-widest animate-pulse font-display">Carregando seus desejos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 mt-20">
            <Helmet>
                <title>Meus Favoritos - Lojinha das Graças</title>
                <meta name="description" content="Sua lista de desejos e artigos favoritos na Lojinha das Graças." />
            </Helmet>

            {/* Header */}
            <div className="py-12 md:py-20 border-b border-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-brand-gold font-black uppercase tracking-[0.3em] text-[10px]">
                                <Heart size={14} className="fill-brand-gold" />
                                Devoção Guardada
                            </div>
                            <h1 className="text-4xl md:text-6xl font-display font-medium text-stone-800 tracking-tighter uppercase">
                                Meus Favoritos
                            </h1>
                            <p className="text-stone-400 font-medium italic text-sm">
                                Itens que tocaram seu coração de uma forma especial.
                            </p>
                        </div>

                        {items.length > 0 && (
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-3 bg-white border border-stone-200 text-stone-600 px-8 py-4 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-brand-gold hover:text-brand-wood hover:border-brand-gold transition-all shadow-soft active:scale-95"
                            >
                                <Share2 size={16} />
                                Compartilhar Lista
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-16">
                <div className="max-w-4xl mx-auto">
                    {items.length === 0 ? (
                        <div className="bg-stone-50 rounded-3xl p-16 text-center border-2 border-dashed border-stone-200">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Heart size={44} className="text-stone-200" />
                            </div>
                            <h2 className="text-2xl font-display font-medium text-stone-800 mb-2 uppercase tracking-tight">Sua lista está vazia</h2>
                            <p className="text-stone-400 mb-10 max-w-sm mx-auto font-medium">
                                Explore nosso catálogo e salve os tesouros que você amou para comprar em um momento de fé.
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-3 bg-stone-800 text-white px-10 py-5 rounded-sm font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-gold hover:text-brand-wood transition-all active:scale-95 group"
                            >
                                <Compass size={20} className="group-hover:rotate-12 transition-transform" />
                                Começar a Explorar
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {items.map((item) => {
                                const product = item.product;
                                if (!product) return null;

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all group flex flex-col md:flex-row gap-8 relative overflow-hidden"
                                    >
                                        {/* Image Area */}
                                        <Link to={`/product/${product.id}`} className="shrink-0">
                                            <div className="w-full md:w-48 h-56 md:h-48 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 group-hover:scale-105 transition-transform duration-700">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-4"
                                                />
                                            </div>
                                        </Link>

                                        {/* Info Area */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-1 block">
                                                            {product.category}
                                                        </span>
                                                        <Link to={`/product/${product.id}`}>
                                                            <h3 className="text-2xl font-display font-medium text-stone-800 hover:text-brand-gold transition-colors leading-tight uppercase">
                                                                {product.name}
                                                            </h3>
                                                        </Link>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => removeFromWishlist(item.product_id)}
                                                            className="text-stone-300 hover:text-red-500 transition-colors p-3 hover:bg-red-50 rounded-full"
                                                            title="Remover dos Favoritos"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Notification Controls */}
                                                <div className="flex flex-wrap gap-4 py-3 border-y border-stone-50 my-4">
                                                    <button
                                                        onClick={() => updatePreferences(item.product_id, { notify_on_sale: !item.notify_on_sale })}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${item.notify_on_sale ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}
                                                    >
                                                        {item.notify_on_sale ? <Bell size={12} /> : <BellOff size={12} />}
                                                        <Tag size={12} />
                                                        Avisar Promoção
                                                    </button>
                                                    <button
                                                        onClick={() => updatePreferences(item.product_id, { notify_on_stock: !item.notify_on_stock })}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${item.notify_on_stock ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}
                                                    >
                                                        {item.notify_on_stock ? <Bell size={12} /> : <BellOff size={12} />}
                                                        <Package size={12} />
                                                        Avisar Estoque
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
                                                <div className="flex flex-col">
                                                    {product.promotionalPrice ? (
                                                        <div className="flex items-baseline gap-3">
                                                            <span className="text-2xl font-black text-brand-gold font-display">{formatCurrency(product.promotionalPrice)}</span>
                                                            <span className="text-xs text-stone-300 line-through font-bold">{formatCurrency(product.price)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-2xl font-black text-stone-800 font-display">{formatCurrency(product.price)}</span>
                                                    )}
                                                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                                                        {product.stock > 0 ? '✨ Em Estoque' : '⏳ Esgotado'}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-stone-800 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-gold hover:text-brand-wood shadow-xl active:scale-95 transition-all"
                                                >
                                                    <ShoppingBag size={18} />
                                                    {product.stock > 0 ? 'No Carrinho' : 'Avise-me'}
                                                </button>
                                            </div>
                                        </div>

                                        {(item.notify_on_sale || item.notify_on_stock) && (
                                            <div className="absolute top-4 right-4 text-[8px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                                                <Bell size={10} className="animate-bounce" /> Notificações Ativas
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
