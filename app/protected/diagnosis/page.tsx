'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DiagnosisPage() {
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDiagnosis = async () => {
      try {
        const response = await fetch('/api/diagnosis', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to get diagnosis');
        }

        const data = await response.json();
        setDiagnosis(data.diagnosis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    getDiagnosis();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">אבחון עסקי AI</h1>
        <Button asChild variant="outline">
          <Link href="/protected">חזרה ללוח הבקרה</Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-3">מייצר אבחון...</span>
          </div>
        ) : error ? (
          <div className="text-destructive">
            שגיאה: {error}
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-right">{diagnosis}</div>
          </div>
        )}
      </div>
    </div>
  );
} 