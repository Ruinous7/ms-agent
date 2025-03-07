import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the business diagnosis from the profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_diagnosis')
      .eq('id', user.id)
      .single();

    if (!profile?.business_diagnosis) {
      return NextResponse.json(
        { error: 'No business diagnosis found' },
        { status: 404 }
      );
    }

    // Generate content strategy using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "אתה מומחה לשיווק דיגיטלי ותוכן. עליך ליצור אסטרטגיית תוכן ותוכנית פרסום לרשתות חברתיות בהתבסס על האבחון העסקי."
        },
        {
          role: "user",
          content: `אנא צור אסטרטגיית תוכן ותוכנית פרסום לרשתות חברתיות. הנה האבחון העסקי:\n\n${profile.business_diagnosis}\n\nהתוכנית צריכה לכלול:\n1. נושאי תוכן מרכזיים\n2. סוגי תוכן מומלצים\n3. תדירות פרסום מומלצת\n4. רשתות חברתיות מומלצות\n5. דוגמאות לפוסטים`
        }
      ],
      max_tokens: 1000,
    });

    const contentStrategy = completion.choices[0].message.content;

    return NextResponse.json({ contentStrategy });

  } catch (error) {
    console.error('Content strategy generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content strategy' },
      { status: 500 }
    );
  }
} 