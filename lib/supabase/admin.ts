export async function updateUserMembershipAdmin(userId: string, membership: 'free' | 'subscribed') {
  const baseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl) throw new Error('Missing SUPABASE_URL');
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  const url = `${baseUrl}/rest/v1/users?id=eq.${userId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ membership }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed updating membership: ${res.status} ${txt}`);
  }
  return res.json();
}
