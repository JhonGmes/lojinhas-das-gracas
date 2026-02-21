import { useRef, useState, useMemo, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Sparkles, ArrowRight, Feather, Compass, Gift } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { BlogCard } from '../components/ui/BlogCard';
import ProductFilters, { type FilterState } from '../components/ProductFilters';

import { useBlog } from '../context/BlogContext';
import { SEO } from '../components/SEO';

export function Home() {
    const { products, loading } = useProducts();
    const { settings } = useStore();
    const { posts } = useBlog();
    const offersRef = useRef<HTMLDivElement>(null);

    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Filter states
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        search: searchParams.get('q') || '',
        category: searchParams.get('cat') ? [searchParams.get('cat')!] : [],
        priceRange: [0, 1000],
        materials: [],
        colors: [],
        sortBy: 'newest'
    });

    // Update filters when URL params change
    useEffect(() => {
        const cat = searchParams.get('cat');
        const q = searchParams.get('q');

        setActiveFilters(prev => ({
            ...prev,
            category: cat ? [cat] : [],
            search: q || ''
        }));
    }, [location.search]);

    // Carousel State
    const [currentBanner, setCurrentBanner] = useState(0);
    const banners = useMemo(() => [
        settings.hero_image_url || "https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000",
        ...(settings.hero_banners || [])
    ].filter(Boolean), [settings.hero_image_url, settings.hero_banners]);

    // Auto-rotate carousel
    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    // Data for filters
    const { categories: adminCategories } = useProducts();
    const categories = useMemo(() => adminCategories.sort(), [adminCategories]);



    // Internal filtering logic
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (activeFilters.search) {
            const search = activeFilters.search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search)
            );
        }

        if (activeFilters.category.length > 0) {
            result = result.filter(p =>
                activeFilters.category.some(cat =>
                    p.category.toLowerCase() === cat.toLowerCase()
                )
            );
        }

        result = result.filter(p => {
            const price = p.promotionalPrice || p.price;
            return price <= activeFilters.priceRange[1];
        });

        if (activeFilters.materials.length > 0) {
            result = result.filter(p => p.material && activeFilters.materials.includes(p.material));
        }

        if (activeFilters.colors.length > 0) {
            result = result.filter(p => p.color && activeFilters.colors.includes(p.color));
        }

        switch (activeFilters.sortBy) {
            case 'price_asc':
                result.sort((a, b) => (a.promotionalPrice || a.price) - (b.promotionalPrice || b.price));
                break;
            case 'price_desc':
                result.sort((a, b) => (b.promotionalPrice || b.price) - (a.promotionalPrice || a.price));
                break;
            case 'best_rated':
                result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
                break;
            case 'newest':
            default:
                break;
        }

        return result;
    }, [products, activeFilters]);

    const promoProducts = useMemo(() => products.filter(p => p.promotionalPrice && p.stock > 0), [products]);
    const featuredProducts = useMemo(() => products.filter(p => p.isFeatured && p.stock > 0), [products]);
    const featuredPosts = useMemo(() => posts.filter(p => p.isFeatured && p.isPublished).slice(0, 4), [posts]);

    const isGlobalSearch = activeFilters.search !== '' || activeFilters.category.length > 0 || activeFilters.colors.length > 0 || activeFilters.materials.length > 0;

    return (
        <div className="flex flex-col w-full bg-gray-50/30">
            <SEO
                title={settings.store_name}
                description={`A maior e mais completa loja de artigos religiosos. Encontre terços, bustos, crucifixos e presentes da fé selecionados com amor em ${settings.store_name}.`}
                jsonLd={[
                    {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": settings.store_name,
                        "url": window.location.origin,
                        "logo": settings.logo_url,
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": settings.whatsapp_number,
                            "contactType": "customer service"
                        },
                        "sameAs": [
                            settings.instagram_url
                        ].filter(Boolean)
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": settings.store_name,
                        "image": settings.logo_url || settings.hero_image_url,
                        "@id": window.location.origin,
                        "url": window.location.origin,
                        "telephone": settings.whatsapp_number,
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Venda Online",
                            "addressLocality": "São Luís",
                            "addressRegion": "MA",
                            "postalCode": "65000-000",
                            "addressCountry": "BR"
                        }
                    }
                ]}
            />

            {!isGlobalSearch && (
                <section className="relative h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden group w-full bg-stone-900 border-b border-brand-gold/20">
                    {banners.map((url, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                        >
                            <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                        </div>
                    ))}

                    <div className="absolute inset-0 flex items-center z-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
                        <div className="max-w-2xl text-white space-y-4 md:space-y-6">
                            <h1 className="text-2xl md:text-5xl font-display font-medium uppercase tracking-tighter">
                                {settings.hero_title || 'Encontre Paz e Devoção'}
                            </h1>
                            <p className="text-xs md:text-xl opacity-90 font-light italic">
                                {settings.hero_subtitle || 'Artigos religiosos selecionados com amor.'}
                            </p>
                            <button onClick={() => offersRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-brand-gold text-brand-wood font-black py-2.5 px-6 md:py-4 md:px-12 rounded-sm text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                                Ver Ofertas <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <div className="max-w-7xl mx-auto px-4 w-full pt-12 md:pt-20">
                <main className="space-y-16">
                    {!isGlobalSearch && (
                        <>
                            {featuredProducts.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <Sparkles size={16} className="text-brand-gold" />
                                        <h2 className="text-sm font-display font-medium text-stone-800 uppercase tracking-[0.2em]">Destaques</h2>
                                        <div className="h-px flex-1 bg-stone-100" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {featuredProducts.slice(0, 8).map(p => (
                                            <ProductCard key={`${p.id}-featured`} product={p} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {promoProducts.length > 0 && (
                                <section ref={offersRef}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <Gift size={16} className="text-brand-gold" />
                                        <h2 className="text-sm font-display font-medium text-stone-800 uppercase tracking-[0.2em]">Ofertas de Bênção</h2>
                                        <div className="h-px flex-1 bg-stone-100" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {promoProducts.slice(0, 8).map(p => (
                                            <ProductCard key={`${p.id}-promo`} product={p} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Categorias - Navegue por Categoria */}
                            {categories.length > 0 && (
                                <section className="py-8 border-y border-stone-100 dark:border-stone-800 my-12 bg-white/50 dark:bg-stone-900/50">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-px flex-1 bg-stone-100 dark:bg-stone-800" />
                                        <h2 className="text-sm font-display font-medium text-stone-800 dark:text-stone-200 uppercase tracking-[0.2em] text-center">Navegue por Categoria</h2>
                                        <div className="h-px flex-1 bg-stone-100 dark:bg-stone-800" />
                                    </div>
                                    <div className="relative overflow-hidden w-full pb-6 pt-2">
                                        {/* Fading Edges for elegance */}
                                        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white dark:from-stone-900 to-transparent z-10 pointer-events-none" />
                                        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white dark:from-stone-900 to-transparent z-10 pointer-events-none" />

                                        <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused] gap-6 md:gap-8 px-4">
                                            {/* Renderizamos a lista duas vezes com os mesmos itens para o efeito de loop infinito suave */}
                                            {[...categories, ...categories].map((category, idx) => {
                                                // Find a product image to represent the category, or use a placeholder
                                                const representiveProduct = products.find(p => p.category === category && p.image);
                                                const bgImage = representiveProduct?.image || "https://images.unsplash.com/photo-1601142634808-38923eb7c560?auto=format&fit=crop&q=80&w=400";

                                                return (
                                                    <button
                                                        key={`${category}-${idx}`}
                                                        onClick={() => {
                                                            const newParams = new URLSearchParams(searchParams);
                                                            newParams.set('cat', category);
                                                            // Prevent keeping old search query if switching categories
                                                            newParams.delete('q');

                                                            // Update URL directly (which naturally updates filters via useEffect)
                                                            window.history.replaceState({}, '', `?${newParams.toString()}`);

                                                            // Also update local state for immediate feedback
                                                            setActiveFilters(prev => ({ ...prev, category: [category], search: '' }));

                                                            // Smooth scroll to results
                                                            document.getElementById('product-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                        }}
                                                        className="shrink-0 group flex flex-col items-center gap-4 transition-all hover:-translate-y-1"
                                                    >
                                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-brand-gold transition-colors shadow-sm relative">
                                                            <img
                                                                src={bgImage}
                                                                alt={category}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                            />
                                                            <div className="absolute inset-0 bg-brand-wood/20 group-hover:bg-transparent transition-colors duration-500" />
                                                        </div>
                                                        <span className="text-[10px] md:text-xs font-bold font-display uppercase tracking-widest text-stone-600 dark:text-stone-300 group-hover:text-brand-gold transition-colors text-center w-32">
                                                            {category}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </section>
                            )}

                        </>
                    )}

                    <section id="product-results-section" className="pb-20 scroll-mt-24 min-h-[60vh]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-stone-100 pb-6">
                            <div className="flex items-center gap-3">
                                <Compass size={18} className="text-brand-gold" />
                                <div>
                                    <h2 className="text-lg font-display font-medium text-stone-800 uppercase tracking-widest">
                                        {isGlobalSearch ? 'Resultados da Busca' : 'Nossos Tesouros'}
                                    </h2>
                                    <p className="text-[8px] text-stone-400 font-bold uppercase tracking-[0.4em] mt-1">
                                        {filteredProducts.length} itens encontrados
                                    </p>
                                </div>
                            </div>

                            <ProductFilters
                                categories={categories}
                                onFilterChange={setActiveFilters}
                                activeFilters={activeFilters}
                                totalResults={filteredProducts.length}
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-brand-gold/40 font-display text-sm tracking-[0.5em] uppercase animate-pulse">
                                Sincronizando com o céu...
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredProducts.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-white rounded-sm border border-dashed border-stone-200">
                                <span className="text-4xl mb-6 block">🕊️</span>
                                <h3 className="text-sm font-black text-stone-800 uppercase tracking-widest mb-2">Nenhum tesouro encontrado</h3>
                                <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-8">Tente ajustar seus filtros para encontrar sua graça.</p>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="bg-brand-gold text-brand-wood px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-soft"
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </section>
                </main>

                {!isGlobalSearch && featuredPosts.length > 0 && (
                    <section className="py-24 border-t border-stone-100">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-3">
                                <Feather size={20} className="text-brand-gold" />
                                <h2 className="text-xl font-display font-medium text-stone-800 uppercase tracking-widest">Blog de Fé</h2>
                            </div>
                            <Link to="/blog" className="text-brand-gold font-bold text-[10px] uppercase tracking-widest border-b border-brand-gold/30 pb-1 hover:border-brand-gold transition-colors">Ver tudo</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
