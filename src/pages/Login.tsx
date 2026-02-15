import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lock, Mail, Loader2, Info, ArrowRight, Store } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [storeSettings, setStoreSettings] = useState<any>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.settings.get().then(setStoreSettings);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const ok = await login(email, pass);
            if (ok) {
                navigate('/admin');
            } else {
                setError('Credenciais inválidas.');
            }
        } catch (err) {
            setError('Erro ao autenticar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Side - Brand (Professional Dark Blue) */}
            <div className="hidden lg:flex w-5/12 bg-[#2A3F54] text-white relative overflow-hidden flex-col items-center justify-center p-12 text-center z-10">
                {/* Abstract Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-gold rounded-full mix-blend-overlay blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                        {storeSettings?.logo_url ? (
                            <img src={storeSettings.logo_url} className="w-20 h-20 object-contain rounded-xl" alt="Logo" />
                        ) : (
                            <Store size={48} className="text-brand-gold" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-display font-medium tracking-wide">
                            {storeSettings?.store_name || "Lojinha das Graças"}
                        </h1>
                        <p className="text-xs uppercase tracking-[0.3em] opacity-70">Portal Administrativo</p>
                    </div>

                    <p className="max-w-xs text-sm text-stone-300 leading-relaxed mt-4">
                        Gerencie seus produtos, pedidos e clientes com eficiência e beleza.
                    </p>
                </div>

                <div className="absolute bottom-8 text-[10px] text-white/30 uppercase tracking-widest">
                    Sistema de Gestão v2.0
                </div>
            </div>

            {/* Right Side - Login Form (Clean & Compact) */}
            <div className="w-full lg:w-7/12 flex items-center justify-center bg-white dark:bg-stone-950 p-8 relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Bem-vindo de volta</h2>
                        <p className="text-sm text-stone-500">Insira suas credenciais para acessar o painel.</p>
                    </div>

                    {/* Demo Alert Compact */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-lg flex gap-3 items-start">
                        <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wide">Acesso de Demonstração</p>
                            <div className="flex flex-wrap gap-3 text-xs text-amber-700 dark:text-amber-400">
                                <span>Email: <code className="bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900 font-mono text-stone-600 dark:text-stone-300">admin@lojinha.com</code></span>
                                <span>Senha: <code className="bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900 font-mono text-stone-600 dark:text-stone-300">admin</code></span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-gold transition-colors" size={16} />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">Senha</label>
                                    <a href="#" className="text-xs text-brand-gold hover:underline">Esqueceu a senha?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-gold transition-colors" size={16} />
                                    <input
                                        required
                                        type="password"
                                        value={pass}
                                        onChange={e => setPass(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2A3F54] hover:bg-[#34495E] text-white font-bold py-3 rounded-lg shadow-lg shadow-stone-200/50 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>Entrar no Sistema <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-stone-400">
                        Não consegue acessar? <span className="text-stone-600 font-semibold cursor-pointer underline">Contate o suporte</span>
                    </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 right-6 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
                >
                    Voltar à Loja &rarr;
                </button>
            </div>
        </div>
    );
}
