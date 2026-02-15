import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { RefreshCw, CheckCircle2, XCircle, Clock, Package, Eye, Bell, User, Calendar, ShoppingBag, TrendingUp } from 'lucide-react';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { toast } from 'react-hot-toast';

export function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newOrdersCount, setNewOrdersCount] = useState(0);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'delivered' | 'cancelled'>('all');

    const loadOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.orders.list();

            // Detectar novos pedidos
            if (orders.length > 0 && data.length > orders.length) {
                const newCount = data.length - orders.length;
                setNewOrdersCount(newCount);
                toast.success(`${newCount} ${newCount === 1 ? 'novo pedido' : 'novos pedidos'}!`, {
                    icon: '🔔',
                    duration: 5000,
                    style: {
                        background: '#D4AF37',
                        color: '#2d2a28',
                        fontSize: '12px',
                        fontWeight: '900'
                    }
                });
            }

            setOrders(data);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        await api.orders.updateStatus(orderId, newStatus);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast.success('Status atualizado!', { icon: '✓' });
    };

    useEffect(() => {
        loadOrders();

        // Auto-refresh a cada 30 segundos para detectar novos pedidos
        const interval = setInterval(() => {
            loadOrders(true); // Silent refresh
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const getStatusConfig = (status: Order['status']) => {
        switch (status) {
            case 'paid':
                return {
                    label: 'Pago',
                    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                    icon: CheckCircle2,
                    dotColor: 'bg-emerald-500'
                };
            case 'delivered':
                return {
                    label: 'Entregue',
                    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                    icon: Package,
                    dotColor: 'bg-blue-500'
                };
            case 'cancelled':
                return {
                    label: 'Cancelado',
                    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
                    icon: XCircle,
                    dotColor: 'bg-red-500'
                };
            default:
                return {
                    label: 'Pendente',
                    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                    icon: Clock,
                    dotColor: 'bg-amber-500'
                };
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
    };

    if (loading) return (
        <div className="p-20 text-center animate-pulse flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-brand-gold" size={32} />
            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Carregando Vendas...</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">
                        Histórico de Vendas
                    </h1>
                    {newOrdersCount > 0 && (
                        <div className="flex items-center gap-2 bg-brand-gold text-brand-wood px-4 py-2 rounded-full animate-bounce">
                            <Bell size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">
                                {newOrdersCount} {newOrdersCount === 1 ? 'Novo' : 'Novos'}
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => loadOrders()}
                    className="flex items-center gap-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-4 py-2 rounded-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-sm"
                >
                    <RefreshCw size={16} className="text-stone-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">Atualizar</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total</span>
                        <ShoppingBag size={16} className="text-stone-400" />
                    </div>
                    <p className="text-xl font-display font-bold text-stone-800 dark:text-stone-100">{stats.total}</p>
                </div>

                <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-amber-200 dark:border-amber-900/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Pendentes</span>
                        <Clock size={16} className="text-amber-500" />
                    </div>
                    <p className="text-xl font-display font-bold text-amber-700 dark:text-amber-400">{stats.pending}</p>
                </div>

                <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-emerald-200 dark:border-emerald-900/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Pagos</span>
                        <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-xl font-display font-bold text-emerald-700 dark:text-emerald-400">{stats.paid}</p>
                </div>

                <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-blue-200 dark:border-blue-900/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Entregues</span>
                        <Package size={16} className="text-blue-500" />
                    </div>
                    <p className="text-xl font-display font-bold text-blue-700 dark:text-blue-400">{stats.delivered}</p>
                </div>

                <div className="bg-gradient-to-br from-brand-gold/10 to-amber-50 dark:from-brand-gold/5 dark:to-stone-900 p-6 rounded-sm border border-brand-gold/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Receita</span>
                        <TrendingUp size={16} className="text-brand-gold" />
                    </div>
                    <p className="text-xl font-display font-bold text-brand-gold">{formatCurrency(stats.revenue)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'paid', 'delivered', 'cancelled'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === status
                            ? 'bg-brand-gold text-brand-wood shadow-md'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                            }`}
                    >
                        {status === 'all' ? 'Todos' : getStatusConfig(status).label}
                    </button>
                ))}
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 rounded-sm border border-stone-200 dark:border-stone-800 p-20 text-center">
                    <ShoppingBag size={48} className="mx-auto text-stone-300 dark:text-stone-700 mb-4" />
                    <p className="text-stone-400 italic">
                        {filter === 'all' ? 'Nenhuma venda registrada ainda.' : `Nenhum pedido ${getStatusConfig(filter).label.toLowerCase()}.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredOrders.map(order => {
                        const config = getStatusConfig(order.status);
                        const hasCustomerData = order.customerEmail || order.customerPhone || order.customerAddress?.street;

                        return (
                            <div
                                key={order.id}
                                className="bg-white dark:bg-stone-900 rounded-sm border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                            >
                                {/* Card Header */}
                                <div className="bg-stone-50 dark:bg-stone-800/50 px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></div>
                                        <div>
                                            <p className="text-xs font-mono font-black text-stone-400">
                                                #{order.orderNumber ? String(order.orderNumber).padStart(4, '0') : order.id.slice(0, 4)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar size={12} className="text-stone-400" />
                                                <p className="text-[10px] text-stone-500">
                                                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value as any)}
                                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border outline-none transition-all cursor-pointer ${config.color}`}
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="paid">Pago</option>
                                        <option value="delivered">Entregue</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 space-y-4">
                                    {/* Cliente */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                                            <User size={18} className="text-brand-gold" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">
                                                {order.customerName}
                                            </p>
                                            {hasCustomerData && (
                                                <span className="inline-block text-[8px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider mt-1">
                                                    ✓ Dados Completos
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Itens */}
                                    <div className="bg-stone-50 dark:bg-stone-800/30 rounded-sm p-3 border border-stone-100 dark:border-stone-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                                            {order.items.length} {order.items.length === 1 ? 'Item' : 'Itens'}
                                        </p>
                                        <div className="space-y-1">
                                            {order.items.slice(0, 2).map((item, idx) => (
                                                <p key={idx} className="text-xs text-stone-600 dark:text-stone-400 truncate">
                                                    {item.quantity}x {item.name}
                                                </p>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className="text-[10px] text-stone-400 italic">
                                                    +{order.items.length - 2} {order.items.length - 2 === 1 ? 'item' : 'itens'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Observações */}
                                    {order.notes && (
                                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-sm p-3 border border-blue-100 dark:border-blue-900/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
                                                Observação
                                            </p>
                                            <p className="text-xs text-blue-900 dark:text-blue-200 line-clamp-2">
                                                {order.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Total e Ação */}
                                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total</p>
                                            <p className="text-2xl font-display font-bold text-brand-gold mt-1">
                                                {formatCurrency(order.total)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="flex items-center gap-2 bg-brand-gold text-brand-wood px-4 py-3 rounded-sm hover:bg-brand-wood hover:text-white transition-all shadow-sm group-hover:scale-105"
                                        >
                                            <Eye size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                Detalhes
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
