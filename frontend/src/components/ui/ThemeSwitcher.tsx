import { Sun, Moon } from 'lucide-react';
// Make sure the path is correct; if the file does not exist, create it as shown below.
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
      className="p-2 rounded-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
      aria-label="Changer de thème"
    >
      {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  );
};

export default ThemeSwitcher;
