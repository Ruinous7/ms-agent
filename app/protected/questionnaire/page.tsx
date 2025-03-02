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
    return <div>Error loading questionnaire</div>;
  }

  // Set default question_type if not present in the database yet
  const questionsWithDefaults = questions.map(question => ({
    ...question,
    question_type: question.question_type || 'single_select',
    max_selections: question.max_selections || 1
  }));

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-right">שאלון אבחון עסקי</h1>
      <QuestionnaireComponent 
        initialQuestions={questionsWithDefaults} 
        initialStages={stages || []}
        userId={user.id}
      />
    </div>
  );
} 