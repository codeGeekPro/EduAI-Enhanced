import React, { useEffect } from 'react';
import Header from './Header';
import { useThemeStore } from '../../stores/themeStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 ${theme}`}>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {/* Footer pourrait être ajouté ici plus tard */}
    </div>
  );
};

export default Layout;
