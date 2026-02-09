import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { RefreshCw, CheckCircle2, XCircle, Clock, Package } from 'lucide-react';

export function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await api.orders.list();
            setOrders(data);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        await api.orders.updateStatus(orderId, newStatus);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    useEffect(() => {
        loadOrders();
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
                <h1 className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">Histórico de Vendas</h1>
                <button
                    onClick={loadOrders}
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-stone-400 italic">
                                        Nenhuma venda registrada ainda.
                                    </td>
                                </tr>
                            ) : orders.map(order => {
                                const config = getStatusConfig(order.status);
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
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
