import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProducts } from "../../context/ProductContext"
import { Upload, X, PlusCircle, Star } from "lucide-react"
import { supabase } from "../../lib/supabase"

export function AddProduct() {
    const navigate = useNavigate();
    const { createProduct, categories, addCategory } = useProducts();

    const [form, setForm] = useState({
        name: '',
        code: '',
        price: '',
        stock: '10',
        category: 'Terços',
        description: '',
        image: '',
        images: [] as string[],
        isFeatured: false
    });

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.image) {
            alert('Por favor, envie pelo menos uma imagem principal.');
            return;
        }

        await createProduct({
            name: form.name,
            code: form.code,
            price: parseFloat(form.price) || 0,
            stock: parseInt(form.stock) || 0,
            category: form.category,
            description: form.description,
            image: form.image,
            images: form.images,
            isFeatured: form.isFeatured
        });

        navigate('/admin/inventory');
    };

    const handleImageUpload = async (file: File, target: 'main' | 'gallery') => {
        try {
            setUploading(true);
            const fileName = `${Date.now()}-${file.name}`;

            const { error } = await supabase.storage
                .from("product-images")
                .upload(fileName, file);

            if (error) {
                console.error("Supabase Storage Error:", error);
                alert(`Erro ao enviar imagem: ${error.message}`);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("product-images")
                .getPublicUrl(fileName);

            if (target === 'main') {
                setForm(prev => ({ ...prev, image: publicUrlData.publicUrl }));
            } else {
                setForm(prev => ({ ...prev, images: [...prev.images, publicUrlData.publicUrl] }));
            }

        } catch (err: any) {
            console.error("Upload Catch Error:", err);
            alert(`Erro no upload: ${err.message || 'Erro desconhecido'}`);
        } finally {
            setUploading(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        await addCategory(newCategoryName.trim());
        setForm(prev => ({ ...prev, category: newCategoryName.trim() }));
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <h1 className="text-2xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-widest">
                Cadastrar Produto
            </h1>

            <div className="bg-white dark:bg-stone-800 rounded-sm shadow-soft border border-brand-cotton-dark dark:border-stone-700 p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 text-stone-400">Nome do Produto</label>
                            <input
                                required
                                className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm p-3 focus:border-brand-gold outline-none transition-colors shadow-soft-sm"
                                placeholder="Ex: Terço de São Bento"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 text-stone-400">Código (SKU)</label>
                            <input
                                className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm p-3 focus:border-brand-gold outline-none transition-colors shadow-soft-sm"
                                placeholder="Ex: 007066GR"
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2 text-stone-400">Preço (R$)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm p-3 focus:border-brand-gold outline-none transition-colors shadow-soft-sm"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2 text-stone-400">Estoque Inicial</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm p-3 focus:border-brand-gold outline-none transition-colors shadow-soft-sm"
                                    placeholder="0"
                                    value={form.stock}
                                    onChange={e => setForm({ ...form, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase text-stone-400">Categoria</label>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                                    className="text-[10px] text-brand-gold font-bold uppercase flex items-center gap-1 hover:underline"
                                >
                                    <PlusCircle size={12} /> {isAddingCategory ? 'Cancelar' : 'Nova Categoria'}
                                </button>
                            </div>

                            {isAddingCategory ? (
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        className="flex-1 bg-white dark:bg-stone-900 border border-brand-gold rounded-sm p-3 text-sm outline-none"
                                        placeholder="Nome da nova categoria..."
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="bg-brand-gold text-brand-wood px-6 rounded-sm font-bold text-xs uppercase tracking-widest"
                                    >
                                        Add
                                    </button>
                                </div>
                            ) : (
                                <select
                                    className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm p-3 outline-none focus:border-brand-gold transition-colors shadow-soft-sm appearance-none"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                >
                                    {categories.map((cat: string) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 text-stone-400">Descrição Detalhada</label>
                            <textarea
                                className="w-full bg-white dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm p-3 h-32 focus:border-brand-gold outline-none resize-none transition-colors shadow-soft-sm"
                                placeholder="Conte sobre o produto, materiais, significados..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className="p-4 bg-brand-cotton dark:bg-stone-900 border border-brand-cotton-dark dark:border-stone-700 rounded-sm flex items-center justify-between shadow-soft-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-sm ${form.isFeatured ? 'bg-amber-100 text-brand-gold' : 'bg-stone-100 text-stone-400'}`}>
                                    <Star size={20} fill={form.isFeatured ? 'currentColor' : 'none'} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-stone-700 dark:text-stone-200">Destaque da Vitrine</div>
                                    <div className="text-[10px] text-stone-400 uppercase font-bold tracking-tight">Mostrar no topo da página inicial</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${form.isFeatured ? 'bg-brand-gold' : 'bg-stone-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isFeatured ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 text-stone-400">Imagem Principal</label>
                            <div className="aspect-square bg-white dark:bg-stone-900 border-2 border-dashed border-brand-cotton-dark dark:border-stone-700 rounded-sm flex flex-col items-center justify-center text-stone-400 hover:border-brand-gold transition-all duration-400 cursor-pointer relative overflow-hidden group">
                                {form.image ? (
                                    <>
                                        <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-xs font-bold uppercase tracking-widest">Trocar Foto</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={40} className={`mb-2 ${uploading ? 'animate-bounce' : ''}`} />
                                        <span className="text-sm font-bold uppercase tracking-tight">{uploading ? 'Subindo...' : 'Enviar Foto'}</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploading}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(file, 'main');
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 text-stone-400">Galeria de Fotos (Opcional)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {form.images.map((img: string, idx: number) => (
                                    <div key={idx} className="aspect-square rounded-sm overflow-hidden relative group">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {form.images.length < 4 && (
                                    <div className="aspect-square bg-brand-cotton dark:bg-stone-900 border border-dashed border-brand-cotton-dark dark:border-stone-700 rounded-sm flex items-center justify-center text-stone-400 hover:border-brand-gold cursor-pointer relative">
                                        <PlusCircle size={24} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            disabled={uploading}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(file, 'gallery');
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-brand-gold hover:bg-brand-gold-light disabled:bg-stone-300 text-brand-wood font-bold py-4 px-8 rounded-sm shadow-soft active:transform active:scale-[0.98] transition-all duration-400 text-xs uppercase tracking-widest"
                            >
                                {uploading ? 'Carregando Imagens...' : 'Salvar Produto na Loja'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
