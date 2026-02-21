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

        // If street contains comma/numbers, assume full address string was passed
        if (addr.street && addr.street.length > 30 && !addr.number) {
            return addr.street;
        }

        const parts = [
            addr.street && `${addr.street}${addr.number ? ', ' + addr.number : ''}`,
            addr.complement,
            addr.neighborhood,
            addr.city && addr.state && `${addr.city}/${addr.state}`,
            addr.zipcode
        ].filter(Boolean);
        return parts.join(' - ') || 'Endereço não informado';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-12 sm:pt-20 animate-fade-in overflow-y-auto" role="dialog" aria-modal="true">
            <div
                className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] relative z-10 overflow-hidden animate-scale-in">

                {/* Header Clean - White */}
                <div className="px-6 py-5 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide flex items-center gap-2">
                            Pedido #{order.orderNumber || order.id.slice(0, 6)}
                        </h2>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1.5 hover:bg-stone-50 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content - White & Clean */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-stone-900">

                    {/* Status Section */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Status do Pedido</span>
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

                    {/* Customer Info - Expanded & Visible */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                            <User size={14} className="text-brand-gold" />
                            <h3 className="text-xs font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide">Dados do Cliente</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-1">Nome Completo</p>
                                <p className="font-medium text-stone-700 dark:text-stone-300">{order.customerName || 'Não informado'}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-1">Email</p>
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(order.customerEmail, 'Email')}>
                                    <p className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[150px]">{order.customerEmail || 'Não informado'}</p>
                                    {order.customerEmail && <Mail size={10} className="text-stone-300 group-hover:text-brand-gold" />}
                                </div>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-1">Telefone / WhatsApp</p>
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(order.customerPhone, 'Whatsapp')}>
                                    <p className="font-medium text-stone-700 dark:text-stone-300">{order.customerPhone || 'Não informado'}</p>
                                    {order.customerPhone && <Phone size={10} className="text-stone-300 group-hover:text-emerald-500" />}
                                </div>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-1">Forma de Pagamento</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-stone-700 dark:text-stone-300 uppercase text-[10px] tracking-wider px-2 py-1 bg-stone-100 rounded-sm">
                                        {order.paymentMethod === 'credit' ? 'Cartão de Crédito' : order.paymentMethod === 'debit' ? 'Cartão de Débito' : order.paymentMethod === 'pix' ? 'Pix' : 'Não Informado'}
                                    </span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-1">Endereço de Entrega</p>
                                <div className="flex items-start gap-2">
                                    <MapPin size={12} className="text-stone-300 mt-0.5 shrink-0" />
                                    <p className="font-medium text-stone-700 dark:text-stone-300 leading-relaxed">
                                        {formatAddress(order.customerAddress)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                            <Package size={14} className="text-brand-gold" />
                            <h3 className="text-xs font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide">Itens do Pedido</h3>
                        </div>
                        <div className="space-y-3">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-xs group hover:bg-stone-50 p-2 -mx-2 rounded transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-stone-400 w-6 text-right">{item.quantity}x</div>
                                        <div className="font-medium text-stone-700 dark:text-stone-200">{item.name}</div>
                                    </div>
                                    <div className="font-semibold text-stone-800 dark:text-stone-100">
                                        {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer - White with Top Border */}
                <div className="bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 p-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-stone-500">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-stone-500">
                            <span>Taxas</span>
                            <span>R$ 0,00</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-stone-100 dark:border-stone-800">
                            <span className="text-xs font-black uppercase tracking-widest text-stone-800 dark:text-stone-200">Total Pago</span>
                            <span className="text-xl font-display font-bold text-brand-gold">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
