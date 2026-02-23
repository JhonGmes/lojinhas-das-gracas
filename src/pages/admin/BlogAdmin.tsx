import { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import {
    Plus, Search, Edit2, Trash2, Sparkles,
    Calendar, BookOpen, Loader2, Image as ImageIcon,
    ArrowLeft, Save, Globe, History, MessageSquare,
    Type, Hash, AlignLeft
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import type { BlogPost } from '../../types';

export function BlogAdmin() {
    const { posts, loading, deletePost, updatePost, createPost } = useBlog();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost || isSaving) return;

        setIsSaving(true);
        try {
            const postData = {
                ...editingPost,
                date: editingPost.date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                isPublished: editingPost.isPublished ?? true,
                isFeatured: editingPost.isFeatured ?? false,
                author: editingPost.author || 'Assistente das Graças',
                image: editingPost.image || 'https://images.unsplash.com/photo-1445006844190-67571343729d?q=80&w=800'
            } as BlogPost;

            if (postData.id) {
                await updatePost(postData);
                toast.success("Mensagem atualizada!");
            } else {
                await createPost(postData);
                toast.success("Mensagem criada com sucesso!");
            }
            setShowForm(false);
            setEditingPost(null);
        } catch (error) {
            toast.error("Erro ao salvar mensagem.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja realmente excluir esta mensagem? Esta ação não pode ser desfeita.')) {
            try {
                await deletePost(id);
                toast.success("Mensagem excluída.");
            } catch (error) {
                toast.error("Erro ao excluir mensagem.");
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                const url = await api.storage.upload(file, `blog/${Date.now()}`);
                setEditingPost({ ...editingPost, image: url });
                toast.success("Imagem enviada!");
            } catch (error) {
                toast.error("Erro no upload");
            } finally {
                setUploading(false);
            }
        }
    };

    // Editor View
    if (showForm) {
        return (
            <div className="min-h-[80vh] flex flex-col animate-fade-in max-w-5xl mx-auto pb-10">
                {/* Editor Header */}
                <div className="flex items-center justify-between gap-4 mb-8 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setShowForm(false); setEditingPost(null); }}
                            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-base font-black text-stone-800 dark:text-stone-100 uppercase tracking-tight">
                                {editingPost?.id ? 'Editar Mensagem' : 'Nova Mensagem de Fé'}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${editingPost?.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                                    {editingPost?.isPublished ? 'Modo Público' : 'Modo Rascunho'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            form="blog-editor-form"
                            type="submit"
                            disabled={isSaving}
                            className="bg-stone-800 hover:bg-stone-900 dark:bg-brand-gold dark:hover:bg-brand-gold-dark text-white px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>

                <form id="blog-editor-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Title Section */}
                        <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                    <Type size={12} className="text-brand-gold" /> Título da Mensagem
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: A Importância da Oração em Família"
                                    value={editingPost?.title || ''}
                                    onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                                    className="w-full text-2xl font-black text-stone-800 dark:text-stone-100 bg-transparent border-none outline-none placeholder:text-stone-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                    <AlignLeft size={12} className="text-brand-gold" /> Resumo Curto
                                </label>
                                <textarea
                                    required
                                    placeholder="Uma breve introdução para atrair os leitores..."
                                    value={editingPost?.excerpt || ''}
                                    onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                    className="w-full min-h-[80px] text-sm text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-100 dark:border-stone-700 outline-none focus:border-brand-gold/30 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                    <MessageSquare size={12} className="text-brand-gold" /> Conteúdo Completo
                                </label>
                                <textarea
                                    required
                                    placeholder="Comece a escrever sua mensagem espiritual aqui..."
                                    value={editingPost?.content || ''}
                                    onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                                    className="w-full min-h-[400px] text-base font-serif leading-relaxed text-stone-800 dark:text-stone-200 bg-transparent border-none outline-none placeholder:text-stone-300 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Publish & Status */}
                        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-800 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">Status e Visibilidade</h3>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${editingPost?.isPublished ? 'bg-emerald-50 text-emerald-500' : 'bg-stone-50 text-stone-400'}`}>
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-stone-700 dark:text-stone-200 uppercase tracking-tight">Publicado</p>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase">Visível para fiéis</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={editingPost?.isPublished ?? true}
                                        onChange={e => setEditingPost({ ...editingPost, isPublished: e.target.checked })}
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-all relative ${editingPost?.isPublished ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${editingPost?.isPublished ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${editingPost?.isFeatured ? 'bg-amber-50 text-amber-500' : 'bg-stone-50 text-stone-400'}`}>
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-stone-700 dark:text-stone-200 uppercase tracking-tight">Destaque</p>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase">Início da Home</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={editingPost?.isFeatured ?? false}
                                        onChange={e => setEditingPost({ ...editingPost, isFeatured: e.target.checked })}
                                    />
                                    <div className={`w-10 h-5 rounded-full transition-all relative ${editingPost?.isFeatured ? 'bg-amber-500' : 'bg-stone-200'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${editingPost?.isFeatured ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Image & Category */}
                        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-800 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">Categorização e Mídia</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                                        <Hash size={10} /> Categoria
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Oração, Santo do Dia"
                                        value={editingPost?.category || ''}
                                        onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                                        className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-brand-gold transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                                        <ImageIcon size={10} /> Imagem de Capa
                                    </label>
                                    <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-stone-100 dark:border-stone-700 group hover:border-brand-gold transition-all">
                                        {editingPost?.image ? (
                                            <>
                                                <img src={editingPost.image} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label htmlFor="cover-upload" className="cursor-pointer bg-white text-stone-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-xl">
                                                        Trocar Imagem
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label htmlFor="cover-upload" className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer text-stone-400 hover:text-brand-gold transition-colors p-4 text-center">
                                                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-full">
                                                    <ImageIcon size={24} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Fazer Upload ou URL</span>
                                            </label>
                                        )}
                                        <input
                                            id="cover-upload"
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="animate-spin text-brand-gold" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ou cole o link da imagem aqui..."
                                        value={editingPost?.image || ''}
                                        onChange={e => setEditingPost({ ...editingPost, image: e.target.value })}
                                        className="w-full mt-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700 rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:border-brand-gold transition-all italic text-stone-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    // List View (Default)
    return (
        <div className="space-y-8 animate-fade-in-up max-w-6xl mx-auto pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 dark:border-stone-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 text-brand-gold mb-2">
                        <BookOpen size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestão Editorial</span>
                    </div>
                    <h1 className="text-4xl font-black text-stone-800 dark:text-stone-100 uppercase tracking-tighter leading-none">Blog de Fé</h1>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                        <History size={14} className="text-stone-300" /> Histórico de Mensagens Espirituais
                    </p>
                </div>

                <button
                    onClick={() => { setEditingPost({ author: 'Assistente das Graças', isPublished: true }); setShowForm(true); }}
                    className="group relative bg-stone-800 dark:bg-brand-gold active:scale-95 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-brand-gold/20 transition-all flex items-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    <Plus size={18} className="relative z-10" />
                    <span className="relative z-10">Nova Mensagem de Fé</span>
                </button>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                {/* Search & Stats Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
                    <div className="flex-1 w-full relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-brand-gold transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar por título ou categoria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-800/50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none placeholder:text-stone-400 text-stone-700 dark:text-stone-200"
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-6 px-4">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-stone-800 dark:text-stone-100 leading-none">{posts.length}</p>
                            <p className="text-[8px] font-bold text-stone-400 uppercase mt-1 tracking-widest">Posts</p>
                        </div>
                        <div className="w-px h-6 bg-stone-100 dark:bg-stone-800" />
                        <div className="text-center">
                            <p className="text-[10px] font-black text-emerald-500 leading-none">{posts.filter(p => p.isPublished).length}</p>
                            <p className="text-[8px] font-bold text-stone-400 uppercase mt-1 tracking-widest">Ativos</p>
                        </div>
                    </div>
                </div>

                {/* Enhanced List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-4 animate-pulse">
                            <Loader2 size={32} className="animate-spin text-brand-gold opacity-50" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Acessando Arquivos de Fé...</p>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <div
                                key={post.id}
                                className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm hover:border-brand-gold/30 hover:shadow-md transition-all group flex items-start sm:items-center gap-6"
                            >
                                {/* Thumbnail */}
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-inner flex-shrink-0 border border-stone-100 dark:border-stone-800">
                                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>

                                {/* Body */}
                                <div className="flex-1 min-w-0 py-2">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-[9px] font-black bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                            {post.category}
                                        </span>
                                        {post.isFeatured && (
                                            <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                                <Sparkles size={8} /> Destaque
                                            </span>
                                        )}
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${post.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400'}`}>
                                            {post.isPublished ? 'Público' : 'Rascunho'}
                                        </span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-black text-stone-800 dark:text-stone-100 leading-tight mb-1 truncate">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-tight">
                                        <div className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</div>
                                        <div className="flex items-center gap-1.5"><Save size={12} /> {post.author}</div>
                                    </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex items-center gap-2 pr-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                    <button
                                        onClick={() => { setEditingPost(post); setShowForm(true); }}
                                        className="p-3 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-brand-gold hover:bg-brand-gold/5 rounded-xl transition-all shadow-sm"
                                        title="Editar Mensagem"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-3 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                                        title="Excluir Definitivamente"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-40 text-center space-y-4">
                            <div className="w-20 h-20 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center mx-auto text-stone-200">
                                <BookOpen size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-stone-300 uppercase tracking-tighter">O Silêncio se faz presente</h3>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-2">Nenhuma mensagem encontrada para seu critério.</p>
                            </div>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-brand-gold font-black text-[10px] uppercase tracking-widest hover:underline"
                            >
                                Limpar Pesquisa
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
