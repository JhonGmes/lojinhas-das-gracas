import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { api } from '../services/api';
import { db } from '../lib/firebase';
import { collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { Shield, Layout, ArrowRight, CheckCircle2, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterStore() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        name: '',
        email: '',
        pass: '',
        storeName: '',
        slug: ''
    });

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Generate a store ID first (reference only, no write yet)
            const storeRef = doc(collection(db, 'stores'));
            const storeId = storeRef.id;

            // 2. Create the user as admin linked to this store ID
            // This step authenticates the user in Firebase
            const result = await signup({
                email: form.email,
                pass: form.pass,
                name: form.name,
                storeId: storeId,
                role: 'admin'
            });

            if (!result.success) {
                throw new Error(result.message);
            }

            // NOW THE USER IS AUTHENTICATED - Subsequent writes will succeed

            // 3. Create the store document
            await setDoc(storeRef, {
                name: form.storeName,
                slug: form.slug.toLowerCase().trim().replace(/\s+/g, '-'),
                status: 'active',
                created_at: serverTimestamp()
            });

            // 4. Initialize store settings
            await api.settings.update({
                store_id: storeId,
                store_name: form.storeName,
                manager_name: form.name,
                primary_color: '#D4AF37',
                logo_url: '',
                banner_url: '',
                is_active: true,
                plans: {
                    active: 'basic',
                    features: ['catalog', 'orders']
                }
            } as any);

            // 5. Create initial subscription (15 days trial)
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 15);

            await setDoc(doc(db, 'subscriptions', storeId), {
                storeId: storeId,
                plan: 'basic',
                status: 'active',
                currentPeriodEnd: trialEnd,
                cancelAtPeriodEnd: false,
                customerEmail: form.email,
                createdAt: serverTimestamp()
            });

            toast.success('Parabéns! Sua loja foi criada.');
            navigate('/admin');
        } catch (error: any) {
            console.error('Erro na criação:', error);
            toast.error(error.message || 'Erro ao criar loja');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col font-sans selection:bg-brand-gold/30">
            {/* Header Mini */}
            <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform">
                        <Shield className="text-white dark:text-stone-900" size={20} />
                    </div>
                    <span className="font-display text-xl font-black uppercase tracking-tighter dark:text-white">Lojinhas das Graças</span>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 pb-20">
                <div className="w-full max-w-xl">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-gold' : 'text-stone-300'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${step >= 1 ? 'border-brand-gold bg-brand-gold/10' : 'border-stone-200'}`}>1</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Perfil Lojista</span>
                        </div>
                        <div className="w-12 h-[2px] bg-stone-200" />
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-gold' : 'text-stone-300'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${step >= 2 ? 'border-brand-gold bg-brand-gold/10' : 'border-stone-200'}`}>2</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Identidade da Loja</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 relative overflow-hidden group">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        {step === 1 ? (
                            <form onSubmit={handleNext} className="relative z-10 animate-fade-in-right">
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2 leading-tight">Comece sua jornada sagrada no comércio.</h1>
                                    <p className="text-stone-400 text-sm">Crie seu perfil de administrador para gerenciar sua loja.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">Seu Nome Completo</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                className="w-full h-14 bg-stone-50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 rounded-2xl px-6 outline-none focus:ring-2 ring-brand-gold/20 transition-all text-stone-700 dark:text-stone-200"
                                                placeholder="Como gostaria de ser chamado?"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">E-mail Profissional</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full h-14 bg-stone-50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 rounded-2xl px-6 outline-none focus:ring-2 ring-brand-gold/20 transition-all text-stone-700 dark:text-stone-200"
                                            placeholder="seu@email.com"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">Senha de Acesso</label>
                                        <input
                                            required
                                            type="password"
                                            className="w-full h-14 bg-stone-50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 rounded-2xl px-6 outline-none focus:ring-2 ring-brand-gold/20 transition-all text-stone-700 dark:text-stone-200"
                                            placeholder="Mínimo 6 caracteres"
                                            value={form.pass}
                                            onChange={e => setForm({ ...form, pass: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-16 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all shadow-xl shadow-stone-200 dark:shadow-none mt-8"
                                    >
                                        Próximo Passo <ArrowRight size={18} />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup} className="relative z-10 animate-fade-in-right">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-stone-400 hover:text-stone-600 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-6"
                                >
                                    Voltar
                                </button>

                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2 leading-tight">Dê um nome e um endereço para sua fé.</h1>
                                    <p className="text-stone-400 text-sm">Estas informações serão vistas por todos os seus clientes.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">Nome da sua Loja</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                className="w-full h-14 bg-stone-50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 rounded-2xl px-12 outline-none focus:ring-2 ring-brand-gold/20 transition-all text-stone-700 dark:text-stone-200"
                                                placeholder="Ex: Cantinho da Paz"
                                                value={form.storeName}
                                                onChange={e => {
                                                    const name = e.target.value;
                                                    const slug = name.toLowerCase()
                                                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
                                                        .trim()
                                                        .replace(/\s+/g, '-')
                                                        .replace(/[^\w-]+/g, '');
                                                    setForm({ ...form, storeName: name, slug });
                                                }}
                                            />
                                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">Endereço da Loja (Slug)</label>
                                        <div className="flex items-center bg-stone-50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 rounded-2xl px-6 h-14">
                                            <span className="text-stone-400 text-xs font-medium lowercase">lojinhadasgracas.com/</span>
                                            <input
                                                required
                                                type="text"
                                                className="flex-1 bg-transparent outline-none text-stone-700 dark:text-stone-200 text-sm font-bold ml-0.5"
                                                placeholder="nome-da-loja"
                                                value={form.slug}
                                                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            />
                                        </div>
                                        <p className="text-[9px] text-stone-400 ml-2 italic">Este será seu link único para compartilhar.</p>
                                    </div>

                                    <div className="bg-brand-gold/5 border border-brand-gold/10 rounded-2xl p-4 flex gap-3">
                                        <CheckCircle2 className="text-brand-gold shrink-0 mt-0.5" size={16} />
                                        <p className="text-[10px] text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                                            Ao clicar em criar, sua loja será configurada instantaneamente com o plano <strong className="text-brand-gold uppercase tracking-widest">Degustação (Grátis)</strong> por 15 dias.
                                        </p>
                                    </div>

                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className={`w-full h-16 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-stone-200 dark:shadow-none mt-8 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:translate-y-[-2px]'}`}
                                    >
                                        {loading ? (
                                            <>Configurando Altar... <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /></>
                                        ) : (
                                            <>Consagrar minha Loja <Layout size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <p className="text-center mt-8 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                        Já possui uma unidade? <button onClick={() => navigate('/admin-login')} className="text-brand-gold hover:underline">Entre no seu Painel</button>
                    </p>
                </div>
            </main>

            {/* Copyright */}
            <footer className="p-8 text-center border-t border-stone-100 dark:border-stone-900">
                <p className="text-stone-400 text-[9px] font-bold uppercase tracking-[0.2em]">&copy; 2026 Lojinhas das Graças - Elevando o Comércio através da Fé</p>
            </footer>
        </div>
    );
}
