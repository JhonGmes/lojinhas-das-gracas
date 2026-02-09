import { useState } from 'react';
import { useBlog } from '../../context/BlogContext';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Sparkles } from 'lucide-react';
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
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-widest">Gestão de Fé (Blog)</h1>
                    <p className="text-stone-500 font-medium">Compartilhe sabedoria, orações e hagiografias com seus clientes.</p>
                </div>
                <button
                    onClick={() => { setEditingPost({}); setShowForm(true); }}
                    className="bg-brand-gold text-brand-wood font-black px-8 py-3 rounded-xl shadow-xl hover:bg-brand-amber transition-all flex items-center gap-3 uppercase text-sm tracking-widest"
                >
                    <Plus size={20} /> Nova Mensagem
                </button>
            </header>



            {/* List Section */}
            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-premium border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="p-8 border-b border-stone-100 dark:border-stone-800 flex items-center gap-4">
                    <Search className="text-stone-400" />
                    <input
                        type="text"
                        placeholder="Buscar por título ou categoria..."
                        className="flex-1 bg-stone-50 dark:bg-stone-800/50 rounded-xl px-6 py-3 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="divide-y divide-stone-50 dark:divide-stone-800/50">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse text-brand-gold font-bold tracking-widest uppercase">Carregando mensagens...</div>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <div key={post.id} className="p-6 flex flex-col md:flex-row items-center gap-8 group hover:bg-stone-50 dark:hover:bg-brand-gold/10 transition-colors">
                                <img src={post.image} alt={post.title} className="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 font-bold px-3 py-1 rounded-full uppercase tracking-widest">{post.category}</span>
                                        <span className="text-[10px] text-stone-400 font-bold">{post.date}</span>
                                        {post.isFeatured && <span className="text-[10px] bg-amber-100 text-amber-600 font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><Sparkles size={10} /> Destaque (3 na Home)</span>}
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-stone-800 dark:text-stone-100">{post.title}</h3>
                                    <p className="text-sm text-stone-500 line-clamp-1">{post.excerpt}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => togglePublished(post)}
                                        className={`p-3 rounded-xl transition-all ${post.isPublished ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-stone-200 text-stone-500 hover:bg-stone-300'}`}
                                        title={post.isPublished ? 'Publicado' : 'Rascunho'}
                                    >
                                        {post.isPublished ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                    <button
                                        onClick={() => toggleFeatured(post)}
                                        className={`p-3 rounded-xl transition-all ${post.isFeatured ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-stone-200 text-stone-500 hover:bg-stone-300'}`}
                                        title="Destaque na Vitrine"
                                    >
                                        <Sparkles size={20} className={post.isFeatured ? 'fill-amber-600' : ''} />
                                    </button>
                                    <button
                                        onClick={() => { setEditingPost(post); setShowForm(true); }}
                                        className="p-3 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl hover:bg-brand-gold hover:text-white transition-all shadow-sm"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => deletePost(post.id)}
                                        className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center text-stone-400 font-medium italic">Nenhuma mensagem encontrada.</div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-[100] bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-4xl my-8 rounded-[3rem] shadow-2xl p-8 md:p-12 border border-stone-200 dark:border-stone-800 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-widest">
                                    {editingPost?.id ? 'Editar Mensagem' : 'Nova Mensagem'}
                                </h2>
                                <p className="text-stone-500 font-medium">Preencha os detalhes da sabedoria que deseja compartilhar.</p>
                            </div>
                            <button onClick={() => { setShowForm(false); setEditingPost(null); }} className="text-stone-400 hover:text-stone-800 transition-colors bg-stone-50 dark:bg-stone-800 p-3 rounded-2xl">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-stone-400 ml-2">Título da Mensagem</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-800 rounded-2xl px-6 py-4 outline-none focus:border-brand-gold transition-all font-bold"
                                        placeholder="Ex: A Oração de São Francisco"
                                        value={editingPost?.title || ''}
                                        onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-stone-400 ml-2">Categoria</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-800 rounded-2xl px-6 py-4 outline-none focus:border-brand-gold transition-all font-bold"
                                        placeholder="Ex: Espiritualidade, História, Oração"
                                        value={editingPost?.category || ''}
                                        onChange={e => setEditingPost({ ...editingPost, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-stone-400 ml-2">Resumo (Excerpt)</label>
                                <textarea
                                    required
                                    className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-800 rounded-2xl px-6 py-4 outline-none focus:border-brand-gold transition-all font-medium h-24 resize-none"
                                    placeholder="Uma breve introdução para atrair o leitor..."
                                    value={editingPost?.excerpt || ''}
                                    onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-stone-400 ml-2">URL da Imagem</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-800 rounded-2xl px-6 py-4 outline-none focus:border-brand-gold transition-all font-medium"
                                    placeholder="Link da imagem do Unsplash ou similar"
                                    value={editingPost?.image || ''}
                                    onChange={e => setEditingPost({ ...editingPost, image: e.target.value })}
                                />
                                {editingPost?.image && <img src={editingPost.image} className="w-full h-48 object-cover rounded-2xl mt-4 border border-stone-100 dark:border-stone-800" />}
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-stone-400 ml-2">Conteúdo Completo</label>
                                <textarea
                                    required
                                    className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-800 rounded-[2rem] px-8 py-8 outline-none focus:border-brand-gold transition-all font-serif text-lg leading-relaxed h-[400px]"
                                    placeholder="Escreva aqui a mensagem completa..."
                                    value={editingPost?.content || ''}
                                    onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-8 bg-stone-50 dark:bg-stone-800/50 p-6 rounded-3xl border border-stone-100 dark:border-stone-800">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-6 h-6 rounded-lg text-brand-gold focus:ring-brand-gold border-stone-200"
                                        checked={editingPost?.isPublished ?? true}
                                        onChange={e => setEditingPost({ ...editingPost, isPublished: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-stone-600 dark:text-stone-300 group-hover:text-brand-gold transition-colors">Publicar Imediatamente</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-6 h-6 rounded-lg text-brand-gold focus:ring-brand-gold border-stone-200"
                                        checked={editingPost?.isFeatured ?? false}
                                        onChange={e => setEditingPost({ ...editingPost, isFeatured: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-stone-600 dark:text-stone-300 group-hover:text-brand-gold transition-colors">Destaque na Vitrine Home</span>
                                </label>
                                <div className="flex-1 md:text-right">
                                    <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest">Autor Padrão: {editingPost?.author || 'Assistente das Graças'}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingPost(null); }}
                                    className="flex-1 bg-stone-100 text-stone-500 font-bold py-5 rounded-2xl hover:bg-stone-200 transition-all uppercase text-sm tracking-widest shadow-inner"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-brand-gold text-brand-wood font-black py-5 rounded-2xl hover:bg-brand-amber transition-all shadow-xl uppercase text-sm tracking-[0.2em]"
                                >
                                    Salvar Mensagem Sagrada
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
