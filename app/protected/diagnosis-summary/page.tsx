import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DiagnosisSummary from "./diagnosis-summary";

export default async function DiagnosisSummaryPage() {
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-right">סיכום אבחון עסקי</h1>
      <DiagnosisSummary 
        questions={questions} 
        responses={responses} 
        stages={stages || []}
      />
    </div>
  );
} 