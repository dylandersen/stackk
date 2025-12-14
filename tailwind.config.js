/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0A0A0B',
        surface: '#1A1A1C',
        'surface-hover': '#242426',
        border: '#2A2A2E',
        primary: '#F97316',
        'primary-hover': '#EA580C',
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        'text-primary': '#FFFFFF',
        'text-secondary': '#71717A',
      },
      fontFamily: {
        primary: ['"Red Hat Display"', 'sans-serif'],
        secondary: ['"Unbounded"', 'sans-serif'],
        body: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'btn': '12px',
      }
    },
  },
  plugins: [],
}

