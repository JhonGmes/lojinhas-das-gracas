import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useProducts } from '../../context/ProductContext';
import type { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, DollarSign, Package, AlertTriangle, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';

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
    const points = chartData.map((d, i) => {
        const x = (i / 6) * 100;
        const y = 90 - ((d.total / maxVal) * 80); // Leave some margin
        return `${x},${y}`;
    }).join(' ');

    const polyPoints = `0,100 ${points} 100,100`;

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-brand-gold tracking-[0.3em] font-display text-xl uppercase">Carregando Resultados...</div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in-up pb-10">
            <header>
                <h1 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-widest">Resumo Executivo</h1>
                <p className="text-stone-400 font-medium mt-2 text-sm">Visão geral do desempenho e saúde da sua loja sagrada.</p>
            </header>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Vendas Hoje"
                    value={formatCurrency(salesToday)}
                    icon={<TrendingUp className="text-emerald-500" />}
                    subtitle="Apenas pedidos confirmados"
                    trend="+12%"
                />
                <StatCard
                    title="Faturamento Mês"
                    value={formatCurrency(salesMonth)}
                    icon={<DollarSign className="text-brand-gold" />}
                    subtitle="Mês vigente"
                />
                <StatCard
                    title="Pedidos Pendentes"
                    value={pendingOrders.length.toString()}
                    icon={<Clock className="text-amber-500" />}
                    subtitle="Aguardando confirmação"
                    alert={pendingOrders.length > 5}
                />
                <StatCard
                    title="Itens em Estoque"
                    value={products.length.toString()}
                    icon={<Package className="text-stone-400" />}
                    subtitle={`${promoProducts.length} em promoção`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Performance Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-800 p-10 rounded-sm shadow-soft border border-brand-cotton-dark dark:border-stone-700">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="font-display text-xl font-medium uppercase tracking-widest text-stone-800 dark:text-stone-100">Performance de Vendas (7 Dias)</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase tracking-tighter">
                            <ArrowUpRight size={14} /> Crescimento Saudável
                        </div>
                    </div>

                    <div className="relative h-72 w-full mt-6">
                        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* Grid lines - Horizontal */}
                            {[0, 25, 50, 75, 100].map(val => (
                                <line key={val} x1="0" y1={val} x2="100" y2={val} stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5" />
                            ))}

                            {/* Area Gradient */}
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                            </linearGradient>

                            {/* Area */}
                            <polygon points={polyPoints} fill="url(#chartGradient)" />

                            {/* Line */}
                            <polyline points={points} fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Data Points */}
                            {chartData.map((d, i) => {
                                const x = (i / 6) * 100;
                                const y = 90 - ((d.total / maxVal) * 80);
                                return (
                                    <g key={i} className="group/dot">
                                        <circle cx={x} cy={y} r="1.5" className="fill-brand-gold stroke-white dark:stroke-stone-800 stroke-[1.5] group-hover/dot:r-2 transition-all cursor-pointer shadow-lg" />
                                        <text x={x} y={y - 5} textAnchor="middle" className="text-[3px] font-bold fill-stone-400 opacity-0 group-hover/dot:opacity-100 transition-opacity">
                                            {formatCurrency(d.total)}
                                        </text>
                                    </g>
                                )
                            })}
                        </svg>

                        <div className="flex justify-between mt-8">
                            {chartData.map(d => (
                                <div key={d.date} className="text-center">
                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                                        {new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                                    </div>
                                    <div className="text-[8px] text-stone-300 font-medium">
                                        {d.date.slice(8)}/{d.date.slice(5, 7)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stock Alerts Column */}
                <div className="bg-white dark:bg-stone-800 p-10 rounded-sm shadow-soft border border-brand-cotton-dark dark:border-stone-700 flex flex-col">
                    <h3 className="font-display text-xl font-medium uppercase tracking-widest text-stone-800 dark:text-stone-100 mb-8 flex items-center gap-3">
                        <AlertTriangle className="text-brand-gold" size={20} /> Alertar Itens
                    </h3>

                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        {lowStock.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-stone-300 text-center">
                                <CheckCircle2 size={48} className="mb-4 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Estoque Impecável</p>
                                <p className="text-[10px] mt-1 opacity-60">Todos os produtos estão com níveis saudáveis.</p>
                            </div>
                        ) : (
                            lowStock.map(p => (
                                <div key={p.id} className="flex items-center gap-5 group hover:bg-stone-50 dark:hover:bg-stone-900/50 p-2 rounded-lg transition-colors">
                                    <div className="w-14 h-14 bg-brand-cotton dark:bg-stone-900 rounded-sm overflow-hidden border border-brand-cotton-dark dark:border-stone-700">
                                        <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-stone-800 dark:text-stone-200 line-clamp-1">{p.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-[10px] text-red-500 font-black uppercase tracking-widest">
                                                {p.stock === 0 ? 'Esgotado' : `${p.stock} Unidades`}
                                            </div>
                                            <div className="h-1 w-1 rounded-full bg-stone-300" />
                                            <div className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">SKU: {p.code || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <button className="text-brand-gold hover:text-brand-gold-light p-1">
                                        <ArrowUpRight size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <button className="w-full mt-8 py-4 bg-brand-cotton dark:bg-stone-900 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-brand-gold transition-colors border border-brand-cotton-dark dark:border-stone-700 rounded-sm shadow-soft-sm">
                        Ver Inventário Completo
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subtitle, trend, alert }: { title: string, value: string, icon: React.ReactNode, subtitle?: string, trend?: string, alert?: boolean }) {
    return (
        <div className={`bg-white dark:bg-stone-800 p-8 rounded-sm shadow-soft border ${alert ? 'border-red-100 dark:border-red-900/30 ring-1 ring-red-50' : 'border-brand-cotton-dark dark:border-stone-700'} relative overflow-hidden group hover:-translate-y-1 transition-all duration-400`}>
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-stone-50 dark:bg-stone-900/50 rounded-sm shadow-inner-soft group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-tighter">
                        {trend} <ArrowUpRight size={12} />
                    </span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <h3 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100">{value}</h3>
                {subtitle && <p className="text-[10px] text-stone-400 font-medium italic mt-2 opacity-60">{subtitle}</p>}
            </div>
            {/* Subtle decorative background element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl group-hover:bg-brand-gold/10 transition-all duration-500" />
        </div>
    );
}
