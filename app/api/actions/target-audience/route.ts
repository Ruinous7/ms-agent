import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set maxDuration to 10 seconds (maximum for hobby plan without timeout)
export const config = {
  maxDuration: 10,
  runtime: 'edge',
  regions: ['fra1'], // Frankfurt region
  experimental: {
    fluidCompute: true, // Enable Fluid Compute
  }
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's diagnosis from the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('business_diagnosis')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.business_diagnosis) {
      return NextResponse.json(
        { error: 'No diagnosis found. Please complete the diagnosis first.' },
        { status: 404 }
      );
    }

    const diagnosis = profile.business_diagnosis;

    // Generate target audience
    const audienceCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "אתה יועץ שיווקי מומחה. עליך לזהות 3-5 קהלי יעד ספציפיים לעסק בהתבסס על האבחון שסופק. הקהלים צריכים להיות בפורמט של טקסט רגיל, כל קהל יעד בשורה נפרדת עם מספור ותיאור קצר."
        },
        {
          role: "user",
          content: `בהתבסס על האבחון העסקי הבא, זהה 3-5 קהלי יעד ספציפיים שהעסק צריך לפנות אליהם. לכל קהל יעד, ספק תיאור קצר. החזר את התשובה כטקסט רגיל, כל קהל יעד בשורה נפרדת עם מספור.\n\nאבחון העסק:\n${diagnosis}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const targetAudience = audienceCompletion.choices[0].message.content || 'לא ניתן היה לזהות קהלי יעד. אנא נסה שוב מאוחר יותר.';

    // Update the profile with the new target audience
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        target_audience: targetAudience,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile with target audience:', updateError);
      return NextResponse.json(
        { error: 'Failed to save target audience' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audience: targetAudience
    });

  } catch (error) {
    console.error('Target audience error:', error);
    return NextResponse.json(
      { error: 'Failed to generate target audience' },
      { status: 500 }
    );
  }
} 