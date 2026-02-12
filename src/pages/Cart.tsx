import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Cart() {
    const { items, removeFromCart, updateQuantity, total, checkout } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.email?.split('@')[0] || '');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
    const discount = paymentMethod === 'pix' ? total * 0.05 : 0;
    const finalTotal = total - discount;

    const { settings } = useStore();

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            const result = await checkout(name, notes, paymentMethod);
            if (result.success && result.orderId) {
                // INTEGRAÇÃO INFINITEPAY (OPÇÃO B - AUTOMÁTICO)
                if (paymentMethod === 'pix' && settings.infinitepay_handle) {
                    try {
                        const infinitePayPayload = {
                            handle: settings.infinitepay_handle,
                            order_nsu: result.orderId,
                            items: items.map(item => ({
                                quantity: item.quantity,
                                price: Math.round((item.promotionalPrice || item.price) * 100), // Em centavos
                                description: item.name
                            })),
                            redirect_url: `${window.location.origin}/pedido-confirmado/${result.orderId}`
                        };

                        const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(infinitePayPayload)
                        });

                        const data = await response.json();
                        if (data && data.url) {
                            window.location.href = data.url;
                            return;
                        }
                    } catch (apiErr) {
                        console.error("InfinitePay Direct Link Error:", apiErr);
                    }
                }

                if (paymentMethod === 'card') {
                    navigate('/checkout');
                } else {
                    navigate(`/pedido-confirmado/${result.orderId}`);
                }
            } else {
                setError(result.message || "Erro desconhecido");
            }
        } catch (err) {
            setError("Erro ao processar pedido.");
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in-up">
                <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={48} className="text-stone-300" />
                </div>
                <h2 className="text-2xl font-display font-bold text-stone-600 dark:text-stone-300">Seu carrinho está vazio</h2>
                <Link to="/" className="text-brand-gold font-bold hover:underline">Continuar comprando</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-16 px-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-stone-400 hover:text-brand-gold transition-colors font-black uppercase text-[9px] tracking-[0.2em] group"
                >
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar para Loja
                </button>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300">Checkout Seguro</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Carrinho List Section */}
                <div className="lg:col-span-8 space-y-5">
                    <div className="flex items-end gap-2 mb-1">
                        <h1 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-tight">Seu Carrinho</h1>
                        <span className="text-stone-400 text-xs font-bold pb-1">({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-sm border border-brand-cotton-dark dark:border-stone-800 shadow-soft overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 gap-4 p-3 border-b border-stone-100 dark:border-stone-800 text-[9px] font-black uppercase text-stone-400 tracking-widest">
                            <div className="col-span-6">Produto</div>
                            <div className="col-span-2 text-center">Preço</div>
                            <div className="col-span-2 text-center">Qtd</div>
                            <div className="col-span-2 text-right">Subtotal</div>
                        </div>

                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {items.map(item => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-5 items-center group transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                                    <div className="col-span-6 flex gap-4">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-50 dark:bg-stone-800 rounded-sm overflow-hidden flex-shrink-0 border border-stone-100 dark:border-stone-800">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h3 className="font-bold text-xs text-stone-800 dark:text-stone-100 leading-tight mb-1">{item.name}</h3>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">{item.category}</p>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="mt-1 text-[8px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 w-fit"
                                            >
                                                <Trash2 size={10} /> Remover
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-center hidden md:block">
                                        <span className="text-[10px] font-bold text-stone-500">{formatCurrency(item.promotionalPrice || item.price)}</span>
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-sm">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center font-bold text-stone-600 hover:bg-white rounded-sm transition-all text-xs">-</button>
                                            <span className="w-5 text-center text-[10px] font-black">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center font-bold text-stone-600 hover:bg-white rounded-sm transition-all text-xs">+</button>
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <span className="text-xs font-black text-brand-gold">
                                            {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-stone-900 p-6 md:p-7 rounded-sm border border-brand-cotton-dark dark:border-stone-800 shadow-soft-xl">
                        <h2 className="text-base font-display font-medium mb-6 text-stone-800 dark:text-stone-100 uppercase tracking-tight border-b border-stone-100 dark:border-stone-800 pb-3">Resumo da Compra</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                <span>Subtotal</span>
                                <span className="text-stone-800 dark:text-stone-200">{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                <span>Frete Estipulado</span>
                                <span className="text-emerald-600">No Próximo Passo</span>
                            </div>

                            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Total</span>
                                    <span className={`text-xl font-display font-medium ${discount > 0 ? 'line-through text-stone-300 text-xs mb-0.5' : 'text-stone-800 dark:text-stone-100'}`}>
                                        {formatCurrency(total)}
                                    </span>
                                </div>

                                {discount > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-emerald-600">
                                            <span className="text-[9px] font-black uppercase tracking-widest">Desconto Pix (5%)</span>
                                            <span className="text-xs font-black">-{formatCurrency(discount)}</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-2 border-t border-stone-100 dark:border-stone-800 mt-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-800 dark:text-stone-100">Total Final</span>
                                            <span className="text-2xl font-display font-medium text-brand-gold">{formatCurrency(finalTotal)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleCheckout} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">Forma de Pagamento</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('pix')}
                                        className={`p-3 rounded-sm border transition-all flex flex-col items-center gap-1 group ${paymentMethod === 'pix' ? 'border-brand-gold bg-stone-50 dark:bg-stone-800 shadow-inner' : 'border-stone-100 dark:border-stone-800 hover:border-brand-gold/50'}`}
                                    >
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${paymentMethod === 'pix' ? 'text-brand-gold' : 'text-stone-400'}`}>PIX</span>
                                        <span className="text-[7px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-sm font-black uppercase tracking-tighter">5% OFF</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-3 rounded-sm border transition-all flex flex-col items-center gap-1 group ${paymentMethod === 'card' ? 'border-brand-gold bg-stone-50 dark:bg-stone-800 shadow-inner' : 'border-stone-100 dark:border-stone-800 hover:border-brand-gold/50'}`}
                                    >
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${paymentMethod === 'card' ? 'text-brand-gold' : 'text-stone-400'}`}>Cartão</span>
                                        <span className="text-[7px] text-stone-400 font-bold uppercase tracking-tighter">Até 3x s/j</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Seu Nome Principal *</label>
                                    <input
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-sm px-3 py-2.5 text-[10px] font-bold focus:border-brand-gold outline-none transition-colors"
                                        placeholder="Ex: Maria das Graças"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Observações (Opcional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-sm px-3 py-2.5 text-[10px] font-bold focus:border-brand-gold outline-none h-16 resize-none transition-colors"
                                        placeholder="Embalagem para presente..."
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-2 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            {!user ? (
                                <button
                                    type="button"
                                    onClick={() => navigate('/login?redirect=/cart')}
                                    className="w-full bg-stone-800 text-white py-3.5 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-brand-gold transition-all"
                                >
                                    Login para Finalizar
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-brand-gold text-brand-wood py-3.5 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-brand-wood hover:text-white transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {processing ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <>
                                                {paymentMethod === 'pix' ? 'GERAR QR CODE PIX' : 'PAGAR COM CARTÃO'}
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[8px] text-center text-stone-400 font-bold uppercase tracking-widest block pt-1">
                                        {paymentMethod === 'pix'
                                            ? 'QR Code na próxima página.'
                                            : 'Processado pela Appmax.'}
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 rounded-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center border border-stone-100 dark:border-stone-800 flex-shrink-0">
                            <ShoppingBag className="text-brand-gold" size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">Compra Segura</p>
                            <p className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">Dados protegidos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
