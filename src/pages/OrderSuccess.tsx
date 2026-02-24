import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Copy, MessageCircle, ArrowRight, Mail, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency, generatePixPayload } from '../lib/utils';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { OrderReceipt } from '../components/OrderReceipt';
import { EmailService } from '../services/EmailService';

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
    const [showReceipt, setShowReceipt] = useState(false);
    const hasShownToast = useRef(false);
    const hasSentEmail = useRef(false);

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000;
    const POLLING_INTERVAL = 5000;

    const pixKey = settings.pix_key || "seu-pix-aqui@email.com";

    // Efeito de Confete Vibrante (Suavizado para performance máxima - Burst único)
    const triggerConfetti = () => {
        const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 1000, particleCount: 150 };

        // Disparo único em dois pontos laterais
        confetti({ ...defaults, origin: { x: 0.2, y: 0.5 } });
        confetti({ ...defaults, origin: { x: 0.8, y: 0.5 } });
    };

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
        return `https://pay.infinitepay.io/${settings.infinitepay_handle}/${order.total.toString().replace('.', ',')}`;
    }, [order, settings.infinitepay_handle]);

    // Timer de Expiração
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

    // Busca e Polling do Pedido
    useEffect(() => {
        if (orderId) {
            clearCart();

            const fetchOrder = async () => {
                try {
                    const urlParams = new URLSearchParams(window.location.search);
                    const transactionNsu = urlParams.get('transaction_nsu');
                    const normalizedOrderId = orderId?.toLowerCase();

                    // 1. Tenta buscar pelo ID exato primeiro (mais rápido e confiável)
                    let found = await api.orders.getById(orderId);

                    // Se não encontrou e o ID original tinha maiúsculas, tenta minusculo
                    if (!found && orderId !== normalizedOrderId) {
                        found = await api.orders.getById(normalizedOrderId);
                    }

                    // 2. Fallback para lista se não encontrar pelo ID exato (ex: ID truncado na URL)
                    if (!found) {
                        const orders = await api.orders.list(currentStoreId);
                        found = orders.find((o: any) => {
                            const docId = o.id?.toLowerCase();
                            const docOrderNum = o.orderNumber?.toString();

                            return docId === normalizedOrderId ||
                                docId?.slice(0, 8) === normalizedOrderId ||
                                docOrderNum === normalizedOrderId ||
                                docOrderNum?.padStart(4, '0') === normalizedOrderId;
                        }) || null;
                    }

                    if (found) {
                        setOrder(found);
                        setLoading(false);
                        let currentStatus = found.status;

                        // Detecção via Redirect
                        if (transactionNsu && currentStatus === 'pending') {
                            await api.orders.confirmPayment(found);
                            currentStatus = 'paid';
                            found.status = 'paid';
                        }

                        // Polling InfinitePay
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
                                    if (checkData && (checkData.paid || (checkData.success && checkData.paid))) {
                                        await api.orders.confirmPayment(found);
                                        currentStatus = 'paid';
                                        found.status = 'paid';

                                        if (checkData.customer || checkData.payer) {
                                            const customer = checkData.customer || checkData.payer;
                                            const customerData: any = {
                                                transactionNsu: checkData.transaction_nsu || transactionNsu,
                                                infinitepayData: checkData
                                            };

                                            // CRÍTICO: Não sobrescrever e-mail se já temos um do cadastro/checkout
                                            // Isso resolve o problema de e-mails indo para contas erradas vinculadas ao cartão
                                            if (customer.email && !found.customerEmail) {
                                                customerData.email = customer.email;
                                            }

                                            if ((customer.phone || customer.phone_number) && !found.customerPhone) {
                                                customerData.phone = customer.phone || customer.phone_number;
                                            }

                                            if (customer.address && (!found.customerAddress || !found.customerAddress.street)) {
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

                                            await api.orders.updateOrderWithCustomerData(found.id, customerData);
                                            setOrder((prev: any) => ({
                                                ...prev,
                                                customerEmail: customerData.email || prev.customerEmail,
                                                customerPhone: customerData.phone || prev.customerPhone,
                                                customerAddress: customerData.address || prev.customerAddress,
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

                        // Ações ao Confirmar Pagamento
                        if (currentStatus === 'paid' || currentStatus === 'delivered') {
                            if (!isPaid) {
                                setIsPaid(true);
                                triggerConfetti();

                                if (!hasShownToast.current) {
                                    hasShownToast.current = true;
                                    toast.success("PAGAMENTO CONFIRMADO!", {
                                        icon: '💰',
                                        duration: 5000
                                    });
                                }

                                // Usa o e-mail do pedido (prioridade para o do cadastro original)
                                const recipientEmail = found.customerEmail || (order && order.customerEmail);
                                if (recipientEmail && !hasSentEmail.current) {
                                    hasSentEmail.current = true;
                                    EmailService.sendOrderConfirmation(found.id, recipientEmail);
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
            const poll = setInterval(fetchOrder, POLLING_INTERVAL);
            return () => clearInterval(poll);
        }
    }, [orderId, retryCount, settings.whatsapp_number, settings.infinitepay_handle, currentStoreId, clearCart, isPaid]);

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
            <p className="text-xs font-black uppercase tracking-widest text-red-500">Ops! Pedido não localizado.</p>
            <p className="text-[10px] text-stone-400 max-w-xs leading-relaxed uppercase font-bold">
                Estamos processando seu pedido #{orderId}. <br />
                Por favor, aguarde alguns instantes ou atualize a página.
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
                    <span className="h-px w-4 bg-stone-200"></span>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">
                        PEDIDO {order?.orderNumber ? `#${String(order.orderNumber).padStart(4, '0')}` : `#${orderId}`}
                    </p>
                    <span className="h-px w-4 bg-stone-200"></span>
                </div>

                <div className="p-10 space-y-10">
                    <div className="flex flex-col gap-3">
                        <div className="bg-stone-50 dark:bg-stone-800/30 p-6 rounded-sm border border-stone-100 dark:border-stone-800/50">
                            <h2 className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-200 mb-4 border-b border-stone-200 dark:border-stone-700 pb-3">Resumo da Compra</h2>
                            <div className="space-y-3 mb-4">
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center text-[10px]">
                                        <span className="text-stone-500 font-bold uppercase tracking-tight">{item.quantity}x {item.name}</span>
                                        <span className="font-black text-stone-800 dark:text-stone-200">{formatCurrency((item.promotionalPrice || item.price) * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-stone-200 dark:border-stone-700 pt-4 flex justify-between items-center text-base">
                                <span className="font-bold uppercase tracking-widest text-[9px] text-stone-400">Total</span>
                                <span className="font-black text-brand-gold font-display text-xl">{formatCurrency(order.total || 0)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowReceipt(true)}
                            className="hidden"
                        >
                            Ver Comprovante Detalhado
                        </button>

                        {isPaid && order.customerEmail && (
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-sm border border-green-100 dark:border-green-900/20 flex items-center gap-3">
                                <Mail size={16} className="text-green-600" />
                                <p className="text-[9px] font-bold text-green-700 uppercase tracking-wider">
                                    E-mail de confirmação enviado para {order.customerEmail}
                                </p>
                            </div>
                        )}
                    </div>

                    {isPaid ? (
                        <div className="text-center space-y-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-500 leading-relaxed max-w-sm mx-auto">
                                Seu pagamento foi processado com sucesso! 🙏<br /><br />
                                Nossa equipe já foi notificada e iniciará a separação dos seus produtos imediatamente.
                            </p>
                        </div>
                    ) : timeLeft === 0 ? (
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

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="w-8 h-8 bg-brand-gold text-brand-wood rounded-full flex items-center justify-center text-xs font-black shadow-soft">2</span>
                            <h2 className="text-sm font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">Envie o comprovante</h2>
                        </div>

                        <a
                            href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                                `Olá! 👋 Acabei de fazer um pedido no site.\n\n` +
                                `📦 *PEDIDO #${orderId}*\n` +
                                `--------------------------\n` +
                                `${order?.items?.map((item: any) => `• ${item.quantity}x ${item.name}`).join('\n')}\n` +
                                `--------------------------\n` +
                                `Total: ${formatCurrency(order?.total || 0)}\n\n` +
                                `Aqui está o meu comprovante:`
                            )}`}
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

            {/* Receipt Modal */}
            {showReceipt && order && (
                <OrderReceipt
                    order={order}
                    storeSettings={settings}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </div>
    );
}
