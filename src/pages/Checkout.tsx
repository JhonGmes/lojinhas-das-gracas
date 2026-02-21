import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, Banknote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { toast } from 'react-hot-toast';

export function Checkout() {
    const navigate = useNavigate();
    const { items, total } = useCart();
    const { user } = useAuth();
    const { currentStoreId, settings: storeSettings } = useStore();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');

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

        try {
            // Calculate final items exactly as InfinitePay expects
            // Note: prices must be integers (cents) -> e.g. R$ 10,00 = 1000
            const infiniteItems = items.map(item => ({
                description: item.name,
                price: Math.round((item.promotionalPrice || item.price) * 100),
                quantity: item.quantity
            }));

            // Prepare Link Payload
            const infinitePayload = {
                handle: storeSettings?.infinitepay_handle || 'lojinhadasgracas',
                items: infiniteItems,
                payment_method: paymentMethod === 'credit' ? ["credit"] : ["pix"],
                customer: {
                    name: user.name || 'Cliente',
                    email: user.email,
                    phone: user.whatsapp || '5511999999999'
                }
            };

            // Call external InfinitePay endpoint
            // Try fetching from invoices/public/checkout/links first
            let checkoutUrl = '';

            try {
                const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(infinitePayload)
                });

                // fallback to v2/payment-links if 404
                if (response.status === 404) {
                    const fallbackResponse = await fetch('https://api.infinitepay.io/v2/payment-links', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(infinitePayload)
                    });
                    const fallbackData = await fallbackResponse.json();
                    checkoutUrl = fallbackData.url || fallbackData.payment_url || fallbackData?.data?.url;
                } else {
                    const data = await response.json();
                    checkoutUrl = data.url || data.payment_url || data?.data?.url;
                }
            } catch (fetchError) {
                console.warn('InfinitePay API call direct failed, falling back to local simulation.', fetchError);
            }

            // Create Order Object
            const orderData = {
                id: '', // Placeholder
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
                    // Redirect to InfinitePay checkout
                    // In a real scenario we might pass redirect_url back to our site
                    window.location.href = checkoutUrl;
                } else {
                    toast.success("PEDIDO REALIZADO COM SUCESSO (Simulado)!");
                    navigate(`/pedido-confirmado/${createdOrder.id}`);
                }
            } else {
                throw new Error("Falha ao criar pedido no banco");
            }
        } catch (error) {
            console.error("Erro no checkout:", error);
            toast.error("Erro ao processar pedido. Tente novamente.");
        } finally {
            setLoading(false);
        }
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
                        <h1 className="text-xl font-display font-medium uppercase tracking-tight">Pagamento</h1>
                    </div>

                    {/* Payment Method Selection */}
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
                                {loading ? <Loader2 className="animate-spin" size={20} /> : `PAGAR ${formatCurrency(total)} (VIA INFINITEPAY)`}
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

                        {/* Customer Info Preview */}
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
