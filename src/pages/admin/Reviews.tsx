import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Review } from '../../types';
import {
    Star,
    MessageSquare,
    Trash2,
    Reply,
    CheckCircle2,
    Search,
    Filter,
    Loader2,
    Calendar,
    Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReviewWithProduct extends Review {
    products: { name: string } | null;
}

import { useStore } from '../../context/StoreContext';

export function Reviews() {
    const { currentStoreId } = useStore();
    const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await api.reviews.listAll(currentStoreId);
            setReviews(data as any);
        } catch (error) {
            toast.error('Erro ao carregar avaliações.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentStoreId) {
            loadReviews();
        }
    }, [currentStoreId]);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação é irreversível.')) return;
        try {
            await api.reviews.delete(id);
            toast.success('Avaliação excluída.');
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error('Erro ao excluir avaliação.');
        }
    };

    const handleRespond = async (id: string) => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            await api.reviews.respond(id, replyText);
            toast.success('Resposta enviada!');
            setReplyingTo(null);
            setReplyText('');
            loadReviews();
        } catch (error) {
            toast.error('Erro ao enviar resposta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            r.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.comment?.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filter === 'all' ||
            (filter === 'pending' && !r.admin_response) ||
            (filter === 'responded' && r.admin_response);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-stone-800 uppercase tracking-tight">Gestão de Avaliações</h1>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Moderação e Respostas de Clientes</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, produto ou comentário..."
                        className="w-full bg-white border border-stone-200 rounded-sm pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-brand-gold transition-colors"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <select
                        className="w-full bg-white border border-stone-200 rounded-sm pl-10 pr-4 py-2.5 text-xs font-bold outline-none appearance-none focus:border-brand-gold transition-colors"
                        value={filter}
                        onChange={e => setFilter(e.target.value as any)}
                    >
                        <option value="all">Todas</option>
                        <option value="pending">Aguardando Resposta</option>
                        <option value="responded">Respondidas</option>
                    </select>
                </div>
                <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-sm p-2 flex items-center justify-center text-brand-gold font-black text-[10px] uppercase tracking-widest">
                    {filteredReviews.length} Avaliações
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-stone-100 shadow-soft">
                    <Loader2 className="animate-spin text-brand-gold mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Carregando depoimentos...</p>
                </div>
            ) : filteredReviews.length > 0 ? (
                <div className="grid gap-4">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-sm border border-stone-100 shadow-soft overflow-hidden group hover:border-brand-gold/30 transition-all">
                            <div className="p-5">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-stone-50 rounded-sm flex items-center justify-center text-stone-400 shrink-0 border border-stone-100 italic font-serif">
                                            {review.customer_name[0].toUpperCase()}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-stone-800 uppercase tracking-tight">{review.customer_name}</span>
                                                {review.is_verified_purchase && (
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={10}
                                                            fill={i < review.rating ? "currentColor" : "none"}
                                                            className={i < review.rating ? "text-brand-gold" : "text-stone-200"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {format(new Date(review.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                            <div className="text-[9px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-1.5 pt-1">
                                                <Package size={10} />
                                                {review.products?.name || "Produto não identificado"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <button
                                            onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                                            className="p-2 text-stone-400 hover:text-brand-gold transition-colors border border-stone-100 rounded-sm hover:border-brand-gold/30"
                                            title="Responder"
                                        >
                                            <Reply size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-2 text-stone-400 hover:text-red-500 transition-colors border border-stone-100 rounded-sm hover:border-red-500/30"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-stone-50/50 rounded-sm border border-stone-100/50 italic text-stone-600 text-xs leading-relaxed">
                                    "{review.comment}"
                                </div>

                                {review.admin_response && (
                                    <div className="mt-4 pl-4 border-l-2 border-brand-gold space-y-2">
                                        <div className="flex items-center gap-2 text-[8px] font-black text-brand-gold uppercase tracking-widest">
                                            <MessageSquare size={10} />
                                            Resposta da Loja
                                        </div>
                                        <div className="text-xs text-stone-700 bg-brand-gold/5 p-3 rounded-sm border border-brand-gold/10">
                                            {review.admin_response}
                                        </div>
                                    </div>
                                )}

                                {replyingTo === review.id && (
                                    <div className="mt-6 space-y-3 animate-scale-in">
                                        <div className="text-[10px] font-black text-stone-800 uppercase tracking-widest flex items-center gap-2">
                                            <Reply size={12} className="text-brand-gold" />
                                            Respondendo a {review.customer_name}
                                        </div>
                                        <textarea
                                            autoFocus
                                            placeholder="Sua resposta elegante aqui..."
                                            className="w-full bg-white border border-brand-gold/30 rounded-sm p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-gold/10 min-h-[100px] resize-none"
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleRespond(review.id)}
                                                disabled={isSubmitting || !replyText.trim()}
                                                className="px-8 py-2 bg-brand-gold text-brand-wood text-[10px] font-black uppercase tracking-widest rounded-sm shadow-soft hover:bg-brand-wood hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Enviar Resposta'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white rounded-sm border border-dashed border-stone-200">
                    <MessageSquare size={48} className="text-stone-100 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-stone-300 uppercase tracking-[0.2em]">Nenhuma avaliação encontrada</h3>
                    <p className="text-stone-400 text-[10px] uppercase tracking-widest mt-2">{search ? 'Tente buscar por outro termo.' : 'Aguardando o primeiro feedback dos fiéis.'}</p>
                </div>
            )}
        </div>
    );
}
