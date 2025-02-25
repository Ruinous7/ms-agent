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

    // Generate SMART goals using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "אתה יועץ עסקי המתמחה בהגדרת יעדים SMART (ספציפיים, מדידים, ברי השגה, רלוונטיים, ותחומים בזמן). עליך ליצור יעדים עסקיים בהתבסס על האבחון העסקי."
        },
        {
          role: "user",
          content: `אנא צור רשימת יעדים SMART לעסק בהתבסס על האבחון הבא:\n\n${profile.business_diagnosis}\n\nעבור כל יעד, כלול:\n1. תיאור היעד\n2. כיצד נמדוד אותו\n3. למה הוא בר השגה\n4. למה הוא רלוונטי לעסק\n5. לוח זמנים להשגת היעד`
        }
      ],
      max_tokens: 1000,
    });

    const businessGoals = completion.choices[0].message.content;

    return NextResponse.json({ businessGoals });

  } catch (error) {
    console.error('Business goals generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate business goals' },
      { status: 500 }
    );
  }
} 