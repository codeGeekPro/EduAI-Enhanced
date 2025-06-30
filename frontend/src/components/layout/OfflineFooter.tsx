import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineFooter: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 text-center text-sm z-50">
      <div className="container mx-auto flex items-center justify-center">
        <WifiOff className="h-5 w-5 mr-2" />
        <span>Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.</span>
      </div>
    </footer>
  );
};

export default OfflineFooter;
