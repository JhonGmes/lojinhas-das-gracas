import { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Sparkles, X, Calendar, Layout, FileText, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import type { BlogPost } from '../../types';

export function BlogAdmin() {
    const { posts, loading, deletePost, updatePost, createPost } = useBlog();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;

        const postData = {
            ...editingPost,
            date: editingPost.date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
            isPublished: editingPost.isPublished ?? true,
            isFeatured: editingPost.isFeatured ?? false,
        } as BlogPost;

        if (postData.id) {
            await updatePost(postData);
        } else {
            await createPost(postData);
        }
        setShowForm(false);
        setEditingPost(null);
    };

    const toggleFeatured = (post: BlogPost) => {
        updatePost({ ...post, isFeatured: !post.isFeatured });
    };

    const togglePublished = (post: BlogPost) => {
        updatePost({ ...post, isPublished: !post.isPublished });
    };

    return (
        <div className="space-y-10 animate-fade-in-up pb-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-cotton-dark dark:border-stone-800">
                <div>
                    <h1 className="text-4xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-widest">Gestão de Fé</h1>
                    <p className="text-stone-400 font-medium mt-2">Compartilhe sabedoria, orações e mensagens com sua comunidade.</p>
                </div>
                <button
                    onClick={() => { setEditingPost({ author: 'Assistente das Graças' }); setShowForm(true); }}
                    className="bg-brand-gold text-brand-wood font-bold px-8 py-4 rounded-sm shadow-soft hover:bg-brand-gold-light transition-all flex items-center gap-3 uppercase text-xs tracking-widest"
                >
                    <Plus size={18} /> Nova Mensagem Sagrada
                </button>
            </header>

            {/* List Section */}
            <div className="bg-white dark:bg-stone-900 rounded-sm shadow-soft border border-brand-cotton-dark dark:border-stone-800 overflow-hidden">
                <div className="p-6 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-800 flex items-center gap-4">
                    <Search className="text-brand-gold" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar mensagens por título ou tema..."
                        className="flex-1 bg-transparent border-none rounded-none px-2 py-2 outline-none text-sm font-medium placeholder:text-stone-400 uppercase tracking-wider"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800/10">
                    {loading ? (
                        <div className="p-24 text-center animate-pulse text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Aguardando sabedoria...</div>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <div key={post.id} className="p-8 flex flex-col lg:flex-row items-center gap-10 group hover:bg-brand-cotton/30 dark:hover:bg-stone-800/20 transition-all duration-400">
                                <div className="relative w-32 h-32 flex-shrink-0">
                                    <img src={post.image} alt={post.title} className="w-full h-full rounded-sm object-cover shadow-soft group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                                    <div className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-stone-800 rounded-full shadow-sm">
                                        {post.isPublished ? <CheckCircle2 className="text-emerald-500" size={14} /> : <Clock className="text-amber-500" size={14} />}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center flex-wrap gap-4">
                                        <span className="text-[10px] bg-brand-gold/10 text-brand-gold font-black px-4 py-1.5 rounded-sm uppercase tracking-widest border border-brand-gold/20 leading-none">
                                            {post.category}
                                        </span>
                                        <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                            <Calendar size={12} /> {post.date}
                                        </div>
                                        {post.isFeatured && (
                                            <span className="text-[10px] text-amber-600 font-black px-3 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-sm uppercase tracking-tighter flex items-center gap-1.5 animate-pulse">
                                                <Sparkles size={10} fill="currentColor" /> Destaque Home
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-wide leading-tight group-hover:text-brand-gold transition-colors">{post.title}</h3>
                                    <p className="text-sm text-stone-400 font-light line-clamp-2 max-w-3xl leading-relaxed italic">"{post.excerpt}"</p>
                                </div>

                                <div className="flex items-center gap-4 bg-white/50 dark:bg-stone-800/50 p-3 rounded-sm border border-brand-cotton-dark dark:border-stone-700 shadow-soft-sm opacity-60 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                    <ActionButton
                                        onClick={() => togglePublished(post)}
                                        active={post.isPublished}
                                        activeColor="text-emerald-500"
                                        title={post.isPublished ? 'Publicado' : 'Rascunho'}
                                    >
                                        {post.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </ActionButton>

                                    <ActionButton
                                        onClick={() => toggleFeatured(post)}
                                        active={post.isFeatured}
                                        activeColor="text-brand-gold"
                                        title="Destaque Home"
                                    >
                                        <Sparkles size={18} className={post.isFeatured ? 'fill-brand-gold' : ''} />
                                    </ActionButton>

                                    <ActionButton
                                        onClick={() => { setEditingPost(post); setShowForm(true); }}
                                        title="Editar Conteúdo"
                                    >
                                        <Edit2 size={18} />
                                    </ActionButton>

                                    <ActionButton
                                        onClick={() => deletePost(post.id)}
                                        activeColor="text-red-500 hover:bg-red-50"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </ActionButton>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-32 text-center text-stone-300 font-medium italic flex flex-col items-center gap-4">
                            <BookOpen size={48} className="opacity-10" />
                            <p className="uppercase text-xs tracking-[0.3em] font-bold">Nenhuma mensagem sagrada encontrada</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FORM MODAL - Completely Repaginated */}
            {showForm && (
                <div className="fixed inset-0 z-[100] bg-brand-wood/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-8 animate-fade-in">
                    <div className="bg-brand-cotton dark:bg-stone-950 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl rounded-none md:rounded-sm shadow-2xl border-none md:border border-brand-gold/20 flex flex-col overflow-hidden animate-slide-up">

                        {/* Modal Header */}
                        <div className="bg-white dark:bg-stone-900 px-8 py-6 border-b border-brand-cotton-dark dark:border-stone-800 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-cotton dark:bg-stone-800 rounded-sm">
                                    <FileText className="text-brand-gold" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-widest">
                                        {editingPost?.id ? 'Refinar Mensagem' : 'Nova Sabedoria'}
                                    </h2>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Editor de Conteúdo Espiritual</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowForm(false); setEditingPost(null); }}
                                className="text-stone-400 hover:text-brand-gold transition-all p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
                            <form id="blog-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                                {/* Left Side: Metadata */}
                                <div className="lg:col-span-5 space-y-10 border-r border-brand-cotton-dark dark:border-stone-800 pr-0 lg:pr-12">
                                    <SectionTitle icon={<Layout size={16} />} title="Metadados da Postagem" />

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <Label>Título Sagrado</Label>
                                            <input
                                                required
                                                type="text"
                                                className="edit-input font-medium"
                                                placeholder="Ex: A Oração de São Francisco"
                                                value={editingPost?.title || ''}
                                                onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Tema / Categoria</Label>
                                            <input
                                                required
                                                type="text"
                                                className="edit-input font-medium"
                                                placeholder="Ex: Espiritualidade, Hagiografia"
                                                value={editingPost?.category || ''}
                                                onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Breve Resumo (Excerpt)</Label>
                                            <textarea
                                                required
                                                className="edit-input font-normal h-32 resize-none leading-relaxed italic"
                                                placeholder="Uma introdução inspiradora que será exibida no card do blog..."
                                                value={editingPost?.excerpt || ''}
                                                onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                            />
                                            <p className="text-[9px] text-stone-400 font-medium italic">Máximo 180 caracteres recomendados.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Imagem de Capa</Label>
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <input
                                                    required
                                                    type="text"
                                                    className="edit-input font-normal flex-1"
                                                    placeholder="URL da Imagem (Unsplash, Pexels...)"
                                                    value={editingPost?.image || ''}
                                                    onChange={e => setEditingPost({ ...editingPost, image: e.target.value })}
                                                />
                                                <button type="button" className="p-4 bg-brand-cotton dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm text-stone-400 hover:text-brand-gold transition-colors">
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                            {editingPost?.image && (
                                                <div className="aspect-[16/9] w-full rounded-sm overflow-hidden border border-brand-cotton-dark dark:border-stone-800 shadow-inner group relative">
                                                    <img src={editingPost.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Settings Toggles */}
                                    <div className="p-6 bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm space-y-6 shadow-soft-sm">
                                        <Toggle
                                            label="Publicar Imediatamente"
                                            checked={editingPost?.isPublished ?? true}
                                            onChange={val => setEditingPost({ ...editingPost, isPublished: val })}
                                        />
                                        <Toggle
                                            label="Destacar na Vitrine Principal"
                                            checked={editingPost?.isFeatured ?? false}
                                            onChange={val => setEditingPost({ ...editingPost, isFeatured: val })}
                                        />
                                        <div className="pt-4 border-t border-brand-cotton-dark dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                            <span>Autor: {editingPost?.author || 'Assistente das Graças'}</span>
                                            <button type="button" className="text-brand-gold hover:underline">Trocar</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Full Content Editor */}
                                <div className="lg:col-span-7 space-y-10">
                                    <SectionTitle icon={<FileText size={16} />} title="O Texto Inspirador" />

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-300 mb-2">
                                            <span className="flex items-center gap-1"><Edit2 size={12} /> Sugestão: Use parágrafos claros e breves.</span>
                                        </div>
                                        <textarea
                                            required
                                            className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm px-10 py-12 outline-none focus:border-brand-gold transition-all duration-700 font-serif text-xl leading-relaxed h-[600px] shadow-soft-sm placeholder:opacity-20 scrollbar-premium"
                                            placeholder="Comece a redigir o texto espiritual aqui..."
                                            value={editingPost?.content || ''}
                                            onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                                        />
                                    </div>

                                    <div className="text-center">
                                        <p className="text-[10px] text-stone-400 italic">"Que cada palavra escrita leve conforto aos corações que a lerem."</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white dark:bg-stone-900 p-8 border-t border-brand-cotton-dark dark:border-stone-800 flex flex-col md:flex-row gap-6 shrink-0">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingPost(null); }}
                                className="flex-1 border border-brand-cotton-dark dark:border-stone-700 text-stone-400 font-bold py-5 rounded-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-all uppercase text-[10px] tracking-[0.2em]"
                            >
                                Rejeitar Alterações
                            </button>
                            <button
                                form="blog-form"
                                type="submit"
                                className="flex-[2] bg-brand-gold text-brand-wood font-black py-5 rounded-sm hover:bg-brand-gold-light transition-all shadow-soft-lg uppercase text-[10px] tracking-[0.3em]"
                            >
                                Consagrar e Salvar Mensagem
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components for cleaner code
function ActionButton({ children, onClick, active, activeColor = 'text-brand-gold bg-brand-gold/5', title }: any) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-3 rounded-sm transition-all duration-300 ${active ? `${activeColor} shadow-inner-soft` : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
        >
            {children}
        </button>
    );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center gap-3 border-l-2 border-brand-gold pl-4 py-1">
            <div className="text-brand-gold">{icon}</div>
            <h4 className="text-xs font-black uppercase tracking-[0.25em] text-stone-500 dark:text-stone-300">{title}</h4>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">{children}</label>;
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-brand-gold transition-colors">{label}</span>
            <div
                onClick={() => onChange(!checked)}
                className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-brand-gold' : 'bg-stone-200 dark:bg-stone-800'}`}
            >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${checked ? 'left-6' : 'left-1'}`} />
            </div>
        </label>
    );
}

// Component styles injected via CSS in components is not standard, let's assume global or common classes
// Adding them here for logic awareness:
// .edit-input { w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm px-6 py-4 outline-none focus:border-brand-gold transition-all text-sm }
