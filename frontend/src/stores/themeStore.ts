import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeState = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initializeTheme: () => void;
};

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const body = document.body;
    
    // Nettoie les classes existantes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Applique la nouvelle classe
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Met à jour l'attribut data-theme
    root.setAttribute('data-theme', theme);
    
    // Force le re-render en appliquant les variables CSS
    root.style.colorScheme = theme;
    
    console.log(`Theme applied: ${theme}`, {
      rootClasses: Array.from(root.classList),
      bodyClasses: Array.from(body.classList),
      dataTheme: root.getAttribute('data-theme'),
      colorScheme: root.style.colorScheme
    });
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light', // Thème par défaut
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          applyTheme(newTheme);
          return { theme: newTheme };
        }),
      initializeTheme: () => {
        const currentTheme = get().theme;
        applyTheme(currentTheme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // S'assure que le thème est appliqué après la réhydratation
        if (state?.theme) {
          // Petit délai pour s'assurer que le DOM est prêt
          setTimeout(() => {
            applyTheme(state.theme);
          }, 100);
        }
      },
    }
  )
);
