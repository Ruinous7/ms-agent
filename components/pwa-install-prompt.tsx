'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { Suspense } from 'react';

// Inner component that handles the actual PWA install logic
function PWAInstallPromptInner() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);
      // Show our custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the saved prompt regardless of outcome
    setDeferredPrompt(null);

    // Hide our custom prompt
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t shadow-lg z-50" dir="rtl">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">התקן את האפליקציה</h3>
          <p className="text-sm text-muted-foreground">התקן את האפליקציה למסך הבית שלך לגישה מהירה</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPrompt(false)}>
            <X className="h-4 w-4 ml-1" />
            לא עכשיו
          </Button>
          <Button size="sm" onClick={handleInstallClick}>
            <Download className="h-4 w-4 ml-1" />
            התקן
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export function PWAInstallPrompt() {
  return (
    <Suspense fallback={null}>
      <PWAInstallPromptInner />
    </Suspense>
  );
} 