import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useStore } from '../../context/StoreContext';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency } from '../../lib/utils';
import {
    TrendingUp, DollarSign, Package, AlertTriangle, ArrowUpRight,
    Clock, User, Award, RefreshCw, ShoppingBag
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import type { TooltipProps } from 'recharts';

type ChartMode = 'revenue' | 'orders';

const CustomTooltip = ({ active, payload, label, mode }: TooltipProps<number, string> & { mode: ChartMode }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-stone-800 border border-stone-700 p-2 shadow-2xl rounded-sm">
                <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xs font-bold text-white">
                    {mode === 'revenue' ? formatCurrency((payload[0].value as number) || 0) : `${payload[0].value} Pedidos`}
                </p>
            </div>
        );
    }
    return null;
};

export function Dashboard() {
    const navigate = useNavigate();
    const { products } = useProducts();
    const { settings, currentStoreId, hasFeature } = useStore();
    const { orders = [], isLoading } = useOrders(currentStoreId);
    const [chartMode, setChartMode] = useState<ChartMode>('revenue');

    const confirmedOrders = useMemo(() => orders.filter(o => o.status === 'paid' || o.status === 'delivered'), [orders]);
    const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);

    const today = new Date().toISOString().split('T')[0];
    const month = new Date().getMonth();

    const salesToday = confirmedOrders
        .filter(o => o.createdAt.startsWith(today))
        .reduce((acc: number, o) => acc + o.total, 0);

    const salesMonth = confirmedOrders
        .filter(o => new Date(o.createdAt).getMonth() === month)
        .reduce((acc: number, o) => acc + o.total, 0);

    const uniqueCustomers = new Set(orders.map(o => o.customerEmail).filter(Boolean)).size;

    // Chart Data (Last 7 days)
    const chartData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const date = d.toISOString().split('T')[0];
            const filtered = confirmedOrders.filter(o => o.createdAt.startsWith(date));
            days.push({
                date: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
                fullDate: date,
                revenue: filtered.reduce((acc: number, o) => acc + o.total, 0),
                orders: filtered.length
            });
        }
        return days;
    }, [confirmedOrders]);

    // Top Products
    const topProductsData = useMemo(() => {
        const counts: Record<string, { name: string, count: number }> = {};
        confirmedOrders.forEach(o => {
            o.items.forEach(item => {
                if (!counts[item.id]) {
                    counts[item.id] = { name: item.name, count: 0 };
                }
                counts[item.id].count += item.quantity;
            });
        });
        return Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [confirmedOrders]);

    // CRM Analytics
    const tierStats = useMemo(() => {
        const map = orders.reduce((acc: Record<string, { total: number, count: number }>, o) => {
            const email = o.customerEmail || 'anonimo';
            if (!acc[email]) acc[email] = { total: 0, count: 0 };
            if (o.status === 'paid' || o.status === 'delivered') {
                acc[email].total += o.total;
                acc[email].count += 1;
            }
            return acc;
        }, {});

        const stats = {
            'VIP': { revenue: 0, count: 0 },
            'Recorrente': { revenue: 0, count: 0 },
            'Novo': { revenue: 0, count: 0 }
        };

        Object.values(map).forEach(c => {
            let tier: keyof typeof stats = 'Novo';
            if (c.total > 500 || c.count > 5) tier = 'VIP';
            else if (c.count > 2) tier = 'Recorrente';
            stats[tier].revenue += c.total;
            stats[tier].count += 1;
        });

        return stats;
    }, [orders]);

    const lowStock = products.filter(p => p.stock <= 5);

    if (isLoading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 border-2 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
                <div className="absolute inset-0 bg-brand-gold/10 blur-xl rounded-full" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 animate-pulse">Carregando Resultados...</span>
        </div>
    );

    return (
        <div className="animate-fade-in pb-10 space-y-8 max-w-7xl mx-auto">
            {/* Header Clean */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 dark:border-stone-800 pb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-display font-medium text-stone-700 dark:text-stone-100 uppercase tracking-[0.2em]">Painel de Controle</h1>
                        <div className="px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full flex items-center gap-2">
                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{settings.store_name}</span>
                        </div>
                    </div>
                    <p className="text-stone-400 text-xs mt-2 font-medium">Análise de performance e gestão estratégica</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono bg-stone-100 dark:bg-stone-900 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 shadow-inner">
                    <RefreshCw size={10} className="animate-spin-slow" />
                    Sincronizado: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* KPI Cards - Glassmorphism Edition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Vendas Hoje', value: formatCurrency(salesToday), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                    { label: 'Faturamento Mês', value: formatCurrency(salesMonth), icon: DollarSign, color: 'text-brand-gold', bg: 'bg-brand-gold/5' },
                    { label: 'Base de Clientes', value: uniqueCustomers, icon: User, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                    { label: 'Pedidos Pendentes', value: pendingOrders.length, icon: Clock, color: pendingOrders.length > 5 ? 'text-amber-500' : 'text-stone-400', bg: 'bg-stone-500/5' }
                ].map((stat, i) => (
                    <div key={i} className="relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-white/[0.02] backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5 shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-brand-gold/30" />
                        <div className="relative p-6 flex flex-col items-center text-center">
                            <div className={`p-2.5 ${stat.bg} ${stat.color} rounded-lg mb-4 transform transition-transform group-hover:rotate-12`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">{stat.label}</span>
                            <span className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Chart with Selector - Gated for Pro */}
            <div className={`bg-white dark:bg-stone-900/50 backdrop-blur-sm p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl relative overflow-hidden group ${!hasFeature('metrics_pro') ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                {!hasFeature('metrics_pro') && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-900/40 backdrop-blur-[2px]">
                        <div className="bg-brand-gold text-brand-wood px-4 py-2 rounded-sm font-black text-[10px] uppercase tracking-widest shadow-2xl mb-2">Recurso PRO</div>
                        <p className="text-[9px] text-white uppercase tracking-widest font-bold">Assine o plano Pro para ver métricas detalhadas</p>
                    </div>
                )}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <TrendingUp size={120} className="text-brand-gold" />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h3 className="text-sm font-display uppercase tracking-[0.2em] text-stone-700 dark:text-stone-200 flex items-center gap-2">
                            Tendência de Performance
                        </h3>
                        <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest">Acompanhamento dos últimos 7 dias</p>
                    </div>

                    {/* Mode Selector - Visual Premium */}
                    <div className="flex bg-stone-100 dark:bg-stone-950 p-1 rounded-full border border-stone-200 dark:border-stone-800 shadow-inner">
                        <button
                            onClick={() => setChartMode('revenue')}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${chartMode === 'revenue'
                                ? 'bg-brand-gold text-white shadow-lg'
                                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                                }`}
                        >
                            Receita (R$)
                        </button>
                        <button
                            onClick={() => setChartMode('orders')}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${chartMode === 'orders'
                                ? 'bg-brand-gold text-white shadow-lg'
                                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                                }`}
                        >
                            Pedidos
                        </button>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212, 175, 55, 0.05)" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: '#888' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 700, fill: '#888' }}
                                tickFormatter={(val: number) => chartMode === 'revenue' ? `R$${val}` : `${val}`}
                            />
                            <Tooltip content={<CustomTooltip mode={chartMode} />} />
                            <Area
                                type="monotone"
                                dataKey={chartMode}
                                stroke="#d4af37"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVal)"
                                animationDuration={1500}
                                dot={{ r: 4, fill: '#d4af37', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#d4af37' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products - BarChart */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-700 dark:text-stone-200">Produtos em Destaque</h3>
                            <p className="text-[9px] text-stone-400 mt-0.5 uppercase tracking-widest">Itens mais vendidos no período</p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductsData} layout="vertical" margin={{ left: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fontSize: 9, fontWeight: 800, fill: '#666' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(212,175,55,0.05)' }}
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length > 0) {
                                            return (
                                                <div className="bg-stone-800 px-3 py-1.5 rounded-sm shadow-xl border border-stone-700">
                                                    <span className="text-[10px] font-bold text-white">{payload[0].value} Unidades</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topProductsData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={['#d4af37', '#e5c05b', '#f1d279', '#f9e4a0', '#fff2c8'][index] || '#d4af37'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CRM Segmentation - Gated for Pro */}
                <div className={`bg-[#1c1c1c] p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden ${!hasFeature('metrics_pro') ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                    {!hasFeature('metrics_pro') && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                            <div className="bg-brand-gold text-brand-wood px-4 py-2 rounded-sm font-black text-[10px] uppercase tracking-widest shadow-2xl mb-2">CRM Avançado (PRO)</div>
                            <p className="text-[9px] text-white uppercase tracking-widest font-bold text-center px-4">Conheça o comportamento dos seus clientes no Plano Pro</p>
                        </div>
                    )}
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Award size={80} className="text-brand-gold" />
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-gold mb-8">Inteligência CRM</h3>

                    <div className="space-y-6">
                        {(['VIP', 'Recorrente', 'Novo'] as const).map(tier => {
                            const count = tierStats[tier].count;
                            const totalRev = tierStats[tier].revenue;
                            const maxRev = Math.max(...Object.values(tierStats).map(s => s.revenue), 1);

                            return (
                                <div key={tier} className="space-y-2 group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded bg-white/5 ${tier === 'VIP' ? 'text-amber-500' : tier === 'Recorrente' ? 'text-blue-400' : 'text-stone-500'}`}>
                                                {tier === 'VIP' ? <Award size={14} /> : tier === 'Recorrente' ? <RefreshCw size={14} /> : <User size={14} />}
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{tier}</span>
                                                <p className="text-[8px] text-stone-500">{count} clientes</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-white">{formatCurrency(totalRev)}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${tier === 'VIP' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : tier === 'Recorrente' ? 'bg-blue-400' : 'bg-stone-500'}`}
                                            style={{ width: `${(totalRev / maxRev) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between">
                        <div>
                            <p className="text-[8px] text-stone-500 uppercase tracking-widest font-black mb-1">Ticket Médio VIP</p>
                            <span className="text-lg font-display text-white">{formatCurrency(tierStats.VIP.revenue / (tierStats.VIP.count || 1))}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] text-stone-500 uppercase tracking-widest font-black mb-1">Retenção</p>
                            <span className="text-lg font-display text-emerald-500">
                                {Math.round(((tierStats.VIP.count + tierStats.Recorrente.count) / (orders.length || 1)) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock Warning */}
                <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-200 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500" /> Alerta de Inventário
                        </h3>
                        <button onClick={() => navigate('/admin/inventory')} className="text-[9px] font-black text-brand-gold uppercase tracking-widest hover:underline transition-all">Ver Estoque</button>
                    </div>

                    <div className="space-y-2">
                        {lowStock.length === 0 ? (
                            <div className="py-8 text-center text-stone-300 italic text-[10px]">Tudo sob controle.</div>
                        ) : (
                            lowStock.slice(0, 3).map(p => (
                                <div key={p.id} className="flex items-center gap-3 p-2 bg-stone-50 dark:bg-stone-950/50 rounded-lg border border-stone-100 dark:border-stone-800">
                                    <img src={p.image} className="w-8 h-8 rounded-sm object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-stone-700 dark:text-stone-200 truncate">{p.name}</p>
                                        <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">{p.stock} em estoque</p>
                                    </div>
                                    <button onClick={() => navigate(`/admin/edit-product/${p.id}`)} className="p-1.5 text-stone-400 hover:text-brand-gold transition-colors">
                                        <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-[#2A3F54] p-5 rounded-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
                        <Package size={80} className="text-white" />
                    </div>

                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-4">Ações Estratégicas</h3>

                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <button
                            onClick={() => navigate('/admin/add-product')}
                            className="bg-white/5 hover:bg-brand-gold text-white p-4 rounded-lg border border-white/5 hover:border-brand-gold transition-all duration-300 group/btn"
                        >
                            <Package className="mb-2 text-brand-gold group-hover/btn:text-white" size={20} />
                            <span className="block text-[10px] font-black uppercase tracking-widest">Novo Item</span>
                        </button>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="bg-white/5 hover:bg-emerald-600 text-white p-4 rounded-lg border border-white/5 hover:border-emerald-600 transition-all duration-300 group/btn"
                        >
                            <ShoppingBag className="mb-2 text-brand-gold group-hover/btn:text-white" size={20} />
                            <span className="block text-[10px] font-black uppercase tracking-widest">Ver Pedidos</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
