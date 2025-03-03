import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import QuestionnaireComponent from "./questionnaire-component";

export default async function QuestionnairePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch question stages
  const { data: stages, error: stagesError } = await supabase
    .from('question_stages')
    .select('*')
    .order('step_number');

  if (stagesError) {
    console.error('Error fetching stages:', stagesError);
    // Continue without stages if they don't exist yet
  }

  // Fetch questions with their options and include new fields
  const { data: questions, error } = await supabase
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

  if (error) {
    console.error('Error fetching questions:', error);
    return (
      <div className="max-w-5xl mx-auto p-6 bg-card rounded-xl border shadow-sm" dir="rtl">
        <h2 className="text-xl font-semibold text-destructive">שגיאה בטעינת השאלון</h2>
        <p className="text-muted-foreground mt-2">אירעה שגיאה בטעינת השאלון. אנא נסה שוב מאוחר יותר.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <QuestionnaireComponent 
        initialQuestions={questions || []} 
        initialStages={stages || []} 
        userId={user.id} 
      />
    </div>
  );
} 