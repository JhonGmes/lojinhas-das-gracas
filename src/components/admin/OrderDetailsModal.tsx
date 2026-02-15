import { useEffect } from 'react';
import { X, Phone, Mail, MapPin, Package, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
    onStatusUpdate?: (orderId: string, newStatus: any) => Promise<void>;
}

export function OrderDetailsModal({ order, onClose, onStatusUpdate }: OrderDetailsModalProps) {

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden'; // Lock scroll
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado!`);
    };



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Centered Modal Card */}
            <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] relative z-10 overflow-hidden animate-scale-in">

                {/* Header Compacto */}
                <div className="px-6 py-4 bg-stone-50/50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide flex items-center gap-2">
                            <span className="bg-brand-gold/10 text-brand-gold p-1.5 rounded-md"><ShoppingBag size={16} /></span>
                            Pedido #{order.orderNumber || order.id.slice(0, 6)}
                        </h2>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest pl-10 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Status & Cliente Row */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Status Update */}
                        <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Status Atual</span>

                            {onStatusUpdate ? (
                                <select
                                    value={order.status}
                                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                                    className={`text-xs font-bold uppercase tracking-wide bg-transparent border-none focus:ring-0 cursor-pointer text-right min-w-[120px] ${order.status === 'paid' ? 'text-emerald-600' :
                                        order.status === 'delivered' ? 'text-blue-600' :
                                            order.status === 'cancelled' ? 'text-red-600' :
                                                'text-amber-600'
                                        }`}
                                >
                                    <option value="pending">Pendente</option>
                                    <option value="paid">Pago</option>
                                    <option value="delivered">Entregue</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            ) : (
                                <span className="text-xs font-bold uppercase">{order.status}</span>
                            )}
                        </div>

                        {/* Customer Mini Card */}
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-lg shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-sm shrink-0">
                                {order.customerName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">{order.customerName}</p>
                                <div className="flex items-center gap-2 text-[10px] text-stone-500 truncate">
                                    {order.customerPhone && (
                                        <button onClick={() => copyToClipboard(order.customerPhone, 'Tel')} className="hover:text-brand-gold flex items-center gap-1">
                                            <Phone size={10} /> {order.customerPhone}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {order.customerEmail && (
                                <button onClick={() => copyToClipboard(order.customerEmail, 'Email')} className="text-stone-300 hover:text-brand-gold" title="Copiar Email">
                                    <Mail size={14} />
                                </button>
                            )}
                        </div>
                        {order.customerAddress?.street && (
                            <div className="flex items-start gap-2 p-3 bg-stone-50 dark:bg-stone-800/30 rounded-lg border border-stone-100 dark:border-stone-800 text-[10px] text-stone-600">
                                <MapPin size={12} className="mt-0.5 shrink-0 text-stone-400" />
                                <div>
                                    <p className="font-bold">{order.customerAddress.street}, {order.customerAddress.number}</p>
                                    <p>{order.customerAddress.neighborhood} - {order.customerAddress.city}/{order.customerAddress.state}</p>
                                    {order.customerAddress.complement && <p className="italic opacity-70">{order.customerAddress.complement}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Items List - Compact */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2">
                            <Package size={12} /> Itens ({order.items?.length})
                        </h3>
                        <div className="border border-stone-100 dark:border-stone-800 rounded-lg divide-y divide-stone-100 dark:divide-stone-800 bg-white dark:bg-stone-900">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="p-3 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 text-[10px] font-bold">
                                            {item.quantity}x
                                        </div>
                                        <span className="font-medium text-stone-700 dark:text-stone-200 line-clamp-1 max-w-[180px]">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="font-bold text-stone-800 dark:text-stone-100 whitespace-nowrap">
                                        {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer - Totals Compact */}
                <div className="bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4">
                    <div className="flex justify-between items-end">
                        <div className="text-[10px] text-stone-500 space-y-1">
                            <p>Subtotal: {formatCurrency(order.total)}</p>
                            <p>Frete: <span className="text-emerald-600 font-bold">Grátis</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Total do Pedido</p>
                            <p className="text-xl font-display font-bold text-brand-gold">{formatCurrency(order.total)}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
