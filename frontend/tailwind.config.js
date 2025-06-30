/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette inspirée par TutorTrek/Kalvi (vert doux, beige, bleu clair)
        'beige': '#F5F5DC',
        'soft-green': '#A9D8B8',
        'light-blue': '#A8D8EA',
        'dark-text': '#2C3E50',
        'light-text': '#ECF0F1',
        'dark-bg': '#34495E',

        // Mappage sémantique pour le thème
        'brand': 'var(--color-primary)',
        'accent': 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
