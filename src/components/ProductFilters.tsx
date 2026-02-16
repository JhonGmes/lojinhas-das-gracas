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
    activeFilters: FilterState;
    totalResults?: number;
}

export default function ProductFilters({
    onFilterChange,
    categories,
    activeFilters,
    totalResults
}: ProductFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = React.useState<FilterState>(activeFilters);

    // Sync internal filters with props (URL changes)
    React.useEffect(() => {
        setFilters(activeFilters);
    }, [activeFilters]);

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: false,
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
        <div className="flex items-center gap-3">
            {/* Botão Discreto */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm text-[10px] font-black uppercase tracking-widest text-stone-600 dark:text-stone-400 hover:border-brand-gold hover:text-brand-gold transition-all shadow-sm"
            >
                <Filter size={14} />
                Filtrar Tesouros
                {totalResults !== undefined && (
                    <span className="ml-1 bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded-sm">
                        {totalResults}
                    </span>
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-[100] transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer Lateral - Sempre Drawer para ser discreto */}
            <aside className={`
                fixed inset-y-0 right-0 w-80 bg-white dark:bg-stone-900 z-[101] transform transition-transform duration-500 shadow-2xl overflow-y-auto
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-xl font-black text-stone-800 dark:text-stone-100 uppercase tracking-tight">Refinar Busca</h2>
                            <div className="h-1 w-10 bg-brand-gold mt-1" />
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-stone-300 hover:text-brand-gold transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-10">
                        {/* Busca Rápida */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Palavra-chave</label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-brand-gold transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="O que procura?"
                                    value={filters.search}
                                    onChange={handleSearchChange}
                                    className="w-full bg-stone-50 dark:bg-stone-800/50 border-none rounded-sm pl-10 pr-4 py-3 text-xs font-bold outline-none ring-1 ring-stone-100 dark:ring-stone-800 focus:ring-brand-gold transition-all"
                                />
                            </div>
                        </div>

                        {/* Order By */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ordenar por</label>
                            <select
                                value={filters.sortBy}
                                onChange={handleSortChange}
                                className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-sm px-4 py-3 text-[10px] font-black uppercase outline-none focus:border-brand-gold transition-colors"
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
                                className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-gold border-b border-brand-gold/10 pb-2"
                            >
                                Categorias
                                {expandedSections.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {expandedSections.categories && (
                                <div className="flex flex-wrap gap-2 animate-fade-in">
                                    {categories.map((cat: string) => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleFilter('category', cat)}
                                            className={`px-3 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${filters.category.includes(cat)
                                                ? 'bg-brand-gold text-brand-wood shadow-sm'
                                                : 'bg-stone-50 dark:bg-stone-800 text-stone-500 hover:bg-stone-100'
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
                                className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-gold border-b border-brand-gold/10 pb-2"
                            >
                                Faixa de Preço
                                {expandedSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {expandedSections.price && (
                                <div className="space-y-5 animate-fade-in pt-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        step="10"
                                        value={filters.priceRange[1]}
                                        onChange={handlePriceChange}
                                        className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-brand-gold"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">R$ 0</span>
                                        <span className="text-[10px] font-black text-stone-800 dark:text-stone-100 bg-brand-gold/10 px-3 py-1.5 rounded-sm">Até R$ {filters.priceRange[1]}</span>
                                    </div>
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
                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-stone-300 hover:text-brand-gold transition-colors border-t border-stone-100 dark:border-stone-800 mt-10"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};
