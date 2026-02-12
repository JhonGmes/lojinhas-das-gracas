import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

import { ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, Truck, CreditCard, Banknote, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
    const [shippingLoading, setShippingLoading] = useState(false);
    const [addressInfo, setAddressInfo] = useState<{ city: string; state: string } | null>(null);

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
                // Fallback: Se o CEP começa com 650 ou 651, provavelmente é São Luís/Grande Ilha
                if (cleanCEP.startsWith('650') || cleanCEP.startsWith('651')) {
                    setAddressInfo({ city: 'São Luís (Estimado)', state: 'MA' });
                    setShippingCost(12.00);
                    toast.success('Localização estimada por região');
                } else if (cleanCEP.startsWith('65')) {
                    setAddressInfo({ city: 'Maranhão (Estimado)', state: 'MA' });
                    setShippingCost(35.00);
                    toast.success('Localização estimada por estado');
                } else {
                    toast.error('CEP NÃO ENCONTRADO');
                    setShippingCost(null);
                    setAddressInfo(null);
                }
                return;
            }

            setAddressInfo({ city: data.localidade, state: data.uf });

            // Lógica de Frete Realista e Segura
            const state = data.uf;
            const city = data.localidade.toLowerCase();
            const isSaoLuisGrandeIlha = city.includes('são luís') ||
                city.includes('sao luis') ||
                city.includes('paço do lumiar') ||
                city.includes('são josé de ribamar') ||
                city.includes('raposa');

            if (state === 'MA') {
                if (isSaoLuisGrandeIlha) {
                    setShippingCost(12.00); // Grande Ilha
                } else {
                    setShippingCost(35.00); // Interior do MA
                }
            } else {
                // Regiões do Brasil
                const norte = ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'];
                const sul = ['PR', 'RS', 'SC'];
                const nordeste = ['AL', 'BA', 'CE', 'PB', 'PE', 'PI', 'RN', 'SE'];
                const centroOeste = ['DF', 'GO', 'MT', 'MS'];
                const sudeste = ['ES', 'MG', 'RJ', 'SP'];

                if (norte.includes(state) || sul.includes(state)) {
                    setShippingCost(68.00);
                } else if (sudeste.includes(state) || centroOeste.includes(state)) {
                    setShippingCost(52.00);
                } else if (nordeste.includes(state)) {
                    setShippingCost(42.00);
                } else {
                    setShippingCost(48.00);
                }
            }
        } catch (error) {
            toast.error('ERRO AO CONECTAR');
        } finally {
            setShippingLoading(false);
        }
    };

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
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 animate-fade-in-up">
            {product && (
                <Helmet>
                    <title>{product.name} - Lojinha das Graças</title>
                    <meta name="description" content={product.description || `Confira este(a) ${product.name} na Lojinha das Graças.`} />
                </Helmet>
            )}

            <button onClick={() => navigate(-1)} className="flex items-center text-stone-400 hover:text-brand-gold mb-4 transition-colors font-bold uppercase text-[8px] tracking-[0.2em] group">
                <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white dark:bg-stone-900/50 p-4 md:p-6 rounded-sm border border-brand-cotton-dark dark:border-stone-800 shadow-soft">
                {/* Left: Image & Gallery - Column 7 */}
                <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
                    {/* Vertical Thumbnails (Desktop) */}
                    {allImages.length > 1 && (
                        <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`aspect-square rounded-sm overflow-hidden border transition-all ${idx === currentImageIndex ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-stone-100 dark:border-stone-800 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    <div
                        className="relative flex-1 aspect-square rounded-sm overflow-hidden bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 group cursor-zoom-in max-h-[500px]"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsZooming(true)}
                        onMouseLeave={() => setIsZooming(false)}
                    >
                        <img
                            src={allImages[currentImageIndex]}
                            alt={product.name}
                            className="w-full h-full object-contain md:object-cover transition-transform duration-500 ease-out"
                            style={{
                                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                                transform: isZooming ? 'scale(2)' : 'scale(1)'
                            }}
                        />

                        {allImages.length > 1 && (
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity md:hidden">
                                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="p-1.5 bg-white/90 rounded-full shadow-lg text-stone-800">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="p-1.5 bg-white/90 rounded-full shadow-lg text-stone-800">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Info Section - Column 5 */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-gold">{product.category}</span>
                            {product.code && (
                                <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">Ref: {product.code}</span>
                            )}
                        </div>
                        <h1 className="text-xl md:text-2xl font-display font-medium text-stone-800 dark:text-stone-100 leading-tight tracking-tight uppercase">{product.name}</h1>
                    </div>

                    <div className="pt-2">
                        {product.promotionalPrice && (
                            <span className="text-[10px] text-stone-400 line-through font-medium block">{formatCurrency(product.price)}</span>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-brand-gold font-display">{formatCurrency(currentPrice)}</span>
                            {product.promotionalPrice && (
                                <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Oferta do Dia</span>
                            )}
                        </div>
                        <p className="text-[9px] text-stone-500 mt-1 uppercase font-bold tracking-wider">em 3x de {formatCurrency(currentPrice / 3)} sem juros</p>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-sm border border-brand-cotton-dark dark:border-stone-800 space-y-3">
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                            {product.stock > 0 ? (
                                <span className="text-emerald-600 flex items-center gap-1"><Check size={12} strokeWidth={3} /> Estoque disponível</span>
                            ) : (
                                <span className="text-red-500">Produto esgotado</span>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            className="w-full h-11 bg-brand-gold text-brand-wood font-black text-[10px] uppercase tracking-[0.2em] rounded-sm shadow-soft hover:bg-brand-wood hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={16} />
                            {product.stock > 0 ? 'ADICIONAR AO CARRINHO' : 'AVISE-ME'}
                        </button>
                    </div>

                    {/* Shipping & Payment Mini Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2 border border-stone-100 dark:border-stone-800 rounded-sm flex items-center gap-2 bg-emerald-50/30 dark:bg-emerald-900/10">
                            <Banknote size={14} className="text-emerald-600" />
                            <div>
                                <div className="text-[8px] font-black uppercase text-emerald-700 tracking-tighter">Pix -5% OFF</div>
                            </div>
                        </div>
                        <div className="p-2 border border-stone-100 dark:border-stone-800 rounded-sm flex items-center gap-2">
                            <CreditCard size={14} className="text-stone-400" />
                            <div className="text-[8px] font-bold uppercase text-stone-500 tracking-tighter">Até 3x sem juros</div>
                        </div>
                        <div className="p-2 border border-stone-100 dark:border-stone-800 rounded-sm flex items-center gap-2">
                            <Truck size={14} className="text-stone-400" />
                            <div className="text-[8px] font-bold uppercase text-stone-500 tracking-tighter">Entrega em todo Brasil</div>
                        </div>
                    </div>

                    {/* Shipping Calculator Compact */}
                    <div className="pt-2">
                        <div className="flex gap-2 items-center mb-2">
                            <Truck size={12} className="text-brand-gold" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Calcular Entrega</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={cep}
                                onChange={(e) => setCep(e.target.value)}
                                placeholder="00000-000"
                                className="flex-1 bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm px-3 py-2 text-[10px] font-bold focus:border-brand-gold outline-none tracking-widest"
                                maxLength={9}
                            />
                            <button
                                onClick={handleCalculateShipping}
                                disabled={shippingLoading}
                                className="bg-stone-800 text-white px-4 py-2 rounded-sm text-[9px] font-black hover:bg-brand-gold transition-all disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                            >
                                {shippingLoading ? <Loader2 size={12} className="animate-spin" /> : 'OK'}
                            </button>
                        </div>
                        {shippingCost !== null && addressInfo && (
                            <div className="mt-3 space-y-2 animate-fade-in">
                                <div className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">
                                    Enviando para: {addressInfo.city} - {addressInfo.state}
                                </div>
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-sm flex justify-between items-center transition-all">
                                    <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest">
                                        {addressInfo.city.toLowerCase().includes('são luís') ? 'Entrega Local (Motoboy)' : 'Envio via Transportadora'}
                                    </span>
                                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-500">{formatCurrency(shippingCost)}</span>
                                </div>
                                <p className="text-[7px] text-stone-400 font-bold uppercase leading-tight italic">
                                    * Valor estimado. A confirmação final será feita via WhatsApp.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-2 border-t border-stone-100 dark:border-stone-800">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.1em] text-stone-400 mb-2">Descrição</h3>
                        <div className="prose prose-sm dark:prose-invert text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed max-w-none line-clamp-6">
                            <p className="whitespace-pre-line">{product.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
