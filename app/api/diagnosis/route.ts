import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { createUserProfile } from '@/app/actions';

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

    const aiDiagnosis = completion.choices[0].message.content;
    console.log('Generated AI Diagnosis:', aiDiagnosis); // Debug log

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

    console.log('Updated Profile:', updateData); // Debug log

    // Verify the update
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('business_diagnosis')
      .eq('id', user.id)
      .single();

    console.log('Verified Profile:', verifyProfile); // Debug log

    // Create or update user profile with the diagnosis
    if (aiDiagnosis) {
      await createUserProfile(aiDiagnosis);
    }

    return NextResponse.json({
      diagnosis: aiDiagnosis,
      profile: verifyProfile // Include profile in response for verification
    });

  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate diagnosis' },
      { status: 500 }
    );
  }
} 