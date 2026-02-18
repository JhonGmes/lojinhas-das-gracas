import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Copy, MessageCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency, generatePixPayload } from '../lib/utils';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { Clock, AlertTriangle } from 'lucide-react';

const EXPIRATION_MINUTES = 20;

export function OrderSuccess() {
    const { orderId } = useParams();
    const { settings, currentStoreId } = useStore();
    const { clearCart } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const hasShownToast = useRef(false); // Controla se o toast já foi mostrado
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000; // 2 seconds
    const POLLING_INTERVAL = 5000; // 5 seconds

    // Use settings pix_key or fallback
    const pixKey = settings.pix_key || "seu-pix-aqui@email.com";

    // Gerar Payload Pix Válido apenas quando tiver o pedido
    const pixPayload = useMemo(() => {
        if (!order || !pixKey) return '';
        try {
            return generatePixPayload(
                pixKey,
                order.total,
                settings.store_name || 'VALE SAGRADO',
                'SAO LUIS'
            );
        } catch (e) {
            console.error("Erro ao gerar payload Pix:", e);
            return '';
        }
    }, [order, pixKey, settings.store_name]);

    const infinitepayLink = useMemo(() => {
        if (!order || !settings.infinitepay_handle) return null;
        // Formato mais estável para links dinâmicos da InfinitePay
        return `https://pay.infinitepay.io/${settings.infinitepay_handle}/${order.total.toString().replace('.', ',')}`;
    }, [order, settings.infinitepay_handle]);

    useEffect(() => {
        if (!order) return;

        const creationTime = new Date(order.createdAt).getTime();
        const timerDuration = EXPIRATION_MINUTES * 60 * 1000;
        const targetTime = creationTime + timerDuration;

        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
            setTimeLeft(diff);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [order]);

    useEffect(() => {
        if (orderId) {
            // 🛒 LIMPAR CARRINHO IMEDIATAMENTE ao chegar na página de sucesso
            // Isso garante que o carrinho seja limpo mesmo se o usuário voltar para a página
            clearCart();

            const fetchOrder = async () => {
                try {
                    // 1. Checar parâmetros de retorno na URL (Redirect)
                    const urlParams = new URLSearchParams(window.location.search);
                    const transactionNsu = urlParams.get('transaction_nsu');

                    const orders = await api.orders.list(currentStoreId);
                    const found = orders.find((o: any) =>
                        o.id === orderId ||
                        o.orderNumber?.toString() === orderId ||
                        o.orderNumber?.toString().padStart(4, '0') === orderId
                    );

                    if (found) {
                        setOrder(found);
                        setLoading(false);
                        let currentStatus = found.status;

                        // 2. Detecção via Redirect (Se o cliente clicou em 'Voltar para a Loja')
                        if (transactionNsu && currentStatus === 'pending') {
                            await api.orders.updateStatus(found.id, 'paid');
                            currentStatus = 'paid';
                            found.status = 'paid';
                        }

                        // 3. Polling Ativo (O "Coração" do SaaS): Verifica no servidor se o Pix caiu enquanto o usuário espera na tela
                        if (currentStatus === 'pending' && settings.infinitepay_handle) {
                            try {
                                const checkResponse = await fetch(`/api/proxy?target=${encodeURIComponent('https://api.infinitepay.io/invoices/public/checkout/payment_check')}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        handle: settings.infinitepay_handle,
                                        order_nsu: orderId
                                    })
                                });

                                if (checkResponse.ok) {
                                    const checkData = await checkResponse.json();

                                    // A InfinitePay retorna success e paid se estiver tudo certo
                                    if (checkData && (checkData.paid || (checkData.success && checkData.paid))) {
                                        // Atualizar status do pedido
                                        await api.orders.updateStatus(found.id, 'paid');
                                        currentStatus = 'paid';
                                        found.status = 'paid';

                                        // 🎯 CAPTURAR DADOS DO CLIENTE DA INFINITEPAY
                                        // A InfinitePay retorna dados do cliente quando o pagamento é confirmado
                                        if (checkData.customer || checkData.payer) {
                                            const customer = checkData.customer || checkData.payer;
                                            const customerData: any = {
                                                transactionNsu: checkData.transaction_nsu || transactionNsu,
                                                infinitepayData: checkData // Backup completo dos dados
                                            };

                                            // Email e Telefone
                                            if (customer.email) customerData.email = customer.email;
                                            if (customer.phone || customer.phone_number) {
                                                customerData.phone = customer.phone || customer.phone_number;
                                            }

                                            // Endereço (se disponível)
                                            if (customer.address) {
                                                customerData.address = {
                                                    street: customer.address.street || customer.address.line1,
                                                    number: customer.address.number,
                                                    complement: customer.address.complement || customer.address.line2,
                                                    neighborhood: customer.address.neighborhood || customer.address.district,
                                                    city: customer.address.city,
                                                    state: customer.address.state || customer.address.state_code,
                                                    zipcode: customer.address.zipcode || customer.address.postal_code
                                                };
                                            }

                                            // Salvar dados do cliente no banco
                                            await api.orders.updateOrderWithCustomerData(found.id, customerData);
                                            console.log('✅ Dados do cliente capturados e salvos!', customerData);

                                            // Atualizar o estado do pedido com os novos dados
                                            setOrder((prev: any) => ({
                                                ...prev,
                                                customerEmail: customerData.email,
                                                customerPhone: customerData.phone,
                                                customerAddress: customerData.address,
                                                transactionNsu: customerData.transactionNsu,
                                                infinitepayData: customerData.infinitepayData
                                            }));
                                        }
                                    }
                                }
                            } catch (e) {
                                console.warn("Polling de segundo plano aguardando sinal...");
                            }
                        }

                        // 4. Detecção final e atualização da UI
                        if (currentStatus === 'paid' || currentStatus === 'delivered') {
                            if (!isPaid) {
                                setIsPaid(true);
                                clearCart();

                                // Mostrar toast apenas uma vez
                                if (!hasShownToast.current) {
                                    hasShownToast.current = true;
                                    toast.success("PAGAMENTO CONFIRMADO!", {
                                        icon: '💰',
                                        duration: 5000
                                    });

                                    // Redirecionamento automático após confirmação
                                    setTimeout(() => {
                                        const waUrl = `https://wa.me/${settings.whatsapp_number}?text=Olá! Meu pagamento do pedido #${orderId} foi confirmado via InfinitePay. Pode iniciar a separação!`;
                                        window.open(waUrl, '_blank');
                                    }, 3000);
                                }
                            }
                        }
                    } else if (retryCount < MAX_RETRIES && loading) {
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, RETRY_DELAY_MS);
                    } else {
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Failed to fetch order:", error);
                    setLoading(false);
                }
            };

            fetchOrder();

            // Inicia o Polling para checar status em tempo real
            const poll = setInterval(fetchOrder, POLLING_INTERVAL);
            return () => clearInterval(poll);
        }
    }, [orderId, retryCount, settings.whatsapp_number, settings.infinitepay_handle]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = timeLeft !== null ? (timeLeft / (EXPIRATION_MINUTES * 60)) * 100 : 100;

    const copyPix = () => {
        navigator.clipboard.writeText(pixPayload);
        toast.success("CÓDIGO PIX COPIADO!", {
            style: {
                background: '#2d2a28',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '900',
                borderRadius: '2px',
                border: '1px solid #d4af37'
            }
        });
    };

    const PixSection = ({ isFallback = false }: { isFallback?: boolean }) => (
        <div className={`space-y-8 ${isFallback ? 'pt-4' : ''}`}>
            {!isFallback && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <span className="w-8 h-8 bg-brand-gold text-brand-wood rounded-full flex items-center justify-center text-xs font-black shadow-soft">1</span>
                        <h2 className="text-sm font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">Pague com Pix</h2>
                    </div>

                    {timeLeft !== null && (
                        <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800/80 px-5 py-3 rounded-full border border-stone-100 dark:border-stone-700 shadow-sm">
                            <Clock size={16} className="text-brand-gold" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter leading-none mb-1">Expira em</span>
                                <span className="text-sm font-mono font-black text-stone-700 dark:text-stone-100 leading-none">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <div className="w-16 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-gold transition-all duration-1000"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className={`bg-stone-50 dark:bg-stone-800/30 ${isFallback ? 'p-6' : 'p-10'} rounded-sm border border-stone-100 dark:border-stone-800/50 flex flex-col items-center text-center shadow-inner`}>
                <div className={`${isFallback ? 'mb-4' : 'mb-8'} p-3 bg-white rounded-sm border border-stone-200 shadow-md transform transition-all hover:scale-105`}>
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=${isFallback ? '160x160' : '220x220'}&data=${encodeURIComponent(pixPayload)}`}
                        alt="QR Code Pix"
                        className={isFallback ? "w-32 h-32" : "w-48 h-48"}
                    />
                </div>

                <div className="w-full space-y-3 mb-8 text-left">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] text-center">Pix Copia e Cola</p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-5 py-3 text-[10px] font-mono text-stone-400 break-all rounded-sm overflow-hidden text-ellipsis whitespace-nowrap shadow-inner">
                            {pixPayload}
                        </div>
                        <button
                            onClick={copyPix}
                            className="bg-brand-gold text-brand-wood px-4 py-3 rounded-sm hover:bg-brand-wood hover:text-white transition-all shadow-md group"
                            title="Copiar código Pix"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                <div className={`${isFallback ? 'pt-4' : 'pt-6'} border-t border-stone-200/60 dark:border-stone-700/60 w-full`}>
                    <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-1">Valor Total</p>
                    <p className={`${isFallback ? 'text-2xl' : 'text-4xl'} font-display text-brand-gold font-medium tracking-tight`}>
                        {formatCurrency(order?.total || 0)}
                    </p>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Localizando Pedido...</p>
            {retryCount > 0 && retryCount <= MAX_RETRIES && (
                <p className="text-[9px] text-stone-400">Tentando novamente ({retryCount}/{MAX_RETRIES})...</p>
            )}
        </div>
    );

    if (!order) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-red-500">Ops! Pedido não encontrado.</p>
            <p className="text-[10px] text-stone-400 max-w-xs leading-relaxed">
                Não conseguimos carregar os detalhes do pedido #{orderId}. Por favor, verifique se o número está correto ou tente novamente em instantes.
            </p>
            <Link to="/" className="text-brand-gold font-black uppercase text-[10px] tracking-widest hover:underline pt-4">Voltar para a loja</Link>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto py-12 px-4 animate-fade-in-up">
            <div className="bg-white dark:bg-stone-900 rounded-sm border border-brand-cotton-dark dark:border-stone-800 shadow-soft overflow-hidden">
                {/* Header Sucesso */}
                <div className={`${isPaid ? 'bg-brand-gold/10' : 'bg-stone-50/50'} dark:bg-stone-900/40 p-10 text-center border-b border-stone-100 dark:border-stone-800`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 ${isPaid ? 'bg-brand-gold text-brand-wood' : 'bg-stone-100 text-stone-400'} dark:bg-stone-800 rounded-full mb-6 shadow-inner`}>
                        <CheckCircle2 size={40} className={isPaid ? 'animate-bounce' : ''} />
                    </div>
                    <h1 className="text-3xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-tight">
                        {isPaid ? 'Pagamento Confirmado!' : 'Pedido Recebido!'}
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="h-px w-4 bg-stone-200"></span>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">PEDIDO #{orderId}</p>
                        <span className="h-px w-4 bg-stone-200"></span>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    {isPaid ? (
                        <div className="text-center space-y-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-500 leading-relaxed max-w-sm mx-auto">
                                Seu pagamento foi processado com sucesso! 🙏<br /><br />
                                Nossa equipe já foi notificada e iniciará a separação dos seus produtos imediatamente.
                            </p>
                        </div>
                    ) : timeLeft === 0 ? (
                        /* Tela de Expirado */
                        <div className="bg-red-50 dark:bg-red-900/10 p-10 rounded-sm border border-red-100 dark:border-red-900/20 text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                                <AlertTriangle size={28} />
                            </div>
                            <div>
                                <h2 className="text-base font-black uppercase tracking-widest text-red-800 dark:text-red-400 mb-2">Tempo Expirado</h2>
                                <p className="text-xs text-red-600/70 uppercase font-bold leading-relaxed max-w-xs mx-auto">
                                    O código de pagamento expirou. Por favor, realize um novo pedido.
                                </p>
                            </div>
                            <Link to="/" className="inline-block bg-brand-gold text-brand-wood px-8 py-4 text-xs font-black uppercase tracking-widest rounded-sm shadow-soft hover:bg-brand-wood hover:text-white transition-all">
                                Fazer novo pedido
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <PixSection />

                            {infinitepayLink && (
                                <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center mb-4">Ou se preferir, pague com Cartão:</p>
                                    <a
                                        href={infinitepayLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-900/30"
                                    >
                                        Pagar com Cartão (InfinitePay)
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Próximo Passo */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="w-8 h-8 bg-brand-gold text-brand-wood rounded-full flex items-center justify-center text-xs font-black shadow-soft">2</span>
                            <h2 className="text-sm font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">Envie o comprovante</h2>
                        </div>

                        <a
                            href={`https://wa.me/${settings.whatsapp_number}?text=Olá! Acabei de fazer o pedido #${orderId} e aqui está o comprovante.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#25D366] text-white py-5 rounded-sm font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-lg hover:bg-brand-wood hover:scale-[1.02] transition-all"
                        >
                            <MessageCircle size={22} />
                            Confirmar no WhatsApp
                        </a>
                    </div>

                    <div className="pt-10 border-t border-stone-100 dark:border-stone-800 text-center">
                        <Link to="/" className="text-xs font-black uppercase tracking-[0.3em] text-stone-400 hover:text-brand-gold transition-colors flex items-center justify-center gap-2 group">
                            <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                            Voltar para a Loja
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
