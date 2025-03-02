'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function SetupQuestionnairePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleSetupQuestionnaire = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/setup-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up questionnaire');
      }
      
      setResult({ 
        success: true, 
        message: data.message || 'Questionnaire set up successfully' 
      });
    } catch (err) {
      setResult({ 
        success: false, 
        error: err instanceof Error ? err.message : 'An unexpected error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Set Up Enhanced Questionnaire</CardTitle>
          <CardDescription>
            This will update your database schema to support the enhanced questionnaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This action will:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Add new columns to the questions table</li>
            <li>Add new columns to the options table</li>
            <li>Add new columns to the responses table</li>
            <li>Create a new question_stages table</li>
            <li>Create a new option_sets table</li>
          </ul>
          
          {result && (
            <Alert className="mt-6" variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>
                {result.message || result.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSetupQuestionnaire} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Setting Up...' : 'Set Up Questionnaire'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 