import { validateApiAuth } from '@/lib/auth/api-middleware';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiAuth(request);
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', auth.userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/users/profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await validateApiAuth(request);
    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    
    // Validate update data
    const { name, photo_url } = body;
    if (!name && !photo_url) {
      return NextResponse.json(
        { error: 'Invalid profile data' },
        { status: 400 }
      );
    }

    const updateData: { name?: string; photo_url?: string } = {};
    if (name) updateData.name = name;
    if (photo_url) updateData.photo_url = photo_url;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', auth.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/users/profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    );
  }
} 