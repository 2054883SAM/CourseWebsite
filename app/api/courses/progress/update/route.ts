import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { updateEnrollmentProgressFromSections } from '@/lib/supabase/courseProgress';

// Use shared progress utility for a single source of truth

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const { userId, courseId } = await request.json();

    // Validate input
    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId' },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is updating their own progress
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Always compute from sections and persist via shared utility
    const progress = await updateEnrollmentProgressFromSections(supabase, userId, courseId);
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Error in progress update route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
