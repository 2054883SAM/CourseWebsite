import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Missing required field: courseId' }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const userId = user.id;

    console.log('Course ID:', courseId);
    console.log('User ID:', userId);

    // 1) Find the enrollment id first (ensures the record exists and is visible)
    const { data: enrollment, error: findError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: findError.message || 'Failed to find enrollment record' },
        { status: 500 }
      );
    }

    if (!enrollment?.id) {
      return NextResponse.json({ error: 'Enrollment record not found' }, { status: 404 });
    }

    // 2) Delete by id and return representation to confirm deletion
    const { data: deletedRows, error: deleteError } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollment.id)
      .select('id');

    console.log('Delete error:', deleteError);
    console.log('Deleted rows:', Array.isArray(deletedRows) ? deletedRows.length : deletedRows);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || 'Failed to unenroll from course' },
        { status: 403 }
      );
    }

    if (!deletedRows || deletedRows.length === 0) {
      // Double check whether the row still exists (RLS or race condition)
      const { data: stillExists } = await supabase
        .from('enrollments')
        .select('id')
        .eq('id', enrollment.id)
        .maybeSingle();

      if (stillExists?.id) {
        return NextResponse.json(
          { error: 'Not authorized to delete enrollment (policy blocked)' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, deleted: deletedRows?.length ?? 0 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error processing unenrollment' },
      { status: 500 }
    );
  }
}
