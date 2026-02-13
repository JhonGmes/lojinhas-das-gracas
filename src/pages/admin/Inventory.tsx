import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { formatCurrency } from '../../lib/utils';
import { Trash2, Plus, Edit2, Loader2 } from 'lucide-react';
import type { Product } from '../../types';

export function Inventory() {
    const { products, updateProduct, updateStock, deleteProduct, loading } = useProducts();
    const navigate = useNavigate();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [localInputs, setLocalInputs] = useState<Record<string, { price: string, percent: string }>>({});

    const syncLocalInputs = (product: Product, priceVal?: string, percentVal?: string) => {
        const pPrice = product.price || 0;
        let newPrice = priceVal ?? '';
        let newPercent = percentVal ?? '';

        if (priceVal !== undefined && priceVal !== '') {
            const val = parseFloat(priceVal);
            if (!isNaN(val)) {
                const disc = ((pPrice - val) / pPrice) * 100;
                newPercent = disc.toFixed(1);
            } else {
                newPercent = ''; // Clear percent if price is invalid
            }
        } else if (percentVal !== undefined && percentVal !== '') {
            const pct = parseFloat(percentVal);
            if (!isNaN(pct)) {
                const val = pPrice - (pPrice * pct / 100);
                newPrice = val.toFixed(2);
            } else {
                newPrice = ''; // Clear price if percent is invalid
            }
        }

        setLocalInputs(prev => ({
            ...prev,
            [product.id]: { price: newPrice, percent: newPercent }
        }));
    };

    const handlePriceChange = (product: Product, value: string) => {
        syncLocalInputs(product, value, undefined);
    };

    const handlePercentChange = (product: Product, percent: string) => {
        syncLocalInputs(product, undefined, percent);
    };

    const commitUpdate = async (product: Product) => {
        const local = localInputs[product.id];
        if (!local) return;

        if (local.price === '') {
            if (product.promotionalPrice !== undefined) {
                await togglePromo(product);
            }
            return;
        }

        const numPrice = parseFloat(local.price);
        if (isNaN(numPrice) || numPrice === product.promotionalPrice) return;

        setUpdatingId(product.id);
        await updateProduct({ ...product, promotionalPrice: Number(numPrice.toFixed(2)) });
        setUpdatingId(null);
    };

    const togglePromo = async (product: Product) => {
        setUpdatingId(product.id);
        try {
            const isCurrentlyOn = product.promotionalPrice !== null && product.promotionalPrice !== undefined;

            if (isCurrentlyOn) {
                await updateProduct({ ...product, promotionalPrice: undefined });
                setLocalInputs(prev => {
                    const next = { ...prev };
                    delete next[product.id];
                    return next;
                });
            } else {
                const defaultPromo = Number((product.price * 0.9).toFixed(2));
                await updateProduct({ ...product, promotionalPrice: defaultPromo });
                syncLocalInputs(product, defaultPromo.toString(), undefined);
            }
        } catch (err) {
            console.error('Erro ao alternar promoção:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            await deleteProduct(id);
        }
    }

    if (loading) return (
        <div className="p-20 text-center animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Sincronizando Inventário...</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-widest">Gerenciar Produtos</h1>
                <button
                    onClick={() => navigate('/admin/add-product')}
                    className="bg-brand-gold hover:bg-brand-gold-light text-brand-wood font-bold py-3 px-8 rounded-sm shadow-soft transition-all duration-400 flex items-center gap-2 text-xs uppercase tracking-widest active:scale-95"
                >
                    <Plus size={18} /> Adicionar Novo
                </button>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-sm shadow-soft border border-brand-cotton-dark dark:border-stone-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-brand-cotton dark:bg-stone-900 border-b border-brand-cotton-dark dark:border-stone-700">
                            <tr>
                                <th className="p-5 font-bold text-stone-400 text-[10px] uppercase tracking-widest">Produto</th>
                                <th className="p-5 font-bold text-stone-400 text-[10px] uppercase tracking-widest text-center">Preço Original</th>
                                <th className="p-5 font-bold text-stone-400 text-[10px] uppercase tracking-widest text-center">Promoção</th>
                                <th className="p-5 font-bold text-stone-400 text-[10px] uppercase tracking-widest">Config. Oferta</th>
                                <th className="p-5 font-bold text-stone-400 text-[10px] uppercase tracking-widest text-center">Estoque</th>
                                <th className="p-5 font-bold text-stone-400 text-[10px] uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                            {products.map(p => {
                                const isPromo = !!p.promotionalPrice;
                                const discountPercent = isPromo ? Math.round(((p.price - (p.promotionalPrice || 0)) / p.price) * 100) : 0;

                                // Usa valores locais se estiverem sendo editados, senão usa do banco
                                const displayPrice = localInputs[p.id]?.price ?? (isPromo ? p.promotionalPrice?.toString() : '');
                                const displayPercent = localInputs[p.id]?.percent ?? (isPromo ? discountPercent.toString() : '');

                                return (
                                    <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-700/30 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-700 p-1 flex-shrink-0">
                                                    <img src={p.image} className="w-full h-full object-cover rounded" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-stone-800 dark:text-stone-200 text-sm truncate max-w-[200px]">{p.name}</div>
                                                    <div className="text-[10px] text-brand-gold font-bold uppercase tracking-tight">{p.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="font-bold text-stone-600 dark:text-stone-400 text-sm">
                                                {formatCurrency(p.price)}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button
                                                onClick={() => togglePromo(p)}
                                                disabled={updatingId === p.id}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:opacity-50 ${isPromo ? 'bg-green-500' : 'bg-stone-200 dark:bg-stone-700'}`}
                                            >
                                                {updatingId === p.id ? (
                                                    <Loader2 size={12} className="mx-auto animate-spin text-white" />
                                                ) : (
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPromo ? 'translate-x-6' : 'translate-x-1'}`} />
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-5">
                                            {isPromo ? (
                                                <div className="flex items-center gap-3 animate-fade-in">
                                                    <div className="flex flex-col">
                                                        <label className="text-[9px] text-stone-400 font-bold uppercase mb-1">Valor Promo (R$)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={displayPrice}
                                                            onChange={(e) => handlePriceChange(p, e.target.value)}
                                                            onBlur={() => commitUpdate(p)}
                                                            className="w-24 px-2 py-1 bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm text-xs font-bold text-brand-wood dark:text-brand-gold outline-none focus:border-brand-gold transition-colors shadow-soft-sm"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[9px] text-stone-400 font-bold uppercase mb-1">Desc. (%)</label>
                                                        <input
                                                            type="number"
                                                            value={displayPercent}
                                                            onChange={(e) => handlePercentChange(p, e.target.value)}
                                                            onBlur={() => commitUpdate(p)}
                                                            className="w-16 px-2 py-1 bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm text-xs font-bold text-red-500 outline-none focus:border-red-400 transition-colors shadow-soft-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-stone-400 italic">Sem desconto aplicado</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}
                                                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-brand-cotton-dark hover:border-brand-gold hover:text-brand-gold bg-white dark:bg-stone-800 transition-all active:scale-90"
                                                >
                                                    -
                                                </button>
                                                <span className={`font-mono font-bold text-sm min-w-4 text-center ${p.stock <= 5 ? 'text-red-500' : 'text-stone-800 dark:text-stone-200'}`}>
                                                    {p.stock}
                                                </span>
                                                <button
                                                    onClick={() => updateStock(p.id, p.stock + 1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-brand-cotton-dark hover:border-brand-gold hover:text-brand-gold bg-white dark:bg-stone-800 transition-all active:scale-90"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                                                    className="p-2 text-stone-400 hover:text-brand-gold hover:bg-brand-cotton dark:hover:bg-stone-700 rounded-sm transition-all duration-400"
                                                    title="Editar Detalhes"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-all duration-400"
                                                    title="Excluir Produto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
