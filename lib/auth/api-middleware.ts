import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

interface AuthResult {
  userId: string;
  role: string;
}

export async function validateApiAuth(request: NextRequest): Promise<AuthResult> {
  const supabase = createRouteHandlerClient({ cookies });

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('Unauthorized');
  }

  // Get user role from database
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  return {
    userId: session.user.id,
    role: userData.role
  };
} 