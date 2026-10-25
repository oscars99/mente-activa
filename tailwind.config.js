/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        crema: '#FBF7EF',
        tinta: { DEFAULT: '#1F2933', suave: '#4A5561' },
        primario: { DEFAULT: '#0F6B6B', oscuro: '#0A4F4F', claro: '#DCEFEC' },
        acento: { DEFAULT: '#A8460A', claro: '#FCEBDD' },
        exito: { DEFAULT: '#166534', claro: '#DCFCE7' },
        borde: '#D9D2C3',
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Base is set on <html> (20–26px) so every rem scales with the user's text size.
        jumbo: ['3.25rem', { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
};
