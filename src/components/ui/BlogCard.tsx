import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

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
        <article className="group bg-white dark:bg-stone-900 rounded-sm overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-400 border border-stone-100 dark:border-stone-800 flex flex-col h-full">
            <Link to={`/blog/${post.id}`} className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-900/50 block group/img">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                    <span className="bg-brand-gold/90 backdrop-blur-sm text-brand-wood text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest shadow-sm">
                        {post.category}
                    </span>
                </div>
            </Link>

            <div className="p-3 md:p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[8px] font-black text-stone-400 uppercase tracking-widest mb-2">
                    <Calendar size={10} className="text-brand-gold" /> {post.date}
                </div>

                <Link to={`/blog/${post.id}`} className="block mb-2">
                    <h3 className="font-display font-medium text-xs text-stone-800 dark:text-stone-100 leading-relaxed group-hover:text-brand-gold transition-colors duration-400 line-clamp-2 h-10">
                        {post.title}
                    </h3>
                </Link>

                <div className="mt-auto pt-3 border-t border-stone-50 dark:border-stone-800">
                    <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center gap-1.5 text-brand-gold font-black text-[8px] uppercase tracking-[0.2em] hover:gap-2.5 transition-all"
                    >
                        Ler Mensagem <ArrowRight size={10} />
                    </Link>
                </div>
            </div>
        </article>
    );
}
