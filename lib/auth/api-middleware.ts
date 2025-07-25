import { NextRequest } from 'next/server';

interface AuthResult {
  userId: string;
  role: string;
}

export async function validateApiAuth(request: NextRequest): Promise<AuthResult> {
  // Extraire les cookies directement de la requête
  const cookieHeader = request.headers.get('cookie') || '';
  
  // Parser les cookies pour extraire le token d'authentification Supabase
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  // Chercher le token d'authentification Supabase
  const authToken = cookies['sb-qrowzznnnarfogfbnnow-auth-token'] || 
                   cookies['supabase-auth-token'] ||
                   cookies['auth-token'];

  if (!authToken) {
    console.error('No auth token found in cookies');
    console.error('Available cookies:', Object.keys(cookies));
    throw new Error('No auth token found');
  }

  try {
    // Décoder le token JWT pour obtenir les informations utilisateur
    const tokenParts = authToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Décoder le payload du JWT (base64)
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const userId = payload.sub;

    if (!userId) {
      throw new Error('No user ID in token');
    }

    console.log('User ID from token:', userId);

    // Utiliser l'API Supabase directement pour récupérer le rôle
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=role&id=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Content-Type': 'application/json',
      },
    });

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
      role
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Unauthorized');
  }
} 