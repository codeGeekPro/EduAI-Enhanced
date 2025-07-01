import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useThemeStore } from '../../stores/themeStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, initializeTheme } = useThemeStore();

  useEffect(() => {
    // Initialise le thème au montage du composant
    initializeTheme();
  }, [initializeTheme]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
