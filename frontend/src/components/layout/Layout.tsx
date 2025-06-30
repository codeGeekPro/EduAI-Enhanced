import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans">
      <Header />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
};

export default Layout;
