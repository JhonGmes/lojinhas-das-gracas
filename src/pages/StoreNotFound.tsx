import { Link } from 'react-router-dom';
import { Store, ArrowLeft, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export function StoreNotFound() {
    return (
        <div className="min-h-screen bg-brand-cotton flex items-center justify-center p-4">
            <Helmet>
                <title>Loja Não Encontrada - Lojinha das Graças</title>
            </Helmet>

            <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-stone-100 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Store size={40} className="text-brand-gold" />
                </div>

                <h1 className="text-3xl font-display font-medium text-stone-800 mb-4 uppercase tracking-tight">
                    Ops! Onde está sua loja?
                </h1>

                <p className="text-stone-500 mb-8 text-sm leading-relaxed">
                    Não conseguimos identificar a loja que você está tentando acessar.
                    Isso pode acontecer se o link estiver incorreto ou se a loja ainda não foi configurada.
                </p>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-3 bg-stone-800 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-gold hover:text-brand-wood transition-all active:scale-95 shadow-xl"
                    >
                        <ArrowLeft size={18} />
                        Voltar para o Início
                    </Link>

                    <a
                        href="https://wa.me/5598984095956"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-100 text-stone-600 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-all active:scale-95"
                    >
                        <HelpCircle size={18} />
                        Precisa de Ajuda?
                    </a>
                </div>

                <p className="mt-12 text-[10px] text-stone-300 font-bold uppercase tracking-[0.3em]">
                    Lojinha das Graças SaaS
                </p>
            </div>
        </div>
    );
}
