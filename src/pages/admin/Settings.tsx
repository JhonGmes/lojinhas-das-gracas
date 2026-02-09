import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Save, Globe, MessageSquare, Palette, Layout, Loader2, CheckCircle, PlusCircle, TrendingUp } from 'lucide-react';

export function Settings() {
    const { settings, updateSettings, loading } = useStore();
    const [formData, setFormData] = useState(settings);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Sync form with context when loaded
    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    // Real-time preview of primary color
    useEffect(() => {
        if (formData.primary_color) {
            document.documentElement.style.setProperty('--color-primary', formData.primary_color);
            document.documentElement.style.setProperty('--color-primary-dark', formData.primary_color + 'CC');
        }
    }, [formData.primary_color]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSettings(formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar as configurações: " + (error.message || "Verifique as colunas do banco de dados"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Carregando Configurações...</span>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">Configurações da Loja</h1>
                    <p className="text-stone-400 text-sm">Personalize o visual e as informações do seu SaaS</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg ${saved ? 'bg-green-500 text-white' : 'bg-brand-gold hover:bg-amber-600 text-white'
                        }`}
                >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
                    {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Gerais */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="text-brand-gold" size={20} />
                        <h2 className="font-bold text-stone-700 dark:text-stone-200">Informações Gerais</h2>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nome da Loja</label>
                        <input
                            type="text"
                            value={formData.store_name}
                            onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                            placeholder="Ex: Minha Loja"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">E-mail de Contato</label>
                        <input
                            type="email"
                            value={formData.store_email || ''}
                            onChange={e => setFormData({ ...formData, store_email: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                            placeholder="contato@loja.com"
                        />
                    </div>
                </div>

                {/* Vendas & WhatsApp */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="text-green-500" size={20} />
                        <h2 className="font-bold text-stone-700 dark:text-stone-200">Vendas & WhatsApp</h2>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Número do WhatsApp</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-bold">+</span>
                            <input
                                type="text"
                                value={formData.whatsapp_number}
                                onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value.replace(/\D/g, '') })}
                                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors font-mono"
                                placeholder="5599999999999"
                            />
                        </div>
                        <p className="text-[9px] text-stone-400 italic">Digite apenas números (com DDD e código do país)</p>
                    </div>
                </div>

                {/* Identidade Visual */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Palette className="text-amber-500" size={20} />
                        <h2 className="font-bold text-stone-700 dark:text-stone-200">Identidade Visual</h2>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cor Principal</label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="color"
                                value={formData.primary_color}
                                onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent"
                            />
                            <input
                                type="text"
                                value={formData.primary_color}
                                onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold uppercase font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Logo & Banner */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Layout className="text-indigo-500" size={20} />
                        <h2 className="font-bold text-stone-700 dark:text-stone-200">Logotipo da Loja</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">URL da Logo</label>
                            <input
                                type="text"
                                value={formData.logo_url || ''}
                                onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-stone-100 dark:border-stone-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-stone-800 px-2 text-stone-400">ou</span>
                            </div>
                        </div>

                        <div>
                            <input
                                type="file"
                                id="logo-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, logo_url: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <label
                                htmlFor="logo-upload"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors font-bold text-xs uppercase"
                            >
                                <PlusCircle size={16} />
                                Anexar Imagem Local
                            </label>
                        </div>
                    </div>

                    {formData.logo_url && (
                        <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl flex flex-col items-center gap-2">
                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest self-start">Prévia:</div>
                            <img src={formData.logo_url} className="h-16 object-contain" alt="Preview" />
                            <button
                                onClick={() => setFormData({ ...formData, logo_url: '' })}
                                className="text-[10px] text-red-500 hover:underline uppercase font-bold"
                            >
                                Remover Logo
                            </button>
                        </div>
                    )}
                </div>
                {/* Marketing & Banner */}
                <div className="md:col-span-2 bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-brand-gold" size={22} />
                        <h2 className="text-lg font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider">Marketing & Banner Principal</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Título do Banner</label>
                                <input
                                    type="text"
                                    value={formData.hero_title || ''}
                                    onChange={e => setFormData({ ...formData, hero_title: e.target.value })}
                                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                                    placeholder="Ex: Encontre Paz e Devoção"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Subtítulo</label>
                                <textarea
                                    value={formData.hero_subtitle || ''}
                                    onChange={e => setFormData({ ...formData, hero_subtitle: e.target.value })}
                                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors min-h-[100px]"
                                    placeholder="Descreva sua oferta principal..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Texto do Botão</label>
                                <input
                                    type="text"
                                    value={formData.hero_button_text || ''}
                                    onChange={e => setFormData({ ...formData, hero_button_text: e.target.value })}
                                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                                    placeholder="Ex: Ver Ofertas"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Imagem do Banner</label>
                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        id="banner-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, hero_image_url: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="banner-upload"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-6 bg-stone-50 dark:bg-stone-900 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl cursor-pointer hover:border-brand-gold transition-colors font-bold text-xs uppercase text-stone-500"
                                    >
                                        <PlusCircle size={20} />
                                        Trocar Imagem do Banner
                                    </label>

                                    {formData.hero_image_url && (
                                        <div className="relative group rounded-xl overflow-hidden aspect-video">
                                            <img src={formData.hero_image_url} className="w-full h-full object-cover" alt="Banner Preview" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setFormData({ ...formData, hero_image_url: '' })}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
