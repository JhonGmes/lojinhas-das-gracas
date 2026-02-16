import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { useStore } from '../context/StoreContext';
import { Calendar, User, ChevronLeft, Share2, Instagram, Smartphone, Send, Feather } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { api } from '../services/api';
import { generateStoryCard } from '../services/storyGenerator';
import toast from 'react-hot-toast';
import { X as CloseIcon, Loader2, Sparkles } from 'lucide-react';

export function BlogDetail() {
    const { id } = useParams();
    const { posts, loading } = useBlog();
    const { settings } = useStore();

    const post = posts.find(p => p.id === id);

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [generatingStory, setGeneratingStory] = useState(false);
    const [storyImageUrl, setStoryImageUrl] = useState<string | null>(null);
    const [visualMode, setVisualMode] = useState<'instagram' | 'whatsapp' | null>(null);

    const handleNewsletterSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail.trim()) return;

        setIsSubscribing(true);
        try {
            await api.newsletter.subscribe(newsletterEmail);
            toast.success('Que alegria! Você agora receberá nossas Palavras de Fé. 🙏');
            setNewsletterEmail('');
        } catch (error) {
            toast.error('Ocorreu um erro ao se inscrever. Tente novamente em breve.');
        } finally {
            setIsSubscribing(false);
        }
    };

    const openStoryStudio = async (mode: 'instagram' | 'whatsapp') => {
        if (!post) return;
        setVisualMode(mode);
        setGeneratingStory(true);
        setShowStoryModal(true);
        try {
            const cardUrl = await generateStoryCard({
                title: post.title,
                image: post.image,
                excerpt: post.excerpt,
                storeName: settings.store_name
            });
            setStoryImageUrl(cardUrl);
        } catch (error) {
            console.error('Erro no Studio:', error);
            toast.error('Ocorreu um problema ao compor sua arte.');
            setShowStoryModal(false);
        } finally {
            setGeneratingStory(false);
        }
    };

    const handleShareWhatsApp = () => {
        openStoryStudio('whatsapp');
    };

    const handleShareInstagram = () => {
        openStoryStudio('instagram');
    };

    const downloadStoryAndOpenIG = () => {
        if (!storyImageUrl) return;

        // Link copy
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado! Baixando imagem e abrindo Instagram... 🙏');

        // Download
        const link = document.createElement('a');
        link.download = `story-${post?.title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = storyImageUrl;
        link.click();

        // Redirect
        setTimeout(() => {
            const instagramUrl = settings.instagram_url || 'https://instagram.com';
            window.open(instagramUrl, '_blank');
            setShowStoryModal(false);
        }, 2000);
    };

    const shareToWhatsAppStatus = async () => {
        if (!storyImageUrl || !post) return;

        try {
            // Converte DataURL para File para usar na API de compartilhamento nativa
            const res = await fetch(storyImageUrl);
            const blob = await res.blob();
            const file = new File([blob], `mensagem-de-fe.png`, { type: 'image/png' });

            // Link copy
            navigator.clipboard.writeText(window.location.href);

            // Verifica se o navegador suporta compartilhar arquivos (comum em celulares)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: post.title,
                    text: `Veja esta mensagem de fé: ${window.location.href}`
                });
                toast.success('Compartilhando com WhatsApp... 🙏');
            } else {
                // Fallback para PC ou navegadores sem suporte a compartilhamento de arquivo
                const link = document.createElement('a');
                link.download = `story-${post.title.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.href = storyImageUrl;
                link.click();

                toast.success('Imagem baixada! Redirecionando para o WhatsApp... ✨');
                setTimeout(() => {
                    const text = encodeURIComponent(`Veja esta mensagem de fé: \n\n${window.location.href}`);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                }, 2000);
            }
            setShowStoryModal(false);
        } catch (error) {
            console.error('Erro ao compartilhar no WhatsApp:', error);
            toast.error('Erro ao preparar compartilhamento.');
        }
    };

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

                    {/* Engagement Section */}
                    <div className="mt-16 bg-brand-wood text-white p-8 md:p-12 rounded-sm relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                            <Feather size={140} className="text-brand-gold" />
                        </div>

                        <div className="relative z-10 max-w-xl">
                            <h3 className="font-display text-2xl md:text-3xl text-brand-gold mb-4 uppercase tracking-[0.2em]">Palavras de Fé</h3>
                            <p className="text-stone-300 text-xs md:text-sm mb-8 italic font-serif leading-relaxed">
                                "Onde dois ou mais estiverem reunidos em meu nome, ali eu estarei." <br />
                                Deseja receber orações, reflexões e mensagens de esperança diretamente em seu e-mail toda semana?
                            </p>
                            <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleNewsletterSubscribe}>
                                <div className="flex-1 relative">
                                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input
                                        type="email"
                                        required
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder="Seu melhor e-mail..."
                                        className="w-full bg-white/5 border border-white/10 rounded-sm pl-12 pr-4 py-4 outline-none focus:border-brand-gold transition-all text-xs"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubscribing}
                                    className="bg-brand-gold text-brand-wood font-black px-8 py-4 rounded-sm text-[10px] uppercase tracking-widest hover:bg-white transition-colors duration-400 disabled:opacity-50"
                                >
                                    {isSubscribing ? 'Sincronizando...' : 'Inscrever-se'}
                                </button>
                            </form>
                            <p className="mt-6 text-[8px] text-stone-500 uppercase tracking-widest font-bold">Sua privacidade é sagrada para nós. Cancele quando desejar.</p>
                        </div>
                    </div>

                    <div className="mt-16 pt-12 border-t border-brand-cotton-dark dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={handleShareWhatsApp}
                                className="flex items-center gap-3 bg-[#25D366]/10 text-[#25D366] px-6 py-3 rounded-sm hover:bg-[#25D366] hover:text-white transition-all duration-400 font-black text-[9px] uppercase tracking-widest shadow-soft-sm border border-[#25D366]/20"
                            >
                                <Smartphone size={14} /> WhatsApp
                            </button>
                            <button
                                onClick={handleShareInstagram}
                                className="flex items-center gap-3 bg-[#E4405F]/10 text-[#E4405F] px-6 py-3 rounded-sm hover:bg-[#E4405F] hover:text-white transition-all duration-400 font-black text-[9px] uppercase tracking-widest shadow-soft-sm border border-[#E4405F]/20"
                            >
                                <Instagram size={14} /> Instagram
                            </button>
                            <button
                                onClick={() => {
                                    navigator.share ? navigator.share({ title: post.title, url: window.location.href }) : openStoryStudio('instagram');
                                }}
                                className="flex items-center gap-3 bg-brand-cotton dark:bg-stone-800 px-6 py-3 rounded-sm text-stone-600 dark:text-stone-300 hover:bg-brand-gold/10 hover:text-brand-gold transition-all duration-400 font-black text-[9px] uppercase tracking-widest shadow-soft-sm border border-brand-cotton-dark dark:border-stone-700"
                            >
                                <Share2 size={14} /> Outros
                            </button>
                        </div>
                        <Link to="/" className="text-brand-gold font-bold text-[10px] uppercase tracking-widest hover:gap-3 transition-all duration-400 flex items-center gap-2">
                            Voltar para Loja <ChevronLeft size={18} className="rotate-180" />
                        </Link>
                    </div>
                </div>
            </div>
            {/* Story Card Modal */}
            {showStoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative border border-brand-gold/20 flex flex-col md:flex-row">
                        <button
                            onClick={() => {
                                setShowStoryModal(false);
                                setVisualMode(null);
                            }}
                            className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors"
                        >
                            <CloseIcon size={20} />
                        </button>

                        <div className="flex-1 bg-stone-200 dark:bg-black flex items-center justify-center p-4 min-h-[500px]">
                            {generatingStory ? (
                                <div className="text-center space-y-4">
                                    <Loader2 className="animate-spin text-brand-gold mx-auto" size={40} />
                                    <p className="text-stone-400 font-display text-sm uppercase tracking-widest px-8">Compondo seu cartão de fé...</p>
                                </div>
                            ) : storyImageUrl ? (
                                <div className="relative group max-w-[300px] shadow-2xl animate-scale-in">
                                    <img src={storyImageUrl} className="w-full h-auto rounded-lg" alt="Preview" />
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-[8px] font-black uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        Prévia do Story
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="p-8 flex flex-col justify-center gap-6 max-w-md">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-brand-gold">
                                    <Sparkles size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exclusivo Lojinha das Graças</span>
                                </div>
                                <h3 className="font-display text-2xl text-stone-800 dark:text-white uppercase leading-tight">
                                    {visualMode === 'whatsapp' ? 'Status WhatsApp' : 'Story Instagram'}
                                </h3>
                                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
                                    Geramos um cartão artístico exclusivo para evangelizar suas redes sociais. <br /><br />
                                    <strong>O que acontecerá:</strong>
                                    <ol className="list-decimal list-inside mt-4 space-y-2 text-[11px]">
                                        <li>A imagem sagrada será salva no seu dispositivo</li>
                                        <li>O link da mensagem será enviado junto com a imagem</li>
                                        <li>O {visualMode === 'whatsapp' ? 'WhatsApp' : 'Instagram'} será aberto para você postar</li>
                                    </ol>
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {visualMode === 'instagram' ? (
                                    <button
                                        onClick={downloadStoryAndOpenIG}
                                        disabled={generatingStory || !storyImageUrl}
                                        className="w-full bg-brand-gold text-brand-wood font-black py-5 rounded-sm flex items-center justify-center gap-3 hover:bg-brand-wood hover:text-white transition-all duration-400 uppercase tracking-[0.2em] text-[10px] shadow-lg disabled:opacity-50"
                                    >
                                        <Instagram size={18} /> Postar no Instagram
                                    </button>
                                ) : (
                                    <button
                                        onClick={shareToWhatsAppStatus}
                                        disabled={generatingStory || !storyImageUrl}
                                        className="w-full bg-[#25D366] text-white font-black py-5 rounded-sm flex items-center justify-center gap-3 hover:bg-[#128C7E] transition-all duration-400 uppercase tracking-[0.2em] text-[10px] shadow-lg disabled:opacity-50"
                                    >
                                        <Smartphone size={18} /> Postar no WhatsApp
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
