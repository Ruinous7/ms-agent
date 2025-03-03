'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from "@/components/ui/spinner";

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
      setError(null);

      // If this is an "Other" option that allows free text, don't auto-advance
      if (option.allows_free_text) {
        return;
      }

      // First, delete all existing responses for this question
      const { error: deleteError } = await supabase
        .from('responses')
        .delete()
        .match({ user_id: userId, question_id: questionId });
      
      if (deleteError) {
        console.error('Error deleting existing responses:', deleteError);
        setError('אירעה שגיאה במחיקת תשובות קיימות. אנא נסה שוב.');
        return;
      }
      
      // Then insert the new response
      const { error: insertError } = await supabase
        .from('responses')
        .insert({
          user_id: userId,
          question_id: questionId,
          option_id: optionId,
        });

      if (insertError) {
        console.error('Error inserting response:', insertError);
        setError('אירעה שגיאה בשמירת התשובה. אנא נסה שוב.');
        return;
      }

      // Auto-advance to next question
      handleNextQuestion();
    } catch (error) {
      console.error('Error saving response:', error);
      setError('אירעה שגיאה בשמירת התשובה. אנא נסה שוב.');
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
      if (selections.length === 0) return;
      
      // First, get all existing responses for this question
      const { data: existingResponses, error: fetchError } = await supabase
        .from('responses')
        .select('id, option_id')
        .match({ user_id: userId, question_id: questionId });
      
      if (fetchError) {
        console.error('Error fetching existing responses:', fetchError);
        throw new Error('Failed to fetch existing responses');
      }
      
      // Create a map of existing option_ids to response ids
      const existingOptionsMap = new Map();
      if (existingResponses) {
        existingResponses.forEach(response => {
          existingOptionsMap.set(response.option_id, response.id);
        });
      }
      
      // Determine which options to add, update, or delete
      const optionsToAdd = selections.filter(optionId => !existingOptionsMap.has(optionId));
      const optionsToDelete = existingResponses
        ? existingResponses
            .filter(response => !selections.includes(response.option_id))
            .map(response => response.id)
        : [];
      
      // Delete responses that are no longer selected
      if (optionsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('responses')
          .delete()
          .in('id', optionsToDelete);
        
        if (deleteError) {
          console.error('Error deleting unselected responses:', deleteError);
          throw new Error('Failed to delete unselected responses');
        }
      }
      
      // Add new responses for newly selected options
      if (optionsToAdd.length > 0) {
        // Insert responses one by one to handle potential constraint violations
        for (const optionId of optionsToAdd) {
          // Check if this option already exists (might have been added in another session)
          const { data: existingOption, error: checkError } = await supabase
            .from('responses')
            .select('id')
            .match({ 
              user_id: userId, 
              question_id: questionId,
              option_id: optionId
            })
            .maybeSingle();
          
          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking existing option:', checkError);
            continue; // Skip this option but continue with others
          }
          
          if (!existingOption) {
            // Insert the new response
            const { error: insertError } = await supabase
              .from('responses')
              .insert({
                user_id: userId,
                question_id: questionId,
                option_id: optionId,
              });
              
            if (insertError) {
              console.error(`Error inserting response for option ${optionId}:`, insertError);
              // Continue with other options even if this one fails
            }
          }
        }
      }
    } catch (error) {
      console.error('Error saving multi-select responses:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  const saveFreeTextResponse = async (questionId: string, text: string) => {
    try {
      if (!text) return;
      
      // Special handling for business name question (first question)
      // This is a workaround for questions that might not have options
      if (currentStageIndex === 0 && currentQuestionIndex === 0) {
        // For the business name question, we'll create a dummy option_id
        const dummyOptionId = `dummy_option_${questionId}`;
        
        // First, delete all existing responses for this question
        const { error: deleteError } = await supabase
          .from('responses')
          .delete()
          .match({ user_id: userId, question_id: questionId });
        
        if (deleteError) {
          console.error('Error deleting existing responses:', deleteError);
          throw new Error('Failed to delete existing responses');
        }
        
        // Insert the response with the dummy option_id
        const { error: insertError } = await supabase
          .from('responses')
          .insert({
            user_id: userId,
            question_id: questionId,
            option_id: dummyOptionId,
            free_text_response: text,
          });
          
        if (insertError) {
          console.error('Error inserting free text response:', insertError);
          throw new Error('Failed to save response');
        }
        
        return; // Exit early after handling the business name question
      }
      
      // For other questions, first delete all existing responses
      const { error: deleteError } = await supabase
        .from('responses')
        .delete()
        .match({ user_id: userId, question_id: questionId });
      
      if (deleteError) {
        console.error('Error deleting existing responses:', deleteError);
        throw new Error('Failed to delete existing responses');
      }
      
      // Find the first option for this question to use as the option_id
      const question = initialQuestions.find(q => q.id === questionId);
      
      // For other questions, continue with the normal flow
      if (!question || !question.options || question.options.length === 0) {
        console.error('Cannot save free text response: no options found for question');
        throw new Error('Cannot save response: missing options for question');
      }
      
      const optionId = question.options[0].id;
      
      // Insert the response with the required option_id
      const { error: insertError } = await supabase
        .from('responses')
        .insert({
          user_id: userId,
          question_id: questionId,
          option_id: optionId,
          free_text_response: text,
        });
        
      if (insertError) {
        console.error('Error inserting free text response:', insertError);
        throw new Error('Failed to save response');
      }
    } catch (error) {
      console.error('Error saving free text response:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  const saveOtherOptionText = async (questionId: string, optionId: string) => {
    const key = `${questionId}_${optionId}`;
    const text = otherOptionTexts[key];
    
    if (text) {
      try {
        // First, delete all existing responses for this question
        const { error: deleteError } = await supabase
          .from('responses')
          .delete()
          .match({ user_id: userId, question_id: questionId });
        
        if (deleteError) {
          console.error('Error deleting existing responses:', deleteError);
          throw new Error('Failed to delete existing responses');
        }
        
        // Then insert the new response
        const { error: insertError } = await supabase
          .from('responses')
          .insert({
            user_id: userId,
            question_id: questionId,
            option_id: optionId,
            free_text_response: text
          });
          
        if (insertError) {
          console.error('Error inserting other option text:', insertError);
          throw new Error('Failed to save response');
        }
      } catch (error) {
        console.error('Error saving other option text:', error);
        throw error; // Re-throw to be handled by the caller
      }
    }
  };

  const updateMultiSelectOptionText = async (questionId: string, optionId: string, text: string) => {
    try {
      if (!text) return;
      
      // Check if the response exists
      const { data: existingResponse, error: checkError } = await supabase
        .from('responses')
        .select('id')
        .match({ 
          user_id: userId, 
          question_id: questionId,
          option_id: optionId
        })
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing multi-select response:', checkError);
        throw new Error('Failed to check existing response');
      }
      
      if (!existingResponse) {
        console.error('Cannot update option text: response not found');
        throw new Error('Response not found');
      }
      
      // Update the existing response
      const { error: updateError } = await supabase
        .from('responses')
        .update({ free_text_response: text })
        .match({ 
          user_id: userId, 
          question_id: questionId,
          option_id: optionId
        });
        
      if (updateError) {
        console.error('Error updating option text:', updateError);
        throw new Error('Failed to update response');
      }
    } catch (error) {
      console.error('Error updating option text:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  const handleNextQuestion = async () => {
    // Save multi-select or free text responses if needed
    if (currentQuestion) {
      try {
        if (currentQuestion.question_type === 'multi_select') {
          const selections = (responses[currentQuestion.id] as string[]) || [];
          if (selections.length > 0) {
            await saveMultiSelectResponses(currentQuestion.id, selections);
            
            // Save any "Other" option texts
            for (const optionId of selections) {
              const option = currentQuestion.options.find(o => o.id === optionId);
              if (option?.allows_free_text) {
                const key = `${currentQuestion.id}_${optionId}`;
                if (otherOptionTexts[key]) {
                  await updateMultiSelectOptionText(currentQuestion.id, optionId, otherOptionTexts[key]);
                }
              }
            }
          }
        } else if (currentQuestion.question_type === 'free_text') {
          const text = freeTextResponses[currentQuestion.id] || '';
          if (text) {
            // If this is the business name question (first question), create a profile
            if (currentStageIndex === 0 && currentQuestionIndex === 0) {
              await createOrUpdateProfile(text);
            } else {
              await saveFreeTextResponse(currentQuestion.id, text);
            }
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

        // Move to next question or stage
        if (currentQuestionIndex < currentStageQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          // Check if this is the last stage and last question
          if (currentStageIndex === totalStages - 1) {
            // End of questionnaire - generate diagnosis
            setCurrentQuestionIndex(currentQuestionIndex + 1); // Move past the last question
            generateAIDiagnosis();
          } else {
            // Move to next stage
            setCurrentStageIndex(currentStageIndex + 1);
            setCurrentQuestionIndex(0);
          }
        }
      } catch (error) {
        console.error('Error saving responses:', error);
        setError('אירעה שגיאה בשמירת התשובות. אנא נסה שוב.');
      }
    }
  };

  // Function to create or update the user profile with the business name
  const createOrUpdateProfile = async (businessName: string) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error checking profile:', checkError);
        throw new Error('Failed to check if profile exists');
      }
      
      // If profile exists, update it
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            business_name: businessName, // Using business_name field to store business name
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw new Error('Failed to update profile');
        }
      } else {
        // If profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            business_name: businessName, // Using business_name field to store business name
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw new Error('Failed to create profile');
        }
      }
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      throw error; // Re-throw to be handled by the caller
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
      // Generate AI diagnosis
      await generateAIDiagnosis();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State for AI diagnosis
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [recommendedActions, setRecommendedActions] = useState<any[]>([]);

  // Function to generate AI diagnosis
  const generateAIDiagnosis = async () => {
    setDiagnosisLoading(true);
    setDiagnosisError(null);
    
    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setDiagnosis(data.diagnosis);
      
      // Set default recommended actions
      setRecommendedActions([
        {
          id: 'marketing',
          title: 'תוכנית שיווק',
          description: 'פיתוח אסטרטגיית שיווק מותאמת אישית לעסק שלך',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10"></path>
              <path d="M18 20V4"></path>
              <path d="M6 20v-4"></path>
            </svg>
          ),
        },
        {
          id: 'content',
          title: 'אסטרטגיית תוכן',
          description: 'יצירת תוכן שמושך לקוחות ובונה את המותג שלך',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          ),
        },
        {
          id: 'goals',
          title: 'יעדים עסקיים',
          description: 'הגדרת יעדים ברורים ומדידים להצלחת העסק',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          ),
        },
      ]);
      
    } catch (error) {
      console.error('Error generating diagnosis:', error);
      setDiagnosisError('אירעה שגיאה בעת יצירת האבחון. אנא נסה שוב.');
    } finally {
      setDiagnosisLoading(false);
    }
  };

  // Render completion page with diagnosis
  const renderCompletionPage = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">תודה על השלמת השאלון!</h2>
        
        {diagnosisLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner className="mb-4" />
            <p className="text-lg text-center">מייצר אבחון AI מותאם אישית עבורך...</p>
            <p className="text-sm text-gray-500 mt-2">זה עשוי לקחת מספר שניות</p>
          </div>
        ) : diagnosisError ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p className="text-lg text-center text-red-600 mb-4">{diagnosisError}</p>
            <button 
              onClick={generateAIDiagnosis}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              נסה שוב
            </button>
          </div>
        ) : diagnosis ? (
          <div className="w-full">
            <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
              <h3 className="text-xl font-semibold mb-4">האבחון שלך:</h3>
              <div className="whitespace-pre-wrap">{diagnosis}</div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">הצעדים הבאים המומלצים:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {recommendedActions.map((action) => (
                <div key={action.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary mr-3">
                      {action.icon}
                    </div>
                    <h4 className="font-medium">{action.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Link href="/protected/dashboard" className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                חזרה לדאשבורד
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="text-lg text-center mb-4">מכין את האבחון שלך...</p>
            <button 
              onClick={generateAIDiagnosis}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              צור אבחון
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-6xl mx-auto px-2 sm:px-4" dir="rtl">
        <div className="bg-card rounded-xl border shadow-sm p-6 sm:p-10 space-y-6 sm:space-y-8">
          {renderCompletionPage()}

          <div className="pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              הנתונים שלך מאובטחים ומשמשים רק לצורך יצירת האבחון העסקי המותאם אישית.
            </p>
          </div>
        </div>
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
    <div className="space-y-8 max-w-6xl mx-auto px-2 sm:px-4" dir="rtl">
      {/* Progress Indicator */}
      <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {currentStage.step_number}
              </div>
              <h3 className="text-lg font-semibold">{currentStage.title || 'שאלון'}</h3>
            </div>
            <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
              שאלה {currentQuestionIndex + 1} מתוך {currentStageQuestions.length}
            </div>
          </div>
          
          {currentStage.description && (
            <p className="text-sm text-muted-foreground">{currentStage.description}</p>
          )}
          
          <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>התחלה</span>
            <span>{Math.round(progressPercentage)}%</span>
            <span>סיום</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b bg-muted/30">
          <h2 className="text-xl font-semibold">{currentQuestion.he_text}</h2>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* Free Text Question */}
          {currentQuestion.question_type === 'free_text' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-muted/20 p-3 sm:p-6 rounded-lg border">
                <div className="flex items-center justify-center mb-2 sm:mb-4">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
                      <line x1="17" y1="10" x2="3" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="17" y1="18" x2="3" y2="18"></line>
                    </svg>
                  </div>
                </div>
                <Input
                  value={freeTextResponses[currentQuestion.id] || ''}
                  onChange={(e) => handleFreeTextAnswer(currentQuestion.id, e.target.value)}
                  placeholder="הקלד את תשובתך כאן..."
                  className="w-full bg-background border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base text-center"
                />
              </div>
              <div className="flex justify-center">
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!freeTextResponses[currentQuestion.id]}
                  className="mt-2 sm:mt-4 px-4 sm:px-8"
                  size="default"
                >
                  המשך לשאלה הבאה
                </Button>
              </div>
            </div>
          )}

          {/* Single Select Question */}
          {currentQuestion.question_type === 'single_select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = responses[currentQuestion.id] === option.id;
                  
                  return (
                    <div key={option.id} className="flex flex-col">
                      <button
                        onClick={() => handleSingleSelectAnswer(currentQuestion.id, option.id, option)}
                        className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg border transition-all duration-200 aspect-square hover:shadow-md
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 shadow-lg' 
                            : 'hover:bg-accent hover:border-primary/30'}`}
                      >
                        <div className={`h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-3 rounded-full border-2 flex items-center justify-center
                          ${isSelected ? 'border-primary-foreground' : 'border-muted-foreground'}`}>
                          {isSelected && <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-primary-foreground" />}
                        </div>
                        <span className="text-center text-xs sm:text-base line-clamp-2 sm:line-clamp-3">{option.he_value || option.display}</span>
                      </button>
                      
                      {isSelected && option.allows_free_text && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-4 bg-muted/20 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1 sm:mb-2 text-center">אנא פרט:</p>
                          <Input
                            value={otherOptionTexts[`${currentQuestion.id}_${option.id}`] || ''}
                            onChange={(e) => handleOtherOptionText(currentQuestion.id, option.id, e.target.value)}
                            placeholder="פרט..."
                            className="w-full bg-transparent border-0 shadow-none focus-visible:ring-0 text-center text-xs sm:text-base"
                          />
                          <div className="flex justify-center mt-2 sm:mt-3">
                            <Button 
                              onClick={handleNextQuestion}
                              disabled={!otherOptionTexts[`${currentQuestion.id}_${option.id}`]}
                              className="w-full text-xs sm:text-sm"
                              size="sm"
                            >
                              המשך
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Multi Select Question */}
          {currentQuestion.question_type === 'multi_select' && (
            <div className="space-y-4">
              <div className="flex justify-center mb-2">
                <div className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 sm:mr-2 sm:w-4 sm:h-4">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>בחר עד {currentQuestion.max_selections} אפשרויות</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = Array.isArray(responses[currentQuestion.id]) && 
                    (responses[currentQuestion.id] as string[]).includes(option.id);
                  
                  return (
                    <div key={option.id} className="flex flex-col">
                      <button
                        onClick={() => handleMultiSelectAnswer(currentQuestion.id, option.id, option)}
                        className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg border transition-all duration-200 aspect-square hover:shadow-md
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 shadow-lg' 
                            : 'hover:bg-accent hover:border-primary/30'}`}
                      >
                        <div className={`h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-3 rounded flex items-center justify-center
                          ${isSelected ? 'bg-primary-foreground text-primary' : 'border-2 border-muted-foreground'}`}>
                          {isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-2.5 w-2.5 sm:h-4 sm:w-4">
                              <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-center text-xs sm:text-base line-clamp-2 sm:line-clamp-3">{option.he_value || option.display}</span>
                      </button>
                      
                      {isSelected && option.allows_free_text && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-4 bg-muted/20 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1 sm:mb-2 text-center">אנא פרט:</p>
                          <Input
                            value={otherOptionTexts[`${currentQuestion.id}_${option.id}`] || ''}
                            onChange={(e) => handleOtherOptionText(currentQuestion.id, option.id, e.target.value)}
                            placeholder="פרט..."
                            className="w-full bg-transparent border-0 shadow-none focus-visible:ring-0 text-center text-xs sm:text-base"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center mt-4 sm:mt-6">
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!Array.isArray(responses[currentQuestion.id]) || 
                    (responses[currentQuestion.id] as string[])?.length === 0}
                  className="px-4 sm:px-8"
                  size="default"
                >
                  המשך לשאלה הבאה
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4 sm:mt-6">
        <Button
          onClick={handlePreviousQuestion}
          disabled={currentStageIndex === 0 && currentQuestionIndex === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm sm:size-default"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
            <path d="m9 18 6-6-6-6"/>
          </svg>
          הקודם
        </Button>
        
        {/* Next button is only shown for single_select without free text */}
        {currentQuestion.question_type === 'single_select' && 
         responses[currentQuestion.id] && 
         !currentQuestion.options.find(o => o.id === responses[currentQuestion.id] && o.allows_free_text) && (
          <Button
            onClick={handleNextQuestion}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            size="sm"
          >
            הבא
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}