
import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface EmotionAwareHeaderProps {
  onMenuClick: () => void;
  emotion: string; // e.g., 'neutral', 'focused', 'curious'
}

const EmotionAwareHeader: React.FC<EmotionAwareHeaderProps> = ({ onMenuClick, emotion }) => {
  const emotionColor = {
    neutral: 'border-transparent',
    focused: 'border-green-400',
    curious: 'border-yellow-400',
    confused: 'border-red-400',
  }[emotion] || 'border-transparent';

  return (
    <header className={`sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b-4 ${emotionColor} transition-all duration-300`}>
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          title="Open menu"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold">Tableau de Bord</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default EmotionAwareHeader;
