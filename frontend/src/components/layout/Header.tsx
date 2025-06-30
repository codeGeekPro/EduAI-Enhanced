import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { BookOpen, Home, BarChart2 } from 'lucide-react';

const Header = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 left-0 right-0 z-50 bg-background/80 dark:bg-dark-bg/80 backdrop-blur-sm shadow-sm"
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">EduAI</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 font-medium">
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
            Accueil
          </Link>
          <Link to="/courses" className="text-foreground/80 hover:text-primary transition-colors">
            Cours
          </Link>
          <Link to="/progress" className="text-foreground/80 hover:text-primary transition-colors">
            Progrès
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          >
            Connexion
          </Link>
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;
