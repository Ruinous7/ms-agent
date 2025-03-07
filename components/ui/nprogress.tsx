'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import '../../styles/nprogress.css';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize NProgress
  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      minimum: 0.1,
      speed: 300,
      easing: 'ease',
      trickleSpeed: 200
    });
  }, []);

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