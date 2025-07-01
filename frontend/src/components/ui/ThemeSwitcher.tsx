import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useEffect } from 'react';

const ThemeSwitcher = () => {
  const { theme, toggleTheme, initializeTheme } = useThemeStore();

  // S'assure que la classe est appliquée au chargement initial
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Force le re-render quand le thème change
  useEffect(() => {
    // Force le recalcul des styles
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
  }, [theme]);

  const handleThemeToggle = () => {
    toggleTheme();
    // Force un refresh des styles
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  };

  return (
    <button
      onClick={handleThemeToggle}
      className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 border border-border"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
