'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface Option {
  id: string;
  display: string;
  he_value: string;
  option_key?: string;
  allows_free_text?: boolean;
}

interface Question {
  id: string;
  step: number;
  text: string;
  he_text: string;
  options: Option[];
  question_type: 'single_select' | 'multi_select' | 'free_text';
  max_selections: number;
  category?: string;
  stage_id?: number;
}

interface Stage {
  id: number;
  step_number: number;
  title: string;
  description?: string;
}

interface Props {
  initialQuestions: Question[];
  initialStages?: Stage[];
  userId: string;
}

export default function QuestionnaireComponent({ initialQuestions, initialStages = [], userId }: Props) {
  const router = useRouter();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [freeTextResponses, setFreeTextResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Group questions by stage
  const questionsByStage = initialQuestions.reduce((acc, question) => {
    const stageId = question.stage_id || 1;
    if (!acc[stageId]) {
      acc[stageId] = [];
    }
    acc[stageId].push(question);
    return acc;
  }, {} as Record<number, Question[]>);

  // Get current stage questions
  const currentStage = initialStages[currentStageIndex] || { id: 1, step_number: 1, title: 'שאלון' };
  const currentStageQuestions = questionsByStage[currentStage.id] || [];
  const totalStages = initialStages.length || 1;

  // Get current question
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = currentStageQuestions[currentQuestionIndex];
  
  const handleSingleSelectAnswer = async (questionId: string, optionId: string) => {
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
      handleNextQuestion();
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleMultiSelectAnswer = async (questionId: string, optionId: string) => {
    try {
      // Get current selections for this question
      const currentSelections = (responses[questionId] as string[]) || [];
      let newSelections: string[];
      
      // Toggle selection
      if (currentSelections.includes(optionId)) {
        newSelections = currentSelections.filter(id => id !== optionId);
      } else {
        // Check if we've reached max selections
        if (currentQuestion.max_selections && currentSelections.length >= currentQuestion.max_selections) {
          newSelections = [...currentSelections.slice(1), optionId]; // Remove oldest selection
        } else {
          newSelections = [...currentSelections, optionId];
        }
      }
      
      // Update local state
      setResponses(prev => ({ ...prev, [questionId]: newSelections }));

      // For multi-select, we'll save when moving to the next question
    } catch (error) {
      console.error('Error handling multi-select:', error);
    }
  };

  const handleFreeTextAnswer = (questionId: string, text: string) => {
    setFreeTextResponses(prev => ({ ...prev, [questionId]: text }));
  };

  const saveMultiSelectResponses = async (questionId: string, selections: string[]) => {
    try {
      // First delete any existing responses for this question
      await supabase
        .from('responses')
        .delete()
        .match({ user_id: userId, question_id: questionId });
      
      // Then insert all selected options
      for (const optionId of selections) {
        await supabase
          .from('responses')
          .insert({
            user_id: userId,
            question_id: questionId,
            option_id: optionId,
          });
      }
    } catch (error) {
      console.error('Error saving multi-select responses:', error);
    }
  };

  const saveFreeTextResponse = async (questionId: string, text: string) => {
    try {
      await supabase
        .from('responses')
        .upsert(
          {
            user_id: userId,
            question_id: questionId,
            free_text_response: text,
          },
          {
            onConflict: 'user_id,question_id',
            ignoreDuplicates: false,
          }
        );
    } catch (error) {
      console.error('Error saving free text response:', error);
    }
  };

  const handleNextQuestion = async () => {
    // Save multi-select or free text responses if needed
    if (currentQuestion) {
      if (currentQuestion.question_type === 'multi_select') {
        const selections = (responses[currentQuestion.id] as string[]) || [];
        if (selections.length > 0) {
          await saveMultiSelectResponses(currentQuestion.id, selections);
        }
      } else if (currentQuestion.question_type === 'free_text') {
        const text = freeTextResponses[currentQuestion.id] || '';
        if (text) {
          await saveFreeTextResponse(currentQuestion.id, text);
        }
      }
    }

    // Move to next question or stage
    if (currentQuestionIndex < currentStageQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to next stage
      if (currentStageIndex < totalStages - 1) {
        setCurrentStageIndex(currentStageIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        // End of questionnaire
        handleSubmitQuestionnaire();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Move to previous stage
      if (currentStageIndex > 0) {
        setCurrentStageIndex(currentStageIndex - 1);
        // Set to last question of previous stage
        const prevStageQuestions = questionsByStage[initialStages[currentStageIndex - 1].id] || [];
        setCurrentQuestionIndex(prevStageQuestions.length - 1);
      }
    }
  };

  const handleSubmitQuestionnaire = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: Object.values(responses) }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit questionnaire');
      }
      
      const data = await response.json();
      
      // Redirect to a results page or dashboard
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center space-y-4" dir="rtl">
        <h2 className="text-2xl font-bold">השאלון הושלם!</h2>
        <Button onClick={handleSubmitQuestionnaire} disabled={isSubmitting}>
          {isSubmitting ? 'מעבד...' : 'צפה באבחון העסקי'}
        </Button>
      </div>
    );
  }

  // Calculate overall progress
  const totalQuestions = Object.values(questionsByStage).reduce((sum, questions) => sum + questions.length, 0);
  const completedQuestions = currentStageIndex * (questionsByStage[currentStage.id]?.length || 0) + currentQuestionIndex;
  const progressPercentage = (completedQuestions / totalQuestions) * 100;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          שלב {currentStage.step_number} מתוך {totalStages}: {currentStage.title}
        </div>
        <div className="h-2 flex-1 mx-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.he_text}</h2>
        
        {currentQuestion.question_type === 'free_text' && (
          <div className="space-y-4">
            <Input
              value={freeTextResponses[currentQuestion.id] || ''}
              onChange={(e) => handleFreeTextAnswer(currentQuestion.id, e.target.value)}
              placeholder="הקלד את תשובתך כאן..."
              className="w-full"
            />
            <Button 
              onClick={handleNextQuestion}
              disabled={!freeTextResponses[currentQuestion.id]}
              className="mt-4"
            >
              המשך
            </Button>
          </div>
        )}

        {currentQuestion.question_type === 'single_select' && (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSingleSelectAnswer(currentQuestion.id, option.id)}
                className={`w-full p-4 text-right rounded-lg border transition-colors
                  ${responses[currentQuestion.id] === option.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'}`}
              >
                {option.he_value || option.display}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.question_type === 'multi_select' && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-2">
              בחר עד {currentQuestion.max_selections} אפשרויות
            </div>
            {currentQuestion.options.map((option) => {
              const isSelected = Array.isArray(responses[currentQuestion.id]) && 
                (responses[currentQuestion.id] as string[]).includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleMultiSelectAnswer(currentQuestion.id, option.id)}
                  className={`w-full p-4 text-right rounded-lg border transition-colors
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'}`}
                >
                  {option.he_value || option.display}
                </button>
              );
            })}
            <Button 
              onClick={handleNextQuestion}
              disabled={!Array.isArray(responses[currentQuestion.id]) || 
                (responses[currentQuestion.id] as string[])?.length === 0}
              className="mt-4"
            >
              המשך
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button
          onClick={handlePreviousQuestion}
          disabled={currentStageIndex === 0 && currentQuestionIndex === 0}
          variant="outline"
        >
          הקודם
        </Button>
        
        {/* Next button is only shown for single_select, as multi_select and free_text have their own buttons */}
        {currentQuestion.question_type === 'single_select' && (
          <Button
            onClick={handleNextQuestion}
            disabled={!responses[currentQuestion.id]}
            className="disabled:opacity-50"
          >
            הבא
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 