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

    // Generate marketing messages
    const messagesCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "אתה יועץ שיווקי מומחה. עליך ליצור 5 מסרים שיווקיים קצרים וממוקדים לעסק בהתבסס על האבחון שסופק. המסרים צריכים להיות בפורמט של טקסט רגיל, כל מסר בשורה נפרדת עם מספור."
        },
        {
          role: "user",
          content: `בהתבסס על האבחון העסקי הבא, צור 5 מסרים שיווקיים קצרים וממוקדים שהעסק יכול להשתמש בהם בפרסום ובתקשורת שלו. החזר את התשובה כטקסט רגיל, כל מסר בשורה נפרדת עם מספור.\n\nאבחון העסק:\n${diagnosis}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const marketingMessages = messagesCompletion.choices[0].message.content || 'לא ניתן היה לייצר מסרים שיווקיים. אנא נסה שוב מאוחר יותר.';

    // Update the profile with the new marketing messages
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        marketing_messages: marketingMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile with marketing messages:', updateError);
      return NextResponse.json(
        { error: 'Failed to save marketing messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: marketingMessages
    });

  } catch (error) {
    console.error('Marketing messages error:', error);
    return NextResponse.json(
      { error: 'Failed to generate marketing messages' },
      { status: 500 }
    );
  }
} 