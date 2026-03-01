import { CreditCard, History, Star, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';
import { useBilling } from '../../features/billing/context/BillingContext';
import { useStore } from '../../features/store/context/StoreContext';

export function BillingDashboard() {
    const { subscription, loading, upgrade } = useBilling();
    const { settings } = useStore();

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Carregando dados financeiros...</span>
            </div>
        );
    }

    const isPro = settings.plan === 'pro' || subscription?.plan === 'pro';

    return (
        <div className="space-y-8 animate-fade-in-up max-w-6xl mx-auto pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 dark:border-stone-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 text-brand-gold mb-2">
                        <CreditCard size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestão Financeira</span>
                    </div>
                    <h1 className="text-4xl font-black text-stone-800 dark:text-stone-100 uppercase tracking-tighter leading-none">Assinatura & Cobrança</h1>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                        <History size={14} className="text-stone-300" /> Gerencie seu plano e histórico de pagamentos
                    </p>
                </div>
            </div>

            {/* Pricing / Plan Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`bg-white dark:bg-stone-900 rounded-3xl p-8 border-2 transition-all ${isPro ? 'border-brand-gold shadow-xl' : 'border-stone-100 dark:border-stone-800'} relative overflow-hidden`}>
                    {isPro && (
                        <div className="absolute top-0 right-0 bg-brand-gold text-white px-6 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={12} /> Plano Ativo
                        </div>
                    )}

                    <h3 className="text-2xl font-black text-stone-800 dark:text-stone-100 uppercase mb-2">
                        {isPro ? 'Plano Pro' : 'Plano Basic'}
                    </h3>
                    <p className="text-stone-500 text-sm mb-6">
                        {isPro
                            ? 'Acesso total a todas as ferramentas de evangelização digital.'
                            : 'Comece sua missão digital com o essencial.'}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-black text-stone-800 dark:text-stone-100">
                            {isPro ? 'R$ 49' : 'R$ 0'}
                        </span>
                        <span className="text-stone-400 font-bold uppercase text-[10px]">/mês</span>
                    </div>

                    <ul className="space-y-4 mb-10">
                        {[
                            { label: 'Produtos Ilimitados', active: true },
                            { label: 'Blog de Fé Ativo', active: isPro },
                            { label: 'Cupons de Desconto', active: isPro },
                            { label: 'Métricas em Tempo Real', active: isPro }
                        ].map((feat, i) => (
                            <li key={i} className={`flex items-center gap-3 text-xs font-bold ${feat.active ? 'text-stone-600 dark:text-stone-300' : 'text-stone-300 dark:text-stone-700'}`}>
                                <div className={`p-1 rounded-full ${feat.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-stone-100 dark:bg-stone-800 text-stone-300'}`}>
                                    <Star size={12} fill={feat.active ? 'currentColor' : 'none'} />
                                </div>
                                {feat.label}
                            </li>
                        ))}
                    </ul>

                    {!isPro ? (
                        <button
                            onClick={() => upgrade('pro')}
                            className="group relative w-full py-4 bg-brand-gold text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-brand-gold/20 hover:scale-[1.02] transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            Fazer Upgrade Agora
                        </button>
                    ) : (
                        <button className="w-full py-4 bg-stone-100 dark:bg-stone-800 text-stone-400 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                            Assinatura Ativa
                        </button>
                    )}
                </div>

                <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-3xl p-8 border border-dashed border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4 text-stone-300">
                        <TrendingUp size={32} />
                    </div>
                    <h4 className="text-lg font-black text-stone-800 dark:text-stone-100 uppercase mb-2">Métricas de Assinatura</h4>
                    <p className="text-xs text-stone-400 max-w-xs mb-6">Em breve: visualize o crescimento da sua loja e engajamento dos seus fiéis através de ferramentas avançadas.</p>
                    <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-brand-gold/30 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Plan Benefits Detailed Table */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm">
                <h3 className="text-xl font-black text-stone-800 dark:text-stone-100 uppercase mb-8 flex items-center gap-3">
                    <Star className="text-brand-gold" size={20} /> Comparativo de Recursos
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-stone-100 dark:border-stone-800">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Recurso</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Basic</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-gold text-center">Pro Premium</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
                            {[
                                { name: 'Painel de Vendas Primário', basic: true, pro: true },
                                { name: 'Gestão de Estoque', basic: true, pro: true },
                                { name: 'ChatBot de Atendimento AI', basic: 'Limitado', pro: 'Ilimitado' },
                                { name: 'Blog para Evangelização', basic: false, pro: true },
                                { name: 'Sistema de Cupons de Desconto', basic: false, pro: true },
                                { name: 'Relatórios de Métricas Avançados', basic: false, pro: true },
                                { name: 'Personalização Premium de SEO', basic: false, pro: true },
                            ].map((row, i) => (
                                <tr key={i} className="group hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                                    <td className="py-4 text-xs font-bold text-stone-600 dark:text-stone-400">{row.name}</td>
                                    <td className="py-4 text-center">
                                        {typeof row.basic === 'boolean' ? (
                                            row.basic ? <CheckCircle2 size={16} className="mx-auto text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-stone-200 dark:border-stone-700 mx-auto" icon-name="circle" />
                                        ) : <span className="text-[10px] font-black text-stone-400 uppercase">{row.basic}</span>}
                                    </td>
                                    <td className="py-4 text-center">
                                        {typeof row.pro === 'boolean' ? (
                                            row.pro ? <CheckCircle2 size={16} className="mx-auto text-brand-gold" /> : <div className="w-4 h-4 rounded-full border border-stone-200 dark:border-stone-700 mx-auto" icon-name="circle" />
                                        ) : <span className="text-[10px] font-black text-brand-gold uppercase">{row.pro}</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { q: 'Como funciona o cancelamento?', a: 'Você pode cancelar a qualquer momento sem taxas ocultas. Seu acesso Pro permanece até o fim do ciclo atual.' },
                    { q: 'Quais as formas de pagamento?', a: 'Aceitamos Cartão de Crédito e PIX através da segurança do Mercado Pago.' },
                    { q: 'Preciso configurar o domínio?', a: 'O Plano Pro inclui suporte para domínios personalizados para deixar sua loja ainda mais profissional.' }
                ].map((item, i) => (
                    <div key={i} className="space-y-2">
                        <h4 className="text-[10px] font-black text-stone-800 dark:text-stone-100 uppercase tracking-widest">{item.q}</h4>
                        <p className="text-[10px] font-bold text-stone-400 leading-relaxed uppercase">{item.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
