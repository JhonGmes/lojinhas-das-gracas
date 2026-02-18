import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Product, Review } from '../types';
import { useCart } from '../context/CartContext';

import { ShoppingCart, ArrowLeft, Banknote, CreditCard, Truck, Star, Mail, MessageCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { SEO } from '../components/SEO';
import WishlistButton from '../components/WishlistButton';
import ReviewStars from '../components/ReviewStars';
import { ReviewCard, ReviewSummary } from '../components/ReviewComponents';

export function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isReviewing, setIsReviewing] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '', email: '' });

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);
    const [cep, setCep] = useState('');
    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [addressInfo, setAddressInfo] = useState<{ city: string; state: string } | null>(null);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyForm, setNotifyForm] = useState({ name: '', email: '', whatsapp: '' });
    const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);

    const reviewStats = useMemo(() => {
        const stats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => stats[r.rating as keyof typeof stats]++);
        return stats;
    }, [reviews]);

    useEffect(() => {
        if (id) {
            setLoading(true);
            Promise.all([
                api.products.getById(id),
                api.reviews.list(id)
            ]).then(([p, r]) => {
                setProduct(p || null);
                setReviews(r || []);
                setLoading(false);
            }).catch(err => {
                console.error("Erro ao carregar produto:", err);
                setLoading(false);
            });
        }
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            if (product.stock > 0) {
                addToCart(product, 1);
                toast.success('Adicionado ao carrinho! 🛒');
            } else {
                setShowNotifyModal(true);
            }
        }
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReview.comment || !newReview.name) {
            toast.error('Preencha seu nome e comentário.');
            return;
        }
        try {
            await api.reviews.create({
                product_id: id!,
                customer_name: newReview.name,
                customer_email: newReview.email,
                rating: newReview.rating,
                comment: newReview.comment,
                is_verified_purchase: false
            });
            toast.success('Avaliação enviada com sucesso! 🙏');
            setIsReviewing(false);
            setNewReview({ rating: 5, comment: '', name: '', email: '' });
            const updatedReviews = await api.reviews.list(id!);
            setReviews(updatedReviews);
        } catch (err) {
            toast.error('Erro ao enviar avaliação.');
        }
    };

    const handleCalculateShipping = async () => {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length !== 8) {
            toast.error('CEP INVÁLIDO');
            return;
        }

        setShippingLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
            const data = await response.json();

            if (data.erro) {
                toast.error('CEP NÃO ENCONTRADO');
                setShippingCost(null);
                setAddressInfo(null);
                return;
            }

            setAddressInfo({ city: data.localidade, state: data.uf });
            const state = data.uf;
            const city = data.localidade.toLowerCase();
            const isSaoLuisGrandeIlha = city.includes('são luís') || city.includes('sao luis') || city.includes('paço do lumiar') || city.includes('são josé de ribamar') || city.includes('raposa');

            if (state === 'MA') {
                setShippingCost(isSaoLuisGrandeIlha ? 12.00 : 35.00);
            } else {
                // Cálculo simplificado para outras regiões
                const regions = {
                    norte_sul: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO', 'PR', 'RS', 'SC'],
                    sudeste_centro: ['ES', 'MG', 'RJ', 'SP', 'DF', 'GO', 'MT', 'MS'],
                    nordeste: ['AL', 'BA', 'CE', 'PB', 'PE', 'PI', 'RN', 'SE']
                };

                if (regions.norte_sul.includes(state)) setShippingCost(68.00);
                else if (regions.sudeste_centro.includes(state)) setShippingCost(52.00);
                else setShippingCost(42.00);
            }
        } catch (error) {
            toast.error('ERRO AO CONECTAR');
        } finally {
            setShippingLoading(false);
        }
    };

    const handleSubmitNotify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifyForm.name || (!notifyForm.email && !notifyForm.whatsapp)) {
            toast.error('Preencha seu nome e pelo menos um contato.');
            return;
        }

        setIsSubmittingNotify(true);
        try {
            await api.waitingList.create({
                product_id: product!.id,
                customer_name: notifyForm.name,
                customer_email: notifyForm.email || undefined,
                customer_whatsapp: notifyForm.whatsapp || undefined
            });
            toast.success('Avisaremos você assim que voltar ao estoque! 🙏✨', { duration: 5000 });
            setShowNotifyModal(false);
            setNotifyForm({ name: '', email: '', whatsapp: '' });
        } catch (error) {
            toast.error('Erro ao salvar seu contato.');
        } finally {
            setIsSubmittingNotify(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-stone-400 font-bold uppercase tracking-widest animate-pulse">Buscando detalhes...</p>
        </div>
    );

    if (!product) return (
        <div className="p-20 text-center">
            <h2 className="text-2xl font-bold text-stone-500 mb-4">Produto não encontrado.</h2>
            <button onClick={() => navigate('/')} className="text-brand-gold font-bold uppercase tracking-[0.2em]">Voltar para a Home</button>
        </div>
    );

    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const currentPrice = product.promotionalPrice || product.price;

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 animate-fade-in-up">
            <SEO
                title={product.name}
                description={product.description}
                image={product.image}
                type="product"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "image": [product.image, ...(product.images || [])],
                    "description": product.description,
                    "sku": product.code || product.id,
                    "brand": {
                        "@type": "Brand",
                        "name": "Lojinha das Graças"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": window.location.href,
                        "priceCurrency": "BRL",
                        "price": product.promotionalPrice || product.price,
                        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                        "itemCondition": "https://schema.org/NewCondition"
                    },
                    "aggregateRating": reviews.length > 0 ? {
                        "@type": "AggregateRating",
                        "ratingValue": product.average_rating || 5,
                        "reviewCount": reviews.length
                    } : undefined
                }}
            />

            <button onClick={() => navigate(-1)} className="flex items-center text-stone-400 hover:text-brand-gold mb-4 transition-colors font-bold uppercase text-[8px] tracking-[0.2em] group">
                <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-lg overflow-hidden relative">
                {/* Imagens */}
                <div className="lg:col-span-6 flex flex-col md:flex-row gap-4">
                    <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`aspect-square rounded-xl overflow-hidden border transition-all ${idx === currentImageIndex ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    <div
                        className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group cursor-zoom-in h-fit shadow-inner max-h-[450px]"
                        onMouseMove={(e) => {
                            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                            setMousePos({ x: ((e.pageX - left - window.scrollX) / width) * 100, y: ((e.pageY - top - window.scrollY) / height) * 100 });
                        }}
                        onMouseEnter={() => setIsZooming(true)}
                        onMouseLeave={() => setIsZooming(false)}
                    >
                        <img
                            src={allImages[currentImageIndex]}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform duration-500"
                            style={{ transformOrigin: `${mousePos.x}% ${mousePos.y}%`, transform: isZooming ? 'scale(2)' : 'scale(1)' }}
                        />
                    </div>
                </div>

                {/* Informações */}
                <div className="lg:col-span-6 flex flex-col pt-2">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold bg-brand-gold/10 px-2 py-1 rounded-full">{product.category}</span>
                        <WishlistButton productId={product.id} size={20} />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-display font-medium text-stone-800 leading-tight mb-2 tracking-tight uppercase">{product.name}</h1>

                    <div className="flex items-center gap-3 mb-6">
                        <ReviewStars rating={product.average_rating || 0} totalReviews={reviews.length} size={16} showText />
                    </div>

                    <div className="mb-6">
                        {product.promotionalPrice && (
                            <span className="text-xs text-gray-400 line-through font-bold block mb-1">De {formatCurrency(product.price)}</span>
                        )}
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-brand-gold font-display">Por {formatCurrency(currentPrice)}</span>
                            {product.promotionalPrice && (
                                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded uppercase">Promoção</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <button
                            onClick={handleAddToCart}
                            className="w-full h-12 bg-stone-800 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg hover:bg-brand-gold hover:text-stone-900 transition-all transform active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <ShoppingCart size={18} className="group-hover:translate-x-1 transition-transform" />
                            {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Avise-me quando chegar'}
                        </button>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                                <Banknote size={16} className="text-emerald-500 mb-1" />
                                <span className="text-[7px] font-black uppercase text-stone-400">Pix -5%</span>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                                <CreditCard size={16} className="text-stone-400 mb-1" />
                                <span className="text-[7px] font-black uppercase text-stone-400">3x S/ Juros</span>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                                <Truck size={16} className="text-stone-400 mb-1" />
                                <span className="text-[7px] font-black uppercase text-stone-400">Todo Brasil</span>
                            </div>
                        </div>
                    </div>

                    {/* Frete */}
                    <div className="pt-2 border-t border-gray-100 mb-6 mt-2">
                        <div className="flex gap-2 items-center mb-2">
                            <Truck size={12} className="text-brand-gold" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Calcular Entrega</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={cep}
                                onChange={(e) => setCep(e.target.value)}
                                placeholder="00000-000"
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-bold focus:ring-1 focus:ring-brand-gold/20 outline-none tracking-widest h-9"
                                maxLength={9}
                            />
                            <button
                                onClick={handleCalculateShipping}
                                disabled={shippingLoading}
                                className="bg-stone-800 text-white px-4 py-2 rounded-lg text-[9px] font-black hover:bg-brand-gold transition-all disabled:opacity-50 flex items-center justify-center min-w-[60px] h-9"
                            >
                                {shippingLoading ? <Loader2 size={12} className="animate-spin" /> : 'Calcular'}
                            </button>
                        </div>
                        {shippingCost !== null && addressInfo && (
                            <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center animate-fade-in">
                                <span className="text-[9px] font-black text-emerald-700 uppercase">{addressInfo.city} - {addressInfo.state}</span>
                                <span className="text-[10px] font-black text-emerald-700">{formatCurrency(shippingCost)}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Sobre este Tesouro</h3>
                        <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line font-medium">{product.description}</p>
                    </div>
                </div>
            </div>

            {/* Avaliações */}
            <section className="mt-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 tracking-tighter mb-2">Avaliações de Clientes</h2>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sua fé, nossa motivação</p>
                    </div>
                    <button
                        onClick={() => setIsReviewing(!isReviewing)}
                        className="bg-stone-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-gold transition-all"
                    >
                        {isReviewing ? 'Cancelar Avaliação' : 'Escrever uma Avaliação'}
                    </button>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-4 sticky top-24">
                        <ReviewSummary
                            averageRating={product.average_rating || 0}
                            totalReviews={reviews.length}
                            stats={reviewStats}
                        />
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        {isReviewing && (
                            <div className="bg-white p-8 rounded-3xl border-2 border-brand-gold/20 shadow-2xl animate-scale-in">
                                <h3 className="text-xl font-black text-gray-800 mb-6">Como foi sua experiência?</h3>
                                <form onSubmit={handleSubmitReview} className="space-y-6">
                                    <div className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-2xl">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Sua nota</span>
                                        <ReviewStars rating={newReview.rating} size={32} interactive onRatingChange={(r) => setNewReview({ ...newReview, rating: r })} />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="text" required placeholder="Seu nome"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20"
                                            value={newReview.name} onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                                        />
                                        <input
                                            type="email" placeholder="Seu email (opcional)"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20"
                                            value={newReview.email} onChange={e => setNewReview({ ...newReview, email: e.target.value })}
                                        />
                                    </div>
                                    <textarea
                                        required placeholder="O que você achou do produto? Detalhes ajudam outros clientes..."
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold h-32 focus:ring-2 focus:ring-brand-gold/20"
                                        value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                    />
                                    <button type="submit" className="w-full bg-stone-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-brand-gold transition-colors">Enviar Avaliação</button>
                                </form>
                            </div>
                        )}

                        {reviews.length > 0 ? (
                            <div className="grid gap-6">
                                {reviews.map(r => <ReviewCard key={r.id} review={r} onHelpful={(rid) => api.reviews.markHelpful(rid)} />)}
                            </div>
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                                <Star size={48} className="text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">Seja o primeiro a avaliar!</h3>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modal Avise-me */}
            {showNotifyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100">
                        <button onClick={() => setShowNotifyModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-600">
                            <X size={24} />
                        </button>

                        <div className="p-10">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold mb-4">
                                    <ShoppingCart size={32} />
                                </div>
                                <h2 className="text-2xl font-display font-medium text-stone-800 uppercase tracking-wider">Avise-me!</h2>
                                <p className="text-xs text-stone-500 mt-2">Deixe seus dados e avisaremos assim que o estoque brilhar novamente. 🙏</p>
                            </div>

                            <form onSubmit={handleSubmitNotify} className="space-y-4">
                                <input
                                    type="text" required placeholder="Seu nome"
                                    value={notifyForm.name} onChange={e => setNotifyForm({ ...notifyForm, name: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                                />
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                        <input
                                            type="email" placeholder="Email"
                                            value={notifyForm.email} onChange={e => setNotifyForm({ ...notifyForm, email: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                        <input
                                            type="text" placeholder="WhatsApp"
                                            value={notifyForm.whatsapp} onChange={e => setNotifyForm({ ...notifyForm, whatsapp: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={isSubmittingNotify}
                                    className="w-full h-14 bg-stone-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg hover:bg-brand-gold hover:text-stone-900 transition-all mt-6"
                                >
                                    {isSubmittingNotify ? <Loader2 size={24} className="animate-spin" /> : 'Quero ser avisado'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
