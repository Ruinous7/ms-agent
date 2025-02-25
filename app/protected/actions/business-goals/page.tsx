"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BusinessGoalsPage() {
  const [businessGoals, setBusinessGoals] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBusinessGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/actions/business-goals', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate business goals');
      }

      const data = await response.json();
      setBusinessGoals(data.businessGoals);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">יעדים עסקיים SMART</h1>
        <Link 
          href="/protected"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          חזרה ללוח הבקרה
        </Link>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <p className="text-sm">
          יעדי SMART הם יעדים ספציפיים, מדידים, ברי השגה, רלוונטיים ותחומים בזמן. 
          המערכת תייצר יעדים המותאמים לעסק שלך בהתבסס על האבחון העסקי.
        </p>
      </div>

      <Button 
        onClick={generateBusinessGoals}
        disabled={loading}
        className="mb-6"
      >
        {loading ? 'מייצר יעדים...' : 'צור יעדים עסקיים'}
      </Button>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {businessGoals && (
        <div className="bg-card rounded-lg p-6 border whitespace-pre-wrap">
          {businessGoals}
        </div>
      )}
    </div>
  );
} 