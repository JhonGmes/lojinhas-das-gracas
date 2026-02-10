import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Sparkles, ArrowRight } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const ok = await login(email, pass);
            if (ok) {
                navigate('/admin');
            } else {
                setError('As credenciais informadas não coincidem com nossos registros sagrados.');
            }
        } catch (err) {
            setError('Ocorreu um erro ao tentar acessar o templo administrativo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cotton dark:bg-stone-950 p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-[480px] animate-fade-in-up relative z-10">
                <div className="bg-white dark:bg-stone-900 rounded-sm shadow-soft-lg border border-brand-cotton-dark dark:border-stone-800 overflow-hidden">
                    {/* Header */}
                    <div className="p-12 pb-8 text-center border-b border-brand-cotton-dark dark:border-stone-800/50 bg-stone-50/50 dark:bg-stone-900/50">
                        <div className="inline-flex p-4 bg-white dark:bg-stone-800 rounded-sm shadow-soft border border-brand-cotton-dark dark:border-stone-700 mb-6">
                            <Sparkles className="text-brand-gold" size={32} />
                        </div>
                        <h1 className="text-4xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-[0.2em] mb-2 leading-tight">Admin</h1>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">Portal de Gestão Lojinha das Graças</p>
                    </div>

                    <div className="p-12 space-y-10">
                        {/* Demo Box */}
                        <div className="bg-brand-cotton dark:bg-stone-950 border border-brand-gold/20 p-6 rounded-sm space-y-3 relative group">
                            <div className="absolute -top-3 left-6 px-3 bg-brand-gold text-brand-wood text-[9px] font-black uppercase tracking-widest rounded-sm">Acesso de Demonstração</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Identificador</p>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">admin@lojinha.com</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Chave Secreta</p>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">admin</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-brand-gold transition-colors">E-mail Administrativo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-brand-gold transition-colors" size={18} />
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm pl-12 pr-4 py-4 text-sm focus:border-brand-gold outline-none transition-all shadow-inner-soft placeholder:text-stone-300"
                                            placeholder="exemplo@graças.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-brand-gold transition-colors">Senha de Acesso</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-brand-gold transition-colors" size={18} />
                                        <input
                                            required
                                            type="password"
                                            className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-800 rounded-sm pl-12 pr-4 py-4 text-sm focus:border-brand-gold outline-none transition-all shadow-inner-soft placeholder:text-stone-300"
                                            placeholder="••••••••"
                                            value={pass}
                                            onChange={e => setPass(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 animate-shake">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-gold text-brand-wood font-black py-5 rounded-sm shadow-soft-lg hover:bg-brand-gold-light transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.3em] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>Acessar o Painel <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-bold">Lojinha das Graças © 2026</p>
                    <div className="h-px w-12 bg-brand-gold/30 mx-auto" />
                    <button
                        onClick={() => navigate('/')}
                        className="text-[10px] text-brand-gold hover:text-brand-brown transition-colors uppercase tracking-[0.2em] font-black"
                    >
                        Voltar para a Loja
                    </button>
                </div>
            </div>
        </div>
    );
}
