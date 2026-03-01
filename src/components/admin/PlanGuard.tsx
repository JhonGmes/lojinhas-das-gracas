import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../features/store/context/StoreContext';
import { Shield, Lock } from 'lucide-react';

interface PlanGuardProps {
    children: ReactNode;
    feature: 'blog' | 'coupons' | 'wishlist' | 'metrics_pro';
    redirectTo?: string;
}

export function PlanGuard({ children, feature, redirectTo = '/admin' }: PlanGuardProps) {
    const { hasFeature, loading } = useStore();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-10 h-10 border-2 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Verificando Permissões...</p>
            </div>
        );
    }

    if (!hasFeature(feature)) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center text-stone-300">
                        <Shield size={48} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-brand-gold text-white p-2 rounded-lg shadow-lg">
                        <Lock size={20} />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-stone-800 dark:text-stone-100 uppercase tracking-tighter mb-2">
                    Recurso Bloqueado
                </h2>
                <p className="text-sm text-stone-500 max-w-md mb-8">
                    Esta funcionalidade está disponível apenas para lojistas no plano <strong className="text-brand-gold">Pro</strong>.
                    Faça o upgrade agora para desbloquear todo o potencial da sua loja.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => window.location.href = '/admin/billing'}
                        className="bg-stone-800 dark:bg-brand-gold text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                    >
                        Fazer Upgrade Agora
                    </button>
                    <Navigate to={redirectTo} replace />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
