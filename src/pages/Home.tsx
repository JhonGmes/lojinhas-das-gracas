import { useRef, useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Sparkles, ArrowRight, Feather, Compass, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogCard } from '../components/ui/BlogCard';
import ProductFilters, { type FilterState } from '../components/ProductFilters';

import { useBlog } from '../context/BlogContext';
import { Helmet } from 'react-helmet-async';

export function Home() {
    const { products, loading } = useProducts();
    const { settings } = useStore();
    const { posts } = useBlog();
    const offersRef = useRef<HTMLDivElement>(null);

    // Filter states
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        search: '',
        category: [],
        priceRange: [0, 1000],
        materials: [],
        colors: [],
        sortBy: 'newest'
    });

    // Carousel State
    const [currentBanner] = useState(0);
    const banners = useMemo(() => [
        settings.hero_image_url || "https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000",
        ...(settings.hero_banners || [])
    ].filter(Boolean), [settings.hero_image_url, settings.hero_banners]);

    // Data for filters
    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map(p => p.category)));
        return cats.sort();
    }, [products]);

    const materials = useMemo(() => {
        const mats = Array.from(new Set(products.map(p => p.material).filter(Boolean)));
        return mats.sort() as string[];
    }, [products]);

    const colors = useMemo(() => {
        const colorMap: Record<string, string> = {
            'Dourado': '#D4AF37',
            'Marrom': '#8B4513',
            'Branco': '#FFFFFF',
            'Prata': '#C0C0C0',
            'Preto': '#1a1a1a',
            'Azul': '#4A90E2',
            'Vermelho': '#E24A4A',
            'Rosa': '#E291A8',
            'Verde': '#4AE290',
            'Bege': '#F5F5DC',
            'Multicolor': 'linear-gradient(to right, red, yellow, green, blue)'
        };
        const uniqueColors = Array.from(new Set(products.map(p => p.color).filter(Boolean)));
        return uniqueColors.map(c => ({ name: c as string, hex: colorMap[c as string] || '#CCCCCC' }));
    }, [products]);

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
            result = result.filter(p => activeFilters.category.includes(p.category));
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
            case 'price-asc':
                result.sort((a, b) => (a.promotionalPrice || a.price) - (b.promotionalPrice || b.price));
                break;
            case 'price-desc':
                result.sort((a, b) => (b.promotionalPrice || b.price) - (a.promotionalPrice || a.price));
                break;
            case 'rating':
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
    const featuredPosts = useMemo(() => posts.filter(p => p.isFeatured && p.isPublished).slice(0, 3), [posts]);

    const isGlobalSearch = activeFilters.search !== '' || activeFilters.category.length > 0 || activeFilters.colors.length > 0 || activeFilters.materials.length > 0;

    return (
        <div className="flex flex-col w-full bg-gray-50/30">
            <Helmet>
                <title>{settings.store_name} - Artigos Religiosos e Presentes de Fé</title>
                <meta name="description" content={`Bem-vindo à ${settings.store_name}. Encontre os melhores artigos religiosos, terços, imagens e presentes para fortalecer sua fé.`} />
            </Helmet>

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
                <div className="flex flex-col lg:flex-row gap-8">
                    <ProductFilters
                        categories={categories}
                        materials={materials}
                        colors={colors}
                        onFilterChange={setActiveFilters}
                        totalResults={filteredProducts.length}
                    />

                    <main className="flex-1 space-y-16">
                        {!isGlobalSearch && (
                            <>
                                {featuredProducts.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-6">
                                            <Sparkles size={20} className="text-brand-gold" />
                                            <h2 className="text-lg font-display font-medium text-stone-800 uppercase tracking-widest">Destaques</h2>
                                            <div className="h-px flex-1 bg-gray-200" />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {featuredProducts.slice(0, 10).map(p => (
                                                <ProductCard key={`${p.id}-featured`} product={p} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {promoProducts.length > 0 && (
                                    <section ref={offersRef}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <Gift size={20} className="text-brand-gold" />
                                            <h2 className="text-lg font-display font-medium text-stone-800 uppercase tracking-widest">Ofertas</h2>
                                            <div className="h-px flex-1 bg-gray-200" />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {promoProducts.slice(0, 10).map(p => (
                                                <ProductCard key={`${p.id}-promo`} product={p} />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}

                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Compass size={20} className="text-brand-gold" />
                                    <div>
                                        <h2 className="text-xl font-display font-medium text-stone-800 uppercase tracking-widest">
                                            {isGlobalSearch ? 'Resultados da Busca' : 'Catálogo Completo'}
                                        </h2>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">
                                            {filteredProducts.length} produtos encontrados
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-20 text-brand-gold font-display text-xl tracking-[0.3em] uppercase animate-pulse">
                                    Sincronizando com o céu...
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                                    {filteredProducts.map(p => (
                                        <ProductCard key={p.id} product={p} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <span className="text-6xl mb-6 block">🕊️</span>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum tesouro encontrado</h3>
                                    <p className="text-gray-400 mb-8">Tente ajustar seus filtros ou buscar por outro termo.</p>
                                    <button onClick={() => window.location.reload()} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
                                        Limpar Filtros
                                    </button>
                                </div>
                            )}
                        </section>
                    </main>
                </div>

                {!isGlobalSearch && featuredPosts.length > 0 && (
                    <section className="py-20 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Feather size={20} className="text-brand-gold" />
                                <h2 className="text-xl font-display font-medium text-stone-800 uppercase tracking-widest">Blog de Fé</h2>
                            </div>
                            <Link to="/blog" className="text-brand-gold font-bold text-xs uppercase border-b-2 border-brand-gold pb-1">Ver tudo</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
