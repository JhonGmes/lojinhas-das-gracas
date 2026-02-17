import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, Plus, Building2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Store {
    id: string;
    slug: string;
    name: string;
    status: string;
    created_at: string;
}

export function SuperAdmin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { setStore, currentStoreId } = useStore();
    const [stores, setStores] = useState<Store[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStore, setNewStore] = useState({ name: '', slug: '' });

    const fetchStores = async () => {
        try {
            const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setStores(data || []);
        } catch (error) {
            toast.error('Erro ao carregar lojas');
        }
    };

    useEffect(() => {
        // Trava de Segurança Mestre: Apenas Jhon acessa o Super Admin
        const JHON_EMAIL = 'lojinhadasgracas18@gmail.com';

        if (!user || user.email !== JHON_EMAIL) {
            toast.error('Acesso restrito ao Administrador Geral do Sistema.');
            navigate('/');
            return;
        }

        fetchStores();
    }, [user, navigate]);

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.from('stores').insert([
                { name: newStore.name, slug: newStore.slug.toLowerCase().trim() }
            ]).select().single();

            if (error) throw error;

            // Criar configurações iniciais para a nova loja
            await api.settings.update({
                store_id: data.id,
                store_name: data.name,
                primary_color: '#D4AF37'
            } as any);

            toast.success('Loja criada com sucesso!');
            setShowAddModal(false);
            setNewStore({ name: '', slug: '' });
            fetchStores();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao criar loja');
        }
    };

    const toggleStore = (id: string) => {
        setStore(id);
        toast.success('Ambiente de loja alterado!');
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
            <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900 dark:text-white uppercase tracking-tighter">Super Admin</h1>
                        <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Painel de Gestão de Rede</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-stone-900 dark:bg-white dark:text-stone-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Plus size={18} /> Nova Loja
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                    <div
                        key={store.id}
                        className={`bg-white dark:bg-stone-900 p-6 rounded-2xl border ${currentStoreId === store.id ? 'border-red-500 ring-4 ring-red-500/10' : 'border-stone-100 dark:border-stone-800'} shadow-soft transition-all`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center text-stone-400">
                                <Building2 size={20} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {store.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">{store.name}</h3>
                        <p className="text-xs text-stone-400 mb-6 italic">/{store.slug}</p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleStore(store.id)}
                                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${currentStoreId === store.id ? 'bg-red-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'}`}
                            >
                                {currentStoreId === store.id ? 'Loja Ativa' : 'Gerenciar'}
                            </button>
                            <a
                                href={`https://${store.slug}.lojinhasdasgracas.com`}
                                target="_blank"
                                className="p-2.5 bg-stone-100 dark:bg-stone-800 text-stone-400 rounded-lg hover:text-brand-gold transition-colors"
                            >
                                <ExternalLink size={18} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-in-up">
                        <h2 className="text-2xl font-bold mb-6 text-stone-900 dark:text-white">Expandir a Rede</h2>
                        <form onSubmit={handleCreateStore} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Nome da Loja</label>
                                <input
                                    required
                                    className="w-full bg-stone-100 dark:bg-stone-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-stone-900"
                                    value={newStore.name}
                                    onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Slug (URL)</label>
                                <input
                                    required
                                    className="w-full bg-stone-100 dark:bg-stone-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-stone-900"
                                    placeholder="ex: cantinhodafe"
                                    value={newStore.slug}
                                    onChange={e => setNewStore({ ...newStore, slug: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-stone-900 dark:bg-white dark:text-stone-900 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg"
                                >
                                    Criar Unidade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
