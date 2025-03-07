'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface MarketingMessage {
  id: string;
  title: string;
  content: string;
  target_audience_id: string | null;
  product_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MarketingMessageFormData {
  title: string;
  content: string;
  target_audience_id?: string;
  product_id?: string;
}

export async function getMarketingMessages(): Promise<MarketingMessage[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('marketing_messages')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching marketing messages:', error);
    throw new Error('Failed to fetch marketing messages');
  }
  
  return data || [];
}

export async function addMarketingMessage(formData: MarketingMessageFormData): Promise<MarketingMessage> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Authentication required');
  }
  
  const { data, error } = await supabase
    .from('marketing_messages')
    .insert({
      title: formData.title,
      content: formData.content,
      target_audience_id: formData.target_audience_id || null,
      product_id: formData.product_id || null,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding marketing message:', error);
    throw new Error('Failed to add marketing message');
  }
  
  revalidatePath('/protected/marketing-messages');
  return data;
}

export async function updateMarketingMessage(id: string, formData: MarketingMessageFormData): Promise<MarketingMessage> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('marketing_messages')
    .update({
      title: formData.title,
      content: formData.content,
      target_audience_id: formData.target_audience_id || null,
      product_id: formData.product_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating marketing message:', error);
    throw new Error('Failed to update marketing message');
  }
  
  revalidatePath('/protected/marketing-messages');
  return data;
}

export async function deleteMarketingMessage(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('marketing_messages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting marketing message:', error);
    throw new Error('Failed to delete marketing message');
  }
  
  revalidatePath('/protected/marketing-messages');
}

export async function generateMarketingMessage(
  targetAudienceId?: string, 
  productId?: string
): Promise<string> {
  try {
    const supabase = await createClient();
    
    // Get target audience and product information if IDs are provided
    let targetAudience = null;
    let product = null;
    
    if (targetAudienceId) {
      const { data } = await supabase
        .from('target_audiences')
        .select('*')
        .eq('id', targetAudienceId)
        .single();
      
      targetAudience = data;
    }
    
    if (productId) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      product = data;
    }
    
    // Get business diagnosis
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_diagnosis')
      .eq('id', user.id)
      .single();
    
    const businessDiagnosis = profile?.business_diagnosis || '';
    
    // Use OpenAI to generate marketing message
    const OpenAI = require('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Create a prompt for generating marketing message
    let prompt = `
      יצירת מסר שיווקי אפקטיבי עבור העסק הבא:
      
      אבחון עסקי: ${businessDiagnosis}
    `;
    
    if (targetAudience) {
      prompt += `
      
      קהל יעד:
      שם: ${targetAudience.name}
      תיאור: ${targetAudience.description || ''}
      מאפיינים: ${targetAudience.characteristics || ''}
      `;
    }
    
    if (product) {
      prompt += `
      
      מוצר/שירות:
      שם: ${product.name}
      מחיר: ${product.price} ₪
      תיאור: ${product.description || ''}
      קשיים/מכשולים: ${product.difficulties || ''}
      `;
    }
    
    prompt += `
      
      אנא צור מסר שיווקי אפקטיבי בעברית שיתאים לעסק ולקהל היעד.
      המסר צריך להיות משכנע, מעורר עניין ומניע לפעולה.
      כלול כותרת מושכת ותוכן שמדגיש את הערך והיתרונות.
      
      המבנה צריך להיות:
      כותרת: [כותרת מושכת]
      
      [תוכן המסר השיווקי - 3-5 פסקאות]
      
      [קריאה לפעולה ברורה]
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "אתה מומחה שיווק ותוכן שיודע ליצור מסרים שיווקיים אפקטיביים. אתה כותב בעברית מצוינת ובסגנון משכנע, מעורר עניין ומניע לפעולה." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    
    return response.choices[0]?.message?.content || "לא ניתן היה ליצור מסר שיווקי. נסה שוב מאוחר יותר.";
  } catch (error) {
    console.error('Error generating marketing message:', error);
    throw new Error('Failed to generate marketing message');
  }
} 