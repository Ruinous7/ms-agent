'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface TargetAudience {
  id: string;
  name: string;
  description: string | null;
  characteristics: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TargetAudienceFormData {
  name: string;
  description?: string;
  characteristics?: string;
}

export async function getTargetAudiences(): Promise<TargetAudience[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('target_audiences')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching target audiences:', error);
    throw new Error('Failed to fetch target audiences');
  }
  
  return data || [];
}

export async function addTargetAudience(formData: TargetAudienceFormData): Promise<TargetAudience> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Authentication required');
  }
  
  const { data, error } = await supabase
    .from('target_audiences')
    .insert({
      name: formData.name,
      description: formData.description || null,
      characteristics: formData.characteristics || null,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding target audience:', error);
    throw new Error('Failed to add target audience');
  }
  
  revalidatePath('/protected/target-audience');
  return data;
}

export async function updateTargetAudience(id: string, formData: TargetAudienceFormData): Promise<TargetAudience> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('target_audiences')
    .update({
      name: formData.name,
      description: formData.description || null,
      characteristics: formData.characteristics || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating target audience:', error);
    throw new Error('Failed to update target audience');
  }
  
  revalidatePath('/protected/target-audience');
  return data;
}

export async function deleteTargetAudience(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('target_audiences')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting target audience:', error);
    throw new Error('Failed to delete target audience');
  }
  
  revalidatePath('/protected/target-audience');
}

export async function generateTargetAudience(businessDiagnosis: string): Promise<string> {
  try {
    const OpenAI = require('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const prompt = `
      זיהוי קהלי יעד עבור העסק הבא:
      
      אבחון עסקי: ${businessDiagnosis}
      
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
    
    return response.choices[0]?.message?.content || "לא ניתן היה לזהות קהלי יעד. נסה שוב מאוחר יותר.";
  } catch (error) {
    console.error('Error generating target audience:', error);
    throw new Error('Failed to generate target audience');
  }
} 