import { useStore } from '../context/StoreContext';
import { Sparkles } from 'lucide-react';

export function AboutUs() {
    const { settings } = useStore();

    return (
        <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
                <Sparkles className="mx-auto text-brand-gold mb-4" size={32} />
                <h1 className="text-3xl lg:text-4xl font-display font-medium text-stone-800 dark:text-stone-100 uppercase tracking-widest mb-4">
                    Quem Somos
                </h1>
                <div className="w-24 h-px bg-brand-gold/30 mx-auto"></div>
            </div>

            <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                {settings?.about_text || 'Aqui você encontrará a história da nossa loja, escrita com muita dedicação.'}
            </div>
        </div>
    );
}
