import { useEffect, useRef } from 'react';
import { X, Phone, Mail, MapPin, Copy, MessageCircle, Package, AlertCircle, Calendar, Truck, User } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
    onStatusUpdate?: (orderId: string, newStatus: any) => Promise<void>;
}

export function OrderDetailsModal({ order, onClose, onStatusUpdate }: OrderDetailsModalProps) {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        // Prevent body scroll when open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    // Handle Backdrop Click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado!`, {
            icon: '📋',
            style: {
                background: '#2d2a28',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '900'
            }
        });
    };

    const hasCustomerData = order.customerEmail || order.customerPhone || order.customerAddress?.street;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-over Panel (Drawer) */}
            <div
                ref={drawerRef}
                className="relative w-full max-w-xl bg-white dark:bg-stone-900 shadow-2xl h-full flex flex-col border-l border-stone-200 dark:border-stone-800 animate-slide-in-right"
            >
                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-lg font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-tight flex items-center gap-2">
                            Pedido #{order.orderNumber || order.id.slice(0, 6)}
                        </h2>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Calendar size={10} />
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors"
                        title="Fechar (Esc)"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 bg-stone-50/50 dark:bg-stone-950/50">

                    {/* Status Control */}
                    <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-100 dark:border-stone-800 shadow-sm">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Status do Pedido</label>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${order.status === 'paid' ? 'bg-emerald-500' :
                                    order.status === 'delivered' ? 'bg-blue-500' :
                                        order.status === 'cancelled' ? 'bg-red-500' :
                                            'bg-amber-500'
                                }`} />
                            {onStatusUpdate ? (
                                <select
                                    value={order.status}
                                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                                    className="flex-1 bg-stone-50 dark:bg-stone-800 border-none rounded text-xs font-bold uppercase tracking-wide focus:ring-1 focus:ring-brand-gold py-1.5"
                                >
                                    <option value="pending">Pendente (Aguardando Pagamento)</option>
                                    <option value="paid">Pago (Aprovado)</option>
                                    <option value="delivered">Entregue (Finalizado)</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            ) : (
                                <span className="text-sm font-bold uppercase">{order.status}</span>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <User size={14} /> Dados do Cliente
                        </h3>

                        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 overflow-hidden">
                            {/* Nome e Avatar */}
                            <div className="p-4 border-b border-stone-50 dark:border-stone-800 flex items-center gap-3 bg-stone-50/50 dark:bg-stone-800/30">
                                <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-sm">
                                    {order.customerName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{order.customerName}</p>
                                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Cliente Lojinha</p>
                                </div>
                            </div>

                            {/* Contatos */}
                            {hasCustomerData ? (
                                <div className="p-4 space-y-3">
                                    {order.customerEmail && (
                                        <div className="flex items-center justify-between text-xs group">
                                            <div className="flex items-center gap-2 text-stone-500">
                                                <Mail size={14} />
                                                <span>{order.customerEmail}</span>
                                            </div>
                                            <button onClick={() => copyToClipboard(order.customerEmail, 'Email')} className="text-stone-300 hover:text-brand-gold opacity-0 group-hover:opacity-100 transition-all">
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    )}
                                    {order.customerPhone && (
                                        <div className="flex items-center justify-between text-xs group">
                                            <div className="flex items-center gap-2 text-stone-500">
                                                <Phone size={14} />
                                                <span>{order.customerPhone}</span>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`} target="_blank" className="text-emerald-500 hover:text-emerald-600"><MessageCircle size={14} /></a>
                                                <button onClick={() => copyToClipboard(order.customerPhone, 'Whatsapp')} className="text-stone-300 hover:text-brand-gold">
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {order.customerAddress?.street && (
                                        <div className="pt-3 border-t border-stone-50 dark:border-stone-800 mt-2">
                                            <div className="flex items-start gap-2 text-stone-500 text-xs">
                                                <MapPin size={14} className="mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-stone-700 dark:text-stone-300">
                                                        {order.customerAddress.street}, {order.customerAddress.number}
                                                    </p>
                                                    <p>{order.customerAddress.neighborhood} - {order.customerAddress.city}/{order.customerAddress.state}</p>
                                                    <p className="text-[10px] font-mono mt-1 text-stone-400">{order.customerAddress.zipcode}</p>
                                                    {order.customerAddress.complement && (
                                                        <p className="text-[10px] italic text-stone-400 mt-1">Comp: {order.customerAddress.complement}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-900">
                                    <AlertCircle size={20} className="mx-auto mb-2 opacity-50" />
                                    Dados de contato indisponíveis para este pedido antigo.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <Package size={14} /> Itens do Pedido ({order.items?.length || 0})
                        </h3>
                        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 divide-y divide-stone-50 dark:divide-stone-800">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="p-4 flex gap-4 hover:bg-stone-50/50 transition-colors">
                                    <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded flex items-center justify-center shrink-0">
                                        {/* Placeholder for item image */}
                                        <Package size={20} className="text-stone-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-bold text-stone-800 dark:text-stone-100 leading-tight pr-4">{item.name}</p>
                                            <span className="text-sm font-medium text-stone-600 whitespace-nowrap">
                                                {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-500">
                                            {item.quantity} un. x {formatCurrency(item.promotionalPrice || item.price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">
                                <MessageCircle size={12} /> Observação
                            </h4>
                            <p className="text-sm italic text-blue-900 dark:text-blue-200">"{order.notes}"</p>
                        </div>
                    )}
                </div>

                {/* Footer (Totals) */}
                <div className="flex-none p-6 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800 backdrop-blur-md">
                    <div className="space-y-2 text-xs text-stone-500 mb-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1"><Truck size={12} /> Frete</span>
                            <span className="text-emerald-500 font-bold uppercase text-[10px]">Grátis</span>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Total</span>
                        <span className="text-2xl font-display font-medium text-brand-gold">
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
