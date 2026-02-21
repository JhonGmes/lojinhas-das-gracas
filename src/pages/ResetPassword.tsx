import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSessionActive, setIsSessionActive] = useState(false);

    const { updatePassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Supabase extracts the token from the URL hash and sets the session automatically.
        // We just need to check if there's an active session after a brief moment or check the auth state.
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (data.session) {
                setIsSessionActive(true);
            } else if (error || !location.hash.includes('access_token')) {
                // Se não há sessão nem hash com token, o link é inválido ou expirou.
                setError('Link inválido ou expirado. Por favor, solicite a redefinição de senha novamente.');
            } else {
                // Aguarda o processamento do hash
                setTimeout(async () => {
                    const { data: updatedData } = await supabase.auth.getSession();
                    if (updatedData.session) setIsSessionActive(true);
                    else setError('Link inválido ou expirado. Por favor, solicite a redefinição de senha novamente.');
                }, 1000);
            }
        };

        checkSession();
    }, [location]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');

        const res = await updatePassword(password);
        if (res.success) {
            setSuccess('Senha atualizada com sucesso! Redirecionando para o login...');
            setTimeout(() => {
                // Fazer logout por precaução e ir pro login
                supabase.auth.signOut().then(() => {
                    navigate('/login');
                });
            }, 3000);
        } else {
            setError(res.message || 'Erro ao atualizar a senha. Tente novamente.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                <div className="p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-display text-stone-800 dark:text-stone-100">Atualizar Senha</h2>
                        <p className="text-sm text-stone-500 font-medium">Digite sua nova senha abaixo para acessar sua conta.</p>
                    </div>

                    {!isSessionActive && !error && (
                        <div className="flex flex-col items-center justify-center py-8 gap-4 text-stone-500">
                            <Loader2 className="animate-spin text-brand-gold" size={32} />
                            <p className="text-xs font-medium uppercase tracking-widest">Validando link seguro...</p>
                        </div>
                    )}

                    {!isSessionActive && error && (
                        <div className="space-y-6">
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 text-center">
                                {error}
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-[#2A3F54] hover:bg-[#34495E] text-white font-bold py-3 rounded-lg shadow-lg shadow-stone-200/50 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                            >
                                Voltar para o Login <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {isSessionActive && success && (
                        <div className="space-y-6">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 text-center">
                                {success}
                            </div>
                        </div>
                    )}

                    {isSessionActive && !success && (
                        <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fade-in">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">Nova Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-gold transition-colors" size={16} />
                                        <input
                                            required
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">Confirmar Nova Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-gold transition-colors" size={16} />
                                        <input
                                            required
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                            placeholder="Mínimo 6 caracteres"
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
                                className="w-full bg-brand-gold hover:bg-brand-amber text-brand-wood font-bold py-3 rounded-lg shadow-lg shadow-stone-200/50 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wide disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>Salvar Nova Senha <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
