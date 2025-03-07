'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center" dir="rtl">
      <div className="space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">משהו השתבש</h1>
        <p className="text-muted-foreground">
          אירעה שגיאה בלתי צפויה. אנו מתנצלים על אי הנוחות.
        </p>
        <div className="pt-6 flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            נסה שוב
          </button>
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
} 