import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center" dir="rtl">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">הדף לא נמצא</h2>
        <p className="text-muted-foreground">
          מצטערים, הדף שחיפשת אינו קיים או שהוסר.
        </p>
        <div className="pt-6">
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
} 