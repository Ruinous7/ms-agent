'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Info } from 'lucide-react';
import { Suspense } from 'react';

// Inner component that handles the actual PWA install logic
function PWAInstallPromptInner() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

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
      // We're not showing the prompt automatically anymore
      // setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    // We're removing the automatic prompt timer
    // const timer = setTimeout(() => {
    //   if (!isInstalled && !showPrompt) {
    //     setShowPrompt(true);
    //   }
    // }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      // clearTimeout(timer);
    };
  }, [isInstalled, showPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
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
    } else {
      // If no deferred prompt is available, show manual instructions
      window.location.href = '/install';
    }
  };

  // We're not showing the prompt automatically, so this component will return null
  // unless showPrompt is set to true by some other means (like a button click)
  if (!showPrompt && !showManualInstructions) return null;
  if (isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t shadow-lg z-50" dir="rtl">
      <div className="container mx-auto">
        {showManualInstructions ? (
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">הוראות התקנה ידנית</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowManualInstructions(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">בכרום (Chrome):</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>לחץ על שלוש הנקודות בפינה הימנית העליונה</li>
                  <li>בחר "התקן אפליקציה" או "הוסף למסך הבית"</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-1">בספארי (Safari) באייפון:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>לחץ על כפתור השיתוף (Share) בתחתית המסך</li>
                  <li>גלול ובחר "הוסף למסך הבית" (Add to Home Screen)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-1">בפיירפוקס (Firefox):</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>לחץ על שלוש הנקודות בפינה הימנית העליונה</li>
                  <li>בחר "התקן" או "הוסף למסך הבית"</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">התקן את האפליקציה</h3>
              <p className="text-sm text-muted-foreground">התקן את האפליקציה למסך הבית שלך לגישה מהירה ושימוש ללא אינטרנט</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowManualInstructions(true)}>
                <Info className="h-4 w-4 ml-1" />
                איך להתקין?
              </Button>
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
        )}
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