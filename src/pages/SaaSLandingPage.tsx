import { ArrowRight, Shield, Layout, Zap as ZapIcon, Smartphone, CheckCircle2, Star, BarChart3, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function SaaSLandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white dark:bg-stone-950 font-sans selection:bg-brand-gold/30 scroll-smooth">
            <SEO
                title="Lojinhas das Graças | Crie sua Loja de Artigos Religiosos"
                description="A plataforma definitiva para lojistas católicos. Crie sua loja virtual, gerencie pedidos pelo WhatsApp e conecte-se com seus clientes em minutos."
            />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-900">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="text-white dark:text-stone-900" size={20} />
                        </div>
                        <span className="font-display text-xl font-black uppercase tracking-tighter dark:text-white">Lojinhas das Graças</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-brand-gold transition-colors">Recursos</a>
                        <a href="#pricing" className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-brand-gold transition-colors">Preços</a>
                        <button
                            onClick={() => navigate('/admin-login')}
                            className="text-[10px] font-bold uppercase tracking-widest text-stone-900 dark:text-white"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/comecar')}
                            className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                        >
                            Criar Loja
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-20 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-stone-100 dark:bg-stone-900 px-4 py-2 rounded-full mb-8 border border-stone-200 dark:border-stone-800">
                        <Sparkles className="text-brand-gold" size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400">A plataforma #1 para Artigos Religiosos</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-display font-medium text-stone-900 dark:text-white uppercase tracking-tighter leading-[0.9] mb-8">
                        Sua fé merece um <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-500 to-brand-gold animate-gradient">Altar Digital</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-stone-500 dark:text-stone-400 text-lg md:text-xl font-light italic mb-12">
                        Transformamos o tradicional em digital. Crie sua própria "Lojinha das Graças" em menos de 5 minutos e comece a vender no WhatsApp hoje mesmo.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/comecar')}
                            className="w-full sm:w-auto bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                        >
                            Começar Agora Grátis <ArrowRight size={18} />
                        </button>
                        <a
                            href="#features"
                            className="w-full sm:w-auto px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 transition-all text-center"
                        >
                            Ver Recursos
                        </a>
                    </div>

                    <div className="mt-20 relative max-w-5xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-stone-950 via-transparent to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000"
                            alt="Dashboard Preview"
                            className="rounded-[2.5rem] shadow-2xl border border-stone-100 dark:border-stone-900 opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                        />
                    </div>
                </div>
            </section>

            {/* Metrics */}
            <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { label: 'Lojas Ativas', value: '150+' },
                        { label: 'Pedidos Realizados', value: '12k+' },
                        { label: 'Crescimento Médio', value: '45%' },
                        { label: 'Uptime Sistema', value: '99.9%' }
                    ].map((m, i) => (
                        <div key={i} className="text-center">
                            <p className="text-4xl font-display font-medium text-stone-900 dark:text-white mb-2">{m.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{m.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-brand-gold mb-4">Recursos Consagrados</h2>
                        <h3 className="text-4xl md:text-6xl font-display font-medium text-stone-900 dark:text-white uppercase tracking-tighter">Tudo o que você precisa <br />para prosperar na rede</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ZapIcon,
                                title: 'Configuração Instantânea',
                                desc: 'Sua loja está pronta assim que você termina o cadastro. Sem complicação técnica.'
                            },
                            {
                                icon: MessageCircle,
                                title: 'Venda no WhatsApp',
                                desc: 'Seu catálogo gera pedidos estruturados direto no seu WhatsApp, facilitando o fechamento.'
                            },
                            {
                                icon: Layout,
                                title: 'Design Impecável',
                                desc: 'Um visual que transmite paz e confiança, elevando o valor percebido dos seus produtos.'
                            },
                            {
                                icon: Smartphone,
                                title: 'Experiência Mobile',
                                desc: 'Navegação fluida e rápida para seus clientes comprarem de qualquer lugar.'
                            },
                            {
                                icon: BarChart3,
                                title: 'Métricas de Crescimento',
                                desc: 'Acompanhe suas vendas, visitantes e produtos mais desejados em tempo real.'
                            },
                            {
                                icon: Shield,
                                title: 'Seguridade Total',
                                desc: 'Isolamento de dados e backups automáticos para sua tranquilidade e dos seus clientes.'
                            }
                        ].map((f, i) => (
                            <div key={i} className="group p-10 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 hover:border-brand-gold/30 transition-all hover:shadow-2xl shadow-stone-200/50">
                                <div className="w-14 h-14 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-400 group-hover:text-brand-gold transition-colors mb-6">
                                    <f.icon size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-stone-900 dark:text-white mb-4">{f.title}</h4>
                                <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-light italic">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 px-6 bg-stone-950 text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold rounded-full blur-[150px]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-brand-gold mb-4">Planos & Investimento</h2>
                        <h3 className="text-4xl md:text-6xl font-display font-medium uppercase tracking-tighter">Escolha como <br />Expandir sua Missão</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Plan Basic */}
                        <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 hover:border-white/20 transition-all">
                            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-2">Plano Basic</h4>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-display font-medium">R$ 0</span>
                                <span className="text-stone-500 text-sm">/mês</span>
                            </div>
                            <ul className="space-y-4 mb-12">
                                {[
                                    'Catálogo de até 30 produtos',
                                    'Pedidos ilimitados no WhatsApp',
                                    'Subdomínio lojinhasdasgracas.com',
                                    'Suporte via ticket',
                                    'Wishlist básica'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-stone-300 font-light italic">
                                        <CheckCircle2 size={16} className="text-brand-gold" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate('/comecar')}
                                className="w-full py-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-xs transition-all"
                            >
                                Começar Grátis
                            </button>
                        </div>

                        {/* Plan Pro */}
                        <div className="bg-white dark:bg-stone-50 p-12 rounded-[3rem] border-4 border-brand-gold relative">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-gold text-stone-900 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">
                                Mais Popular
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-2">Plano Pro</h4>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-display font-medium text-stone-900">R$ 49</span>
                                <span className="text-stone-400 text-sm">/mês</span>
                            </div>
                            <ul className="space-y-4 mb-12">
                                {[
                                    'Produtos ilimitados',
                                    'Módulo de Blog integrado',
                                    'Cupons de Desconto',
                                    'Métricas Avançadas',
                                    'Suporte prioritário WhatsApp',
                                    'Badge de Verificado'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-stone-600 font-light italic">
                                        <CheckCircle2 size={16} className="text-brand-gold" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate('/comecar')}
                                className="w-full py-5 rounded-2xl bg-stone-900 text-white font-bold uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                            >
                                Assinar Pro <Star size={16} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Mini */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-3xl font-display font-medium text-stone-900 dark:text-white uppercase tracking-tighter text-center mb-16">Dúvidas Frequentes</h3>
                    <div className="space-y-8">
                        {[
                            { q: 'Preciso de CNPJ para começar?', a: 'Não. Você pode começar como pessoa física e profissionalizar seu negócio gradualmente.' },
                            { q: 'Como recebo pelos pedidos?', a: 'Os pedidos chegam estruturados no seu WhatsApp. Você combina o pagamento direto com o cliente (PIX, Link de Cartão, etc).' },
                            { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem contratos de fidelidade ou multas. Você tem total controle.' }
                        ].map((faq, i) => (
                            <div key={i} className="border-b border-stone-100 dark:border-stone-900 pb-8">
                                <h4 className="text-lg font-bold text-stone-800 dark:text-white mb-3">{faq.q}</h4>
                                <p className="text-stone-500 dark:text-stone-400 font-light italic">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-50 dark:bg-stone-900/30 border-t border-stone-100 dark:border-stone-900 py-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="text-brand-gold" size={24} />
                        <span className="font-display text-2xl font-black uppercase tracking-tighter dark:text-white">Lojinhas das Graças</span>
                    </div>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.4em] max-w-lg mb-12">
                        Elevando o comércio através da fé e da tecnologia.
                    </p>
                    <div className="flex gap-8 mb-12">
                        <a href="#" className="text-stone-400 hover:text-brand-gold text-[10px] font-bold uppercase tracking-widest transition-colors">Instagram</a>
                        <a href="#" className="text-stone-400 hover:text-brand-gold text-[10px] font-bold uppercase tracking-widest transition-colors">Termos</a>
                        <a href="#" className="text-stone-400 hover:text-brand-gold text-[10px] font-bold uppercase tracking-widest transition-colors">Suporte</a>
                    </div>
                    <p className="text-stone-300 dark:text-stone-600 text-[10px] uppercase font-medium tracking-widest">
                        &copy; 2026 Lojinhas das Graças. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}

const Sparkles = ({ className, size }: { className?: string, size?: number }) => (
    <ZapIcon className={className} size={size} />
);
