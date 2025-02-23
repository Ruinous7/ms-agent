'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Option {
  id: string;
  display: string;
  he_value: string;
}

interface Question {
  id: string;
  step: number;
  text: string;
  he_text: string;
  options: Option[];
}

interface Props {
  initialQuestions: Question[];
  userId: string;
}

export default function QuestionnaireComponent({ initialQuestions, userId }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const supabase = createClient();

  const currentQuestion = initialQuestions.find(q => q.step === currentStep);
  const totalSteps = Math.max(...initialQuestions.map(q => q.step));

  const handleAnswer = async (questionId: string, optionId: string) => {
    try {
      // Update local state
      setResponses(prev => ({ ...prev, [questionId]: optionId }));

      // Save to Supabase with proper upsert handling
      await supabase
        .from('responses')
        .upsert(
          {
            user_id: userId,
            question_id: questionId,
            option_id: optionId,
          },
          {
            onConflict: 'user_id,question_id',
            ignoreDuplicates: false,
          }
        );

      // Auto-advance to next question
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleCompletion = async () => {
    try {
      // You might want to add final submission logic here
      router.push('/protected');
    } catch (error) {
      console.error('Error completing questionnaire:', error);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center space-y-4" dir="rtl">
        <h2 className="text-2xl font-bold">השאלון הושלם!</h2>
        <Button onClick={handleCompletion}>
          צפה באבחון העסקי
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          שאלה {currentStep} מתוך {totalSteps}
        </div>
        <div className="h-2 flex-1 mx-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.he_text}</h2>
        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(currentQuestion.id, option.id)}
              className={`w-full p-4 text-right rounded-lg border transition-colors
                ${responses[currentQuestion.id] === option.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'}`}
            >
              {option.he_value || option.display}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
          variant="outline"
        >
          הקודם
        </Button>
        <Button onClick={() => setCurrentStep(currentStep + 1)}>
          הבא
        </Button>
      </div>
    </div>
  );
} 