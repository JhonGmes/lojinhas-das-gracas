import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Copy, MessageCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency, generatePixPayload } from '../lib/utils';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import { Clock, AlertTriangle } from 'lucide-react';

const EXPIRATION_MINUTES = 20;

export function OrderSuccess() {
    const { orderId } = useParams(); // DEBUG: 2026-02-12-03-07-force-update
    const { settings } = useStore();
    const { clearCart } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isPaid, setIsPaid] = useState(false);
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
                settings.store_name || 'LOJINHA DAS GRACAS',
                'SAO LUIS'
            );
        } catch (e) {
            console.error("Erro ao gerar payload Pix:", e);
            return '';
        }
    }, [order, pixKey, settings.store_name]);

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
            const fetchOrder = async () => {
                try {
                    // 1. Checar parâmetros de retorno na URL (Redirect)
                    const urlParams = new URLSearchParams(window.location.search);
                    const transactionNsu = urlParams.get('transaction_nsu');

                    const orders = await api.orders.list();
                    const found = orders.find((o: any) =>
                        o.id === orderId ||
                        o.orderNumber?.toString() === orderId ||
                        o.orderNumber?.toString().padStart(4, '0') === orderId
                    );

                    if (found) {
                        setOrder(found);
                        setLoading(false);
                        let currentStatus = found.status;

                        // 2. Se temos InfinitePay configurada, consultar API deles diretamente (Polling Ativo)
                        if (currentStatus === 'pending' && settings.infinitepay_handle) {
                            try {
                                const { data: checkData, error: funcError } = await supabase.functions.invoke('infinitepay-integration', {
                                    body: {
                                        action: 'check-payment',
                                        payload: {
                                            handle: settings.infinitepay_handle,
                                            order_nsu: orderId
                                        }
                                    }
                                });
                                if (!funcError && checkData && (checkData.paid || (checkData.success && checkData.paid))) {
                                    await api.orders.updateStatus(found.id, 'paid');
                                    currentStatus = 'paid';
                                    found.status = 'paid';
                                }
                            } catch (e) {
                                console.warn("Aguardando confirmação do banco...", e);
                            }
                        }

                        // 3. Se voltou do Redirect com NSU mas ainda está pendente
                        if (transactionNsu && currentStatus === 'pending') {
                            await api.orders.updateStatus(found.id, 'paid');
                            currentStatus = 'paid';
                            found.status = 'paid';
                        }

                        // 4. Detecção final e atualização da UI
                        if (currentStatus === 'paid' || currentStatus === 'delivered') {
                            if (!isPaid) {
                                setIsPaid(true);
                                clearCart();
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
    }, [orderId, retryCount, isPaid, settings.whatsapp_number, settings.infinitepay_handle, clearCart]);

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
                <div className={`${isPaid ? 'bg-brand-gold/10' : 'bg-emerald-50'} dark:bg-emerald-900/10 p-8 text-center border-b border-emerald-100 dark:border-emerald-900/20`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${isPaid ? 'bg-brand-gold text-brand-wood' : 'bg-emerald-100 text-emerald-600'} dark:bg-emerald-900/30 rounded-full mb-4`}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h1 className="text-2xl font-display font-medium text-stone-800 dark:text-emerald-500 uppercase tracking-tight">
                        {isPaid ? 'Pagamento Confirmado!' : 'Pedido Recebido!'}
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-2">Número do Pedido: #{orderId}</p>
                </div>

                <div className="p-8 space-y-8">
                    {isPaid ? (
                        <div className="text-center space-y-6">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 leading-relaxed">
                                Seu pagamento foi processado com sucesso via <span className="text-indigo-600">InfinitePay</span>. Nossa equipe já foi notificada e iniciará a separação dos seus produtos.
                            </p>
                        </div>
                    ) : timeLeft === 0 ? (
                        /* Tela de Expirado */
                        <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-sm border border-red-100 dark:border-red-900/20 text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-red-800 dark:text-red-400">Tempo Expirado</h2>
                            <p className="text-[10px] text-red-600/70 uppercase font-bold leading-relaxed max-w-xs mx-auto">
                                O tempo para pagamento deste pedido expirou. Por favor, realize um novo pedido para gerar um novo QR Code.
                            </p>
                            <Link to="/" className="inline-block bg-brand-gold text-brand-wood px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm shadow-soft">
                                Voltar para a Loja
                            </Link>
                        </div>
                    ) : (
                        /* Instruções Pix com Countdown */
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-brand-gold text-brand-wood rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                                    <h2 className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">Pague com Pix</h2>
                                </div>

                                {timeLeft !== null && (
                                    <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800 px-4 py-2 rounded-full border border-stone-100 dark:border-stone-700">
                                        <Clock size={14} className="text-brand-gold animate-pulse" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-stone-400 uppercase tracking-tighter leading-none mb-0.5">Expira em</span>
                                            <span className="text-xs font-mono font-black text-stone-700 dark:text-stone-100 leading-none">
                                                {formatTime(timeLeft)}
                                            </span>
                                        </div>
                                        <div className="w-12 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden ml-1">
                                            <div
                                                className="h-full bg-brand-gold transition-all duration-1000"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-sm border border-stone-100 dark:border-stone-800 flex flex-col items-center text-center">
                                <div className="mb-4 p-2 bg-white rounded-sm border border-stone-100 shadow-inner">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixPayload)}`}
                                        alt="QR Code Pix"
                                        className="w-40 h-40"
                                    />
                                </div>

                                <div className="w-full space-y-2">
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Pix Copia e Cola</p>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-4 py-3 text-[10px] font-bold text-stone-400 break-all rounded-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                            {pixPayload}
                                        </div>
                                        <button
                                            onClick={copyPix}
                                            className="bg-brand-gold text-brand-wood px-4 py-3 rounded-sm hover:bg-brand-wood hover:text-white transition-all shadow-soft"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-4 text-[9px] font-bold text-stone-400 uppercase tracking-wider leading-relaxed">
                                    Valor Total: <span className="text-brand-gold text-base ml-1">{formatCurrency(order?.total || 0)}</span>
                                </p>
                            </div>
                        </div>
                    )}


                    {/* Próximo Passo */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-brand-gold text-brand-wood rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                            <h2 className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">Envie o comprovante</h2>
                        </div>

                        <a
                            href={`https://wa.me/${settings.whatsapp_number}?text=Olá! Acabei de fazer o pedido #${orderId} e aqui está o comprovante do Pix.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#25D366] text-white py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg hover:bg-[#1db954] transition-all"
                        >
                            <MessageCircle size={18} />
                            Enviar no WhatsApp
                        </a>
                    </div>

                    <div className="pt-8 border-t border-stone-100 dark:border-stone-800 text-center">
                        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-brand-gold transition-colors flex items-center justify-center gap-2">
                            Voltar para a Loja <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div >
        </div >
    );
}
