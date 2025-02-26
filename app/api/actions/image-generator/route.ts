import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set a longer timeout for this route
export const config = {
  maxDuration: 60, // Increase timeout to 60 seconds
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { prompt, size = '1024x1024', n = 1 } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Image prompt is required' }, { status: 400 });
    }

    console.log('Starting image generation with prompt:', prompt);

    // Generate image using OpenAI DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: n,
      size: size,
      // Add quality parameter for DALL-E 3
      quality: "standard",
    });

    console.log('Image generation completed');

    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    // Save images to Supabase Storage
    const savedImages = [];
    
    for (const image of response.data) {
      if (!image.url) continue;
      
      console.log('Processing image URL:', image.url.substring(0, 30) + '...');
      
      // Download the image
      const imageResponse = await fetch(image.url);
      const imageBlob = await imageResponse.blob();
      
      // Generate a unique filename
      const fileName = `${uuidv4()}.png`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Uploading to Supabase storage:', filePath);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('post_images')
        .upload(filePath, imageBlob, {
          contentType: 'image/png',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('post_images')
        .getPublicUrl(filePath);
        
      // Save image metadata to database
      const { data: metadataData, error: metadataError } = await supabase
        .from('post_images')
        .insert([
          {
            user_id: user.id,
            prompt: prompt,
            file_path: filePath,
            public_url: publicUrlData.publicUrl,
            created_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (metadataError) {
        console.error('Error saving image metadata:', metadataError);
      }
      
      savedImages.push({
        id: metadataData?.[0]?.id || null,
        url: publicUrlData.publicUrl,
        prompt: prompt
      });
    }

    console.log('Successfully processed images:', savedImages.length);
    return NextResponse.json({ images: savedImages });

  } catch (error: any) {
    console.error('Image generation error:', error);
    // Provide more detailed error information
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        message: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
} 