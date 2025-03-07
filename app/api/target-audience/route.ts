'use server';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get business diagnosis
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('business_diagnosis')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch business diagnosis' },
        { status: 500 }
      );
    }
    
    if (!profile?.business_diagnosis) {
      return NextResponse.json(
        { error: 'Business diagnosis not found' },
        { status: 400 }
      );
    }
    
    // Generate target audience using OpenAI
    const prompt = `
      זיהוי קהלי יעד עבור העסק הבא:
      
      אבחון עסקי: ${profile.business_diagnosis}
      
      אנא זהה 3-5 קהלי יעד מדויקים שיהיו הכי רלוונטיים לעסק זה.
      עבור כל קהל יעד, ספק:
      1. שם הקהל
      2. תיאור קצר
      3. מאפיינים עיקריים (דמוגרפיים, פסיכוגרפיים, התנהגותיים)
      
      הפרד כל קהל יעד בצורה ברורה ומובנית.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "אתה מומחה לשיווק ופילוח קהלים. אתה מזהה קהלי יעד מדויקים בהתבסס על אבחון עסקי. אתה כותב בעברית מצוינת ובסגנון מקצועי ומובנה." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const audience = response.choices[0]?.message?.content || "לא ניתן היה לזהות קהלי יעד. נסה שוב מאוחר יותר.";
    
    // Update the profile with the generated audience
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        target_audience: audience,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error updating profile with target audience:', updateError);
      return NextResponse.json(
        { error: 'Failed to save target audience' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ audience });
  } catch (error) {
    console.error('Error generating target audience:', error);
    return NextResponse.json(
      { error: 'Failed to generate target audience' },
      { status: 500 }
    );
  }
} 