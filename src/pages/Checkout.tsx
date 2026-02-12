import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CreditCard, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../lib/utils';
import { toast } from 'react-hot-toast';

export function Checkout() {
    const navigate = useNavigate();
    const { items, total } = useCart();
    const [loading, setLoading] = useState(false);

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulação de Integração Appmax
        setTimeout(() => {
            setLoading(false);
            toast.success("PAGAMENTO PROCESSADO!");
            navigate('/pedido-confirmado/SIMULADO-123');
        }, 2000);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                <p className="font-display uppercase tracking-widest text-stone-400 mb-4">Seu carrinho está vazio</p>
                <button onClick={() => navigate('/')} className="bg-brand-gold px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest">Voltar à Loja</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
            <button onClick={() => navigate(-1)} className="flex items-center text-stone-400 hover:text-brand-gold mb-8 transition-colors font-bold uppercase text-[9px] tracking-[0.2em] group">
                <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar ao Carrinho
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                        <CreditCard className="text-brand-gold" size={24} />
                        <h1 className="text-xl font-display font-medium uppercase tracking-tight">Pagamento com Cartão</h1>
                    </div>

                    <form onSubmit={handlePay} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Número do Cartão</label>
                                <input
                                    required
                                    className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm px-4 py-3 text-xs font-bold focus:border-brand-gold outline-none"
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Nome impresso no Cartão</label>
                                <input
                                    required
                                    className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm px-4 py-3 text-xs font-bold focus:border-brand-gold outline-none uppercase"
                                    placeholder="JOÃO DA SILVA"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Validade</label>
                                    <input
                                        required
                                        className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm px-4 py-3 text-xs font-bold focus:border-brand-gold outline-none"
                                        placeholder="MM/AA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">CVV</label>
                                    <input
                                        required
                                        className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm px-4 py-3 text-xs font-bold focus:border-brand-gold outline-none"
                                        placeholder="123"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-gold text-brand-wood py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-brand-wood hover:text-white transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : `PAGAR ${formatCurrency(total)}`}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-stone-400 py-4">
                            <ShieldCheck size={16} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Pagamento 100% Seguro via Appmax</span>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-stone-50 dark:bg-stone-800/40 p-6 rounded-sm border border-brand-cotton-dark dark:border-stone-800">
                        <h2 className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-200 mb-6 border-b border-stone-200 dark:border-stone-700 pb-3">Resumo da Compra</h2>
                        <div className="space-y-4 mb-6">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-[10px]">
                                    <span className="text-stone-500 font-bold uppercase tracking-tight">{item.quantity}x {item.name}</span>
                                    <span className="font-black text-stone-800 dark:text-stone-200">{formatCurrency((item.promotionalPrice || item.price) * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-stone-200 dark:border-stone-700 pt-4 flex justify-between items-center text-base">
                            <span className="font-bold uppercase tracking-widest text-[9px] text-stone-400">Total a pagar</span>
                            <span className="font-black text-brand-gold font-display text-2xl">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
