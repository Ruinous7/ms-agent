"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function ContentStrategyPage() {
  const [contentStrategy, setContentStrategy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContentStrategy = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/actions/content-strategy', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content strategy');
      }

      const data = await response.json();
      setContentStrategy(data.contentStrategy);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">אסטרטגיית תוכן</h1>
      
      <Button 
        onClick={generateContentStrategy}
        disabled={loading}
        className="mb-6"
      >
        {loading ? 'מייצר אסטרטגיה...' : 'צור אסטרטגיית תוכן'}
      </Button>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {contentStrategy && (
        <div className="bg-card rounded-lg p-6 border whitespace-pre-wrap">
          {contentStrategy}
        </div>
      )}
    </div>
  );
} 