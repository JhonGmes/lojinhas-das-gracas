import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
    whatsappNumber?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary] Erro capturado:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            const whatsapp = this.props.whatsappNumber || '5598984095956';
            const message = encodeURIComponent('Olá! Encontrei um problema no site e preciso de ajuda.');

            return (
                <div className="min-h-screen bg-brand-cotton flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                            <AlertTriangle size={36} className="text-red-400" />
                        </div>

                        {/* Text */}
                        <div className="space-y-3">
                            <h1 className="font-display text-xl font-black text-stone-800 uppercase tracking-tight">
                                Ops! Algo deu errado
                            </h1>
                            <p className="text-sm text-stone-500 leading-relaxed">
                                Uma página não carregou como esperado. Não se preocupe — seus dados estão seguros.
                            </p>
                            {this.state.error?.message && (
                                <p className="text-[10px] font-mono bg-stone-100 text-stone-400 px-3 py-2 rounded-sm text-left truncate">
                                    {this.state.error.message}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="flex items-center justify-center gap-2 w-full bg-brand-gold text-brand-wood py-3 rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-brand-wood hover:text-white transition-all"
                            >
                                <RefreshCw size={14} />
                                Tentar Novamente
                            </button>
                            <button
                                onClick={() => { window.location.href = '/'; }}
                                className="flex items-center justify-center gap-2 w-full border border-stone-200 text-stone-600 py-3 rounded-sm font-black text-[11px] uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all"
                            >
                                <Home size={14} />
                                Voltar à Loja
                            </button>
                            <a
                                href={`https://wa.me/${whatsapp}?text=${message}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full text-green-600 py-2 font-bold text-[10px] uppercase tracking-widest hover:text-green-700 transition-colors"
                            >
                                <MessageCircle size={14} />
                                Falar com o Suporte
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
