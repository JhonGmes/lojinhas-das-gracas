import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';

import { ChevronLeft, Check, Loader2, Image as ImageIcon, Plus, X } from 'lucide-react';

export function AddProduct() {
    const navigate = useNavigate();
    const { createProduct, categories } = useProducts();
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [extraImages, setExtraImages] = useState<string[]>([]);
    const [stock, setStock] = useState('0');
    const [code, setCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        createProduct({
            name,
            price: parseFloat(price.replace(',', '.')),
            description,
            category,
            image: image || 'https://via.placeholder.com/150',
            images: extraImages,
            stock: parseInt(stock),
            code,
            active: true
        });
        setLoading(false);
        navigate('/admin/inventory');
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

    const handleExtraImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setExtraImages([...extraImages, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeExtraImage = (index: number) => {
        setExtraImages(extraImages.filter((_, i) => i !== index));
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
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest">Novo Produto</h1>
                    <p className="text-[10px] text-stone-400">Preencha os dados do item</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/inventory')}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-gold hover:bg-amber-600 text-white px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Salvar Produto
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
                                    placeholder="Ex: Imagem Sagrada Família 20cm"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">SKU / Código</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold font-mono"
                                    placeholder="Ex: IMG-001"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Categoria</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold"
                                >
                                    <option value="">Selecione...</option>
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
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
                                    placeholder="0,00"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Estoque Inicial</label>
                                <input
                                    type="number"
                                    required
                                    value={stock}
                                    onChange={e => setStock(e.target.value)}
                                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm focus:ring-1 focus:ring-brand-gold font-mono"
                                    placeholder="0"
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
                                placeholder="Detalhes do produto..."
                            />
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
                                    <p className="text-[8px] text-stone-300 mt-1">PNG, JPG até 2MB</p>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                        </div>

                        {/* Extra Images Gallery */}
                        <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-4">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-3 flex justify-between items-center">
                                Galeria (Outros Ângulos)
                                <span className="text-[8px] font-normal">{extraImages.length} fotos</span>
                            </label>

                            <div className="grid grid-cols-3 gap-2">
                                {extraImages.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-stone-100 dark:border-stone-800 group/extra">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExtraImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/extra:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}

                                {extraImages.length < 5 && (
                                    <div className="relative aspect-square border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-sm flex items-center justify-center hover:border-brand-gold transition-colors cursor-pointer group/add">
                                        <Plus size={16} className="text-stone-300 group-hover/add:text-brand-gold transition-colors" />
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleExtraImageUpload} accept="image/*" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
