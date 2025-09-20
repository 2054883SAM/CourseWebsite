import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

interface AuthResult {
  userId: string;
  role: string;
}

export async function validateApiAuth(request: NextRequest): Promise<AuthResult> {
  console.log('API Auth: Validating authentication using createServerClient');

  // Debug cookie information
  console.log(
    'API Auth: Available cookies:',
    Array.from(request.cookies.getAll()).map((c) => c.name)
  );

  try {
    // Create a Supabase client using the cookies from the request
    const supabase = createServerClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const cookie = request.cookies.get(name);
            console.log(`API Auth: Getting cookie ${name}:`, cookie ? 'Found' : 'Not found');
            return cookie?.value;
          },
          set() {
            // We don't need to set cookies in this context
          },
          remove() {
            // We don't need to remove cookies in this context
          },
        },
      }
    );

    // Get the authenticated user (validated by Supabase Auth server)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('User fetch error:', userError);
      throw new Error('Error getting user: ' + userError.message);
    }

    if (!user) {
      console.log(
        'API Auth: No session found in Supabase client, checking for supabase.auth.token cookie'
      );

      // Check specifically for the supabase.auth.token cookie that we see in the logs
      const supabaseAuthCookie = request.cookies.get('supabase.auth.token');
      if (supabaseAuthCookie) {
        console.log('API Auth: Found supabase.auth.token cookie');
        try {
          // Parse the cookie value - it might be a JSON string containing the token
          let tokenData = supabaseAuthCookie.value;

          try {
            // Try to parse it as JSON
            const parsed = JSON.parse(tokenData);
            console.log('API Auth: Parsed supabase.auth.token as JSON');

            // If it's JSON, extract the access_token
            if (parsed.access_token) {
              console.log('API Auth: Found access_token in cookie data');
              // Create a new session with this token
              const {
                data: { session: newSession },
                error,
              } = await supabase.auth.setSession({
                access_token: parsed.access_token,
                refresh_token: parsed.refresh_token || '',
              });

              if (error) {
                console.error('API Auth: Error setting session from cookie token:', error);
              }

              if (newSession) {
                console.log('API Auth: Successfully created session from cookie token');
                // Extract user information from the new session
                return {
                  userId: newSession.user.id,
                  role:
                    newSession.user.app_metadata?.role || (await fetchUserRole(newSession.user.id)),
                };
              }

              // If we couldn't create a session but have a valid token, try to validate it manually
              return await validateToken(parsed.access_token);
            } else {
              console.log('API Auth: No access_token found in cookie JSON data');
            }
          } catch (parseError) {
            // Not JSON, might be the token itself
            console.log('API Auth: Could not parse as JSON, trying as raw token');
            return await validateToken(tokenData);
          }
        } catch (err) {
          console.error('API Auth: Error processing supabase.auth.token cookie:', err);
        }
      } else {
        console.log('API Auth: supabase.auth.token cookie not found or empty');
      }

      // Try getting session from authorization header as fallback
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('API Auth: Using authorization header as fallback');
        try {
          return await validateToken(headerToken);
        } catch (err) {
          console.error('Error validating auth header token:', err);
        }
      }

      // Check for a token in the X-Auth-Token header (custom implementation)
      const customToken = request.headers.get('x-auth-token');
      if (customToken) {
        console.log('API Auth: Using x-auth-token header as fallback');
        try {
          return await validateToken(customToken);
        } catch (err) {
          console.error('Error validating custom token:', err);
        }
      }

      throw new Error('No auth token found');
    }

    // Extract the user ID from the validated user
    console.log('API Auth: Authenticated user ID:', user.id);
    const userId = user.id;
    if (!userId) {
      throw new Error('User ID not found in session');
    }

    return {
      userId,
      role: (user as any).app_metadata?.role || (await fetchUserRole(userId)),
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error(
      'Authentication failed: ' + (error instanceof Error ? error.message : String(error))
    );
  }

  // This section is now handled in the main function
  throw new Error('This code path should not be reached');
}

// Helper function to fetch the user's role from the database
async function fetchUserRole(userId: string): Promise<string> {
  console.log('API Auth: Fetching role for user ID:', userId);

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/users?select=role&id=eq.${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    const userData = await response.json();

    if (!userData || userData.length === 0) {
      throw new Error('User not found in database');
    }

    const role = userData[0].role;
    console.log('API Auth: User role found:', role);
    return role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw new Error('Failed to determine user role');
  }
}

// Helper function to validate a token from Authorization header or cookie
async function validateToken(token: string): Promise<AuthResult> {
  try {
    console.log('API Auth: Validating token manually');

    // Check if token is JSON format (cookie sometimes stores as JSON)
    if (token.startsWith('{') && token.endsWith('}')) {
      try {
        console.log('API Auth: Token appears to be JSON, attempting to parse');
        const parsed = JSON.parse(token);
        if (parsed.access_token) {
          console.log('API Auth: Found access_token in JSON, using that');
          token = parsed.access_token;
        } else if (parsed.token) {
          console.log('API Auth: Found token field in JSON, using that');
          token = parsed.token;
        }
      } catch (e) {
        console.log('API Auth: Failed to parse token as JSON');
      }
    }

    // Handle code verifier cookies which don't contain an actual token
    if (token.indexOf('.') === -1) {
      console.error('Token appears to be a code verifier, not a JWT');
      throw new Error('Invalid token format - not a JWT');
    }

    // Decode token
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Token does not have 3 parts:', tokenParts.length);
      throw new Error('Invalid token format - wrong number of segments');
    }

    // Decode the JWT payload
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const userId = payload.sub;

    if (!userId) {
      throw new Error('No user ID in token');
    }

    console.log('User ID from authorization header token:', userId);

    // Fetch the user's role from the database
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/users?select=role&id=eq.${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();

    if (!userData || userData.length === 0) {
      throw new Error('User not found in database');
    }

    const role = userData[0].role;
    console.log('User role found:', role);

    return {
      userId,
      role,
    };
  } catch (error) {
    console.error('Error validating token:', error);
    throw new Error('Invalid authentication token');
  }
}
