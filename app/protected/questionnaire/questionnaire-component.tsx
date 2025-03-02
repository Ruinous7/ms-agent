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
  const [otherOptionTexts, setOtherOptionTexts] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Group questions by stage without filtering out the business name question
  const questionsByStage = initialQuestions.reduce((acc, question) => {
    const stageId = question.stage_id || 1;
    if (!acc[stageId]) {
      acc[stageId] = [];
    }
    acc[stageId].push(question);
    return acc;
  }, {} as Record<number, Question[]>);

  // Get current stage questions
  const currentStage = initialStages[currentStageIndex] || { 
    id: 1, 
    step_number: currentStageIndex + 1, 
    title: 'שאלון' 
  };
  const currentStageQuestions = questionsByStage[currentStage.id] || [];
  const totalStages = initialStages.length || 1;

  // Get current question
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = currentStageQuestions[currentQuestionIndex];
  
  const handleSingleSelectAnswer = async (questionId: string, optionId: string, option: Option) => {
    try {
      // Update local state
      setResponses(prev => ({ ...prev, [questionId]: optionId }));

      // If this is an "Other" option that allows free text, don't auto-advance
      if (option.allows_free_text) {
        return;
      }

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

  const handleMultiSelectAnswer = async (questionId: string, optionId: string, option: Option) => {
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

  const handleOtherOptionText = (questionId: string, optionId: string, text: string) => {
    setOtherOptionTexts(prev => ({
      ...prev,
      [`${questionId}_${optionId}`]: text
    }));
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

  const saveOtherOptionText = async (questionId: string, optionId: string) => {
    const key = `${questionId}_${optionId}`;
    const text = otherOptionTexts[key];
    
    if (text) {
      try {
        await supabase
          .from('responses')
          .upsert(
            {
              user_id: userId,
              question_id: questionId,
              option_id: optionId,
              free_text_response: text
            },
            {
              onConflict: 'user_id,question_id',
              ignoreDuplicates: false,
            }
          );
      } catch (error) {
        console.error('Error saving other option text:', error);
      }
    }
  };

  const handleNextQuestion = async () => {
    // Save multi-select or free text responses if needed
    if (currentQuestion) {
      if (currentQuestion.question_type === 'multi_select') {
        const selections = (responses[currentQuestion.id] as string[]) || [];
        if (selections.length > 0) {
          await saveMultiSelectResponses(currentQuestion.id, selections);
          
          // Save any "Other" option texts
          for (const optionId of selections) {
            const option = currentQuestion.options.find(o => o.id === optionId);
            if (option?.allows_free_text) {
              await saveOtherOptionText(currentQuestion.id, optionId);
            }
          }
        }
      } else if (currentQuestion.question_type === 'free_text') {
        const text = freeTextResponses[currentQuestion.id] || '';
        if (text) {
          await saveFreeTextResponse(currentQuestion.id, text);
        }
      } else if (currentQuestion.question_type === 'single_select') {
        const optionId = responses[currentQuestion.id] as string;
        if (optionId) {
          const option = currentQuestion.options.find(o => o.id === optionId);
          if (option?.allows_free_text) {
            await saveOtherOptionText(currentQuestion.id, optionId);
          }
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
      // Redirect to the diagnosis summary page
      router.push('/protected/diagnosis-summary');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center space-y-4 p-8 bg-card rounded-lg border" dir="rtl">
        <h2 className="text-2xl font-bold">השאלון הושלם בהצלחה!</h2>
        <p className="text-muted-foreground">
          תודה שהשלמת את שאלון האבחון העסקי. כעת נוכל לספק לך תובנות מותאמות אישית לעסק שלך.
        </p>
        <Button onClick={handleSubmitQuestionnaire} disabled={isSubmitting} size="lg" className="mt-4">
          {isSubmitting ? 'מעבד...' : 'צפה בסיכום התשובות שלך'}
        </Button>
      </div>
    );
  }

  // Calculate overall progress correctly
  const totalQuestions = Object.values(questionsByStage).reduce((sum, questions) => sum + questions.length, 0);
  
  // Calculate completed questions by counting all questions in previous stages plus current stage questions
  let completedQuestions = 0;
  
  // Add all questions from completed stages
  for (let i = 0; i < currentStageIndex; i++) {
    const stageId = initialStages[i]?.id;
    if (stageId && questionsByStage[stageId]) {
      completedQuestions += questionsByStage[stageId].length;
    }
  }
  
  // Add questions completed in current stage
  completedQuestions += currentQuestionIndex;
  
  const progressPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            שלב {currentStage.step_number} מתוך {totalStages}: {currentStage.title || ''}
          </div>
          <div className="text-sm text-muted-foreground">
            שאלה {currentQuestionIndex + 1} מתוך {currentStageQuestions.length}
          </div>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
            {currentQuestion.options.map((option) => {
              const isSelected = responses[currentQuestion.id] === option.id;
              
              return (
                <div key={option.id} className="space-y-2">
                  <button
                    onClick={() => handleSingleSelectAnswer(currentQuestion.id, option.id, option)}
                    className={`w-full p-4 text-right rounded-lg border transition-colors
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent'}`}
                  >
                    {option.he_value || option.display}
                  </button>
                  
                  {isSelected && option.allows_free_text && (
                    <div className="mr-4 mt-2">
                      <Input
                        value={otherOptionTexts[`${currentQuestion.id}_${option.id}`] || ''}
                        onChange={(e) => handleOtherOptionText(currentQuestion.id, option.id, e.target.value)}
                        placeholder="פרט..."
                        className="w-full"
                      />
                      <Button 
                        onClick={handleNextQuestion}
                        disabled={!otherOptionTexts[`${currentQuestion.id}_${option.id}`]}
                        className="mt-2"
                      >
                        המשך
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
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
                <div key={option.id} className="space-y-2">
                  <button
                    onClick={() => handleMultiSelectAnswer(currentQuestion.id, option.id, option)}
                    className={`w-full p-4 text-right rounded-lg border transition-colors
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent'}`}
                  >
                    {option.he_value || option.display}
                  </button>
                  
                  {isSelected && option.allows_free_text && (
                    <div className="mr-4 mt-2">
                      <Input
                        value={otherOptionTexts[`${currentQuestion.id}_${option.id}`] || ''}
                        onChange={(e) => handleOtherOptionText(currentQuestion.id, option.id, e.target.value)}
                        placeholder="פרט..."
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
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