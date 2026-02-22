import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, Banknote, AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export function Checkout() {
    const navigate = useNavigate();
    const { items, total } = useCart();
    const { user } = useAuth();
    const { currentStoreId, settings: storeSettings } = useStore();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');
    const [paymentError, setPaymentError] = useState<{ title: string; message: string } | null>(null);

    const whatsappNumber = storeSettings?.whatsapp_number || '5598984095956';
    const whatsappFallback = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Olá! Tive um problema ao finalizar minha compra no site. Gostaria de continuar meu pedido de R$ ${formatCurrency(total)}.`
    )}`;

    useEffect(() => {
        if (!user) {
            toast.error("Faça login para continuar");
            navigate('/identificacao?redirect=/checkout');
        }
    }, [user, navigate]);

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setPaymentError(null); // Reset error state on new attempt

        try {
            const infiniteItems = items.map(item => ({
                description: item.name,
                price: Math.round((item.promotionalPrice || item.price) * 100),
                quantity: item.quantity
            }));

            const infinitePayload = {
                handle: storeSettings?.infinitepay_handle || 'lojinhadasgracas',
                items: infiniteItems,
                payment_method: paymentMethod === 'credit' ? "credit_card" : "pix",
                redirect_url: `${window.location.origin}/pedido-confirmado?status=success`,
                customer: {
                    name: user.name || 'Cliente',
                    email: user.email,
                    phone_number: user.whatsapp || '5598984095956'
                }
            };

            let checkoutUrl = '';

            try {
                // Call Supabase Edge Function instead of direct InfinitePay (to avoid CORS)
                const { data: functionData, error: functionError } = await supabase.functions.invoke('create-checkout-link', {
                    body: infinitePayload
                });

                if (functionError) {
                    console.error("[Checkout] Edge Function Error Object:", functionError);

                    const errorMsg = JSON.stringify(functionError).toLowerCase();
                    const isLimitError = errorMsg.includes('limit') || errorMsg.includes('usage') || errorMsg.includes('quota');

                    setPaymentError({
                        title: isLimitError ? 'Limite do Supabase Atingido' : 'Erro no Pagamento',
                        message: isLimitError
                            ? 'O limite gratuito do seu projeto no Supabase foi excedido. As funções foram temporariamente desativadas. Finalize seu pedido pelo WhatsApp.'
                            : `Houve uma falha na comunicação com o banco: ${functionError.message || 'Erro desconhecido'}. Verifique os logs no dashboard.`
                    });
                    setLoading(false);
                    return;
                }

                if (!functionData?.url) {
                    throw new Error('EMPTY_URL');
                }

                checkoutUrl = functionData.url;
            } catch (proxyError: any) {
                console.error("[Checkout] Invoke Catch Block:", proxyError);
                setPaymentError({
                    title: 'Falha de Comunicação',
                    message: 'Não conseguimos conectar à função de pagamento. Verifique se a função "create-checkout-link" está ativa no Supabase.'
                });
                setLoading(false);
                return;
            }

            const orderData = {
                id: '',
                customerName: user.name || 'Cliente',
                customerEmail: user.email,
                customerPhone: user.whatsapp,
                customerAddress: {
                    street: user.address || '',
                    number: '', complement: '', neighborhood: '', city: '', state: '', zipcode: '',
                },
                items: items,
                total: total,
                status: (checkoutUrl ? 'pending' : 'paid') as 'pending' | 'paid' | 'delivered' | 'cancelled',
                paymentMethod: paymentMethod,
                createdAt: new Date().toISOString(),
                notes: `Checkout ${checkoutUrl ? 'Redirecionado' : 'Simulado'} - InfinitePay`
            };

            const createdOrder = await api.orders.create(orderData, currentStoreId);

            if (createdOrder && createdOrder.id) {
                if (checkoutUrl) {
                    window.location.href = checkoutUrl;
                } else {
                    toast.success("Pedido realizado com sucesso!");
                    navigate(`/pedido-confirmado/${createdOrder.id}`);
                }
            } else {
                throw new Error('ORDER_CREATION_FAILED');
            }
        } catch (error: unknown) {
            console.error("Erro no checkout:", error);
            const isOrderError = error instanceof Error && error.message === 'ORDER_CREATION_FAILED';
            setPaymentError({
                title: isOrderError ? 'Erro ao Registrar Pedido' : 'Algo deu errado',
                message: isOrderError
                    ? 'Não conseguimos salvar seu pedido. Tente novamente ou finalize pelo WhatsApp.'
                    : 'Ocorreu um erro inesperado. Tente novamente ou use o WhatsApp para finalizar.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <span className="text-5xl mb-6">🛒</span>
                <p className="font-display uppercase tracking-widest text-stone-600 dark:text-stone-300 mb-2 font-bold">Seu carrinho está vazio</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-8">Adicione produtos antes de finalizar a compra.</p>
                <button onClick={() => navigate('/')} className="bg-brand-gold text-brand-wood px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest shadow-soft hover:bg-brand-wood hover:text-white transition-all">
                    Ver Produtos
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
            <button onClick={() => navigate(-1)} className="flex items-center text-stone-400 hover:text-brand-gold mb-8 transition-colors font-bold uppercase text-[9px] tracking-[0.2em] group">
                <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar ao Carrinho
            </button>

            {/* === PAYMENT ERROR PANEL === */}
            {paymentError && (
                <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm animate-fade-in-up">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} className="text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-sm text-red-700 dark:text-red-300 uppercase tracking-wide mb-1">
                                {paymentError.title}
                            </h3>
                            <p className="text-[11px] text-red-600 dark:text-red-400 leading-relaxed mb-4">
                                {paymentError.message}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => setPaymentError(null)}
                                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                                >
                                    <RefreshCw size={12} />
                                    Tentar Novamente
                                </button>
                                <a
                                    href={whatsappFallback}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors"
                                >
                                    <MessageCircle size={12} />
                                    Finalizar pelo WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                        <CreditCard className="text-brand-gold" size={24} />
                        <h1 className="text-xl font-display font-medium uppercase tracking-tight">Pagamento</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('credit')}
                            className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all ${paymentMethod === 'credit'
                                ? 'border-brand-gold bg-brand-gold/10 text-brand-wood'
                                : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:border-brand-gold/50'
                                }`}
                        >
                            <CreditCard size={24} className="mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Crédito</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('pix')}
                            className={`flex flex-col items-center justify-center p-4 border rounded-sm transition-all ${paymentMethod === 'pix'
                                ? 'border-brand-gold bg-brand-gold/10 text-brand-wood'
                                : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:border-brand-gold/50'
                                }`}
                        >
                            <Banknote size={24} className="mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Pix</span>
                        </button>
                    </div>

                    <form onSubmit={handlePay} className="space-y-4">
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-gold text-brand-wood py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-brand-wood hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : `Pagar ${formatCurrency(total)} via InfinitePay`}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-stone-400 py-4">
                            <ShieldCheck size={16} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Ambiente 100% Seguro InfinitePay</span>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-stone-50 dark:bg-stone-800/40 p-6 rounded-sm border border-brand-cotton-dark dark:border-stone-800">
                        <h2 className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-200 mb-6 border-b border-stone-200 dark:border-stone-700 pb-3">Resumo da Compra</h2>

                        {user && (
                            <div className="mb-6 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-sm">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Dados do Cliente</h3>
                                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">{user.name}</p>
                                <p className="text-[10px] text-stone-500">{user.email}</p>
                                <p className="text-[10px] text-stone-500">{user.whatsapp}</p>
                            </div>
                        )}

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
