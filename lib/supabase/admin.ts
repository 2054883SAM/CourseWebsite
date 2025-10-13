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

/**
 * Update Stripe customer_id for a user using service role (webhook-safe)
 */
export async function updateUserCustomerIdAdmin(userId: string, customerId: string) {
  const baseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl) throw new Error('Missing SUPABASE_URL');
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  const url = `${baseUrl}/rest/v1/users?id=eq.${userId}`;
  const isProduction = process.env.NODE_ENV === 'production';
  const body = isProduction ? { customer_id: customerId } : { customer_id_dev: customerId };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Failed updating ${isProduction ? 'customer_id' : 'customer_id_dev'}: ${res.status} ${txt}`
    );
  }
  return res.json();
}
