import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPostProps {
    post: {
        id: string;
        title: string;
        excerpt: string;
        date: string;
        author: string;
        image: string;
        category: string;
    }
}

export function BlogCard({ post }: BlogPostProps) {
    return (
        <article className="group bg-white dark:bg-stone-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-stone-100 dark:border-stone-800 flex flex-col h-full">
            <div className="relative h-56 overflow-hidden">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-brand-gold text-brand-wood text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        {post.category}
                    </span>
                </div>
            </div>

            <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-brand-gold" /> {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <User size={12} className="text-brand-gold" /> {post.author}
                    </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4 group-hover:text-brand-gold transition-colors line-clamp-2">
                    {post.title}
                </h3>

                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-8 line-clamp-3">
                    {post.excerpt}
                </p>

                <div className="mt-auto">
                    <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-2 text-brand-gold font-black text-[10px] uppercase tracking-[0.2em] hover:gap-4 transition-all"
                    >
                        Ler Mensagem <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </article>
    );
}
