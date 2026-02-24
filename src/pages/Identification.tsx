import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { User, UserPlus, ArrowRight, Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

export function Identification() {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPass, setRegisterPass] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerPhone, setRegisterPhone] = useState('');
    const [registerStreet, setRegisterStreet] = useState('');
    const [registerNumber, setRegisterNumber] = useState('');
    const [registerComplement, setRegisterComplement] = useState('');
    const [registerNeighborhood, setRegisterNeighborhood] = useState('');
    const [registerCity, setRegisterCity] = useState('');
    const [registerState, setRegisterState] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signUp, resetPassword, user } = useAuth();
    const { currentStoreId } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect path from query params, default to '/'
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/';

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate(redirectPath);
            }
        }
    }, [user, navigate, redirectPath]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(''); // Clear success message on new attempt
        const ok = await login(loginEmail, loginPass);
        if (ok) {
            navigate(redirectPath);
        } else {
            setError('E-mail ou senha incorretos.');
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registerPass.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess(''); // Clear success message on new attempt
        // Concatenate address fields
        const fullAddress = `${registerStreet}, ${registerNumber}${registerComplement ? ', ' + registerComplement : ''}, ${registerNeighborhood}, ${registerCity} - ${registerState}`;

        console.log('🔍 [DEBUG] Tentando cadastrar:', {
            email: registerEmail,
            name: registerName,
            whatsapp: registerPhone,
            address: fullAddress
        });

        const res = await signUp({
            email: registerEmail,
            pass: registerPass,
            name: registerName,
            whatsapp: registerPhone,
            address: fullAddress,
            storeId: currentStoreId,
            customer_address_street: registerStreet,
            customer_address_number: registerNumber,
            customer_address_neighborhood: registerNeighborhood,
            customer_address_city: registerCity,
            customer_address_state: registerState,
            customer_address_complement: registerComplement
        });

        console.log('✅ [DEBUG] Resultado do signUp:', res);

        if (res.success) {
            setSuccess('Cadastro concluído com sucesso!');
            // Se o Supabase estiver configurado para não confirmar e-mail,
            // o setContext já terá logado o usuário e o useEffect acima redirecionará.
            setRegisterEmail('');
            setRegisterPass('');
            setRegisterName('');
            setRegisterPhone('');
            setRegisterStreet('');
            setRegisterNumber('');
            setRegisterComplement('');
            setRegisterNeighborhood('');
            setRegisterCity('');
            setRegisterState('');
        } else {
            setError(res.message || 'Erro ao realizar cadastro.');
            console.error('❌ [DEBUG] Erro no cadastro:', res.message);
        }
        setLoading(false);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(''); // Clear success message on new attempt
        const res = await resetPassword(resetEmail);
        if (res.success) {
            setSuccess('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
            setTimeout(() => setShowResetPassword(false), 3000);
        } else {
            setError(res.message || 'Erro ao enviar e-mail de redefinição.');
        }
        setLoading(false);
    };

    const translateError = (msg: string) => {
        const m = msg.toLowerCase();
        if (m.includes('rate limit')) return 'Por segurança, aguarde um momento antes de tentar novamente.';
        if (m.includes('already registered')) return 'Você já possui cadastro com este e-mail. Tente fazer login ao lado.';
        if (m.includes('invalid login') || m.includes('creds')) return 'E-mail ou senha incorretos.';
        if (m.includes('user not found')) return 'E-mail não encontrado no nosso sistema.';
        return msg;
    };

    if (showResetPassword) {
        return (
            <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 animate-fade-in">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={() => {
                            setShowResetPassword(false);
                            setError(''); // Clear errors when navigating back
                            setSuccess(''); // Clear success when navigating back
                        }}
                        className="flex items-center gap-2 text-stone-400 hover:text-brand-gold mb-8 font-bold uppercase text-[10px] tracking-widest transition-colors"
                    >
                        <ArrowLeft size={16} /> Voltar para o Login
                    </button>

                    <div className="glass-card premium-shadow rounded-[2rem] p-8 space-y-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Lock size={32} className="text-brand-gold" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-brand-wood dark:text-stone-100">Esqueci minha senha</h2>
                            <p className="text-sm text-stone-400 mt-2">Enviaremos um link para você criar uma nova senha</p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">E-mail Cadastrado</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={resetEmail}
                                        onChange={e => setResetEmail(e.target.value)}
                                        className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-stone-800 dark:text-stone-200"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-gold hover:bg-amber-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Link'}
                            </button>
                        </form>

                        {(error || success) && (
                            <div className="mt-4 text-center">
                                {error && <p className="text-red-500 text-xs font-bold uppercase tracking-tight">{translateError(error)}</p>}
                                {success && <p className="text-emerald-500 text-xs font-bold uppercase tracking-tight">{success}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-2xl font-display font-bold text-brand-wood dark:text-stone-100 flex items-center gap-2">
                        <span className="text-brand-gold">Identificação</span>
                        <span className="hidden md:inline text-stone-300 dark:text-stone-700 font-light">|</span>
                        <span className="text-base md:text-lg font-normal text-stone-500 dark:text-stone-400">Login ou Cadastro</span>
                    </h1>
                    <div className="h-1 w-16 bg-brand-gold mt-2 rounded-full hidden md:block"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Login Column */}
                    <div className="glass-card premium-shadow rounded-[1.5rem] p-6 md:p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <User size={120} className="text-brand-gold" />
                        </div>

                        <div className="flex items-center gap-4 text-brand-wood dark:text-stone-100">
                            <div className="p-3 bg-brand-gold/10 rounded-2xl">
                                <ShieldCheck size={28} className="text-brand-gold" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-wider">Já sou cadastrado</h2>
                                <p className="text-xs text-stone-400 font-medium">Acesse sua conta para continuar</p>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={loginEmail}
                                            onChange={e => setLoginEmail(e.target.value)}
                                            className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={loginPass}
                                            onChange={e => setLoginPass(e.target.value)}
                                            className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResetPassword(true);
                                            setError(''); // Clear errors when navigating to reset password
                                            setSuccess(''); // Clear success when navigating to reset password
                                        }}
                                        className="mt-3 ml-1 text-xs text-brand-gold hover:underline font-medium"
                                    >
                                        Esqueceu a senha?
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-wood hover:bg-brand-brown text-white py-3 px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Entrando...' : (
                                    <>
                                        Prosseguir <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Registration Column */}
                    <div className="glass-card premium-shadow rounded-[1.5rem] p-6 md:p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <UserPlus size={120} className="text-brand-gold" />
                        </div>

                        <div className="flex items-center gap-4 text-brand-wood dark:text-stone-100">
                            <div className="p-3 bg-brand-gold/10 rounded-2xl">
                                <UserPlus size={28} className="text-brand-gold" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-wider">Ainda não possuo cadastro</h2>
                                <p className="text-xs text-stone-400 font-medium">Crie sua conta em poucos segundos</p>
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={registerName}
                                            onChange={e => setRegisterName(e.target.value)}
                                            className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">E-mail para cadastro</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={registerEmail}
                                            onChange={e => setRegisterEmail(e.target.value)}
                                            className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                            placeholder="exemplo@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">WhatsApp</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                            <input
                                                type="tel"
                                                required
                                                value={registerPhone}
                                                onChange={e => setRegisterPhone(e.target.value)}
                                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                            <input
                                                type="password"
                                                required
                                                value={registerPass}
                                                onChange={e => setRegisterPass(e.target.value)}
                                                autoComplete="new-password"
                                                name="new-password-registration"
                                                id="new-password-registration"
                                                data-form-type="register"
                                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                                placeholder="Crie sua senha (mínimo 6 caracteres)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Endereço</label>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                required
                                                value={registerStreet}
                                                onChange={e => setRegisterStreet(e.target.value)}
                                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 px-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                                placeholder="Rua"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                required
                                                value={registerNumber}
                                                onChange={e => setRegisterNumber(e.target.value)}
                                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 px-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                                placeholder="Número"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={registerComplement}
                                                onChange={e => setRegisterComplement(e.target.value)}
                                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 px-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                                placeholder="Complemento (opcional)"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                required
                                                value={registerNeighborhood}
                                                onChange={e => setRegisterNeighborhood(e.target.value)}
                                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 px-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                                placeholder="Bairro"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                required
                                                value={registerCity}
                                                onChange={e => setRegisterCity(e.target.value)}
                                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 px-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200"
                                                placeholder="Cidade"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                required
                                                value={registerState}
                                                onChange={e => setRegisterState(e.target.value)}
                                                maxLength={2}
                                                className="w-full bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl py-3 px-4 outline-none focus:ring-2 ring-brand-gold/50 transition-all text-sm text-stone-800 dark:text-stone-200 uppercase"
                                                placeholder="UF"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-gold hover:bg-amber-500 text-white py-3 px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Cadastrando...' : (
                                    <>
                                        Cadastrar <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Feedback Messages */}
                {(error || success) && (
                    <div className="mt-8 flex justify-center animate-fade-in">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-sm font-bold uppercase tracking-tight">
                                {translateError(error)}
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-sm font-bold uppercase tracking-tight">
                                {success}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
