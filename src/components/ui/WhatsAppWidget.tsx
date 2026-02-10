import { MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useState, useRef, useEffect } from 'react';

export function WhatsAppWidget() {
    const { settings } = useStore();
    const [position, setPosition] = useState({ x: 24, y: 24 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaX = dragRef.current.startX - e.clientX;
            const deltaY = dragRef.current.startY - e.clientY;

            // Limit bounds to keep it within screen
            const newX = Math.max(10, Math.min(window.innerWidth - 60, dragRef.current.initialX + deltaX));
            const newY = Math.max(10, Math.min(window.innerHeight - 60, dragRef.current.initialY + deltaY));

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
        e.preventDefault();
    };

    if (!settings.whatsapp_number) return null;

    const message = encodeURIComponent(`Olá! Estou visitando a ${settings.store_name} e gostaria de tirar uma dúvida.`);
    const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${message}`;

    return (
        <div
            className="fixed z-[9999] flex items-center gap-3 transition-opacity duration-300"
            style={{
                bottom: `${position.y}px`,
                right: `${position.x}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="bg-white dark:bg-stone-800 text-stone-800 dark:text-white px-4 py-2 rounded-xl shadow-xl text-xs font-bold border border-stone-100 dark:border-stone-700 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap hidden md:block select-none">
                Dúvidas? Fale conosco!
            </div>

            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block"
                onClick={(e) => {
                    // Prevent navigation if dragged significantly
                    if (isDragging || Math.abs(position.x - dragRef.current.initialX) > 10) {
                        e.preventDefault();
                    }
                }}
            >
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center">
                    <MessageCircle size={24} fill="currentColor" />
                </div>
            </a>
        </div>
    );
}
