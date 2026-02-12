import { useRef, useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Sparkles, ArrowRight, Feather, Compass, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BlogCard } from '../components/ui/BlogCard';

import { useBlog } from '../context/BlogContext';
import { Helmet } from 'react-helmet-async';

export function Home() {
    const { products, loading } = useProducts();
    const { settings } = useStore();
    const location = useLocation();
    const { posts } = useBlog();
    const offersRef = useRef<HTMLDivElement>(null);

    // Carousel State
    const [currentBanner, setCurrentBanner] = useState(0);
    const banners = [
        settings.hero_image_url || "https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000",
        ...(settings.hero_banners || [])
    ].filter(Boolean);

    // Auto-advance carousel
    useEffect(() => {
        if (banners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 6000); // 6 seconds per banner

        return () => clearInterval(timer);
    }, [banners.length]);

    const nextBanner = () => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
    };

    const prevBanner = () => {
        setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    // Filter states driven by URL
    const queryParams = new URLSearchParams(location.search);
    const urlCategory = queryParams.get('cat') || 'Todos';
    const urlSearch = queryParams.get('q') || '';

    const scrollToOffers = () => {
        offersRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const promoProducts = products.filter(p => p.promotionalPrice && p.stock > 0);
    const featuredProducts = products.filter(p => p.isFeatured && p.stock > 0);

    const filtered = products.filter(p => {
        const matchesCategory = urlCategory === 'Todos' || p.category === urlCategory;
        const matchesSearch = p.name.toLowerCase().includes(urlSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const isFiltered = urlCategory !== 'Todos' || urlSearch !== '';

    const featuredPosts = posts.filter(p => p.isFeatured && p.isPublished).slice(0, 3);

    return (
        <div className="flex flex-col w-full">
            <Helmet>
                <title>{settings.store_name} - Artigos Religiosos e Presentes de Fé</title>
                <meta name="description" content={`Bem-vindo à ${settings.store_name}. Encontre os melhores artigos religiosos, terços, imagens e presentes para fortalecer sua fé.`} />
                <meta property="og:title" content={`${settings.store_name} - Artigos Religiosos`} />
                <meta property="og:description" content="Sua loja de fé e devoção online. Artigos selecionados com carinho e reverência." />
            </Helmet>
            {!isFiltered && (
                <>
                    {/* Hero Carousel - Slimmer Height like ML */}
                    <section className="relative h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden group w-full bg-stone-900 border-b border-brand-gold/20">
                        {/* Slides */}
                        {banners.map((url, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100 scale-100 translate-x-0' :
                                    index < currentBanner ? 'opacity-0 scale-110 -translate-x-full' : 'opacity-0 scale-110 translate-x-full'
                                    }`}
                            >
                                <img
                                    src={url}
                                    alt={`Banner ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-linear group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                            </div>
                        ))}

                        {/* Content (Constant across slides for consistent branding) */}
                        <div className="absolute inset-0 flex items-center z-10 pointer-events-none">
                            <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
                                <div className="max-w-2xl text-white space-y-4 md:space-y-6 animate-fade-in-up pointer-events-auto">
                                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-medium leading-[1.1] drop-shadow-2xl uppercase tracking-tighter">
                                        {settings.hero_title || 'Encontre Paz e Devoção'}
                                    </h1>
                                    <p className="text-xs md:text-base lg:text-xl opacity-90 drop-shadow-lg font-light max-w-xl italic line-clamp-2 md:line-clamp-none">
                                        {settings.hero_subtitle || 'Artigos religiosos selecionados com amor para fortalecer sua fé.'}
                                    </p>
                                    <div className="pt-2">
                                        <button
                                            onClick={scrollToOffers}
                                            className="bg-brand-gold text-brand-wood font-black py-2.5 px-6 md:py-3.5 md:px-10 rounded-sm shadow-soft-lg hover:bg-white hover:text-brand-gold transition-all duration-500 transform hover:-translate-y-1 active:scale-95 text-[9px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-2 md:gap-3"
                                        >
                                            {settings.hero_button_text || 'Ver Ofertas'} <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carousel Controls */}
                        {banners.length > 1 && (
                            <>
                                <button
                                    onClick={prevBanner}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-brand-gold hover:border-brand-gold transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextBanner}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-brand-gold hover:border-brand-gold transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                {/* Progress Indicators */}
                                <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:gap-3">
                                    {banners.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentBanner(index)}
                                            className={`h-0.5 md:h-1 transition-all duration-500 rounded-full ${index === currentBanner ? 'w-6 md:w-10 bg-brand-gold' : 'w-1.5 md:w-2 bg-white/30 hover:bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Wrapped Content - Standardized width and less spacing */}
                    <div className="max-w-7xl mx-auto px-4 space-y-12 md:space-y-16 mt-8 md:mt-12">
                        {/* Showcase Highlights / Destaques */}
                        {featuredProducts.length > 0 && (
                            <section className="animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-4 md:mb-6">
                                    <div className="text-brand-gold">
                                        <Sparkles size={20} className="md:size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.15em]">Destaques</h2>
                                        <p className="text-[7px] md:text-[8px] text-stone-400 font-bold uppercase tracking-[0.3em] mt-0.5">Curadoria Especial</p>
                                    </div>
                                    <div className="h-px flex-1 bg-brand-cotton-dark dark:bg-stone-800 ml-4 md:ml-6" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                                    {featuredProducts.slice(0, 12).map(p => (
                                        <ProductCard key={`${p.id}-featured`} product={p} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Flash Deals / Promo Section */}
                        {promoProducts.length > 0 && (
                            <section ref={offersRef} className="animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-4 md:mb-6">
                                    <div className="text-brand-gold">
                                        <Gift size={20} className="md:size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.15em]">Ofertas</h2>
                                        <p className="text-[7px] md:text-[8px] text-brand-gold font-bold uppercase tracking-[0.3em] mt-0.5">Oportunidades Únicas</p>
                                    </div>
                                    <div className="h-px flex-1 bg-brand-cotton-dark dark:bg-stone-800 ml-4 md:ml-6" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                                    {promoProducts.slice(0, 12).map(p => (
                                        <ProductCard key={`${p.id}-promo`} product={p} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </>
            )}

            {/* Main Product Grid Wrapped */}
            <div className="max-w-7xl mx-auto px-4 space-y-12 md:space-y-16 mt-12 md:mt-20">
                <section className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-8 md:mb-12">
                        <div className="flex items-center gap-3">
                            <div className="text-brand-gold">
                                <Compass size={20} className="md:size-6" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.15em]">
                                    {isFiltered ? (urlSearch ? `Resultados para "${urlSearch}"` : urlCategory) : 'Catálogo'}
                                </h2>
                                <p className="text-[7px] md:text-[8px] text-stone-400 font-bold uppercase tracking-[0.3em] mt-1">
                                    {isFiltered ? 'Filtrado com Devoção' : 'Navegue em nossa Seleção Divina'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 animate-pulse text-brand-gold font-display text-xl tracking-[0.3em] uppercase">Elevando orações...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                            {filtered.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-24 md:py-32 bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm shadow-soft max-w-4xl mx-auto">
                            <div className="text-6xl md:text-8xl mb-6 md:mb-8 opacity-20">🕊️</div>
                            <h3 className="text-2xl md:text-4xl font-display font-medium text-stone-800 dark:text-stone-100 mb-4 md:mb-6 uppercase tracking-widest">Tesouro Não Encontrado</h3>
                            <p className="text-stone-400 max-w-md mx-auto mb-8 md:mb-12 font-light text-base md:text-xl italic leading-relaxed">Que tal tentar uma busca diferente ou navegar pelas nossas categorias de devoção?</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex items-center gap-3 bg-brand-gold text-brand-wood hover:bg-brand-wood hover:text-white px-8 py-4 md:px-12 md:py-5 rounded-sm font-black text-[10px] md:text-xs transition-all shadow-xl hover:-translate-y-1 active:scale-95 border-none uppercase tracking-[0.2em]"
                            >
                                Recomeçar Busca <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </section>

                {/* Blog Section */}
                {!isFiltered && (
                    <section className="animate-fade-in-up py-16 md:py-24 border-t border-brand-cotton-dark dark:border-stone-800">
                        <div className="flex items-center justify-between mb-8 md:mb-12">
                            <div className="flex items-center gap-3">
                                <div className="text-brand-gold">
                                    <Feather size={20} className="md:size-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.15em]">Blog de Fé</h2>
                                    <p className="text-[7px] md:text-[8px] text-stone-400 font-bold uppercase tracking-[0.3em] mt-1">Mensagens Diárias</p>
                                </div>
                            </div>
                            <Link to="/blog" className="hidden md:flex items-center gap-2 text-brand-gold font-black text-[9px] uppercase tracking-wider hover:gap-4 transition-all border-b border-brand-gold pb-1">
                                Ver Tudo <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                            {featuredPosts.slice(0, 12).map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
