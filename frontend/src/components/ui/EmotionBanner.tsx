import React from 'react';
import { Info, X } from 'lucide-react';

interface EmotionBannerProps {
  emotion: string;
  message: string;
  onDismiss: () => void;
}

const EmotionBanner: React.FC<EmotionBannerProps> = ({ emotion, message, onDismiss }) => {
  const emotionStyles = {
    confused: 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    curious: 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    default: 'bg-sky-100 border-sky-500 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200',
  };

  const style = emotionStyles[emotion as keyof typeof emotionStyles] || emotionStyles.default;

  return (
    <div className={`p-4 border-l-4 rounded-r-lg flex items-center justify-between ${style}`}>
      <div className="flex items-center">
        <Info className="h-6 w-6 mr-3" />
        <p>{message}</p>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss banner" className="p-1 rounded-full hover:bg-black/10">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default EmotionBanner;
