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

    // Format responses for OpenAI
    const formattedResponses = responses.map(r => 
      `Question: ${r.question.text}\nAnswer: ${r.option.he_value || r.option.display}`
    ).join('\n\n');

    // Get diagnosis from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "אתה יועץ עסקי המנתח תשובות לשאלון. ספק אבחון עסקי תמציתי והמלצות מפתח בהתבסס על התשובות. ענה בעברית."
        },
        {
          role: "user",
          content: `אנא נתח את התשובות לשאלון העסקי הבא וספק אבחון קצר:\n\n${formattedResponses}`
        }
      ],
      max_tokens: 500,
    });

    return NextResponse.json({
      diagnosis: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate diagnosis' },
      { status: 500 }
    );
  }
} 