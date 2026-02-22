import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    emoji?: string;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

export function EmptyState({
    icon,
    emoji,
    title,
    message,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-24 px-8 bg-white rounded-sm border border-dashed border-stone-200 dark:bg-stone-900/30 dark:border-stone-800">
            {/* Icon or Emoji */}
            <div className="mb-6">
                {icon ? (
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                        {icon}
                    </div>
                ) : (
                    <span className="text-5xl">{emoji || '🕊️'}</span>
                )}
            </div>

            {/* Text */}
            <h3 className="text-sm font-black text-stone-800 dark:text-stone-100 uppercase tracking-widest mb-2">
                {title}
            </h3>
            {message && (
                <p className="text-[10px] text-stone-400 uppercase tracking-widest max-w-xs leading-relaxed mb-8">
                    {message}
                </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="bg-brand-gold text-brand-wood px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-soft hover:bg-brand-wood hover:text-white transition-all"
                    >
                        {actionLabel}
                    </button>
                )}
                {secondaryActionLabel && onSecondaryAction && (
                    <button
                        onClick={onSecondaryAction}
                        className="border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all"
                    >
                        {secondaryActionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
