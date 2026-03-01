import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../features/store/context/StoreContext';
import { formatCurrency } from '../../lib/utils';
import {
    TrendingUp, ShoppingBag, Users, DollarSign,
    Calendar, ArrowUpRight, ArrowDownRight,
    Search, Filter, ChevronRight, PieChart, BarChart3, LineChart
} from 'lucide-react';

export function Metrics() {
    const { currentStoreId } = useStore();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        const fetchMetricsData = async () => {
            if (!currentStoreId) return;
            setLoading(true);
            try {
                const ordersData = await api.orders.list(currentStoreId);
                setOrders(ordersData);
            } catch (err) {
                console.error('Erro ao carregar métricas:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetricsData();
    }, [currentStoreId]);

    // Simple aggregation for demonstration
    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // In a real scenario, this would be computed by dates
    const growth = {
        revenue: "+15.2%",
        orders: "+8.4%",
        customers: "+12.1%"
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest flex items-center gap-2">
                        <LineChart size={16} className="text-brand-gold" />
                        Métricas Avançadas
                    </h1>
                    <p className="text-[10px] text-stone-400 mt-0.5">Análise profunda do desempenho da sua loja</p>
                </div>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${timeframe === t
                                    ? 'bg-brand-gold text-white shadow-sm'
                                    : 'bg-white dark:bg-stone-800 text-stone-400 hover:text-stone-600 border border-stone-100 dark:border-stone-700'
                                }`}
                        >
                            {t === '7d' ? '7 Dias' : t === '30d' ? '30 Dias' : '90 Dias'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stone-900 p-5 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={48} className="text-stone-900 dark:text-white" />
                    </div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Faturamento Total</div>
                    <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">{formatCurrency(totalRevenue)}</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-1.5 py-0.5 rounded w-fit">
                        <TrendingUp size={10} /> {growth.revenue}
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-5 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShoppingBag size={48} className="text-stone-900 dark:text-white" />
                    </div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Total de Pedidos</div>
                    <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">{totalOrders}</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-1.5 py-0.5 rounded w-fit">
                        <TrendingUp size={10} /> {growth.orders}
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-5 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={48} className="text-stone-900 dark:text-white" />
                    </div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Ticket Médio</div>
                    <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">{formatCurrency(avgOrderValue)}</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400 bg-stone-50 dark:bg-stone-800 px-1.5 py-0.5 rounded w-fit">
                        Estável
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-5 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={48} className="text-stone-900 dark:text-white" />
                    </div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Taxa de Conversão</div>
                    <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">3.8%</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-1.5 py-0.5 rounded w-fit">
                        <ArrowUpRight size={10} /> +0.5%
                    </div>
                </div>
            </div>

            {/* Placeholder for Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 size={14} className="text-brand-gold" /> Vendas por Dia
                    </h3>
                    <div className="h-64 flex items-end gap-2 pb-4">
                        {[40, 60, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 bg-brand-gold/20 hover:bg-brand-gold/40 transition-all rounded-t-sm relative group" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {formatCurrency(h * 150)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-stone-300 uppercase tracking-tighter px-2">
                        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-6 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <PieChart size={14} className="text-brand-gold" /> Categorias mais Vendidas
                    </h3>
                    <div className="flex items-center justify-around h-64">
                        <div className="w-40 h-40 rounded-full border-[12px] border-brand-gold relative flex items-center justify-center">
                            <div className="text-center">
                                <span className="block text-xl font-bold text-stone-700 dark:text-stone-200">45%</span>
                                <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Acessórios</span>
                            </div>
                            <div className="absolute inset-0 rounded-full border-[12px] border-stone-100 dark:border-stone-800 border-t-transparent border-r-transparent rotate-45 pointer-events-none"></div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Acessórios', val: '45%', color: 'bg-brand-gold' },
                                { label: 'Livros', val: '25%', color: 'bg-emerald-500' },
                                { label: 'Decoração', val: '20%', color: 'bg-blue-500' },
                                { label: 'Outros', val: '10%', color: 'bg-stone-300' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-stone-700 dark:text-stone-200">{item.label}</span>
                                        <span className="text-[8px] text-stone-400">{item.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-brand-wood dark:bg-stone-900/50 p-6 rounded-sm border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h3 className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles size={14} /> Insights da Gracinh IA
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-sm">
                        <p className="text-xs text-stone-300 leading-relaxed italic">
                            "A Paz, Jhon! Notei que seus clientes VIPs estão comprando 30% mais nos fins de semana. Que tal criar um cupom de 'Frete Grátis Abençoado' para envios no Sábado?"
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-sm">
                        <p className="text-xs text-stone-300 leading-relaxed italic">
                            "Bom dia! A categoria de 'Pulseiras' teve um pico de buscas ontem após o post no blog. Verifique se o estoque está preparado para a alta demanda da semana!"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
