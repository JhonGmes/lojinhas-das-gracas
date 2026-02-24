import React from 'react';

export const LoadingScreen: React.FC = () => {

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-stone-900 animate-fade-in">
            <div className="relative flex flex-col items-center">
                {/* Minimalist Golden Spinner */}
                <div className="relative mb-6">
                    <div className="w-12 h-12 border-2 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
                    <div className="absolute inset-0 bg-brand-gold/10 blur-xl rounded-full" />
                </div>

                {/* Loading Text */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 animate-pulse">
                        Paz e Bem
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" />
                    </div>
                </div>
            </div>
        </div>
    );
};
