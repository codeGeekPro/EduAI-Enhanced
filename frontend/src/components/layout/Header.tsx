import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { Menu, X, BookOpen, BarChart3, GraduationCap, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Accueil', path: '/', icon: BookOpen },
  { name: 'Cours', path: '/courses', icon: GraduationCap },
  { name: 'Progrès', path: '/progress', icon: BarChart3 },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-primary-foreground font-bold text-sm group-hover:scale-110 transition-transform">
              🎓
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              EduAI
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
            <Button size="sm">
              Connexion
            </Button>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur"
          >
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border">
                <Button fullWidth className="mb-2">
                  Connexion
                </Button>
                <Button variant="outline" fullWidth>
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
