import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DiagnosisResponse {
  question: { text: string };
  option: { display: string; he_value: string };
}

// Set maxDuration to 60 seconds (maximum allowed for hobby plan)
export const config = {
  maxDuration: 60,
  // Add runtime configuration for Edge runtime to improve performance
  runtime: 'edge'
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Format responses for OpenAI - optimize by pre-allocating array size
    const formattedResponses = new Array(responses.length);
    for (let i = 0; i < responses.length; i++) {
      const r = responses[i];
      formattedResponses[i] = `Question: ${r.question.text}\nAnswer: ${r.option.he_value || r.option.display}`;
    }
    const formattedResponsesText = formattedResponses.join('\n\n');

    // Get diagnosis from OpenAI with optimized settings
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "מטרתך: על בסיס תשובות אלו, נתח את מצב העסק, זיהה אתגרים עיקריים, והצג 3 פעולות פרקטיות לשיפור.\n\n📌 מבנה התשובה הרצוי:\n1. **סיכום קצר של מצב העסק** (מקסימום 3 משפטים).\n2. **זיהוי 2-3 בעיות עיקריות בעסק** (לפי המידע שסיפק המשתמש).\n3. **רשימה של 3 צעדים ברורים ומעשיים לפעולה** שיסייעו למשתמש לשפר את העסק שלו.\n\n❗ *חשוב*: התשובה חייבת להיות בעברית, ברורה ומעשית."
        },
        {
          role: "user",
          content: `אנא נתח את התשובות לשאלון העסקי הבא וספק אבחון מפורט:\n\n${formattedResponsesText}`
        }
      ],
      max_tokens: 800,  // Reduced token limit to speed up response
      temperature: 0.7,
    });

    const aiDiagnosis = completion.choices[0].message.content;

    // Update profile with diagnosis - single database operation
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        business_diagnosis: aiDiagnosis,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (updateError) {
      console.error('Error saving diagnosis:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      diagnosis: aiDiagnosis
    });

  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate diagnosis' },
      { status: 500 }
    );
  }
} 