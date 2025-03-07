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

    // Generate marketing plan using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "אתה יועץ שיווק מקצועי. עליך ליצור תוכנית שיווק מפורטת בהתבסס על האבחון העסקי."
        },
        {
          role: "user",
          content: `אנא צור תוכנית שיווק מפורטת עבור העסק הזה. הנה האבחון העסקי:\n\n${profile.business_diagnosis}\n\nהתוכנית צריכה לכלול:\n1. קהל יעד מדויק\n2. ערוצי שיווק מומלצים\n3. אסטרטגיות תוכן\n4. תקציב מומלץ\n5. לוח זמנים לביצוע`
        }
      ],
      max_tokens: 1000,
    });

    const marketingPlan = completion.choices[0].message.content;

    return NextResponse.json({ marketingPlan });

  } catch (error) {
    console.error('Marketing plan generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate marketing plan' },
      { status: 500 }
    );
  }
}