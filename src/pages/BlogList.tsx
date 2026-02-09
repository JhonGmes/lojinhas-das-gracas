import { useBlog } from '../context/BlogContext';
import { BlogCard } from '../components/ui/BlogCard';
import { BookOpen, Search } from 'lucide-react';
import { useState } from 'react';

export function BlogList() {
    const { posts, loading } = useBlog();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPosts = posts.filter(post =>
        post.isPublished && (
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    return (
        <div className="pb-24">
            {/* Header */}
            <header className="bg-brand-wood py-24 text-center">
                <div className="container mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-gold rounded-[2rem] text-brand-wood shadow-2xl mb-8 rotate-3">
                        <BookOpen size={40} />
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 uppercase tracking-tighter">
                        Blog de Fé
                    </h1>
                    <p className="text-brand-gold/80 text-lg md:text-xl font-medium tracking-widest uppercase">
                        Mensagens, Orações e Sabedoria para o seu dia
                    </p>
                </div>
            </header>

            {/* Search and Filters */}
            <div className="container mx-auto px-4 -mt-8 relative z-10">
                <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-full shadow-2xl border border-stone-100 dark:border-stone-800 p-2 flex items-center">
                    <div className="pl-6 text-stone-400">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="O que você deseja ler hoje?"
                        className="flex-1 px-4 py-3 outline-none bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <main className="container mx-auto px-4 py-24">
                {loading ? (
                    <div className="text-center py-20 text-brand-gold tracking-widest uppercase font-bold animate-pulse">
                        Buscando mensagens sagradas...
                    </div>
                ) : filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {filteredPosts.map(post => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-stone-400 text-lg italic">Nenhuma mensagem encontrada para sua busca.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
