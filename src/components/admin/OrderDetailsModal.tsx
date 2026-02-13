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
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-white dark:bg-stone-900 p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-gold/10 rounded-full text-brand-gold">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-tight">
                                Pedido #{order.orderNumber || order.id.slice(0, 8)}
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mt-1 flex items-center gap-2">
                                {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                <span className={`${order.status === 'paid' || order.status === 'delivered' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {order.status === 'paid' ? 'Pago' : order.status === 'delivered' ? 'Entregue' : 'Pendente'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center justify-center group"
                    >
                        <X size={20} className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-stone-50/50 dark:bg-stone-900/50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

                        {/* Coluna Esquerda: Cliente e Info */}
                        <div className="space-y-6">
                            {/* Dados do Cliente */}
                            <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 p-6 h-full">
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-brand-gold rounded-full"></span>
                                    Dados do Cliente
                                </h3>

                                {hasCustomerData ? (
                                    <div className="space-y-6">
                                        {/* Nome */}
                                        <div className="flex items-start gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-sm flex items-center justify-center text-brand-gold font-black text-sm border border-stone-100 dark:border-stone-700">
                                                {order.customerName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Cliente</p>
                                                <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{order.customerName}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Email */}
                                            {order.customerEmail && (
                                                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg group hover:bg-white dark:hover:bg-stone-800 border border-transparent hover:border-stone-100 dark:hover:border-stone-700 transition-all">
                                                    <div className="flex items-center gap-2 mb-2 text-stone-400 group-hover:text-brand-gold transition-colors">
                                                        <Mail size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Email</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-mono text-stone-800 dark:text-stone-200 truncate">{order.customerEmail}</p>
                                                        <button onClick={() => copyToClipboard(order.customerEmail, 'Email')} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Copy size={12} className="text-stone-400 hover:text-brand-gold" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Telefone */}
                                            {order.customerPhone && (
                                                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg group hover:bg-white dark:hover:bg-stone-800 border border-transparent hover:border-stone-100 dark:hover:border-stone-700 transition-all">
                                                    <div className="flex items-center gap-2 mb-2 text-stone-400 group-hover:text-emerald-500 transition-colors">
                                                        <Phone size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Telefone</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-mono text-stone-800 dark:text-stone-200">{order.customerPhone}</p>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => copyToClipboard(order.customerPhone, 'Telefone')}>
                                                                <Copy size={12} className="text-stone-400 hover:text-brand-gold" />
                                                            </button>
                                                            <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                                <MessageCircle size={12} className="text-emerald-500 hover:text-emerald-600" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Endereço */}
                                        {order.customerAddress?.street && (
                                            <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-dashed border-stone-200 dark:border-stone-700">
                                                <div className="flex items-center gap-2 mb-3 text-stone-400">
                                                    <MapPin size={14} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Endereço de Entrega</span>
                                                </div>
                                                <div className="text-sm text-stone-700 dark:text-stone-300 space-y-1 pl-6 border-l-2 border-stone-200 dark:border-stone-700">
                                                    <p className="font-medium">
                                                        {order.customerAddress.street}, {order.customerAddress.number}
                                                    </p>
                                                    {order.customerAddress.complement && (
                                                        <p className="text-xs text-stone-500">{order.customerAddress.complement}</p>
                                                    )}
                                                    <p className="text-xs">
                                                        {order.customerAddress.neighborhood} - {order.customerAddress.city}/{order.customerAddress.state}
                                                    </p>
                                                    <p className="text-xs font-mono text-stone-400 mt-2">{order.customerAddress.zipcode}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 bg-stone-50 dark:bg-stone-900 rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 text-center p-6">
                                        <AlertCircle className="text-stone-300 mb-2" size={24} />
                                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Dados indisponíveis</p>
                                        <p className="text-[10px] text-stone-300 mt-1 max-w-[200px]">Este pedido foi realizado antes da atualização do sistema de CRM.</p>
                                    </div>
                                )}
                            </div>

                            {/* Observações */}
                            {order.notes && (
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                                        <MessageCircle size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Observação do Cliente</span>
                                    </div>
                                    <p className="text-sm text-blue-900 dark:text-blue-200 italic">"{order.notes}"</p>
                                </div>
                            )}
                        </div>

                        {/* Coluna Direita: Itens */}
                        <div className="space-y-6 flex flex-col">
                            <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 flex-1 flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-800/30">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                        Resumo do Pedido
                                    </h3>
                                    <span className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                        {order.items?.length || 0} Itens
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 p-3 rounded-lg border border-stone-100 dark:border-stone-800 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all">
                                            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded flex items-center justify-center text-stone-300 overflow-hidden">
                                                {/* Placeholder ou Imagem se tiver */}
                                                <Package size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100 line-clamp-2">{item.name}</p>
                                                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100 whitespace-nowrap ml-4">
                                                        {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-stone-400">
                                                        {item.quantity}x {formatCurrency(item.promotionalPrice || item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-stone-50 dark:bg-stone-800/30 border-t border-stone-100 dark:border-stone-800 space-y-3">
                                    <div className="flex justify-between items-center text-stone-500 text-xs">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(order.total)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-stone-500 text-xs">
                                        <span>Frete</span>
                                        <span className="text-emerald-500 font-bold">Grátis</span>
                                    </div>
                                    <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center">
                                        <span className="text-sm font-black uppercase tracking-widest text-stone-800 dark:text-stone-200">Total</span>
                                        <span className="text-2xl font-display font-medium text-brand-gold">
                                            {formatCurrency(order.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    );
}
