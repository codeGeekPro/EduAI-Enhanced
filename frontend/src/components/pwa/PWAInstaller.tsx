import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18nStore } from '../../stores/i18nStore';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t } = useI18nStore();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(event);
      // Show our custom install banner
      setShowInstallBanner(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: Show manual installation instructions
      showManualInstallInstructions();
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
      instructions = `
To install EduAI on iOS:
1. Tap the Share button (square with arrow) in Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm
      `;
    } else if (isAndroid) {
      instructions = `
To install EduAI on Android:
1. Tap the menu (⋮) in your browser
2. Select "Add to Home screen" or "Install app"
3. Tap "Add" or "Install" to confirm
      `;
    } else {
      instructions = `
To install EduAI on Desktop:
1. Look for the install icon (⊕) in your browser's address bar
2. Click it and select "Install"
3. Or use Ctrl+Shift+I → Application → Manifest → Install
      `;
    }
    
    alert(instructions);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    // Store dismissal in localStorage to avoid showing again soon
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Don't show if already installed or recently dismissed
  if (isInstalled) return null;
  
  const dismissedTime = localStorage.getItem('pwa-banner-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    // Don't show again for 24 hours
    return null;
  }

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <Card className="bg-card border border-border shadow-large">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      Install EduAI
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get the app for a better experience
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={dismissBanner}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Smartphone className="h-4 w-4" />
                <span>Works on mobile</span>
                <Monitor className="h-4 w-4 ml-2" />
                <span>Works on desktop</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  icon={Download}
                  iconPosition="left"
                  className="flex-1"
                >
                  Install Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissBanner}
                  className="px-3"
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstaller;
