import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { KeyRound, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { updatePassword, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await updatePassword(password);
            if (res.success) {
                setSuccess('Sua senha foi atualizada com sucesso!');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(res.message || 'Erro ao atualizar a senha. Tente novamente.');
            }
        } catch (err: any) {
            setError('Ocorreu um erro inesperado. Tente novamente em breve.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-stone-200/50 p-8 border border-stone-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gold/10 rounded-full mb-4">
                        <KeyRound className="w-8 h-8 text-brand-gold" />
                    </div>
                    <h1 className="text-2xl font-black text-stone-900 mb-2 font-serif">Nova Senha</h1>
                    <p className="text-stone-500">Escolha uma senha forte para sua conta</p>
                </div>

                {success ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-emerald-900 mb-2">{success}</h2>
                        <p className="text-emerald-700 text-sm mb-4">Você será redirecionado em instantes...</p>
                        <Link
                            to="/login"
                            className="text-emerald-600 font-bold text-sm hover:underline"
                        >
                            Ir para o login agora
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-stone-900 uppercase tracking-widest mb-2">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <p className="mt-1.5 text-[10px] text-stone-400">
                                    Mínimo de 6 caracteres
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-stone-900 uppercase tracking-widest mb-2">
                                    Confirmar Senha
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-gold text-white font-black py-4 rounded-xl shadow-lg shadow-brand-gold/20 hover:bg-brand-gold-dark transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                'ATUALIZAR SENHA'
                            )}
                        </button>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-stone-400 hover:text-stone-900 transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar para o login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
