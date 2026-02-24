import { useEffect } from 'react';
import { X, Phone, Mail, MapPin, Package, User } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
    onStatusUpdate?: (orderId: string, newStatus: any) => Promise<void>;
}

export function OrderDetailsModal({ order, onClose, onStatusUpdate }: OrderDetailsModalProps) {

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado!`);
    };

    const formatAddress = (addr: any) => {
        if (!addr) return 'Endereço não informado';

        // Check for new structured fields first
        const structured = [
            addr.street || addr.customer_address_street,
            addr.number || addr.customer_address_number,
            addr.complement || addr.customer_address_complement,
            addr.neighborhood || addr.customer_address_neighborhood,
            addr.city || addr.customer_address_city,
            addr.state || addr.customer_address_state,
            addr.zipcode || addr.customer_address_zipcode
        ].filter(Boolean);

        if (structured.length > 2) {
            const main = [
                (addr.street || addr.customer_address_street) && `${addr.street || addr.customer_address_street}${addr.number || addr.customer_address_number ? ', ' + (addr.number || addr.customer_address_number) : ''}`,
                addr.complement || addr.customer_address_complement,
                addr.neighborhood || addr.customer_address_neighborhood,
                (addr.city || addr.customer_address_city) && (addr.state || addr.customer_address_state) && `${addr.city || addr.customer_address_city}/${addr.state || addr.customer_address_state}`,
                addr.zipcode || addr.customer_address_zipcode
            ].filter(Boolean);
            return main.join(' - ');
        }

        // Fallback for legacy string addresses
        if (typeof addr.street === 'string' && addr.street.length > 20) return addr.street;
        if (typeof addr === 'string' && addr.length > 20) return addr;

        return 'Endereço incompleto';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in overflow-y-auto" role="dialog" aria-modal="true">
            <div
                className="fixed inset-0 bg-stone-900/60 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-lg shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] relative z-10 overflow-hidden animate-scale-in">

                {/* Header Clean */}
                <div className="px-6 py-4 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide flex items-center gap-2">
                            Pedido #{order.orderNumber || order.id.slice(0, 6)}
                        </h2>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-2 hover:bg-stone-50 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-stone-900">

                    {/* Status Section */}
                    <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Status do Pedido</span>
                        {onStatusUpdate ? (
                            <select
                                value={order.status}
                                onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                                className={`text-xs font-bold uppercase tracking-wide bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700 rounded-md px-3 py-1.5 focus:ring-2 ring-brand-gold/20 outline-none cursor-pointer text-right min-w-[120px] ${order.status === 'paid' ? 'text-emerald-600' :
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column: Customer Info */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-1.5 border-b border-stone-50 dark:border-stone-800/50">
                                    <User size={14} className="text-brand-gold" />
                                    <h3 className="text-[11px] font-black text-stone-800 dark:text-stone-100 uppercase tracking-widest">Informações do Cliente</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] uppercase text-stone-400 font-bold tracking-widest mb-1">Nome Completo</p>
                                        <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{order.customerName || 'Não informado'}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] uppercase text-stone-400 font-bold tracking-widest mb-1">Email</p>
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(order.customerEmail, 'Email')}>
                                                <p className="text-xs font-medium text-stone-600 dark:text-stone-400 truncate">{order.customerEmail || 'N/A'}</p>
                                                {order.customerEmail && <Mail size={12} className="text-stone-300 group-hover:text-brand-gold shrink-0" />}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase text-stone-400 font-bold tracking-widest mb-1">WhatsApp</p>
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(order.customerPhone || order.whatsapp, 'Whatsapp')}>
                                                <p className="text-xs font-bold text-stone-700 dark:text-stone-300">{order.customerPhone || order.whatsapp || 'N/A'}</p>
                                                {(order.customerPhone || order.whatsapp) && <Phone size={12} className="text-stone-300 group-hover:text-emerald-500 shrink-0" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase text-stone-400 font-bold tracking-widest mb-1">Endereço de Entrega</p>
                                        <div className="flex items-start gap-2 bg-stone-50/50 dark:bg-stone-800/30 p-3 rounded-md border border-stone-100 dark:border-stone-800/50">
                                            <MapPin size={14} className="text-stone-300 mt-0.5 shrink-0" />
                                            <p className="text-xs font-medium text-stone-600 dark:text-stone-400 leading-relaxed">
                                                {formatAddress(order.customerAddress)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Items */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-1.5 border-b border-stone-50 dark:border-stone-800/50">
                                    <Package size={14} className="text-brand-gold" />
                                    <h3 className="text-[11px] font-black text-stone-800 dark:text-stone-100 uppercase tracking-widest">Itens do Pedido</h3>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-start py-2 border-b border-stone-50 dark:border-stone-800/30 last:border-0 group">
                                            <div className="flex gap-3">
                                                <div className="flex items-center justify-center w-6 h-6 bg-stone-100 dark:bg-stone-800 rounded text-[10px] font-black text-stone-400">
                                                    {item.quantity}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-xs font-bold text-stone-700 dark:text-stone-200 line-clamp-1">{item.name}</div>
                                                    <div className="text-[10px] text-stone-400 font-medium">{formatCurrency(item.promotionalPrice || item.price)} un.</div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold text-stone-800 dark:text-stone-100 whitespace-nowrap pt-1">
                                                {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Total */}
                <div className="bg-stone-50 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 p-5 mt-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Total do Pedido</p>
                            <p className="text-[10px] text-stone-500 font-medium">via {order.paymentMethod === 'credit' ? 'Cartão' : order.paymentMethod === 'pix' ? 'Pix' : 'Débito'}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-display font-bold text-brand-gold">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
