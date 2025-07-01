import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useEffect } from 'react';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useThemeStore();

  // S'assure que la classe est appliquée au chargement initial
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-300"
      aria-label="Changer de thème"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
