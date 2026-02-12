import { X, Phone, Mail, MapPin, Copy, MessageCircle, Package } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-sm border border-stone-200 dark:border-stone-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-gold/10 to-stone-50 dark:from-brand-gold/5 dark:to-stone-900 p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-tight">
                            Pedido #{order.orderNumber || order.id.slice(0, 8)}
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center group"
                    >
                        <X size={20} className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Status:</span>
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'paid' || order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                            {order.status === 'paid' ? '✓ Pago' : order.status === 'delivered' ? '✓ Entregue' : '⏳ Pendente'}
                        </span>
                    </div>

                    {/* Dados do Cliente */}
                    {hasCustomerData ? (
                        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-sm border border-stone-100 dark:border-stone-800 p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Package size={18} className="text-brand-gold" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">
                                    Dados do Cliente
                                </h3>
                            </div>

                            {/* Nome */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-brand-gold text-xs font-black">
                                        {order.customerName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Nome</p>
                                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100 mt-1">
                                        {order.customerName}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            {order.customerEmail && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                        <Mail size={14} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm font-mono text-stone-800 dark:text-stone-100">
                                                {order.customerEmail}
                                            </p>
                                            <button
                                                onClick={() => copyToClipboard(order.customerEmail, 'Email')}
                                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors"
                                                title="Copiar email"
                                            >
                                                <Copy size={14} className="text-stone-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Telefone */}
                            {order.customerPhone && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                                        <Phone size={14} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Telefone</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm font-mono text-stone-800 dark:text-stone-100">
                                                {order.customerPhone}
                                            </p>
                                            <button
                                                onClick={() => copyToClipboard(order.customerPhone, 'Telefone')}
                                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors"
                                                title="Copiar telefone"
                                            >
                                                <Copy size={14} className="text-stone-400" />
                                            </button>
                                            <a
                                                href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 bg-[#25D366] hover:bg-[#1db954] text-white rounded transition-colors"
                                                title="Abrir WhatsApp"
                                            >
                                                <MessageCircle size={14} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Endereço */}
                            {order.customerAddress?.street && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                                        <MapPin size={14} className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Endereço de Entrega</p>
                                        <div className="text-sm text-stone-800 dark:text-stone-100 space-y-1">
                                            <p className="font-bold">
                                                {order.customerAddress.street}
                                                {order.customerAddress.number && `, ${order.customerAddress.number}`}
                                            </p>
                                            {order.customerAddress.complement && (
                                                <p className="text-stone-600 dark:text-stone-400">
                                                    {order.customerAddress.complement}
                                                </p>
                                            )}
                                            <p>
                                                {order.customerAddress.neighborhood && `${order.customerAddress.neighborhood}, `}
                                                {order.customerAddress.city} - {order.customerAddress.state}
                                            </p>
                                            {order.customerAddress.zipcode && (
                                                <p className="text-stone-600 dark:text-stone-400 font-mono">
                                                    CEP: {order.customerAddress.zipcode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-sm p-4 text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                                ⚠️ Dados do cliente não disponíveis
                            </p>
                            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1">
                                Este pedido foi criado antes da integração com InfinitePay
                            </p>
                        </div>
                    )}

                    {/* Itens do Pedido */}
                    <div className="bg-white dark:bg-stone-900 rounded-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
                        <div className="bg-stone-50 dark:bg-stone-800/50 px-6 py-3 border-b border-stone-200 dark:border-stone-800">
                            <h3 className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">
                                Itens do Pedido
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-stone-400 mt-0.5">
                                            Quantidade: {item.quantity}x
                                        </p>
                                    </div>
                                    <p className="text-sm font-black text-brand-gold">
                                        {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800/50 px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-200">
                                Total
                            </span>
                            <span className="text-2xl font-display font-medium text-brand-gold">
                                {formatCurrency(order.total)}
                            </span>
                        </div>
                    </div>

                    {/* Observações */}
                    {order.notes && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-sm p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-2">
                                Observações do Cliente
                            </p>
                            <p className="text-sm text-blue-900 dark:text-blue-200">
                                {order.notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
