import { MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function WhatsAppWidget() {
    const { settings } = useStore();

    // Se não tiver número configurado, não mostra o widget
    if (!settings.whatsapp_number) return null;

    const message = encodeURIComponent(`Olá! Estou visitando a ${settings.store_name} e gostaria de tirar uma dúvida.`);
    const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[60] group flex items-center gap-3 transition-all duration-300"
        >
            {/* Tooltip/Texto que aparece no hover */}
            <div className="bg-white dark:bg-stone-800 text-stone-800 dark:text-white px-4 py-2 rounded-xl shadow-xl text-xs font-bold border border-stone-100 dark:border-stone-700 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap hidden md:block">
                Dúvidas? Fale conosco!
            </div>

            {/* O Botão principal flutuante */}
            <div className="relative">
                {/* Animação de Pulsar */}
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>

                <div className="relative bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 md:p-3 rounded-full shadow-2xl transition-all transform group-hover:scale-110 active:scale-95 flex items-center justify-center">
                    <MessageCircle size={24} fill="currentColor" />
                </div>
            </div>
        </a>
    );
}
