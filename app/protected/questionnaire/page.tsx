import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import QuestionnaireComponent from "./questionnaire-component";

export default async function QuestionnairePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Remove option_set from the query
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      step,
      text,
      he_text,
      options (
        id,
        display,
        he_value
      )
    `)
    .order('step');

  if (error) {
    console.error('Error fetching questions:', error);
    return <div>Error loading questionnaire</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Business Diagnosis Questionnaire</h1>
      <QuestionnaireComponent 
        initialQuestions={questions} 
        userId={user.id}
      />
    </div>
  );
} 