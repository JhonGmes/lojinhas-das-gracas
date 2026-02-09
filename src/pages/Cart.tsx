import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

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

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        try {
            const result = await checkout(name, notes, paymentMethod);
            if (result.success && result.whatsappUrl) {
                window.open(result.whatsappUrl, '_blank');
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
        <div className="max-w-5xl mx-auto pb-10 animate-fade-in-up">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-stone-500 hover:text-brand-wood mb-6 transition-colors font-bold uppercase text-xs tracking-widest group"
            >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <h1 className="text-3xl font-display font-bold mb-4 text-brand-wood dark:text-stone-100">Seu Carrinho</h1>
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 transition-all hover:shadow-md">
                                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-stone-100" />
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-base text-brand-wood dark:text-stone-100 line-clamp-2">{item.name}</h3>
                                        <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500 transition-colors p-1" title="Remover">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-stone-500 uppercase font-bold tracking-wider">{item.category}</div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-brand-brown dark:text-amber-500 text-lg">
                                            {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                        </span>
                                        <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-900 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center font-bold text-stone-600 dark:text-stone-300 shadow-sm transition-all">-</button>
                                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-stone-700 flex items-center justify-center font-bold text-stone-600 dark:text-stone-300 shadow-sm transition-all">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-lg border border-stone-100 dark:border-stone-700 h-fit sticky top-24">
                    <h2 className="text-xl font-display font-bold mb-6 text-brand-wood dark:text-stone-100 border-b border-stone-100 dark:border-stone-700 pb-4">Resumo do Pedido</h2>

                    <div className="space-y-3 mb-6 text-sm font-medium">
                        <div className="flex justify-between text-stone-500 dark:text-stone-300">
                            <span>Subtotal</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between text-stone-500 dark:text-stone-300">
                            <span>Frete</span>
                            <span className="text-green-600 dark:text-green-400">A combinar no WhatsApp</span>
                        </div>
                        <div className="border-t border-stone-200 dark:border-stone-700 pt-4 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Total</span>
                                <span className={`text-xl ${discount > 0 ? 'line-through text-stone-400 text-base' : 'text-brand-brown dark:text-amber-500'}`}>{formatCurrency(total)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-bold">
                                    <span>Desconto Pix (5%)</span>
                                    <span>- {formatCurrency(discount)}</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-2xl font-bold text-brand-brown dark:text-amber-500">
                                    <span>Total Final</span>
                                    <span>{formatCurrency(finalTotal)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleCheckout} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-3 text-stone-600 dark:text-stone-300">Forma de Pagamento</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${paymentMethod === 'pix' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700' : 'border-stone-200 dark:border-stone-700 hover:border-brand-gold/50'}`}
                                >
                                    <span className="font-bold text-sm">PIX</span>
                                    <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">5% OFF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${paymentMethod === 'card' ? 'border-brand-gold bg-brand-light/30' : 'border-stone-200 dark:border-stone-700 hover:border-brand-gold/50'}`}
                                >
                                    <span className="font-bold text-sm">Cartão</span>
                                    <span className="text-[10px] text-stone-400">Até 3x</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1 text-stone-600 dark:text-stone-300">Seu Nome *</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full rounded-lg border border-stone-200 dark:border-stone-600 px-4 py-3 bg-stone-50 dark:bg-stone-900 focus:ring-2 focus:ring-brand-gold outline-none transition-shadow"
                                placeholder="Como gostaria de ser chamado?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-stone-600 dark:text-stone-300">Observações (Opcional)</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full rounded-lg border border-stone-200 dark:border-stone-600 px-4 py-3 bg-stone-50 dark:bg-stone-900 focus:ring-2 focus:ring-brand-gold outline-none h-24 resize-none transition-shadow"
                                placeholder="Ex: Preciso para o dia..."
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm font-bold bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-800 animate-shake">
                                ⚠️ {error}
                            </div>
                        )}

                        {!user ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-brand-gold/10 rounded-xl border border-brand-gold/20 flex gap-3 items-start">
                                    <UserCheck size={20} className="text-brand-gold shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-brand-wood dark:text-amber-200">Quase lá!</p>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">Identifique-se para salvar seu pedido e ver o histórico.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/login?redirect=/cart')}
                                    className="w-full bg-brand-wood hover:bg-brand-brown text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                                >
                                    Fazer Login ou Criar Conta
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="submit"
                                    disabled={processing || items.length === 0}
                                    className="w-full bg-[#25D366] hover:bg-[#1db954] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-50 disabled:scale-100 disabled:hover:translate-y-0"
                                >
                                    {processing ? 'Processando...' : (
                                        <>
                                            <span className="text-lg">Finalizar no WhatsApp</span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-stone-400 mt-2">
                                    Ao clicar, você será redirecionado para o WhatsApp da loja para concluir o pagamento.
                                </p>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
