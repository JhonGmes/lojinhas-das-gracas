import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { Calendar, User, ChevronLeft, Share2, MessageSquare } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export function BlogDetail() {
    const { id } = useParams();
    const { posts, loading } = useBlog();

    const post = posts.find(p => p.id === id);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-brand-gold tracking-[0.3em] font-display text-2xl">Carregando Mensagem...</div>
        </div>
    );

    if (!post) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-display font-bold mb-4">Mensagem não encontrada</h2>
            <Link to="/" className="text-brand-gold font-bold hover:underline flex items-center gap-2">
                <ChevronLeft size={20} /> Voltar para o Início
            </Link>
        </div>
    );

    return (
        <div className="pb-24">
            <Helmet>
                <title>{post.title} - Blog de Fé</title>
                <meta name="description" content={post.excerpt} />
                <meta property="og:title" content={post.title} />
                <meta property="og:image" content={post.image} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.title,
                        "image": post.image,
                        "author": {
                            "@type": "Person",
                            "name": post.author
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Lojinha das Graças"
                        },
                        "datePublished": post.date,
                        "description": post.excerpt
                    })}
                </script>
            </Helmet>
            {/* Header Hero */}
            <header className="relative h-[400px] md:h-[500px]">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex items-end">
                    <div className="container mx-auto px-4 pb-12">
                        <div className="max-w-4xl">
                            <span className="bg-brand-gold text-brand-wood text-[10px] font-black px-4 py-1.5 rounded-sm uppercase tracking-widest mb-6 inline-block shadow-soft">
                                {post.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-display font-medium text-white mb-6 leading-tight tracking-widest uppercase">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em]">
                                <span className="flex items-center gap-2"><Calendar size={14} className="text-brand-gold" /> {post.date}</span>
                                <span className="flex items-center gap-2"><User size={14} className="text-brand-gold" /> Por {post.author}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="container mx-auto px-4 -mt-12 relative z-10">
                <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 rounded-sm shadow-soft p-8 md:p-16 border border-brand-cotton-dark dark:border-stone-800">
                    <div className="prose prose-stone dark:prose-invert max-w-none">
                        <p className="text-xl md:text-2xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed mb-12 italic border-l-4 border-brand-gold pl-8">
                            {post.excerpt}
                        </p>

                        <div className="text-stone-700 dark:text-stone-300 text-lg leading-relaxed space-y-8 font-serif">
                            {post.content.split('\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    </div>

                    <div className="mt-16 pt-12 border-t border-brand-cotton-dark dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 bg-brand-cotton dark:bg-stone-800 px-6 py-3 rounded-sm text-stone-600 dark:text-stone-300 hover:bg-brand-gold/10 hover:text-brand-gold transition-all duration-400 font-bold text-[10px] uppercase tracking-widest shadow-soft-sm">
                                <Share2 size={16} /> Compartilhar
                            </button>
                            <button className="flex items-center gap-2 bg-brand-cotton dark:bg-stone-800 px-6 py-3 rounded-sm text-stone-600 dark:text-stone-300 hover:bg-brand-gold/10 hover:text-brand-gold transition-all duration-400 font-bold text-[10px] uppercase tracking-widest shadow-soft-sm">
                                <MessageSquare size={16} /> Comentar
                            </button>
                        </div>
                        <Link to="/" className="text-brand-gold font-bold text-[10px] uppercase tracking-widest hover:gap-3 transition-all duration-400 flex items-center gap-2">
                            Voltar para Loja <ChevronLeft size={18} className="rotate-180" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
