import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

import { ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, Truck, CreditCard, Banknote, Check } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Helmet } from 'react-helmet-async';

export function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const quantity = 1;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);
    const [cep, setCep] = useState('');
    const [shippingCost, setShippingCost] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            api.products.getById(id).then(p => {
                setProduct(p || null);
                setLoading(false);
            });
        }
    }, [id]);



    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-stone-400 font-bold uppercase tracking-widest animate-pulse">Buscando detalhes...</p>
        </div>
    );
    if (!product) return <div className="p-20 text-center font-bold text-stone-500">Produto não encontrado.</div>;

    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const currentPrice = product.promotionalPrice || product.price;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in-up pb-20">
            {product && (
                <Helmet>
                    <title>{product.name} - Lojinha das Graças</title>
                    <meta name="description" content={product.description || `Confira este(a) ${product.name} na Lojinha das Graças.`} />
                    <meta property="og:title" content={`${product.name} - Artigos Religiosos`} />
                    <meta property="og:description" content={product.description} />
                    <meta property="og:image" content={product.image} />
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            "name": product.name,
                            "image": [product.image, ...(product.images || [])],
                            "description": product.description,
                            "sku": product.code || product.id,
                            "offers": {
                                "@type": "Offer",
                                "url": window.location.href,
                                "priceCurrency": "BRL",
                                "price": product.promotionalPrice || product.price,
                                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                                "seller": {
                                    "@type": "Organization",
                                    "name": "Lojinha das Graças"
                                }
                            }
                        })}
                    </script>
                </Helmet>
            )}
            {/* Left Column - Image & Gallery */}
            <div className="space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center text-stone-500 hover:text-brand-wood mb-4 transition-colors font-bold uppercase text-xs tracking-widest">
                    <ArrowLeft size={16} className="mr-2" /> Voltar
                </button>

                <div
                    className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-2xl group cursor-zoom-in hidden md:block"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZooming(true)}
                    onMouseLeave={() => setIsZooming(false)}
                >


                    <img
                        src={allImages[currentImageIndex]}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ease-out`}
                        style={{
                            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                            transform: isZooming ? 'scale(2)' : 'scale(1)'
                        }}
                    />

                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/90 dark:bg-stone-800/90 rounded-full shadow-xl text-stone-800 dark:text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/90 dark:bg-stone-800/90 rounded-full shadow-xl text-stone-800 dark:text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                </div>

                {/* Mobile Swipe Gallery */}
                <div className="md:hidden relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                    <div
                        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                        onScroll={(e) => {
                            const scrollLeft = e.currentTarget.scrollLeft;
                            const width = e.currentTarget.offsetWidth;
                            const newIndex = Math.round(scrollLeft / width);
                            if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
                        }}
                    >
                        {allImages.map((img, idx) => (
                            <div key={idx} className="flex-none w-full h-full snap-center">
                                <img src={img} alt={`${product.name} - ${idx}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    {allImages.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                            {allImages.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-brand-gold' : 'w-1.5 bg-white/40'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                    <div className="flex gap-4 justify-center">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex
                                    ? 'border-brand-gold scale-110 shadow-lg'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}


            </div>

            {/* Right Column - Info */}
            <div className="space-y-8 md:pt-14">
                <div>
                    <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">{product.category}</span>
                    <h1 className="text-4xl lg:text-5xl font-display font-bold text-brand-wood dark:text-stone-100 mt-4 leading-tight">{product.name}</h1>
                    {product.code && (
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-2">Cód: {product.code}</p>
                    )}
                </div>

                <div className="flex items-baseline gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
                    <span className="text-5xl font-bold text-brand-brown dark:text-amber-500 font-display">{formatCurrency(currentPrice)}</span>
                    {product.promotionalPrice && (
                        <span className="text-xl text-stone-300 line-through font-light italic">{formatCurrency(product.price)}</span>
                    )}
                </div>

                {/* Purchase Button - Moved Up */}
                <div className="space-y-4">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-xl hover:shadow-emerald-600/20 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <ShoppingCart size={22} />
                        {product.stock > 0 ? 'Comprar Agora' : 'Item Esgotado'}
                    </button>

                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-500">
                        <span className="flex items-center gap-2">
                            Estoque:
                            {product.stock > 0 ? (
                                <span className="text-emerald-600 flex items-center gap-1"><Check size={14} /> Disponível</span>
                            ) : (
                                <span className="text-red-500">Indisponível</span>
                            )}
                        </span>
                        {product.stock <= 5 && product.stock > 0 && (
                            <span className="text-red-500 animate-pulse">Restam {product.stock} un.</span>
                        )}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-100 dark:border-stone-800 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-stone-600 dark:text-stone-300">
                        <Banknote size={18} className="text-brand-gold" />
                        <span>Pagamento via Pix</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-auto">-5% OFF</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-stone-600 dark:text-stone-300">
                        <CreditCard size={18} className="text-brand-gold" />
                        <span>Cartão de Crédito</span>
                        <span className="text-xs text-stone-400 font-normal ml-auto">até 3x sem juros</span>
                    </div>
                </div>

                {/* Shipping Calculator */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                        <Truck size={14} /> Calcular Frete
                    </label>
                    <div className="flex gap-2">
                        <input
                            value={cep}
                            onChange={(e) => setCep(e.target.value)}
                            placeholder="00000-000"
                            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2 text-sm w-36 focus:ring-2 ring-brand-gold outline-none"
                            maxLength={9}
                        />
                        <button
                            onClick={() => setShippingCost(25.90)} // Mock calculation
                            className="bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-stone-300 transition-colors"
                        >
                            Calcular
                        </button>
                    </div>
                    {shippingCost !== null && (
                        <div className="text-sm text-stone-600 dark:text-stone-300 flex justify-between items-center bg-stone-50 dark:bg-stone-900 p-3 rounded-lg border border-stone-100">
                            <span>Frete Fixo (Simulação)</span>
                            <span className="font-bold text-brand-brown">{formatCurrency(shippingCost)}</span>
                        </div>
                    )}
                </div>

                {/* Description moved down */}
                <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Descrição do Produto</h3>
                    <div className="prose dark:prose-invert text-stone-500 dark:text-stone-400 text-base leading-relaxed">
                        <p>{product.description}</p>
                    </div>
                </div>


            </div>
        </div>
    );
}
