'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

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

interface Response {
  id: string;
  user_id: string;
  question_id: string;
  option_id?: string;
  free_text_response?: string;
  created_at: string;
}

interface Props {
  questions: Question[];
  responses: Response[];
  stages: Stage[];
}

export default function DiagnosisSummary({ questions, responses, stages }: Props) {
  // Group questions by stage
  const questionsByStage = questions.reduce((acc, question) => {
    const stageId = question.stage_id || 1;
    if (!acc[stageId]) {
      acc[stageId] = [];
    }
    acc[stageId].push(question);
    return acc;
  }, {} as Record<number, Question[]>);

  // Create a map of responses by question ID for easy lookup
  const responsesByQuestionId = responses.reduce((acc, response) => {
    if (!acc[response.question_id]) {
      acc[response.question_id] = [];
    }
    acc[response.question_id].push(response);
    return acc;
  }, {} as Record<string, Response[]>);

  // Get option text by ID
  const getOptionText = (question: Question, optionId: string) => {
    const option = question.options.find(opt => opt.id === optionId);
    return option ? (option.he_value || option.display) : 'אפשרות לא ידועה';
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Accordion type="single" collapsible className="w-full">
        {stages.map((stage) => {
          const stageQuestions = questionsByStage[stage.id] || [];
          const answeredQuestions = stageQuestions.filter(q => responsesByQuestionId[q.id]?.length > 0);
          
          if (answeredQuestions.length === 0) return null;
          
          return (
            <AccordionItem key={stage.id} value={`stage-${stage.id}`}>
              <AccordionTrigger className="text-lg font-semibold">
                {stage.title} 
                <Badge variant="outline" className="mr-2">
                  {answeredQuestions.length} שאלות
                </Badge>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-2">
                  {answeredQuestions.map((question) => {
                    const questionResponses = responsesByQuestionId[question.id] || [];
                    
                    return (
                      <Card key={question.id} className="border-r-4 border-r-primary">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">{question.he_text}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {question.question_type === 'free_text' ? (
                            <div className="text-sm bg-muted p-3 rounded-md">
                              {questionResponses[0]?.free_text_response || 'אין תשובה'}
                            </div>
                          ) : question.question_type === 'single_select' ? (
                            <div>
                              <div className="font-medium text-sm">התשובה שלך:</div>
                              <div className="mt-1 bg-muted p-3 rounded-md">
                                {questionResponses[0]?.option_id ? 
                                  getOptionText(question, questionResponses[0].option_id) : 
                                  'אין תשובה'}
                              </div>
                              {questionResponses[0]?.free_text_response && (
                                <div className="mt-2">
                                  <div className="font-medium text-sm">פירוט נוסף:</div>
                                  <div className="mt-1 bg-muted p-3 rounded-md">
                                    {questionResponses[0].free_text_response}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium text-sm">התשובות שלך:</div>
                              <ul className="mt-1 space-y-2">
                                {questionResponses.map((response) => (
                                  <li key={response.id} className="bg-muted p-3 rounded-md">
                                    {response.option_id ? 
                                      getOptionText(question, response.option_id) : 
                                      'אפשרות לא ידועה'}
                                    
                                    {response.free_text_response && (
                                      <div className="mt-2 text-sm border-t pt-2">
                                        <span className="font-medium">פירוט נוסף: </span>
                                        {response.free_text_response}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {responses.length === 0 && (
        <div className="text-center p-8 bg-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-2">אין תשובות עדיין</h3>
          <p>נראה שעוד לא השלמת את שאלון האבחון העסקי.</p>
        </div>
      )}
    </div>
  );
} 