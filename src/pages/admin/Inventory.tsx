import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { formatCurrency } from '../../lib/utils';
import { Plus, Search, Edit2, Trash2, Package, Check, X, Minus } from 'lucide-react';

export function Inventory() {
    const { products, toggleProductActive, updateStock, deleteProduct } = useProducts();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Compact Header */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest flex items-center gap-2">
                        <Package size={16} className="text-brand-gold" />
                        Catálogo de Produtos
                    </h1>
                    <p className="text-[10px] text-stone-400 mt-0.5">Gerencie seu estoque com eficiência</p>
                </div>
                <button
                    onClick={() => navigate('/admin/add-product')}
                    className="bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                    <Plus size={12} /> Adicionar Novo
                </button>
            </div>

            {/* Compact Actions Bar */}
            <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-3 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 w-64 text-xs bg-stone-50 dark:bg-stone-800 border-none rounded-sm focus:ring-1 focus:ring-brand-gold text-stone-600 placeholder-stone-400"
                    />
                </div>
                <div className="text-[10px] uppercase font-bold text-stone-400">
                    {filteredProducts.length} itens encontrados
                </div>
            </div>

            {/* Dense Table */}
            <div className="bg-white dark:bg-stone-900 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-[9px] font-bold text-stone-400 uppercase tracking-widest w-12">IMG</th>
                                <th className="px-4 py-2 text-left text-[9px] font-bold text-stone-400 uppercase tracking-widest">Produto</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Preço</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Promoção</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Estoque</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-2 text-right text-[9px] font-bold text-stone-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                    <td className="px-4 py-2">
                                        <div className="w-8 h-8 rounded-sm overflow-hidden bg-stone-100 border border-stone-200">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                    </td>

                                    <td className="px-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-stone-700 dark:text-stone-200 truncate max-w-[200px]">{product.name}</span>
                                            <span className="text-[9px] text-stone-400 font-mono">{product.code || 'SKU N/A'}</span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-medium text-stone-600 dark:text-stone-300">{formatCurrency(product.price)}</span>
                                            {product.promotionPrice && (
                                                <span className="text-[9px] text-emerald-500 font-bold">{formatCurrency(product.promotionPrice)}</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        {/* Toggle Compacto */}
                                        <button
                                            onClick={() => toggleProductActive(product.id)}
                                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${product.active ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.active ? 'translate-x-3.5' : 'translate-x-0.5'
                                                    }`}
                                            />
                                        </button>
                                        <div className="text-[8px] text-stone-400 mt-0.5">{product.active ? 'Ativo' : 'Inativo'}</div>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => updateStock(product.id, -1)}
                                                className="p-0.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className={`text-xs font-mono w-6 text-center ${product.stock <= 5 ? 'text-amber-500 font-bold' : 'text-stone-600'}`}>
                                                {product.stock}
                                            </span>
                                            <button
                                                onClick={() => updateStock(product.id, 1)}
                                                className="p-0.5 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        {product.stock === 0 ? (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                                                Esgotado
                                            </span>
                                        ) : product.stock <= 5 ? (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                                                Baixo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                                                OK
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                                                className="p-1.5 text-stone-400 hover:text-brand-gold hover:bg-amber-50 rounded-sm transition-colors"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
                                                        deleteProduct(product.id);
                                                    }
                                                }}
                                                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-stone-400 text-xs italic">
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
