"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function MarketingPlanPage() {
  const [marketingPlan, setMarketingPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMarketingPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/actions/marketing-plan', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate marketing plan');
      }

      const data = await response.json();
      setMarketingPlan(data.marketingPlan);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">תוכנית שיווק</h1>
      
      <Button 
        onClick={generateMarketingPlan}
        disabled={loading}
        className="mb-6"
      >
        {loading ? 'מייצר תוכנית...' : 'צור תוכנית שיווק'}
      </Button>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {marketingPlan && (
        <div className="bg-card rounded-lg p-6 border whitespace-pre-wrap">
          {marketingPlan}
        </div>
      )}
    </div>
  );
} 