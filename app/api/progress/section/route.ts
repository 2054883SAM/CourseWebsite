import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { courseId, sectionId, progressPercentage, completed } = await request.json();

    if (!courseId || !sectionId || typeof progressPercentage !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, sectionId, progressPercentage' },
        { status: 400 }
      );
    }

    // Create authenticated supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Authentication error:', sessionError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.id);
    console.log('Progress data:', { courseId, sectionId, progressPercentage, completed });

    // Prepare progress data
    const progressData = {
      user_id: session.user.id,
      course_id: courseId,
      section_id: sectionId,
      progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      completed: completed || progressPercentage >= 95, // Auto-complete at 95%
      last_watched_at: new Date().toISOString(),
    };

    console.log('Upserting progress data:', progressData);

    // Upsert progress data
    const { data, error } = await supabase
      .from('section_progress')
      .upsert(progressData)
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json(
        { error: 'Failed to update progress', details: error.message },
        { status: 500 }
      );
    }

    console.log('Progress updated successfully:', data);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error updating section progress:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const sectionId = searchParams.get('sectionId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing courseId parameter' },
        { status: 400 }
      );
    }

    // Create authenticated supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('section_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch progress', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sectionId ? (data[0] || null) : data
    });

  } catch (error) {
    console.error('Error fetching section progress:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
