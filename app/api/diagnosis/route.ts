import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { createUserProfile } from '@/app/actions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds timeout for API requests
});

interface DiagnosisResponse {
  question: { text: string };
  option: { display: string; he_value: string };
}

export const maxDuration = 300; // Set max duration to 300 seconds (5 minutes) for the function

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw profileError;
    }

    // Create profile if it doesn't exist
    if (!profile) {
      const { error: createError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (createError) throw createError;
    }

    // Fetch user's responses with questions and answers
    const { data: responses } = await supabase
      .from('responses')
      .select(`
        question:questions(text),
        option:options(display, he_value)
      `)
      .eq('user_id', user.id)
      .order('created_at') as { data: DiagnosisResponse[] | null };

    if (!responses?.length) {
      return NextResponse.json(
        { error: 'No questionnaire responses found' },
        { status: 404 }
      );
    }

    // Format responses for OpenAI - optimize by limiting the size
    const formattedResponses = responses.map(r => 
      `Question: ${r.question.text}\nAnswer: ${r.option.he_value || r.option.display}`
    ).join('\n\n');

    // Optimize the prompt to reduce token usage
    const systemPrompt = "מטרתך: על בסיס תשובות אלו, נתח את מצב העסק, זיהה אתגרים עיקריים, והצג 3 פעולות פרקטיות לשיפור.\n\n📌 מבנה התשובה הרצוי:\n1. **סיכום קצר של מצב העסק** (מקסימום 3 משפטים).\n2. **זיהוי 2-3 בעיות עיקריות בעסק** (לפי המידע שסיפק המשתמש).\n3. **רשימה של 3 צעדים ברורים ומעשיים לפעולה** שיסייעו למשתמש לשפר את העסק שלו.\n\n❗ *חשוב*: התשובה חייבת להיות בעברית, ברורה ומעשית.";

    // Get diagnosis from OpenAI with retry logic
    let aiDiagnosis = null;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries && !aiDiagnosis) {
      try {
        console.log(`Attempt ${retryCount + 1} to generate diagnosis`);
        
        // Use a faster model for initial attempts, fallback to GPT-3.5 if needed
        const model = retryCount === maxRetries ? "gpt-3.5-turbo" : "gpt-4-turbo";
        
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `אנא נתח את התשובות לשאלון העסקי הבא וספק אבחון מפורט:\n\n${formattedResponses}` }
          ],
          max_tokens: 800,  // Reduced token limit to speed up response
          temperature: 0.7,
        });

        aiDiagnosis = completion.choices[0].message.content;
        console.log('Generated AI Diagnosis successfully');
        
      } catch (error) {
        console.error(`OpenAI API error (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount > maxRetries) {
          throw new Error('Failed to generate diagnosis after multiple attempts');
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }

    if (!aiDiagnosis) {
      throw new Error('Failed to generate diagnosis');
    }

    // Update profile with diagnosis
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        business_diagnosis: aiDiagnosis,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select() // Add this to get the updated record
      .single();

    if (updateError) {
      console.error('Error saving diagnosis:', updateError);
      throw updateError;
    }

    // Create or update user profile with the diagnosis
    if (aiDiagnosis) {
      try {
        await createUserProfile(aiDiagnosis);
      } catch (profileError) {
        console.error('Error in createUserProfile:', profileError);
        // Continue even if this fails
      }
    }

    return NextResponse.json({
      diagnosis: aiDiagnosis
    });

  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate diagnosis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 