import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useProducts } from '../../context/ProductContext';
import { useStore } from '../../context/StoreContext';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, DollarSign, Package, AlertTriangle, ArrowUpRight, Clock, User, ArrowUp, CheckCircle2, Award } from 'lucide-react';

interface HoverState {
    x: number;
    y: number;
    value: number;
    date: string;
}

export function Dashboard() {
    const navigate = useNavigate();
    const { products } = useProducts();
    const { settings } = useStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState<HoverState | null>(null);

    useEffect(() => {
        api.orders.list().then(data => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    const lowStock = products.filter(p => p.stock <= 5);

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

    // Chart Data (Last 7 days)
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

    // CRM Analytics
    const customerTiersMap = orders.reduce((acc, o) => {
        const email = o.customerEmail || 'anonimo';
        if (!acc[email]) acc[email] = { total: 0, count: 0 };
        if (o.status === 'paid' || o.status === 'delivered') {
            acc[email].total += o.total;
            acc[email].count += 1;
        }
        return acc;
    }, {} as Record<string, { total: number, count: number }>);

    const tierStats = Object.values(customerTiersMap).reduce((acc, c) => {
        let tier: 'VIP' | 'Recorrente' | 'Novo' = 'Novo';
        if (c.total > 500 || c.count > 5) tier = 'VIP';
        else if (c.count > 2) tier = 'Recorrente';

        acc[tier].revenue += c.total;
        acc[tier].count += 1;
        return acc;
    }, {
        'VIP': { revenue: 0, count: 0 },
        'Recorrente': { revenue: 0, count: 0 },
        'Novo': { revenue: 0, count: 0 }
    });

    const maxTierRevenue = Math.max(tierStats.VIP.revenue, tierStats.Recorrente.revenue, tierStats.Novo.revenue, 1);

    const maxVal = Math.max(...chartData.map(d => d.total), 100);

    // Smooth Curve Generator
    const points = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * 100;
        const y = 100 - ((d.total / maxVal) * 80); // Leave top margin
        return { x, y };
    });

    // Generate Path Command
    let pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        // Control points for smooth curve
        const cp1x = curr.x + (next.x - curr.x) / 3;
        const cp1y = curr.y;
        const cp2x = curr.x + 2 * (next.x - curr.x) / 3;
        const cp2y = next.y;
        pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }

    const fillPathD = `${pathD} V 100 H 0 Z`;

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-brand-gold tracking-[0.3em] font-display text-lg uppercase">Carregando Resultados...</div>
        </div>
    );

    return (
        <div className="animate-fade-in-up pb-10 space-y-8">
            {/* Header Clean */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-lg font-display font-medium text-stone-700 dark:text-stone-200 uppercase tracking-widest">Resumo Executivo</h1>
                    <p className="text-stone-400 text-xs mt-1">Visão geral do desempenho em tempo real</p>
                </div>
                <div className="text-[10px] text-stone-400 font-mono">
                    Atualizado: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Top Stats Bar - Compact & Clean */}
            <div className="bg-white dark:bg-stone-900 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 p-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-stone-100 dark:divide-stone-800">

                    {/* Stat 1 */}
                    <div className="px-4 flex flex-col items-center justify-center gap-1 group">
                        <div className="flex items-center gap-2 text-stone-400 uppercase text-[9px] font-bold tracking-widest mb-1">
                            <TrendingUp size={12} /> Vendas Hoje
                        </div>
                        <div className="text-2xl font-display font-medium text-stone-700 dark:text-stone-100 group-hover:text-brand-gold transition-colors">
                            {formatCurrency(salesToday)}
                        </div>
                        <div className="text-[9px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ArrowUp size={8} /> 12% Semana Anterior
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="px-4 flex flex-col items-center justify-center gap-1 group">
                        <div className="flex items-center gap-2 text-stone-400 uppercase text-[9px] font-bold tracking-widest mb-1">
                            <DollarSign size={12} /> Faturamento Mês
                        </div>
                        <div className="text-2xl font-display font-medium text-stone-700 dark:text-stone-100 group-hover:text-brand-gold transition-colors">
                            {formatCurrency(salesMonth)}
                        </div>
                        <div className="text-[9px] font-bold text-stone-300">
                            Meta: {formatCurrency(settings.monthly_revenue_goal || 5000)}
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="px-4 flex flex-col items-center justify-center gap-1 group">
                        <div className="flex items-center gap-2 text-stone-400 uppercase text-[9px] font-bold tracking-widest mb-1">
                            <User size={12} /> Novos Clientes
                        </div>
                        <div className="text-2xl font-display font-medium text-stone-700 dark:text-stone-100 group-hover:text-brand-gold transition-colors">
                            12
                        </div>
                        <div className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                            <ArrowUp size={8} /> 3 hoje
                        </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="px-4 flex flex-col items-center justify-center gap-1 group">
                        <div className="flex items-center gap-2 text-stone-400 uppercase text-[9px] font-bold tracking-widest mb-1">
                            <Clock size={12} /> Pedidos Pendentes
                        </div>
                        <div className={`text-2xl font-display font-medium transition-colors ${pendingOrders.length > 5 ? 'text-amber-500' : 'text-stone-700 dark:text-stone-100'}`}>
                            {pendingOrders.length}
                        </div>
                        <div className="text-[9px] text-stone-400 italic">
                            Aguardando confirmação
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Chart Section - Compact Height */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-sm shadow-lg border border-stone-100 dark:border-stone-800 relative group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className="text-sm font-display uppercase tracking-widest text-stone-700 dark:text-stone-200">
                            Performance de Vendas
                        </h3>
                        <p className="text-[10px] text-stone-400 mt-1">Comparativo dos últimos 7 dias</p>
                    </div>
                </div>

                {/* SVG Area Chart - Reduced Height (h-56) & Thinner Strokes */}
                <div className="h-56 w-full relative">
                    {/* Floating Tooltip (React State Managed) */}
                    {hoveredPoint && (
                        <div
                            className="absolute z-20 bg-stone-800 text-white rounded p-2 shadow-xl pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-[120%]"
                            style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%` }}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-0.5">
                                {new Date(hoveredPoint.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-bold font-mono">
                                {formatCurrency(hoveredPoint.value)}
                            </span>
                            {/* Triangle Arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-800 rotate-45"></div>
                        </div>
                    )}

                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        <line x1="0" y1="25" x2="100" y2="25" className="stroke-stone-50 dark:stroke-stone-800" strokeWidth="0.2" />
                        <line x1="0" y1="50" x2="100" y2="50" className="stroke-stone-50 dark:stroke-stone-800" strokeWidth="0.2" />
                        <line x1="0" y1="75" x2="100" y2="75" className="stroke-stone-50 dark:stroke-stone-800" strokeWidth="0.2" />

                        {/* Area Fill */}
                        <path d={fillPathD} fill="url(#chartGradient)" className="transition-all duration-1000 ease-out" />

                        {/* Line Stroke - Thinner */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1"
                            strokeLinecap="round"
                            className="drop-shadow-sm transition-all duration-1000 ease-out"
                        />

                        {/* Interactive Points - Invisible Trigger Area but Visible Dot */}
                        {points.map((p, i) => (
                            <g
                                key={i}
                                className="group/point cursor-pointer"
                                onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, value: chartData[i].total, date: chartData[i].date })}
                                onMouseLeave={() => setHoveredPoint(null)}
                            >
                                {/* Invisible larger target for easier hovering */}
                                <circle cx={p.x} cy={p.y} r="4" className="fill-transparent stroke-none" />
                                {/* Visible Dot */}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={hoveredPoint?.date === chartData[i].date ? '1.5' : '1'}
                                    className={`fill-white stroke-emerald-500 stroke-[0.5] transition-all duration-300 ${hoveredPoint?.date === chartData[i].date ? 'scale-150 stroke-[1]' : ''}`}
                                />
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Horizontal Axis Labels */}
                <div className="flex justify-between text-[8px] text-stone-300 font-bold uppercase tracking-widest mt-2">
                    {chartData.map((d, i) => (
                        <div key={i} className="text-center w-8">
                            {new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                    ))}
                </div>
            </div>

            {/* CRM Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-6 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800">
                    <h3 className="text-sm font-display uppercase tracking-widest text-stone-700 dark:text-stone-200 mb-6">
                        Receita por Segmentação CRM
                    </h3>

                    <div className="space-y-6">
                        {(['VIP', 'Recorrente', 'Novo'] as const).map(tier => (
                            <div key={tier} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${tier === 'VIP' ? 'bg-amber-400' : tier === 'Recorrente' ? 'bg-blue-400' : 'bg-stone-300'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{tier}</span>
                                        <span className="text-[9px] text-stone-400">({tierStats[tier].count} clientes)</span>
                                    </div>
                                    <span className="text-xs font-bold text-stone-700 dark:text-stone-200">{formatCurrency(tierStats[tier].revenue)}</span>
                                </div>
                                <div className="h-2 bg-stone-50 dark:bg-stone-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${tier === 'VIP' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]' : tier === 'Recorrente' ? 'bg-blue-400' : 'bg-stone-300'}`}
                                        style={{ width: `${(tierStats[tier].revenue / maxTierRevenue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#1A1A1A] p-6 rounded-sm shadow-xl flex flex-col justify-center border border-white/5 relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <div className="p-3 bg-white/5 rounded-sm border border-white/10">
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-1">Ticket Médio VIP</h4>
                            <p className="text-xl font-display text-white">
                                {formatCurrency(tierStats.VIP.revenue / (tierStats.VIP.count || 1))}
                            </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-sm border border-white/10">
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-1">Taxa de Retenção</h4>
                            <p className="text-xl font-display text-white">
                                {Math.round(((tierStats.VIP.count + tierStats.Recorrente.count) / (Object.keys(customerTiersMap).length || 1)) * 100)}%
                            </p>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Award size={80} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Stock Alerts & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alertar Itens - Functional Links */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-700 dark:text-stone-200 flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" size={14} /> Alerta de Estoque
                        </h3>
                        <button
                            onClick={() => navigate('/admin/inventory')}
                            className="text-[9px] uppercase font-bold text-stone-400 hover:text-brand-gold transition-colors"
                        >
                            Ver Todos
                        </button>
                    </div>

                    <div className="space-y-3">
                        {lowStock.length === 0 ? (
                            <div className="p-8 text-center text-stone-300 italic text-xs">
                                <CheckCircle2 size={24} className="mx-auto mb-2 opacity-50 text-emerald-500" />
                                Estoque saudável.
                            </div>
                        ) : (
                            lowStock.slice(0, 3).map(product => (
                                <div key={product.id} className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800 p-2 rounded-sm border-l-2 border-amber-500">
                                    <div className="w-10 h-10 bg-white rounded-sm overflow-hidden flex-shrink-0">
                                        <img src={product.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs text-stone-800 dark:text-stone-100 truncate">{product.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Esgotando</span>
                                            <span className="text-[8px] text-stone-400">SKU: {product.code || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-lg font-display font-medium text-stone-800 dark:text-stone-100">{product.stock}</span>
                                        <span className="text-[7px] font-bold text-stone-400 uppercase">Unidades</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                                        className="p-1 hover:bg-stone-200 rounded-full transition-colors"
                                    >
                                        <ArrowUpRight size={14} className="text-stone-400" />
                                    </button>
                                </div>
                            ))
                        )}
                        {lowStock.length > 3 && (
                            <button
                                onClick={() => navigate('/admin/inventory')}
                                className="w-full text-center text-[9px] text-stone-400 uppercase font-bold mt-2 hover:text-brand-gold py-1"
                            >
                                +{lowStock.length - 3} outros itens em alerta
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Shortcuts - Functional */}
                <div className="bg-[#2A3F54] text-white p-6 rounded-sm shadow-lg flex flex-col justify-between overflow-hidden relative group">
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Acesso Rápido</h3>
                        <p className="text-[10px] text-white/60 mb-6 max-w-xs">Gerencie suas vendas e produtos com agilidade.</p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => navigate('/admin/add-product')}
                                className="bg-white/5 hover:bg-brand-gold/90 text-white p-3 rounded-sm text-left transition-all duration-300 group/btn border border-white/5 hover:border-brand-gold transform hover:-translate-y-0.5"
                            >
                                <Package className="mb-2 text-brand-gold group-hover/btn:text-white transition-colors" size={18} />
                                <span className="block text-[9px] font-bold uppercase tracking-widest">Novo Produto</span>
                            </button>
                            <button
                                onClick={() => navigate('/admin/orders')}
                                className="bg-white/5 hover:bg-brand-gold/90 text-white p-3 rounded-sm text-left transition-all duration-300 group/btn border border-white/5 hover:border-brand-gold transform hover:-translate-y-0.5"
                            >
                                <Clock className="mb-2 text-brand-gold group-hover/btn:text-white transition-colors" size={18} />
                                <span className="block text-[9px] font-bold uppercase tracking-widest">Ver Pendentes</span>
                            </button>
                        </div>
                    </div>

                    {/* Decorative Blob */}
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl group-hover:bg-brand-gold/20 transition-all duration-700"></div>
                </div>
            </div>
        </div>
    );
}
