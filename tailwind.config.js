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
                    gold: '#efc26c',
                    amber: '#d4a34d',
                    brown: '#78350f',
                    wood: '#451a03',
                    cotton: '#f9f6f1',
                    cream: '#fef3c7',
                },
                whatsapp: '#25D366',
            },
            fontFamily: {
                sans: ['"Inter Tight"', 'Inter', 'sans-serif'],
                display: ['"Playfair Display"', 'Alice', 'serif'],
                script: ['"Cookie"', 'cursive'],
                base: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
