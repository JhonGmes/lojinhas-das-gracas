import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { RefreshCw, CheckCircle2, XCircle, Clock, Package, Eye, Bell } from 'lucide-react';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { toast } from 'react-hot-toast';

export function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newOrdersCount, setNewOrdersCount] = useState(0);

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
                return { label: 'Pago', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
            case 'delivered':
                return { label: 'Entregue', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package };
            case 'cancelled':
                return { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
            default:
                return { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
        }
    };

    if (loading) return (
        <div className="p-20 text-center animate-pulse flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-brand-gold" size={32} />
            <span className="text-stone-400 font-bold uppercase tracking-widest">Carregando Vendas...</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">
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
                    className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 rounded-lg hover:bg-stone-50 transition-colors shadow-sm"
                    title="Atualizar Lista"
                >
                    <RefreshCw size={18} className="text-stone-500" />
                </button>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#FDFBF7] dark:bg-stone-900 border-b border-stone-100 dark:border-stone-700">
                            <tr>
                                <th className="p-4 font-bold text-stone-400 text-[10px] uppercase tracking-wider">ID</th>
                                <th className="p-4 font-bold text-stone-400 text-[10px] uppercase tracking-wider">Status</th>
                                <th className="p-4 font-bold text-stone-400 text-[10px] uppercase tracking-wider">Data</th>
                                <th className="p-4 font-bold text-stone-400 text-[10px] uppercase tracking-wider">Cliente</th>
                                <th className="p-4 font-bold text-stone-400 text-[10px] uppercase tracking-wider">Pedido</th>
                                <th className="p-4 font-bold text-stone-400 text-[10px] uppercase tracking-wider">Total</th>
                                <th className="p-4 font-bold text-stone-400 text-[10px] uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center text-stone-400 italic">
                                        Nenhuma venda registrada ainda.
                                    </td>
                                </tr>
                            ) : orders.map(order => {
                                const config = getStatusConfig(order.status);
                                const hasCustomerData = order.customerEmail || order.customerPhone || order.customerAddress?.street;

                                return (
                                    <tr key={order.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-700/30 transition-colors">
                                        <td className="p-4 text-xs font-mono font-bold text-stone-400">
                                            #{order.orderNumber ? String(order.orderNumber).padStart(4, '0') : order.id.slice(0, 4)}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as any)}
                                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border outline-none transition-colors cursor-pointer ${config.color}`}
                                            >
                                                <option value="pending">Pendente</option>
                                                <option value="paid">Pago</option>
                                                <option value="delivered">Entregue</option>
                                                <option value="cancelled">Cancelado</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-xs text-stone-500">
                                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                            <div className="text-[10px] opacity-50">{new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">{order.customerName}</div>
                                            {hasCustomerData && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                                        ✓ Dados Completos
                                                    </span>
                                                </div>
                                            )}
                                            {order.notes && <div className="text-[10px] text-brand-gold italic truncate max-w-[150px]" title={order.notes}>Obs: {order.notes}</div>}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-stone-500 font-medium">
                                                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                                                <div className="text-[10px] opacity-60">
                                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ').slice(0, 30)}...
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-display font-bold text-brand-brown dark:text-amber-500">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="flex items-center gap-2 bg-brand-gold text-brand-wood px-3 py-2 rounded-sm hover:bg-brand-wood hover:text-white transition-all shadow-sm group"
                                                title="Ver detalhes completos"
                                            >
                                                <Eye size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">
                                                    Detalhes
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
