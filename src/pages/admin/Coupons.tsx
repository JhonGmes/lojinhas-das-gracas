import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    Ticket, Plus, Trash2, Edit2,
    X, Tag
} from 'lucide-react';
import type { Coupon } from '../../types';
import { toast } from 'react-hot-toast';

export function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: '',
        type: 'percentage',
        value: 0,
        minSpend: 0,
        usageLimit: 0,
        isActive: true,
        expiryDate: ''
    });

    const loadCoupons = async () => {
        setLoading(true);
        const data = await api.coupons.list();
        setCoupons(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const handleOpenModal = (coupon?: Coupon) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData(coupon);
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                type: 'percentage',
                value: 0,
                minSpend: 0,
                usageLimit: 0,
                isActive: true,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        }
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.value) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        try {
            if (editingCoupon) {
                await api.coupons.update(formData as Coupon);
                toast.success('Cupom atualizado!');
            } else {
                await api.coupons.create({
                    ...formData,
                    usageCount: 0,
                    isActive: true
                });
                toast.success('Cupom criado com sucesso!');
            }
            setModalOpen(false);
            loadCoupons();
        } catch (error) {
            toast.error('Erro ao salvar cupom');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
            await api.coupons.delete(id);
            toast.success('Cupom excluído');
            loadCoupons();
        }
    };

    const toggleStatus = async (coupon: Coupon) => {
        const updated = { ...coupon, isActive: !coupon.isActive };
        await api.coupons.update(updated);
        setCoupons(prev => prev.map(c => c.id === coupon.id ? updated : c));
        toast.success(updated.isActive ? 'Cupom ativado' : 'Cupom desativado');
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest flex items-center gap-2">
                        <Ticket size={16} className="text-brand-gold" />
                        Gestão de Cupons
                    </h1>
                    <p className="text-[10px] text-stone-400 mt-0.5">Crie promoções exclusivas para seus clientes</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                >
                    <Plus size={12} /> Novo Cupom
                </button>
            </div>

            {/* Coupons Table */}
            <div className="bg-white dark:bg-stone-900 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-[9px] font-bold text-stone-400 uppercase tracking-widest">Código</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Tipo</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Valor</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Uso</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Expiração</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-2 text-right text-[9px] font-bold text-stone-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8 text-stone-400 text-xs italic">Carregando cupons...</td></tr>
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-stone-400 text-xs italic">Nenhum cupom cadastrado.</td></tr>
                            ) : coupons.map(coupon => (
                                <tr key={coupon.id} className="group hover:bg-stone-50 dark:hover:bg-stone-800/10 transition-colors">
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-amber-50 dark:bg-amber-900/20 rounded text-brand-gold">
                                                <Tag size={12} />
                                            </div>
                                            <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-200">{coupon.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                                            {coupon.type === 'percentage' ? 'Porcentagem' : 'Fixo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-xs font-bold text-stone-800 dark:text-stone-100">
                                            {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value}`}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400">{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                                            <div className="w-12 h-1 bg-stone-100 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-gold"
                                                    style={{ width: coupon.usageLimit ? `${(coupon.usageCount / coupon.usageLimit) * 100}%` : '0%' }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-[10px] text-stone-500">
                                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => toggleStatus(coupon)}
                                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${coupon.isActive ? 'bg-emerald-500' : 'bg-stone-300'
                                                }`}
                                        >
                                            <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${coupon.isActive ? 'translate-x-4' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex justify-end gap-2 text-stone-400">
                                            <button onClick={() => handleOpenModal(coupon)} className="hover:text-brand-gold"><Edit2 size={12} /></button>
                                            <button onClick={() => handleDelete(coupon.id)} className="hover:text-red-500"><Trash2 size={12} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Novo/Editar */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
                    <form onSubmit={handleSave} className="bg-white dark:bg-stone-900 w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-800">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-700 dark:text-stone-200 flex items-center gap-2">
                                <Ticket size={16} className="text-brand-gold" />
                                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
                            </h3>
                            <button type="button" onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Código do Cupom</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs font-bold focus:ring-1 focus:ring-brand-gold outline-none uppercase"
                                        placeholder="EX: SALES20"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Tipo</label>
                                    <select
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="percentage">Porcentagem (%)</option>
                                        <option value="fixed">Valor Fixo (R$)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Valor</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs font-bold outline-none"
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-[10px]">
                                            {formData.type === 'percentage' ? '%' : 'R$'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Mínimo para Uso (R$)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                                        value={formData.minSpend}
                                        onChange={e => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Limite de Uso</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                                        value={formData.usageLimit}
                                        onChange={e => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                        placeholder="Ilimitado"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Data de Expiração</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-stone-50 dark:bg-stone-800 border-t border-stone-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2 bg-brand-gold text-white text-xs font-bold uppercase tracking-widest rounded shadow-md hover:bg-brand-gold-dark transition-all"
                            >
                                Salvar Cupom
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
