import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DiagnosisSummary from "./diagnosis-summary";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, FileText } from 'lucide-react';

export default async function DiagnosisSummaryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch the user's profile with business diagnosis
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('business_diagnosis, business_name')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return <div>Error loading profile</div>;
  }

  // Fetch question stages
  const { data: stages, error: stagesError } = await supabase
    .from('question_stages')
    .select('*')
    .order('step_number');

  if (stagesError) {
    console.error('Error fetching stages:', stagesError);
  }

  // Fetch questions with their options
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      id,
      step,
      text,
      he_text,
      question_type,
      max_selections,
      category,
      stage_id,
      options (
        id,
        display,
        he_value,
        option_key,
        allows_free_text
      )
    `)
    .order('step');

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    return <div>Error loading questions</div>;
  }

  // Fetch user's responses
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('*')
    .eq('user_id', user.id);

  if (responsesError) {
    console.error('Error fetching responses:', responsesError);
    return <div>Error loading responses</div>;
  }

  const businessDiagnosis = profile?.business_diagnosis || "לא נמצא אבחון עסקי.";

  return (
    <div className="w-full max-w-5xl mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-right">סיכום אבחון עסקי</h1>
      
      <Tabs defaultValue="diagnosis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="diagnosis" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>אבחון AI</span>
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>תשובות לשאלון</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnosis" className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl">אבחון עסקי מבוסס AI</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-muted/30 p-6 rounded-lg whitespace-pre-line text-muted-foreground">
                {businessDiagnosis}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responses">
          <DiagnosisSummary 
            questions={questions} 
            responses={responses} 
            stages={stages || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 