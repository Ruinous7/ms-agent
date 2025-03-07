'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import '../../styles/nprogress.css';
import { Suspense } from 'react';

// This component safely uses useSearchParams inside a Suspense boundary
function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle route changes
  useEffect(() => {
    // Start the progress bar
    NProgress.start();
    
    // Complete the progress bar after a short delay
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return null;
}

// Initialize NProgress only once
function InitializeNProgress() {
  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      minimum: 0.1,
      speed: 300,
      easing: 'ease',
      trickleSpeed: 200
    });
  }, []);
  
  return null;
}

// Main component that wraps the inner component with Suspense
export function NavigationProgress() {
  return (
    <>
      <InitializeNProgress />
      <Suspense fallback={null}>
        <NavigationProgressInner />
      </Suspense>
    </>
  );
} 