import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { exportToCSV } from '../../lib/utils';
import {
    Clock, Mail, MessageCircle, CheckCircle,
    Trash2, Search, Download, Package, UserCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Waitlist() {
    const { settings } = useStore();
    const [entries, setEntries] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            // In a real scenario, we'd have api.waitingList.list()
            // For now, let's look at the api.ts to see if I added it. I only added create.
            // I need to add list and delete to api.ts
            const data = await (api as any).waitingList.list();
            setEntries(data || []);
            const prodList = await api.products.list();
            setProducts(prodList);
        } catch (error) {
            console.error('Erro ao carregar lista de espera:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir entrada da lista?')) return;
        try {
            await (api as any).waitingList.delete(id);
            toast.success('Entrada excluída');
            loadData();
        } catch (error) {
            toast.error('Erro ao excluir');
        }
    };

    const handleMarkAsNotified = async (id: string, notified: boolean) => {
        try {
            const entry = entries.find(e => e.id === id);
            if (!entry) return;

            // Se estiver marcando como notificado (estava pendente)
            if (!notified) {
                const product = products.find(p => p.id === entry.product_id);
                const hour = new Date().getHours();
                const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

                const productName = product?.name || 'seu produto';
                const productUrl = `${window.location.origin}/product/${entry.product_id}`;

                const message = `${saudacao}! Paz e Bem! ✨\n\nQuerido(a) Irmão(ã) ${entry.customer_name}, estou passando para avisar que o produto *${productName}* já está disponível em nosso site e em nossa loja física! 🙏\n\n🛍️ Confira aqui: ${productUrl}\n\n📍 Nos visite: Rua E, quadra 15, N° 39, bairro: Jardim Turu.\n📞 WhatsApp: ${settings.whatsapp_number}\n\nDeus abençoe! ✨`;

                // WhatsApp
                if (entry.customer_whatsapp) {
                    const encodedMsg = encodeURIComponent(message);
                    window.open(`https://wa.me/${entry.customer_whatsapp}?text=${encodedMsg}`, '_blank');
                }

                // Email (abre o cliente de email padrão)
                if (entry.customer_email) {
                    const subject = encodeURIComponent(`Novidades: Seu ${productName} chegou! ✨`);
                    const body = encodeURIComponent(message.replace(/\*/g, '')); // Remove negrito do zap para o email

                    // Pequeno atraso para não bloquear o popup do WhatsApp
                    setTimeout(() => {
                        const mailtoLink = `mailto:${entry.customer_email}?subject=${subject}&body=${body}`;
                        window.location.href = mailtoLink;
                    }, 1000);
                }

                toast.success('Notificação preparada!');
            }

            await (api as any).waitingList.update(id, { notified: !notified });
            loadData();
        } catch (error) {
            toast.error('Erro ao atualizar');
        }
    };

    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || 'Produto Removido';
    };

    const filteredEntries = entries.filter(e =>
        e.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProductName(e.product_id).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={16} className="text-brand-gold" />
                        Lista de Espera (Avise-me)
                    </h1>
                    <p className="text-[10px] text-stone-400 mt-0.5">Clientes interessados em produtos esgotados</p>
                </div>
                <button
                    onClick={() => exportToCSV(entries, 'lista-espera-lojinha')}
                    className="px-3 py-1.5 bg-white border border-stone-200 text-stone-600 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center gap-2"
                >
                    <Download size={12} /> Exportar Lista
                </button>
            </div>

            <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-3 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou produto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 w-72 text-xs bg-stone-50 dark:bg-stone-800 border-none rounded-sm focus:ring-1 focus:ring-brand-gold text-stone-600 placeholder-stone-400"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700">
                            <tr>
                                <th className="px-4 py-2 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Cliente</th>
                                <th className="px-4 py-2 text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Produto</th>
                                <th className="px-4 py-2 text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Data</th>
                                <th className="px-4 py-2 text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-4 py-2 text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-4 py-4 bg-stone-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-stone-400 italic text-xs">
                                        Ninguém na lista de espera no momento. 🙏
                                    </td>
                                </tr>
                            ) : filteredEntries.map((entry) => (
                                <tr key={entry.id} className="group hover:bg-stone-50 dark:hover:bg-stone-800/10 transition-colors">
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                                                <UserCircle size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-stone-700 dark:text-stone-200">{entry.customer_name}</span>
                                                <div className="flex gap-2 items-center mt-0.5">
                                                    {entry.customer_email && <span className="text-[8px] text-stone-400 flex items-center gap-1"><Mail size={8} /> {entry.customer_email}</span>}
                                                    {entry.customer_whatsapp && <span className="text-[8px] text-stone-400 flex items-center gap-1"><MessageCircle size={8} /> {entry.customer_whatsapp}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1">
                                                <Package size={10} className="text-brand-gold" /> {getProductName(entry.product_id)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center text-[10px] text-stone-500">
                                        {new Date(entry.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${entry.notified ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'}`}>
                                            {entry.notified ? 'Notificado' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleMarkAsNotified(entry.id, entry.notified)}
                                                className={`p-1.5 rounded transition-all ${entry.notified ? 'bg-stone-100 text-stone-400' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                                                title={entry.notified ? 'Marcar como Pendente' : 'Marcar como Notificado'}
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className="p-1.5 bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 rounded transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
