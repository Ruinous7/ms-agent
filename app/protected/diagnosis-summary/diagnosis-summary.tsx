'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStages, setExpandedStages] = useState<string[]>([]);

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

  // Filter questions based on search term
  const filterQuestions = (questions: Question[]) => {
    if (!searchTerm) return questions;
    return questions.filter(q => 
      q.he_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responsesByQuestionId[q.id]?.some(r => 
        r.free_text_response?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.option_id && getOptionText(q, r.option_id).toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  };

  // Calculate completion percentage for each stage
  const getStageCompletion = (stageId: number) => {
    const stageQuestions = questionsByStage[stageId] || [];
    const answeredQuestions = stageQuestions.filter(q => responsesByQuestionId[q.id]?.length > 0);
    return stageQuestions.length > 0 
      ? Math.round((answeredQuestions.length / stageQuestions.length) * 100) 
      : 0;
  };

  // Toggle all stages expansion
  const toggleAllStages = () => {
    if (expandedStages.length === stages.length) {
      setExpandedStages([]);
    } else {
      setExpandedStages(stages.map(s => `stage-${s.id}`));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש בתשובות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        <button 
          onClick={toggleAllStages}
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          <ChevronDown className="h-4 w-4" />
          {expandedStages.length === stages.length ? 'כווץ הכל' : 'הרחב הכל'}
        </button>
      </div>

      {responses.length === 0 ? (
        <div className="text-center p-8 bg-muted/30 rounded-lg border">
          <h3 className="text-xl font-semibold mb-2">אין תשובות עדיין</h3>
          <p className="text-muted-foreground">נראה שעוד לא השלמת את שאלון האבחון העסקי.</p>
        </div>
      ) : (
        <Accordion 
          type="multiple" 
          value={expandedStages}
          onValueChange={setExpandedStages}
          className="w-full space-y-4"
        >
          {stages.map((stage) => {
            const stageQuestions = questionsByStage[stage.id] || [];
            const filteredQuestions = filterQuestions(stageQuestions);
            const answeredQuestions = filteredQuestions.filter(q => responsesByQuestionId[q.id]?.length > 0);
            
            if (answeredQuestions.length === 0) return null;
            
            const completionPercentage = getStageCompletion(stage.id);
            
            return (
              <AccordionItem 
                key={stage.id} 
                value={`stage-${stage.id}`}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{stage.title}</span>
                      <Badge variant="outline" className="mr-2">
                        {answeredQuestions.length} שאלות
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {completionPercentage}% הושלם
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 bg-card">
                  <div className="space-y-4 mt-2">
                    {answeredQuestions.map((question) => {
                      const questionResponses = responsesByQuestionId[question.id] || [];
                      
                      return (
                        <Card key={question.id} className="border-r-4 border-r-primary overflow-hidden">
                          <CardHeader className="pb-2 bg-muted/30">
                            <CardTitle className="text-base font-medium flex items-start gap-2">
                              <span className="mt-0.5 text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                              </span>
                              <span>{question.he_text}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            {question.question_type === 'free_text' ? (
                              <div className="text-sm bg-muted/30 p-4 rounded-md border">
                                {questionResponses[0]?.free_text_response || 'אין תשובה'}
                              </div>
                            ) : question.question_type === 'single_select' ? (
                              <div>
                                <div className="font-medium text-sm mb-2">התשובה שלך:</div>
                                <div className="bg-muted/30 p-4 rounded-md border">
                                  {questionResponses[0]?.option_id ? 
                                    getOptionText(question, questionResponses[0].option_id) : 
                                    'אין תשובה'}
                                </div>
                                {questionResponses[0]?.free_text_response && (
                                  <div className="mt-3">
                                    <div className="font-medium text-sm mb-2">פירוט נוסף:</div>
                                    <div className="bg-muted/30 p-4 rounded-md border">
                                      {questionResponses[0].free_text_response}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-sm mb-2">התשובות שלך:</div>
                                <ul className="space-y-3">
                                  {questionResponses.map((response) => (
                                    <li key={response.id} className="bg-muted/30 p-4 rounded-md border">
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
      )}
    </div>
  );
} 