import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// This is an admin-only endpoint to set up the questionnaire schema
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you should implement proper admin check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Add schema updates
    
    // 1. Add new columns to questions table
    const { error: questionsError } = await supabase.rpc('add_question_columns');
    if (questionsError) {
      console.error('Error updating questions table:', questionsError);
      return NextResponse.json({ error: 'Failed to update questions table' }, { status: 500 });
    }

    // 2. Add new columns to options table
    const { error: optionsError } = await supabase.rpc('add_option_columns');
    if (optionsError) {
      console.error('Error updating options table:', optionsError);
      return NextResponse.json({ error: 'Failed to update options table' }, { status: 500 });
    }

    // 3. Add new columns to responses table
    const { error: responsesError } = await supabase.rpc('add_response_columns');
    if (responsesError) {
      console.error('Error updating responses table:', responsesError);
      return NextResponse.json({ error: 'Failed to update responses table' }, { status: 500 });
    }

    // 4. Create question_stages table
    const { error: stagesError } = await supabase.rpc('create_question_stages_table');
    if (stagesError) {
      console.error('Error creating stages table:', stagesError);
      return NextResponse.json({ error: 'Failed to create stages table' }, { status: 500 });
    }

    // 5. Create option_sets table
    const { error: optionSetsError } = await supabase.rpc('create_option_sets_table');
    if (optionSetsError) {
      console.error('Error creating option sets table:', optionSetsError);
      return NextResponse.json({ error: 'Failed to create option sets table' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Questionnaire schema updated successfully' 
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up questionnaire schema' },
      { status: 500 }
    );
  }
} 