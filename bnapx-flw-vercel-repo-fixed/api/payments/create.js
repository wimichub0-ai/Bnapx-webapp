export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const { amount, currency = 'NGN', email, name } = await req.json();

  const tx_ref = `BNAPX-${Date.now()}`;
  const payload = {
    tx_ref,
    amount,
    currency,
    redirect_url: `${new URL(req.url).origin}/api/payments/verify?ref=${tx_ref}`,
    customer: { email, name },
    customizations: { title: 'BnapX', description: 'Test payment' },
  };

  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: data }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({ link: data.data.link, ref: tx_ref }), {
    status: 200, headers: { 'content-type': 'application/json' }
  });
}
