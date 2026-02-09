import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useProducts } from '../../context/ProductContext';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, DollarSign, Package, ShoppingBag, AlertTriangle } from 'lucide-react';

export function Dashboard() {
    const { products } = useProducts();
    const [orders, setOrders] = useState<Order[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_loading, setLoading] = useState(true);

    useEffect(() => {
        api.orders.list().then(data => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    const lowStock = products.filter(p => p.stock <= 5);
    const promoProducts = products.filter(p => p.promotionalPrice);

    // KPIs
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().getMonth();

    const confirmedOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered');
    const pendingOrders = orders.filter(o => o.status === 'pending');

    const salesToday = confirmedOrders
        .filter(o => o.createdAt.startsWith(today))
        .reduce((acc, o) => acc + o.total, 0);

    const salesMonth = confirmedOrders
        .filter(o => new Date(o.createdAt).getMonth() === month)
        .reduce((acc, o) => acc + o.total, 0);

    // Simple Chart Data (Last 7 days) - Only confirmed sales
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    };

    const chartData = getLast7Days().map(date => {
        const total = confirmedOrders
            .filter(o => o.createdAt.startsWith(date))
            .reduce((acc, o) => acc + o.total, 0);
        return { date, total };
    });

    const maxVal = Math.max(...chartData.map(d => d.total), 100);
    const points = chartData.map((d, i) => {
        const x = (i / 6) * 100;
        const y = 100 - ((d.total / maxVal) * 100);
        return `${x},${y}`;
    }).join(' ');

    const polyPoints = `0,100 ${points} 100,100`;

    return (
        <div className="space-y-8 animate-fade-in-up pb-10">
            <h1 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">Painel Geral</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Vendas Hoje */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={60} className="text-brand-gold" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Vendas Hoje (Pagas)</p>
                        <h3 className="text-2xl font-bold text-brand-gold">{formatCurrency(salesToday)}</h3>
                    </div>
                </div>

                {/* Vendas Mês */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={60} className="text-stone-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Vendas Mês (Pagas)</p>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{formatCurrency(salesMonth)}</h3>
                    </div>
                </div>

                {/* Pedidos */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={60} className="text-stone-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Status Pedidos</p>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{orders.length}</h3>
                        <p className="text-[10px] font-bold text-amber-500 uppercase mt-1">
                            {pendingOrders.length} Aguardando Pagamento
                        </p>
                    </div>
                </div>

                {/* Em Promoção */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={60} className="text-stone-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Catálogo</p>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{products.length} Produtos</h3>
                        <p className="text-[10px] font-bold text-brand-gold uppercase mt-1">
                            {promoProducts.length} Em Promoção
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-800 p-8 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700">
                    <h3 className="font-bold text-lg mb-6 uppercase tracking-wider text-stone-800 dark:text-stone-100">Desempenho de Vendas</h3>
                    <div className="relative h-64 w-full">
                        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
                            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
                            <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />

                            {/* Area */}
                            <polygon points={polyPoints} className="fill-brand-gold/10" />
                            {/* Line */}
                            <polyline points={points} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Points */}
                            {chartData.map((d, i) => {
                                const x = (i / 6) * 100;
                                const y = 100 - ((d.total / maxVal) * 100);
                                return (
                                    <circle key={i} cx={x} cy={y} r="2" className="fill-brand-gold hover:r-3 transition-all cursor-pointer" />
                                )
                            })}
                        </svg>
                        <div className="flex justify-between mt-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                            {chartData.map(d => <span key={d.date}>{d.date.slice(8)}/{d.date.slice(5, 7)}</span>)}
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2 uppercase tracking-wider text-stone-800 dark:text-stone-100">
                        <AlertTriangle className="text-red-500" size={20} />
                        Alerta de Estoque
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {lowStock.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-stone-400">
                                <Package size={48} className="mb-2 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-wide">Estoque saudável</p>
                            </div>
                        ) : (
                            lowStock.map(p => (
                                <div key={p.id} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-stone-100 rounded-lg p-1 border border-stone-200">
                                        <img src={p.image} className="w-full h-full object-cover rounded" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-stone-800 dark:text-stone-200">{p.name}</div>
                                        <div className="text-xs text-red-500 font-bold uppercase tracking-wide">
                                            {p.stock === 0 ? 'Esgotado' : `Restam apenas ${p.stock}`}
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
