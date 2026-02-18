import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import type { Order } from '../../types';
import { formatCurrency, exportToCSV } from '../../lib/utils';
import { RefreshCw, CheckCircle2, XCircle, Clock, Package, ShoppingBag, Download } from 'lucide-react';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { toast } from 'react-hot-toast';

export function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { currentStoreId, settings } = useStore();
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const playNotificationSound = () => {
        // Voz da Gracinha (Customizável nas Configurações)
        const audio = new Audio(settings.notification_sound_url || 'https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    };
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'delivered' | 'cancelled'>('all');

    const loadOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.orders.list(currentStoreId);

            // Detectar novos pedidos
            if (orders.length > 0 && data.length > orders.length) {
                const newCount = data.length - orders.length;
                playNotificationSound();
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
        const interval = setInterval(() => loadOrders(true), 30000);
        return () => clearInterval(interval);
    }, [currentStoreId]);

    const getStatusConfig = (status: Order['status']) => {
        switch (status) {
            case 'paid':
                return { label: 'Pago', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 };
            case 'delivered':
                return { label: 'Entregue', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Package };
            case 'cancelled':
                return { label: 'Cancelado', color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle };
            default:
                return { label: 'Pendente', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock };
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        delivered: orders.filter(o => o.status === 'delivered').length
    };

    if (loading && orders.length === 0) return (
        <div className="h-96 flex items-center justify-center">
            <RefreshCw className="animate-spin text-brand-gold" size={24} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header Compacto */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest flex items-center gap-2">
                        <ShoppingBag size={16} className="text-brand-gold" />
                        Vendas & Pedidos
                    </h1>
                    <p className="text-[10px] text-stone-400 mt-0.5">Gerencie os pedidos da loja</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportToCSV(orders, 'pedidos-lojinha')}
                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all border border-stone-200 dark:border-stone-700 hover:bg-stone-50 text-stone-600 flex items-center gap-2"
                    >
                        <Download size={12} /> Exportar
                    </button>
                    {(['all', 'pending', 'paid', 'delivered'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${filter === f
                                ? 'bg-stone-800 text-white shadow-md'
                                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagos' : f === 'pending' ? 'Pendentes' : 'Entregues'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Pedidos', value: stats.total, icon: ShoppingBag, color: 'text-stone-600' },
                    { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-amber-600' },
                    { label: 'Pagos', value: stats.paid, icon: CheckCircle2, color: 'text-emerald-600' },
                    { label: 'Entregues', value: stats.delivered, icon: Package, color: 'text-blue-600' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-stone-900 p-3 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-stone-50 dark:bg-stone-800 ${stat.color}`}>
                            <stat.icon size={16} />
                        </div>
                        <div>
                            <span className="block text-xl font-display font-medium text-stone-700 dark:text-stone-200">{stat.value}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dense Table */}
            <div className="bg-white dark:bg-stone-900 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-[9px] font-bold text-stone-400 uppercase tracking-widest w-20">ID</th>
                                <th className="px-4 py-2 text-left text-[9px] font-bold text-stone-400 uppercase tracking-widest">Cliente</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Data</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-2 text-right text-[9px] font-bold text-stone-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                            {filteredOrders.map((order) => {
                                const statusConfig = getStatusConfig(order.status);
                                const StatusIcon = statusConfig.icon;
                                return (
                                    <tr key={order.id} className="group hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                        <td className="px-4 py-2 text-[10px] font-mono text-stone-500">
                                            #{order.id.slice(0, 6)}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-stone-700 dark:text-stone-200">{order.customerName}</span>
                                                <span className="text-[9px] text-stone-400">{order.customerEmail || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center text-[10px] text-stone-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                            <span className="block text-[8px] text-stone-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs font-bold text-stone-700 dark:text-stone-200">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusConfig.color}`}>
                                                <StatusIcon size={10} />
                                                {statusConfig.label}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-[9px] font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-stone-400 text-xs italic">
                                        Nenhum pedido encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
}
