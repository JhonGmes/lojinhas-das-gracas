import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { geminiService } from '../services/gemini';
import { Sparkles, ShoppingCart, ArrowLeft, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [editPrompt, setEditPrompt] = useState('Em um altar iluminado');
    const [editing, setEditing] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);

    useEffect(() => {
        if (id) {
            api.products.getById(id).then(p => {
                setProduct(p || null);
                setLoading(false);
            });
        }
    }, [id]);

    const handleAnalyze = async () => {
        if (!product) return;
        setAnalyzing(true);
        try {
            const text = await geminiService.analyzeProduct(product.name, product.description);
            setAnalysis(text);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleEditImage = async () => {
        if (!product) return;
        setEditing(true);
        try {
            const newUrl = await geminiService.editImage(allImages[currentImageIndex], editPrompt);
            setEditedImage(newUrl);
        } finally {
            setEditing(false);
        }
    };

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
        setEditedImage(null); // Reset IA edit when switching images
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
        setEditedImage(null);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (editing) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in-up pb-20">
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
                    {editing && (
                        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-md">
                            <div className="text-white font-bold flex flex-col items-center text-center p-6">
                                <Sparkles className="animate-spin mb-4 text-brand-gold" size={40} />
                                <span className="uppercase tracking-widest text-sm">A IA está criando um cenário divino para você...</span>
                            </div>
                        </div>
                    )}

                    <img
                        src={editedImage || allImages[currentImageIndex]}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ease-out`}
                        style={{
                            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                            transform: isZooming ? 'scale(2)' : 'scale(1)'
                        }}
                    />

                    {/* Navigation Arrows */}
                    {allImages.length > 1 && !editedImage && (
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

                    {editedImage && (
                        <div className="absolute top-6 right-6 bg-brand-gold text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg font-bold uppercase tracking-widest animate-fade-in">
                            ✨ Cenario IA
                            <button onClick={() => setEditedImage(null)} className="ml-2 hover:text-stone-200">✕</button>
                        </div>
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
                                onClick={() => { setCurrentImageIndex(idx); setEditedImage(null); }}
                                className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex && !editedImage
                                    ? 'border-brand-gold scale-110 shadow-lg'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* AI Tools */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700">
                    <h3 className="font-bold text-xs mb-4 flex items-center gap-2 text-stone-400 uppercase tracking-widest">
                        <Wand2 size={16} className="text-brand-gold" /> Criar Cenário com IA
                    </h3>
                    <div className="flex gap-3">
                        <input
                            value={editPrompt}
                            onChange={e => setEditPrompt(e.target.value)}
                            className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-brand-gold transition-all outline-none"
                            placeholder="Ex: Em um altar iluminado por velas"
                        />
                        <button
                            onClick={handleEditImage}
                            disabled={editing}
                            className="bg-brand-wood text-white px-6 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md hover:bg-brand-brown disabled:opacity-50 transition-all active:scale-95"
                        >
                            {editing ? '...' : 'Gerar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-8 md:pt-14">
                <div>
                    <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">{product.category}</span>
                    <h1 className="text-4xl lg:text-6xl font-display font-bold text-brand-wood dark:text-stone-100 mt-4 leading-tight">{product.name}</h1>
                </div>

                <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-bold text-brand-brown dark:text-amber-500 font-display">{formatCurrency(currentPrice)}</span>
                    {product.promotionalPrice && (
                        <span className="text-2xl text-stone-300 line-through font-light italic">{formatCurrency(product.price)}</span>
                    )}
                </div>

                <div className="prose dark:prose-invert text-stone-500 dark:text-stone-400 text-lg leading-relaxed">
                    <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-brand-gold first-letter:mr-1">{product.description}</p>
                </div>

                {/* AI Analysis */}
                <div className="bg-[#FDFBF7] dark:bg-stone-900/50 p-8 rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-inner relative group">
                    <div className="absolute -top-3 -left-3 bg-brand-gold text-white p-2 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                        <Sparkles size={20} />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="flex items-center gap-3 text-brand-wood dark:text-stone-200 font-bold mb-4 hover:text-brand-gold disabled:opacity-50 transition-colors uppercase text-xs tracking-[0.15em]"
                    >
                        {analyzing ? 'Consultando Sabedoria...' : 'Significado Espiritual'}
                    </button>
                    {analysis ? (
                        <div className="text-stone-600 dark:text-stone-300 italic text-lg leading-relaxed animate-fade-in pl-2 border-l-2 border-brand-gold/30">
                            "{analysis}"
                        </div>
                    ) : (
                        <div className="text-stone-400 text-sm italic">Clique acima para ver a análise espiritual deste produto.</div>
                    )}
                </div>

                {/* Purchase Area */}
                <div className="pt-8 border-t border-stone-100 dark:border-stone-800 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex items-center bg-stone-100 dark:bg-stone-900 rounded-full p-1 h-16 shadow-inner w-full sm:w-auto">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-full flex items-center justify-center hover:bg-white dark:hover:bg-stone-800 rounded-full transition-all text-2xl font-light text-stone-400">-</button>
                            <span className="w-16 text-center font-bold text-xl font-display">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-14 h-full flex items-center justify-center hover:bg-white dark:hover:bg-stone-800 rounded-full transition-all text-2xl font-light text-stone-400">+</button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            className="w-full h-16 bg-brand-wood hover:bg-brand-brown text-white font-bold text-sm uppercase tracking-widest rounded-full shadow-2xl hover:shadow-brand-gold/20 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-4 active:scale-[0.98]"
                        >
                            <ShoppingCart size={22} />
                            {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Item Esgotado'}
                        </button>
                    </div>

                    {product.stock <= 5 && product.stock > 0 && (
                        <p className="text-red-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 justify-center sm:justify-start">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            Apenas {product.stock} unidades restantes!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
