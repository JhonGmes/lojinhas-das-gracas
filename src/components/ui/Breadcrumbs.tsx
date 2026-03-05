import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs = memo(({ items }: BreadcrumbsProps) => {
    return (
        <nav className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-6 overflow-x-auto no-scrollbar py-1">
            <Link
                to="/"
                className="hover:text-brand-gold transition-colors flex items-center gap-1 shrink-0"
            >
                <Home size={10} />
                <span>Início</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 shrink-0">
                    <ChevronRight size={10} className="text-stone-300" />
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="hover:text-brand-gold transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-brand-gold truncate max-w-[150px]">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
});

Breadcrumbs.displayName = 'Breadcrumbs';
