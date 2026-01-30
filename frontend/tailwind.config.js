/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    purple: '#6B46C1',
                    blue: '#3B82F6',
                },
                secondary: {
                    orange: '#F97316',
                    teal: '#14B8A6',
                    pink: '#EC4899',
                    green: '#10B981',
                    yellow: '#FBBF24',
                    red: '#EF4444',
                },
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    600: '#4B5563',
                    900: '#111827',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
            fontSize: {
                xs: '12px',
                sm: '14px',
                base: '16px',
                lg: '18px',
                xl: '20px',
                '2xl': '24px',
                '3xl': '30px',
                '4xl': '36px',
            },
            spacing: {
                '1': '4px',
                '2': '8px',
                '3': '12px',
                '4': '16px',
                '5': '20px',
                '6': '24px',
                '8': '32px',
                '10': '40px',
                '12': '48px',
                '16': '64px',
            },
            borderRadius: {
                'sm': '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '24px',
                'full': '9999px',
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
                'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
                'xl': '0 20px 25px rgba(0, 0, 0, 0.15)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)',
            },
        },
    },
    plugins: [],
}
