import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { postType, keywords } = await request.json();
    
    if (!postType) {
      return NextResponse.json({ error: 'Post type is required' }, { status: 400 });
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

    // Generate posts using OpenAI with stronger emphasis on keywords
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "אתה מומחה לשיווק ברשתות חברתיות. עליך ליצור פוסטים מעניינים ואפקטיביים שמתמקדים במילות המפתח שסופקו ומשלבים אותן באופן טבעי בתוכן."
        },
        {
          role: "user",
          content: `אנא צור 3 פוסטים שונים לרשתות חברתיות עבור העסק הזה.
          
          אבחון עסקי:
          ${profile.business_diagnosis}
          
          סוג הפוסט: ${postType}
          ${keywords ? `מילות מפתח: ${keywords}` : ''}
          
          חשוב מאוד: הפוסטים חייבים להתמקד במילות המפתח שסופקו ולשלב אותן באופן משמעותי בתוכן. מילות המפתח צריכות להיות הנושא המרכזי של כל פוסט.
          
          עבור כל פוסט:
          1. כותרת מושכת שמשלבת את מילות המפתח
          2. תוכן הפוסט (עד 280 תווים) שמתמקד במילות המפתח
          3. האשטאגים רלוונטיים למילות המפתח (עד 5)
          4. קריאה לפעולה (CTA) שקשורה למילות המפתח
          
          הפרד בין הפוסטים באמצעות "---".`
        }
      ],
      max_tokens: 1500,
    });

    const generatedContent = completion.choices[0].message.content;
    if (!generatedContent) {
      return NextResponse.json(
        { error: 'Generated content is empty' },
        { status: 500 }
      );
    }

    // Split the content into separate posts
    const posts = generatedContent.split('---').map(post => post.trim()).filter(post => post.length > 0);

    return NextResponse.json({ posts });

  } catch (error) {
    console.error('Error generating posts:', error);
    return NextResponse.json(
      { error: 'Failed to generate posts' },
      { status: 500 }
    );
  }
} 