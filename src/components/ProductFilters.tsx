import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';

export interface FilterState {
    search: string;
    category: string[];
    priceRange: [number, number];
    materials: string[];
    colors: string[];
    sortBy: string;
}

interface ProductFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    categories: string[];
    materials: string[];
    colors: { name: string; hex: string }[];
    totalResults?: number;
}

export default function ProductFilters({
    onFilterChange,
    categories,
    materials,
    colors,
    totalResults
}: ProductFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        category: [],
        priceRange: [0, 1000],
        materials: [],
        colors: [],
        sortBy: 'newest'
    });

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        materials: false,
        colors: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilters = { ...filters, search: e.target.value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const toggleFilter = (section: 'category' | 'materials' | 'colors', value: string) => {
        const current = filters[section];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];

        const newFilters = { ...filters, [section]: updated };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        const newFilters = { ...filters, priceRange: [0, value] as [number, number] };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilters = { ...filters, sortBy: e.target.value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="relative">
            {/* Botão Mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-wood text-brand-gold p-4 rounded-full shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest border border-brand-gold/30"
            >
                <div className="relative">
                    <Filter size={20} />
                    {totalResults !== undefined && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            {totalResults}
                        </span>
                    )}
                </div>
                Filtros
            </button>

            {/* Overlay Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar / Drawer */}
            <aside className={`
                fixed inset-y-0 right-0 w-80 bg-white dark:bg-stone-900 z-50 transform transition-transform duration-500 shadow-2xl overflow-y-auto
                lg:static lg:w-full lg:shadow-none lg:translate-x-0 lg:z-0 lg:rounded-sm lg:border lg:border-stone-100 dark:lg:border-stone-800
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8 lg:hidden">
                        <div>
                            <h2 className="text-xl font-black text-stone-800 uppercase tracking-tight">Filtros</h2>
                            {totalResults !== undefined && <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{totalResults} tesouros encontrados</p>}
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:text-stone-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Busca Rápida */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-brand-gold transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar nos tesouros..."
                                value={filters.search}
                                onChange={handleSearchChange}
                                className="w-full bg-stone-50 border-none rounded-sm pl-10 pr-4 py-3 text-xs font-bold outline-none ring-1 ring-stone-100 focus:ring-brand-gold transition-all"
                            />
                        </div>

                        {/* Order By */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center justify-between">
                                Ordenar por
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={handleSortChange}
                                className="w-full bg-white border border-stone-200 rounded-sm px-4 py-2.5 text-[10px] font-bold outline-none focus:border-brand-gold transition-colors"
                            >
                                <option value="newest">Mais Recentes</option>
                                <option value="price_asc">Menor Preço</option>
                                <option value="price_desc">Maior Preço</option>
                                <option value="best_rated">Mais Vendidos</option>
                            </select>
                        </div>

                        {/* Categorias */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('categories')}
                                type="button"
                                className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold"
                            >
                                Categorias
                                {expandedSections.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {expandedSections.categories && (
                                <div className="flex flex-wrap gap-2 animate-fade-in text-[10px] font-black uppercase tracking-widest">
                                    {categories.map((cat: string) => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleFilter('category', cat)}
                                            className={`px-3 py-1.5 rounded-sm transition-all ${filters.category.includes(cat)
                                                ? 'bg-brand-gold text-brand-wood shadow-soft'
                                                : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Faixa de Preço */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('price')}
                                type="button"
                                className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold"
                            >
                                Faixa de Preço
                                {expandedSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {expandedSections.price && (
                                <div className="space-y-4 animate-fade-in">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        step="10"
                                        value={filters.priceRange[1]}
                                        onChange={handlePriceChange}
                                        className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-brand-gold"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">R$ 0</span>
                                        <span className="text-xs font-black text-stone-800 bg-brand-gold/10 px-2 py-1 rounded-sm">Até R$ {filters.priceRange[1]}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Materiais */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('materials')}
                                type="button"
                                className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold"
                            >
                                Materiais
                                {expandedSections.materials ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {expandedSections.materials && (
                                <div className="flex flex-wrap gap-2 animate-fade-in">
                                    {materials.map((mat: string) => (
                                        <button
                                            key={mat}
                                            onClick={() => toggleFilter('materials', mat)}
                                            className={`px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${filters.materials.includes(mat)
                                                ? 'bg-brand-gold text-brand-wood'
                                                : 'bg-stone-50 text-stone-500'
                                                }`}
                                        >
                                            {mat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cores */}
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('colors')}
                                type="button"
                                className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold"
                            >
                                Cores
                                {expandedSections.colors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {expandedSections.colors && (
                                <div className="flex flex-wrap gap-3 animate-fade-in">
                                    {colors.map((color: { name: string; hex: string }) => (
                                        <button
                                            key={color.name}
                                            onClick={() => toggleFilter('colors', color.name)}
                                            className={`w-6 h-6 rounded-full border-2 transition-all p-0.5 ${filters.colors.includes(color.name) ? 'border-brand-gold scale-125 shadow-soft' : 'border-transparent'}`}
                                            title={color.name}
                                        >
                                            <div
                                                className="w-full h-full rounded-full shadow-inner"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botão Limpar Filtros */}
                        <button
                            onClick={() => {
                                const reset: FilterState = {
                                    search: '',
                                    category: [],
                                    priceRange: [0, 1000],
                                    materials: [],
                                    colors: [],
                                    sortBy: 'newest'
                                };
                                setFilters(reset);
                                onFilterChange(reset);
                            }}
                            className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-stone-300 hover:text-brand-gold transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};
