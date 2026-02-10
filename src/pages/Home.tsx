import { useRef, useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Tag, Star, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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
                    {/* Hero Carousel - Full Width */}
                    <section className="relative h-[450px] md:h-[750px] overflow-hidden group w-full bg-stone-900">
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
                            <div className="container mx-auto px-4 md:px-8">
                                <div className="max-w-3xl text-white space-y-10 animate-fade-in-up pointer-events-auto">
                                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-medium leading-[0.9] drop-shadow-2xl uppercase tracking-tighter">
                                        {settings.hero_title || 'Encontre Paz e Devoção'}
                                    </h1>
                                    <p className="text-sm md:text-3xl opacity-90 drop-shadow-lg font-light max-w-xl italic">
                                        {settings.hero_subtitle || 'Artigos religiosos selecionados com amor para fortalecer sua fé.'}
                                    </p>
                                    <div className="pt-2 md:pt-6">
                                        <button
                                            onClick={scrollToOffers}
                                            className="bg-brand-gold text-brand-wood font-black py-3 px-8 md:py-6 md:px-16 rounded-sm shadow-soft-lg hover:bg-white hover:text-brand-gold transition-all duration-500 transform hover:-translate-y-1 active:scale-95 text-[10px] md:text-sm uppercase tracking-[0.3em] flex items-center gap-3 md:gap-4"
                                        >
                                            {settings.hero_button_text || 'Ver Ofertas'} <ArrowRight size={18} className="md:size-20" />
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
                                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-brand-gold hover:border-brand-gold transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={nextBanner}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-brand-gold hover:border-brand-gold transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                                >
                                    <ChevronRight size={24} />
                                </button>

                                {/* Progress Indicators */}
                                <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-4">
                                    {banners.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentBanner(index)}
                                            className={`h-1 md:h-1.5 transition-all duration-500 rounded-full ${index === currentBanner ? 'w-8 md:w-12 bg-brand-gold' : 'w-2 md:w-3 bg-white/30 hover:bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Decorative bottom element */}
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-cotton dark:from-stone-950 to-transparent z-10" />
                    </section>

                    {/* Wrapped Content */}
                    <div className="container mx-auto px-4 space-y-24 mt-16">
                        {/* Showcase Highlights / Destaques */}
                        {featuredProducts.length > 0 && (
                            <section className="animate-fade-in-up">
                                <div className="flex items-center gap-4 mb-8 md:mb-12">
                                    <div className="p-3 md:p-4 bg-white dark:bg-stone-800 rounded-sm text-brand-gold shadow-soft border border-brand-cotton-dark dark:border-stone-700">
                                        <Star size={20} className="md:size-24" fill="currentColor" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.2em]">Destaques</h2>
                                        <p className="text-[8px] md:text-[9px] text-stone-400 font-bold uppercase tracking-[0.4em] mt-1">Curadoria Especial</p>
                                    </div>
                                    <div className="h-px flex-1 bg-brand-cotton-dark dark:bg-stone-800 ml-4 md:ml-8" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                    {featuredProducts.slice(0, 4).map(p => (
                                        <ProductCard key={`${p.id}-featured`} product={p} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Flash Deals / Promo Section */}
                        {promoProducts.length > 0 && (
                            <section ref={offersRef} className="animate-fade-in-up">
                                <div className="flex items-center gap-4 mb-8 md:mb-12">
                                    <div className="p-3 md:p-4 bg-white dark:bg-stone-800 rounded-sm text-brand-gold shadow-soft border border-brand-cotton-dark dark:border-stone-700">
                                        <Tag size={20} className="md:size-24" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.2em]">Ofertas</h2>
                                        <p className="text-[8px] md:text-[9px] text-brand-gold font-bold uppercase tracking-[0.4em] mt-1">Oportunidades Únicas</p>
                                    </div>
                                    <div className="h-px flex-1 bg-brand-cotton-dark dark:bg-stone-800 ml-4 md:ml-8" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                    {promoProducts.slice(0, 4).map(p => (
                                        <ProductCard key={`${p.id}-promo`} product={p} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </>
            )}

            {/* Main Product Grid Wrapped */}
            <div className="container mx-auto px-4 space-y-16 mt-24">
                <section className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-10 md:mb-16">
                        <div className="flex items-center gap-4">
                            <div className="p-3 md:p-4 bg-white dark:bg-stone-800 rounded-sm text-brand-gold shadow-soft border border-brand-cotton-dark dark:border-stone-700">
                                <Tag size={20} className="md:size-24" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.2em]">
                                    {isFiltered ? (urlSearch ? `Resultados para "${urlSearch}"` : urlCategory) : 'Catálogo'}
                                </h2>
                                <p className="text-[8px] md:text-[9px] text-stone-400 font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] mt-1 md:mt-2">
                                    {isFiltered ? 'Filtrado com Devoção' : 'Navegue em nossa Seleção Divina'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-32 animate-pulse text-brand-gold font-display text-2xl tracking-[0.3em] uppercase">Elevando orações...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {filtered.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-40 bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm shadow-soft max-w-4xl mx-auto">
                            <div className="text-8xl mb-8 opacity-20">🕊️</div>
                            <h3 className="text-4xl font-display font-medium text-stone-800 dark:text-stone-100 mb-6 uppercase tracking-widest">Tesouro Não Encontrado</h3>
                            <p className="text-stone-400 max-w-md mx-auto mb-12 font-light text-xl italic leading-relaxed">Que tal tentar uma busca diferente ou navegar pelas nossas categorias de devoção?</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex items-center gap-4 bg-brand-gold text-brand-wood hover:bg-brand-wood hover:text-white px-12 py-5 rounded-sm font-black text-xs transition-all shadow-xl hover:-translate-y-1 active:scale-95 border-none uppercase tracking-[0.3em]"
                            >
                                Recomeçar Busca <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </section>

                {/* Blog Section */}
                {!isFiltered && (
                    <section className="animate-fade-in-up py-24 border-t border-brand-cotton-dark dark:border-stone-800">
                        <div className="flex items-center justify-between mb-10 md:mb-16">
                            <div className="flex items-center gap-4">
                                <div className="p-3 md:p-4 bg-white dark:bg-stone-800 rounded-sm text-brand-gold shadow-soft border border-brand-cotton-dark dark:border-stone-700">
                                    <BookOpen size={20} className="md:size-24" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.2em]">Blog de Fé</h2>
                                    <p className="text-[8px] md:text-[9px] text-stone-400 font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] mt-1 md:mt-2">Mensagens Diárias</p>
                                </div>
                            </div>
                            <Link to="/blog" className="hidden md:flex items-center gap-4 text-brand-gold font-black text-xs uppercase tracking-[0.3em] hover:gap-6 transition-all border-b border-brand-gold pb-2">
                                Ver Tudo <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {featuredPosts.map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
