import { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Sparkles, X, Calendar, BookOpen } from 'lucide-react';
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
        <div className="space-y-6 animate-fade-in-up pb-10 max-w-[1600px] mx-auto">
            {/* Header Compacto */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                    <h1 className="text-lg font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen size={20} className="text-brand-gold" />
                        Gestão de Fé
                    </h1>
                </div>
                <button
                    onClick={() => { setEditingPost({ author: 'Assistente das Graças' }); setShowForm(true); }}
                    className="bg-brand-gold text-white font-bold px-4 py-2 rounded-lg shadow-md hover:bg-brand-gold-dark transition-all flex items-center gap-2 uppercase text-xs tracking-wide"
                >
                    <Plus size={16} /> Nova Mensagem
                </button>
            </header>

            {/* List Section - Compact Table Style */}
            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
                {/* Search Bar - Compact */}
                <div className="px-4 py-3 bg-stone-50/50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3">
                    <Search className="text-stone-400" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar mensagens..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-stone-400 text-stone-700 dark:text-stone-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {loading ? (
                        <div className="p-12 text-center animate-pulse text-stone-400 font-bold text-xs uppercase tracking-widest">Carregando...</div>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <div key={post.id} className="group hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors duration-200 flex items-center gap-4 p-3 pr-4">
                                {/* Thumbnail - Compact */}
                                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                </div>

                                {/* Content - Compact */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">{post.title}</h3>
                                        {post.isFeatured && (
                                            <span className="shrink-0 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Destaque</span>
                                        )}
                                        <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${post.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                                            {post.isPublished ? 'Publicado' : 'Rascunho'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-stone-500 truncate">
                                        <span className="font-medium text-brand-gold uppercase tracking-tight text-[10px]">{post.category}</span>
                                        <span className="w-1 h-1 bg-stone-300 rounded-full" />
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {post.date}</span>
                                        <span className="w-1 h-1 bg-stone-300 rounded-full hidden sm:block" />
                                        <span className="hidden sm:truncate max-w-[300px] italic">"{post.excerpt}"</span>
                                    </div>
                                </div>

                                {/* Actions - Compact Row */}
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => togglePublished(post)}
                                        className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${post.isPublished ? 'text-emerald-500' : 'text-stone-400'}`}
                                        title={post.isPublished ? 'Ocultar' : 'Publicar'}
                                    >
                                        {post.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <button
                                        onClick={() => toggleFeatured(post)}
                                        className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${post.isFeatured ? 'text-amber-500' : 'text-stone-400'}`}
                                        title="Destaque"
                                    >
                                        <Sparkles size={14} className={post.isFeatured ? 'fill-amber-500' : ''} />
                                    </button>
                                    <button
                                        onClick={() => { setEditingPost(post); setShowForm(true); }}
                                        className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 text-blue-500 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => deletePost(post.id)}
                                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-stone-400 font-medium text-xs flex flex-col items-center gap-2">
                            <BookOpen size={24} className="opacity-20" />
                            <p>Nenhuma mensagem encontrada.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FORM MODAL - Clean & Compact */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in bg-stone-900/60 backdrop-blur-sm">
                    <div
                        className="fixed inset-0"
                        onClick={() => { setShowForm(false); setEditingPost(null); }}
                    />
                    <div className="bg-white dark:bg-stone-900 w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden relative z-10 animate-scale-in">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white dark:bg-stone-900 shrink-0">
                            <h2 className="text-sm font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                                <Edit2 size={16} className="text-brand-gold" />
                                {editingPost?.id ? 'Editar Mensagem' : 'Nova Mensagem'}
                            </h2>
                            <button
                                onClick={() => { setShowForm(false); setEditingPost(null); }}
                                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-50 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body - Grid Layout */}
                        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 dark:bg-stone-900/50">
                            <form id="blog-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-6">

                                {/* Left: Meta */}
                                <div className="md:col-span-4 space-y-4">
                                    <div className="p-4 bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 space-y-4">
                                        <div>
                                            <Label>Título</Label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full mt-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-gold/20 outline-none"
                                                placeholder="Título da mensagem..."
                                                value={editingPost?.title || ''}
                                                onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Categoria</Label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full mt-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-gold/20 outline-none"
                                                placeholder="Ex: Oração, Santo do Dia..."
                                                value={editingPost?.category || ''}
                                                onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>URL da Imagem</Label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full mt-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-gold/20 outline-none"
                                                placeholder="https://..."
                                                value={editingPost?.image || ''}
                                                onChange={e => setEditingPost({ ...editingPost, image: e.target.value })}
                                            />
                                            {editingPost?.image && (
                                                <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-stone-200">
                                                    <img src={editingPost.image} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 space-y-3">
                                        <Toggle
                                            label="Publicado"
                                            checked={editingPost?.isPublished ?? true}
                                            onChange={val => setEditingPost({ ...editingPost, isPublished: val })}
                                        />
                                        <Toggle
                                            label="Destaque Home"
                                            checked={editingPost?.isFeatured ?? false}
                                            onChange={val => setEditingPost({ ...editingPost, isFeatured: val })}
                                        />
                                    </div>
                                </div>

                                {/* Right: Content */}
                                <div className="md:col-span-8 space-y-4">
                                    <div className="p-4 bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 h-full flex flex-col">
                                        <div className="mb-4">
                                            <Label>Resumo (Excerpt)</Label>
                                            <textarea
                                                required
                                                className="w-full mt-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-gold/20 outline-none resize-none h-20"
                                                placeholder="Breve resumo..."
                                                value={editingPost?.excerpt || ''}
                                                onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <Label>Conteúdo Completo</Label>
                                            <textarea
                                                required
                                                className="w-full flex-1 mt-1 px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm font-serif leading-relaxed focus:ring-2 focus:ring-brand-gold/20 outline-none resize-none min-h-[300px]"
                                                placeholder="Escreva sua mensagem aqui..."
                                                value={editingPost?.content || ''}
                                                onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingPost(null); }}
                                className="px-4 py-2 border border-stone-200 text-stone-500 font-bold rounded-lg hover:bg-stone-50 transition-colors text-xs uppercase tracking-wide"
                            >
                                Cancelar
                            </button>
                            <button
                                form="blog-form"
                                type="submit"
                                className="px-6 py-2 bg-brand-gold text-white font-bold rounded-lg hover:bg-brand-gold-dark transition-colors shadow-md text-xs uppercase tracking-wide"
                            >
                                Salvar Mensagem
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">{children}</label>;
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group select-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 group-hover:text-brand-gold transition-colors">{label}</span>
            <div
                onClick={() => onChange(!checked)}
                className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-brand-gold' : 'bg-stone-200 dark:bg-stone-700'}`}
            >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-5' : 'left-1'}`} />
            </div>
        </label>
    );
}
