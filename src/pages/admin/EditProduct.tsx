import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { ChevronLeft, Upload, Check, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';

export function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, updateProduct, deleteProduct } = useProducts();
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [stock, setStock] = useState('0');
    const [code, setCode] = useState('');
    const [active, setActive] = useState(true);

    useEffect(() => {
        const product = products.find(p => p.id === id);
        if (product) {
            setName(product.name);
            setPrice(product.price.toString());
            setDescription(product.description || '');
            setCategory(product.category);
            setImage(product.image);
            setStock(product.stock.toString());
            setCode(product.code || '');
            setActive(product.active);
        } else {
            // Redirect or show error if not found
        }
    }, [id, products]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (id) {
            updateProduct(id, {
                name,
                price: parseFloat(price.replace(',', '.')),
                description,
                category,
                image,
                stock: parseInt(stock),
                code,
                active
            });
        }
        setLoading(false);
        navigate('/admin/inventory');
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este produto permanentemente?')) {
            if (id) deleteProduct(id);
            navigate('/admin/inventory');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in-up pb-10 max-w-4xl mx-auto">
            {/* Header Compacto */}
            <div className="flex items-center gap-4 mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
                <button
                    type="button"
                    onClick={() => navigate('/admin/inventory')}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                >
                    <ChevronLeft size={16} className="text-stone-500" />
                </button>
                <div>
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest">Editar Produto</h1>
                    <p className="text-[10px] text-stone-400">Atualize as informações</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Excluir
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-gold hover:bg-amber-600 text-white px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Salvar Alterações
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Column: Details */}
                <div className="col-span-12 md:col-span-8 space-y-4">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-stone-900 p-5 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Nome do Produto</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">SKU / Código</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Categoria</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold"
                                >
                                    <option value="imagens">Imagens Sacras</option>
                                    <option value="tercos">Terços</option>
                                    <option value="livros">Livros</option>
                                    <option value="acessorios">Acessórios</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Preço (R$)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Estoque</label>
                                <input
                                    type="number"
                                    required
                                    value={stock}
                                    onChange={e => setStock(e.target.value)}
                                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Descrição</label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <div
                                onClick={() => setActive(!active)}
                                className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-emerald-500' : 'bg-stone-300'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${active ? 'left-4.5' : 'left-0.5'}`} style={{ left: active ? '18px' : '2px' }} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{active ? 'Produto Ativo na Loja' : 'Produto Oculto'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Media */}
                <div className="col-span-12 md:col-span-4 space-y-4">
                    <div className="bg-white dark:bg-stone-900 p-5 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 h-full">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-3">Imagem Principal</label>

                        <div className="relative group w-full aspect-square bg-stone-50 dark:bg-stone-800 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-brand-gold transition-colors overflow-hidden">
                            {image ? (
                                <>
                                    <img src={image} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-[10px] uppercase font-bold tracking-widest">Alterar Imagem</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <div className="w-10 h-10 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400">
                                        <ImageIcon size={18} />
                                    </div>
                                    <p className="text-[10px] text-stone-400 uppercase font-bold">Clique para upload</p>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
