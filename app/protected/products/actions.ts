'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  difficulties: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  offer?: string | null;
}

export interface ProductFormData {
  name: string;
  price: number;
  description?: string;
  difficulties?: string;
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
  
  return data || [];
}

export async function addProduct(formData: ProductFormData): Promise<Product> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Authentication required');
  }
  
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: formData.name,
      price: formData.price,
      description: formData.description || null,
      difficulties: formData.difficulties || null,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
  
  revalidatePath('/protected/products');
  return data;
}

export async function updateProduct(id: string, formData: ProductFormData): Promise<Product> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .update({
      name: formData.name,
      price: formData.price,
      description: formData.description || null,
      difficulties: formData.difficulties || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
  
  revalidatePath('/protected/products');
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
  
  revalidatePath('/protected/products');
}

export async function generateOffer(product: Product): Promise<string> {
  try {
    // Instead of using fetch, let's directly use the OpenAI API here
    // since we're already in a server action
    const OpenAI = require('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Create a prompt for generating an irresistible offer
    const prompt = `
      יצירת "הצעה שאי אפשר לסרב לה" עבור המוצר הבא:
      
      שם המוצר: ${product.name}
      מחיר: ${product.price} ₪
      ${product.description ? `תיאור: ${product.description}` : ''}
      ${product.difficulties ? `קשיים/מכשולים: ${product.difficulties}` : ''}
      
      אנא צור הצעה שיווקית מפתה בעברית שתגרום ללקוחות לרצות לקנות את המוצר מיד.
      ההצעה צריכה להיות קצרה, משכנעת ומושכת. השתמש בשפה חזקה ומשכנעת.
      הוסף ערך מוסף או הטבה מיוחדת שתהפוך את ההצעה לבלתי ניתנת לסירוב.
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "אתה מומחה שיווק ומכירות שיודע ליצור הצעות שאי אפשר לסרב להן. אתה כותב בעברית מצוינת ובסגנון משכנע ומלהיב." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    
    const offer = response.choices[0]?.message?.content || "לא ניתן היה ליצור הצעה. נסה שוב מאוחר יותר.";
    
    // Update the product with the generated offer
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('products')
      .update({
        offer: offer,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id);
    
    if (error) {
      console.error('Error updating product with offer:', error);
      throw new Error('Failed to save offer');
    }
    
    revalidatePath('/protected/products');
    return offer;
  } catch (error) {
    console.error('Error generating offer:', error);
    throw new Error('Failed to generate offer');
  }
} 