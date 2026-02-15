import { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Trash2, Tag, Loader2, FolderTree } from 'lucide-react';

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
            <Loader2 className="animate-spin text-brand-gold" size={24} />
            <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Carregando...</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-10 max-w-5xl mx-auto">
            {/* Header Compacto */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest flex items-center gap-2">
                        <FolderTree size={16} className="text-brand-gold" />
                        Gestão de Categorias
                    </h1>
                    <p className="text-[10px] text-stone-400 mt-0.5">Organize seu catálogo</p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {categories.length} Categorias Ativas
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Adicionar (Compacto) */}
                <div className="bg-white dark:bg-stone-900 p-4 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 h-fit">
                    <div className="flex items-center gap-2 mb-4 text-stone-400 uppercase text-[10px] font-bold tracking-widest">
                        <Plus size={14} /> Nova Categoria
                    </div>

                    <form onSubmit={handleAdd} className="space-y-3">
                        <div>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-sm px-3 py-2 text-xs focus:ring-1 focus:ring-brand-gold transition-colors placeholder-stone-400"
                                placeholder="Nome da categoria..."
                                disabled={isAdding}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAdding || !newCategory.trim()}
                            className="w-full bg-stone-800 hover:bg-stone-700 text-white py-2 rounded-sm transition-all flex items-center justify-center gap-2 uppercase text-[10px] font-bold tracking-widest disabled:opacity-50"
                        >
                            {isAdding ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                            {isAdding ? 'Criando...' : 'Adicionar'}
                        </button>
                    </form>
                </div>

                {/* Lista de Categorias (Grid Densa) */}
                <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
                    {categories.map((category) => {
                        const productCount = products.filter(p => p.category === category.name).length;
                        return (
                            <div
                                key={category.id}
                                className="group bg-white dark:bg-stone-900 p-3 rounded-sm border border-stone-100 dark:border-stone-800 hover:border-brand-gold/30 transition-all flex justify-between items-center relative overflow-hidden"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Tag size={12} className="text-stone-300 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-xs text-stone-700 dark:text-stone-200 truncate">{category.name}</h3>
                                        <p className="text-[9px] text-stone-400 font-mono uppercase tracking-widest">{productCount} items</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(category.name)}
                                    className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors opacity-0 group-hover:opacity-100"
                                    title="Excluir Categoria"
                                >
                                    <Trash2 size={12} />
                                </button>

                                {/* Active Indicator Bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        );
                    })}

                    {categories.length === 0 && (
                        <div className="col-span-full py-10 text-center text-stone-400 text-xs italic bg-stone-50 dark:bg-stone-800/50 rounded-sm border border-dashed border-stone-200 dark:border-stone-700">
                            Nenhuma categoria cadastrada.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
