/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    // Sacred Minimalism Palette
                    gold: '#D4AF37',      // Rich Gold - Spiritual wealth
                    'gold-light': '#E8C872', // Soft gold for accents
                    cream: '#FAF3E0',      // Warm cream
                    cotton: '#F8F4EE',     // Egyptian cotton - main bg
                    'cotton-dark': '#EDE8E0', // Subtle contrast
                    brown: '#78350f',      // Deep ceremonial brown
                    wood: '#3E2723',       // Dark wood accent
                    amber: '#d4a34d',      // Warm amber (legacy)
                },
                whatsapp: '#25D366',
            },
            fontFamily: {
                sans: ['"Inter Tight"', 'Inter', 'sans-serif'],
                display: ['"Cinzel"', '"Playfair Display"', 'Alice', 'serif'], // Solemn serif
                script: ['"Cookie"', 'cursive'],
                base: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(120, 53, 15, 0.08)',
                'soft-lg': '0 4px 16px rgba(120, 53, 15, 0.12)',
                'inner-soft': 'inset 0 2px 4px rgba(120, 53, 15, 0.06)',
            },
            transitionDuration: {
                '400': '400ms', // Contemplative transitions
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            },
            animation: {
                marquee: 'marquee 30s linear infinite',
                'marquee-slow': 'marquee 45s linear infinite',
            }
        },
    },
    plugins: [],
}
