import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

// DELETE /api/courses/[courseId]/delete
// Steps:
// 1) Delete VdoCipher video by playback_id
// 2) Delete Supabase storage thumbnail from thumbnail_url
// 3) Delete the course record

export async function DELETE(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const body = await request.json().catch(() => null as any);
    const courseId: string | undefined = body?.courseId;

    // Validate input
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    // 0) AuthN/AuthZ: ensure current user is admin
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { data: dbUser, error: dbUserErr } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (dbUserErr || !dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch course to get playback_id and thumbnail_url
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('id, playback_id, thumbnail_url')
      .eq('id', courseId)
      .single();
    if (courseErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 1) Delete VdoCipher video if playback_id exists
    if (course.playback_id) {
      const API_SECRET = process.env.VDO_API_SECRET;
      if (!API_SECRET) {
        return NextResponse.json(
          { error: 'Server misconfiguration: VDO_API_SECRET not set' },
          { status: 500 }
        );
      }

      try {
        console.log('Deleting VdoCipher video', course.playback_id);
        const url = new URL('https://dev.vdocipher.com/api/videos');
        url.searchParams.set('videos', course.playback_id);
        const resp = await fetch(url.toString(), {
          method: 'DELETE',
          headers: {
            Authorization: `Apisecret ${API_SECRET}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        // Accept 2xx and 404 (already deleted)
        if (!resp.ok && resp.status !== 404) {
          const txt = await resp.text().catch(() => '');
          return NextResponse.json(
            { error: `VdoCipher delete failed: ${resp.status} ${txt}` },
            { status: 502 }
          );
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'Failed to contact VdoCipher API' },
          { status: 502 }
        );
      }
    }

    // 2) Delete thumbnail from Supabase storage if url present and belongs to our bucket
    if (course.thumbnail_url) {
      try {
        // Expected pattern: https://<project>.supabase.co/storage/v1/object/public/course-thumbnails/<path>
        const url = new URL(course.thumbnail_url);
        const publicPrefix = '/storage/v1/object/public/course-thumbnails/';
        const idx = url.pathname.indexOf(publicPrefix);
        if (idx !== -1) {
          const relativePath = url.pathname.substring(idx + publicPrefix.length);
          if (relativePath) {
            const { error: removeErr } = await supabase
              .storage
              .from('course-thumbnails')
              .remove([relativePath]);
            if (removeErr) {
              return NextResponse.json(
                { error: `Failed to delete thumbnail: ${removeErr.message}` },
                { status: 500 }
              );
            }
          }
        }
      } catch {
        // Ignore malformed URL; proceed
      }
    }

    // 3) Delete the course record (RLS restricts to admin only)
    const { error: delErr } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    if (delErr) {
      return NextResponse.json(
        { error: `Failed to delete course: ${delErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete course unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


