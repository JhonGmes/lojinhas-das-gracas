import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        const ok = await login(email, pass)

        if (ok) {
            navigate('/admin')
        } else {
            setError('Email ou senha inválidos')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900 font-sans">
            <div className="bg-white dark:bg-stone-800 p-12 rounded-2xl shadow-xl w-full max-w-md border border-stone-100 dark:border-stone-700">
                <div className="flex flex-col items-center mb-10">
                    <h1 className="text-xl font-display font-bold text-brand-wood dark:text-brand-gold uppercase tracking-wider mb-2">Área Admin</h1>
                    <div className="w-10 h-1 bg-brand-gold rounded-full"></div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-lg mb-8 text-center">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase mb-1">Modo Demo:</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">Email: admin@lojinha.com</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">Senha: admin</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full bg-transparent border border-stone-200 dark:border-stone-600 rounded-lg p-3 text-stone-800 dark:text-stone-200 focus:border-brand-gold outline-none transition-colors"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Senha</label>
                        <input
                            type="password"
                            className="w-full bg-transparent border border-stone-200 dark:border-stone-600 rounded-lg p-3 text-stone-800 dark:text-stone-200 focus:border-brand-gold outline-none transition-colors"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-brand-gold hover:bg-amber-600 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all uppercase text-sm tracking-wider"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}

