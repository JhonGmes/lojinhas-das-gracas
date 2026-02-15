import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useProducts } from '../../context/ProductContext';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, DollarSign, Package, AlertTriangle, ArrowUpRight, Clock, User, ArrowUp } from 'lucide-react';

export function Dashboard() {
    const { products } = useProducts();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

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

    const maxVal = Math.max(...chartData.map(d => d.total), 100);

    // Smooth Curve Generator (Simple Catmull-Rom or Quadratic approximation)
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
            <div className="animate-pulse text-brand-gold tracking-[0.3em] font-display text-xl uppercase">Carregando Resultados...</div>
        </div>
    );

    return (
        <div className="animate-fade-in-up pb-10 space-y-10">
            {/* Header Clean */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-xl font-display font-medium text-stone-700 dark:text-stone-200 uppercase tracking-widest">Resumo Executivo</h1>
                    <p className="text-stone-400 text-xs mt-1">Visão geral do desempenho em tempo real</p>
                </div>
                <div className="text-xs text-stone-400 font-mono">
                    Atualizado: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Top Stats Bar - Gentelella Style (Clean Row) */}
            <div className="bg-white dark:bg-stone-900 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-stone-100 dark:divide-stone-800">

                    {/* Stat 1 */}
                    <div className="px-4 flex flex-col items-center justify-center gap-2 group">
                        <div className="flex items-center gap-2 text-stone-400 uppercase text-[10px] font-bold tracking-widest">
                            <TrendingUp size={14} /> Vendas Hoje
                        </div>
                        <div className="text-4xl font-display font-medium text-stone-700 dark:text-stone-100 group-hover:text-brand-gold transition-colors">
                            {formatCurrency(salesToday)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ArrowUp size={10} /> 12% Semana Anterior
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="px-4 flex flex-col items-center justify-center gap-2 group">
                        <div className="flex items-center gap-2 text-stone-400 uppercase text-[10px] font-bold tracking-widest">
                            <DollarSign size={14} /> Faturamento Mês
                        </div>
                        <div className="text-4xl font-display font-medium text-stone-700 dark:text-stone-100 group-hover:text-brand-gold transition-colors">
                            {formatCurrency(salesMonth)}
                        </div>
                        <div className="text-[10px] font-bold text-stone-300">
                            Meta: R$ 5k
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="px-4 flex flex-col items-center justify-center gap-2 group">
                        <div className="flex items-center gap-2 text-stone-400 uppercase text-[10px] font-bold tracking-widest">
                            <User size={14} /> Novos Clientes
                        </div>
                        <div className="text-4xl font-display font-medium text-stone-700 dark:text-stone-100 group-hover:text-brand-gold transition-colors">
                            12
                        </div>
                        <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                            <ArrowUp size={10} /> 3 hoje
                        </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="px-4 flex flex-col items-center justify-center gap-2 group">
                        <div className="flex items-center gap-2 text-stone-400 uppercase text-[10px] font-bold tracking-widest">
                            <Clock size={14} /> Pedidos Pendentes
                        </div>
                        <div className={`text-4xl font-display font-medium transition-colors ${pendingOrders.length > 5 ? 'text-amber-500' : 'text-stone-700 dark:text-stone-100'}`}>
                            {pendingOrders.length}
                        </div>
                        <div className="text-[10px] text-stone-400 italic">
                            Aguardando confirmação
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Chart Section - Full Width & Clean */}
            <div className="bg-white dark:bg-stone-900 p-8 rounded-sm shadow-lg border border-stone-100 dark:border-stone-800 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h3 className="text-lg font-display uppercase tracking-widest text-stone-700 dark:text-stone-200">
                            Performance de Vendas
                        </h3>
                        <p className="text-xs text-stone-400 mt-1">Comparativo dos últimos 7 dias</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Vendas Confirmadas
                        </div>
                    </div>
                </div>

                {/* SVG Area Chart */}
                <div className="h-80 w-full relative">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Grid Lines */}
                        <line x1="0" y1="20" x2="100" y2="20" className="stroke-stone-100 dark:stroke-stone-800" strokeWidth="0.5" strokeDasharray="2" />
                        <line x1="0" y1="40" x2="100" y2="40" className="stroke-stone-100 dark:stroke-stone-800" strokeWidth="0.5" strokeDasharray="2" />
                        <line x1="0" y1="60" x2="100" y2="60" className="stroke-stone-100 dark:stroke-stone-800" strokeWidth="0.5" strokeDasharray="2" />
                        <line x1="0" y1="80" x2="100" y2="80" className="stroke-stone-100 dark:stroke-stone-800" strokeWidth="0.5" strokeDasharray="2" />

                        {/* Area Fill */}
                        <path d={fillPathD} fill="url(#chartGradient)" className="transition-all duration-1000 ease-out" />

                        {/* Line Stroke */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2" // Thicker line
                            strokeLinecap="round"
                            className="drop-shadow-sm transition-all duration-1000 ease-out"
                        />

                        {/* Interactive Points */}
                        {points.map((p, i) => (
                            <g key={i} className="group/point hover:scale-125 transition-transform origin-center cursor-pointer">
                                <circle cx={p.x} cy={p.y} r="2" className="fill-white stroke-emerald-500 stroke-2" />
                                <foreignObject x={p.x - 10} y={p.y - 12} width="20" height="20" className="opacity-0 group-hover/point:opacity-100 transition-opacity">
                                    <div className="bg-stone-800 text-white text-[8px] rounded px-1 py-0.5 text-center shadow-lg -translate-x-1/2">
                                        R${chartData[i].total}
                                    </div>
                                </foreignObject>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Horizontal Axis Labels */}
                <div className="flex justify-between text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-4">
                    {chartData.map((d, i) => (
                        <div key={i} className="text-center w-8">
                            {new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Section: Stock Alerts & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alertar Itens (Movido para baixo) */}
                <div className="bg-white dark:bg-stone-900 p-8 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-700 dark:text-stone-200 flex items-center gap-3">
                            <AlertTriangle className="text-amber-500" size={16} /> Alerta de Estoque
                        </h3>
                        <button className="text-[10px] uppercase font-bold text-stone-400 hover:text-brand-gold">Ver Todos</button>
                    </div>

                    <div className="space-y-4">
                        {lowStock.length === 0 ? (
                            <div className="p-8 text-center text-stone-300 italic text-xs">
                                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50 text-emerald-500" />
                                Estoque saudável.
                            </div>
                        ) : (
                            lowStock.slice(0, 3).map(product => (
                                <div key={product.id} className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800 p-3 rounded-sm border-l-4 border-amber-500">
                                    <div className="w-12 h-12 bg-white rounded-sm overflow-hidden flex-shrink-0">
                                        <img src={product.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-stone-800 dark:text-stone-100 truncate">{product.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Esgotando</span>
                                            <span className="text-[10px] text-stone-400">SKU: {product.code || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xl font-display font-medium text-stone-800 dark:text-stone-100">{product.stock}</span>
                                        <span className="text-[8px] font-bold text-stone-400 uppercase">Unidades</span>
                                    </div>
                                    <ArrowUpRight size={14} className="text-stone-300" />
                                </div>
                            ))
                        )}
                        {lowStock.length > 3 && (
                            <p className="text-center text-[10px] text-stone-400 uppercase font-bold mt-2">
                                +{lowStock.length - 3} outros itens em alerta
                            </p>
                        )}
                    </div>
                </div>

                {/* Quick Shortcuts (Opcional, para preencher o grid) */}
                <div className="bg-brand-wood text-white p-8 rounded-sm shadow-lg flex flex-col justify-between overflow-hidden relative group">
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-2">Acesso Rápido</h3>
                        <p className="text-xs text-white/60 mb-8 max-w-xs">Gerencie suas vendas e produtos com agilidade.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-white/10 hover:bg-brand-gold text-white p-4 rounded-sm text-left transition-all duration-300 group/btn">
                                <Package className="mb-2 text-brand-gold group-hover/btn:text-white" size={20} />
                                <span className="block text-[10px] font-bold uppercase tracking-widest">Novo Produto</span>
                            </button>
                            <button className="bg-white/10 hover:bg-brand-gold text-white p-4 rounded-sm text-left transition-all duration-300 group/btn">
                                <Clock className="mb-2 text-brand-gold group-hover/btn:text-white" size={20} />
                                <span className="block text-[10px] font-bold uppercase tracking-widest">Ver Pendentes</span>
                            </button>
                        </div>
                    </div>

                    {/* Decorative Blob */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-gold/20 rounded-full blur-3xl group-hover:bg-brand-gold/30 transition-all duration-700"></div>
                </div>
            </div>
        </div>
    );
}

// Helpers
function CheckCircle2({ size, className }: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>;
}
