import { useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Tag, Star, ArrowRight, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BlogCard } from '../components/ui/BlogCard';

import { useBlog } from '../context/BlogContext';

export function Home() {
    const { products, loading } = useProducts();
    const { settings } = useStore();
    const location = useLocation();
    const { posts } = useBlog();
    const offersRef = useRef<HTMLDivElement>(null);

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
        <div className="space-y-12 pb-12">
            {!isFiltered && (
                <>
                    {/* Hero - Full Width */}
                    <section className="relative h-[450px] md:h-[650px] overflow-hidden group w-full">
                        <div className="absolute inset-0 bg-stone-900 animate-pulse" />
                        <img
                            src={settings.hero_image_url || "https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000"}
                            alt="Hero"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex items-center">
                            <div className="container mx-auto px-4 md:px-8">
                                <div className="max-w-2xl text-white space-y-8 animate-fade-in-up">
                                    <h1 className="text-5xl md:text-8xl font-display font-medium leading-tight drop-shadow-2xl">
                                        {settings.hero_title || 'Encontre Paz e Devoção'}
                                    </h1>
                                    <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg font-light max-w-lg">
                                        {settings.hero_subtitle || 'Artigos religiosos selecionados com amor para fortalecer sua fé.'}
                                    </p>
                                    <button
                                        onClick={scrollToOffers}
                                        className="bg-brand-gold text-brand-wood font-black py-4 px-12 rounded-full shadow-2xl hover:bg-white hover:text-brand-gold transition-all transform hover:-translate-y-1 active:scale-95"
                                    >
                                        {settings.hero_button_text || 'Ver Ofertas'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Decorative bottom curve */}
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-brand-cotton to-transparent" />
                    </section>

                    {/* Wrapped Content */}
                    <div className="container mx-auto px-4 space-y-16">
                        {/* Showcase Highlights / Destaques */}
                        {featuredProducts.length > 0 && (
                            <section className="animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 shadow-sm">
                                        <Star size={28} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-widest">Destaques da Vitrine</h2>
                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em] mt-1">Curadoria Especial</p>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent dark:from-amber-900 ml-4" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {featuredProducts.slice(0, 4).map(p => (
                                        <ProductCard key={`${p.id}-featured`} product={p} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Flash Deals / Promo Section */}
                        {promoProducts.length > 0 && (
                            <section ref={offersRef} className="animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-red-50 rounded-2xl text-red-500 shadow-sm border border-red-100">
                                        <Tag size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-widest">Ofertas de Fé</h2>
                                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.3em] mt-1">Oportunidades Únicas</p>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-red-200 to-transparent dark:from-red-900 ml-4" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <div className="container mx-auto px-4 space-y-12">
                <section className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white dark:bg-stone-800 rounded-3xl shadow-premium flex items-center justify-center border border-stone-100 dark:border-stone-700">
                                <Tag className="text-brand-gold" size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-widest">
                                    {isFiltered ? (urlSearch ? `Resultados para "${urlSearch}"` : urlCategory) : 'Catálogo Completo'}
                                </h2>
                                <p className="text-xs text-stone-400 font-black uppercase tracking-[0.4em] mt-1 italic">
                                    {filtered.length} {filtered.length === 1 ? 'tesouro encontrado' : 'tesouros encontrados'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 animate-pulse text-brand-gold font-display text-xl tracking-widest">Elevando orações...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filtered.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-32 glass-card rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-stone-800 max-w-4xl mx-auto">
                            <p className="text-6xl mb-6 opacity-40">🕊️</p>
                            <h3 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 mb-4">Ainda não encontramos este tesouro</h3>
                            <p className="text-stone-400 max-w-md mx-auto mb-10 font-medium text-lg leading-relaxed">Que tal tentar uma busca diferente ou navegar pelas nossas categorias de devoção?</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex items-center gap-3 bg-brand-gold text-brand-wood hover:bg-white hover:text-brand-gold px-10 py-4 rounded-full font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95 border-2 border-brand-gold"
                            >
                                Recomeçar Busca <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </section>

                {/* Blog Section - New */}
                {!isFiltered && (
                    <section className="animate-fade-in-up py-16 border-t border-stone-100 dark:border-stone-800">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white dark:bg-stone-800 rounded-3xl shadow-premium flex items-center justify-center border border-stone-100 dark:border-stone-700">
                                    <BookOpen className="text-brand-gold" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-widest">Blog de Fé</h2>
                                    <p className="text-xs text-stone-400 font-black uppercase tracking-[0.4em] mt-1 italic">Mensagens e Orações Diárias</p>
                                </div>
                            </div>
                            <Link to="/blog" className="hidden md:flex items-center gap-2 text-brand-gold font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                                Ver Tudo <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
