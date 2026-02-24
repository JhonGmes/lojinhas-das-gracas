import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export function Cart() {
    const {
        items, removeFromCart, updateQuantity, total,
        couponDiscount, appliedCoupon, applyCoupon,
        removeCoupon
    } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const finalTotal = total - couponDiscount;


    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        const ok = await applyCoupon(couponCode);
        if (ok) {
            toast.success('Cupom aplicado com sucesso!');
            setCouponCode('');
        } else {
            toast.error('Cupom inválido ou expirado.');
        }
        setCouponLoading(false);
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
                    <div className="bg-white dark:bg-stone-900 p-8 md:p-10 rounded-sm border border-brand-cotton-dark dark:border-stone-800 shadow-soft-xl">
                        <h2 className="text-lg font-display font-medium mb-8 text-stone-800 dark:text-stone-100 uppercase tracking-tight border-b border-stone-100 dark:border-stone-800 pb-4">Resumo da Compra</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                                <span>Subtotal</span>
                                <span className="text-stone-800 dark:text-stone-200 font-black">{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                                <span>Frete Estimado</span>
                                <span className="text-emerald-600 font-black">Grátis</span>
                            </div>

                            <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total</span>
                                    <span className={`text - 2xl font - display font - medium ${couponDiscount > 0 ? 'line-through text-stone-300 text-sm mb-1' : 'text-stone-800 dark:text-stone-100'} `}>
                                        {formatCurrency(total)}
                                    </span>
                                </div>

                                {/* Coupon Section */}
                                <div className="py-4 border-t border-stone-100 dark:border-stone-800 mt-4">
                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="CUPOM DE DESCONTO"
                                                className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-brand-gold"
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            />
                                            <button
                                                type="button"
                                                disabled={couponLoading}
                                                onClick={handleApplyCoupon}
                                                className="bg-stone-800 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                                            >
                                                Aplicar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 p-2 rounded-sm">
                                            <div className="flex items-center gap-2">
                                                <Tag size={12} className="text-emerald-600" />
                                                <span className="text-[10px] font-black text-emerald-700 uppercase">{appliedCoupon}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeCoupon}
                                                className="text-[9px] font-black text-emerald-700 hover:text-red-500 uppercase underline"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {couponDiscount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 mt-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Desconto Cupom</span>
                                        <span className="text-sm font-black">-{formatCurrency(couponDiscount)}</span>
                                    </div>
                                )}

                                {couponDiscount > 0 && (
                                    <div className="flex justify-between items-end pt-3 border-t border-stone-100 dark:border-stone-800 mt-4">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-800 dark:text-stone-100">Total Final</span>
                                        <span className="text-3xl font-display font-medium text-brand-gold">{formatCurrency(finalTotal)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {!user ? (
                                <button
                                    onClick={() => navigate('/identificacao?redirect=/cart')}
                                    className="w-full bg-stone-800 text-white py-5 rounded-sm font-black text-[11px] uppercase tracking-[0.25em] shadow-lg hover:bg-stone-700 transition-all"
                                >
                                    Login para Finalizar
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-brand-gold text-brand-wood py-5 rounded-sm font-black text-[11px] uppercase tracking-[0.25em] shadow-lg hover:bg-brand-wood hover:text-white transition-all flex items-center justify-center gap-3 group"
                                >
                                    PROSSEGUIR PARA PAGAMENTO
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 rounded-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center border border-stone-100 dark:border-stone-800 flex-shrink-0 shadow-sm">
                            <ShoppingBag className="text-brand-gold" size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">Compra 100% Segura</p>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Privacidade e dados protegidos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
