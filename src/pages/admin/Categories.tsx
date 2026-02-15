import { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Trash2, Tag, Loader2, AlertCircle } from 'lucide-react';

export function Categories() {
    const { categories, addCategory, deleteCategory, loading, products } = useProducts();
    const [newCategory, setNewCategory] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setIsAdding(true);
        try {
            await addCategory(newCategory.trim());
            setNewCategory('');
        } catch (error) {
            console.error("Erro ao adicionar categoria", error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (name: string) => {
        const inUse = products.some(p => p.category === name);
        if (inUse) {
            alert(`Não é possível excluir a categoria "${name}" pois existem produtos vinculados a ela.`);
            return;
        }

        if (confirm(`Deseja realmente excluir a categoria "${name}"?`)) {
            await deleteCategory(name);
        }
    };

    if (loading) return (
        <div className="p-20 text-center animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Carregando Categorias...</span>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
            <div>
                <h1 className="text-lg font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">Gestão de Categorias</h1>
                <p className="text-stone-400 text-xs">Crie e organize as linhas de produtos do seu SaaS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Adicionar */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <Plus className="text-brand-gold" size={20} />
                        <h2 className="font-bold text-stone-700 dark:text-stone-200">Nova Categoria</h2>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nome da Categoria</label>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                                placeholder="Ex: Pulseiras"
                                disabled={isAdding}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAdding || !newCategory.trim()}
                            className="w-full bg-brand-gold hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2 uppercase text-xs tracking-widest disabled:opacity-50"
                        >
                            {isAdding ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            {isAdding ? 'Criando...' : 'Adicionar'}
                        </button>
                    </form>
                </div>

                {/* Lista de Categorias */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-800">
                                <tr>
                                    <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Categoria</th>
                                    <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Produtos</th>
                                    <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                                {categories.map(cat => {
                                    const productCount = products.filter(p => p.category === cat).length;
                                    return (
                                        <tr key={cat} className="group hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                                                        <Tag size={16} />
                                                    </div>
                                                    <span className="font-bold text-sm text-stone-700 dark:text-stone-200">{cat}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded text-[10px] font-mono font-bold text-stone-500">
                                                    {productCount}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(cat)}
                                                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Excluir Categoria"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-10 text-center text-stone-400 italic text-sm">
                                            Nenhuma categoria cadastrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        <AlertCircle className="text-amber-600 flex-shrink-0" size={16} />
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
                            <strong>Dica SaaS:</strong> Você não pode excluir uma categoria que já possua produtos vinculados. Mova os produtos de categoria antes de removê-la.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
