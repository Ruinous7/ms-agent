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

interface BusinessInsights {
  messages: string[];
  audience: string[];
}

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

    // Generate marketing messages
    const messagesCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "אתה יועץ שיווקי מומחה. עליך ליצור 5 מסרים שיווקיים קצרים וממוקדים לעסק בהתבסס על האבחון שסופק. המסרים צריכים להיות בפורמט של מערך JSON בלבד, ללא טקסט נוסף."
        },
        {
          role: "user",
          content: `בהתבסס על האבחון העסקי הבא, צור 5 מסרים שיווקיים קצרים וממוקדים שהעסק יכול להשתמש בהם בפרסום ובתקשורת שלו. החזר את התשובה כמערך JSON בלבד.\n\nאבחון העסק:\n${diagnosis}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
      temperature: 0.7,
    });

    // Generate target audience
    const audienceCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "אתה יועץ שיווקי מומחה. עליך לזהות 3-5 קהלי יעד ספציפיים לעסק בהתבסס על האבחון שסופק. הקהלים צריכים להיות בפורמט של מערך JSON בלבד, ללא טקסט נוסף."
        },
        {
          role: "user",
          content: `בהתבסס על האבחון העסקי הבא, זהה 3-5 קהלי יעד ספציפיים שהעסק צריך לפנות אליהם. לכל קהל יעד, ספק תיאור קצר. החזר את התשובה כמערך JSON בלבד.\n\nאבחון העסק:\n${diagnosis}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
      temperature: 0.7,
    });

    // Parse the responses
    let messages: string[] = [];
    let audience: string[] = [];

    try {
      const messagesResponse = JSON.parse(messagesCompletion.choices[0].message.content || '{}');
      messages = messagesResponse.messages || [];
    } catch (error) {
      console.error('Error parsing messages response:', error);
      messages = ['לא ניתן היה לייצר מסרים שיווקיים. אנא נסה שוב מאוחר יותר.'];
    }

    try {
      const audienceResponse = JSON.parse(audienceCompletion.choices[0].message.content || '{}');
      audience = audienceResponse.audiences || [];
    } catch (error) {
      console.error('Error parsing audience response:', error);
      audience = ['לא ניתן היה לזהות קהלי יעד. אנא נסה שוב מאוחר יותר.'];
    }

    // Update the profile with the new insights
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        marketing_messages: messages,
        target_audience: audience,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile with insights:', updateError);
      return NextResponse.json(
        { error: 'Failed to save business insights' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages,
      audience
    });

  } catch (error) {
    console.error('Business insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate business insights' },
      { status: 500 }
    );
  }
} 