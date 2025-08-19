export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const sig = req.headers.get('verif-hash') || '';
  if (!process.env.FLW_HASH || sig !== process.env.FLW_HASH) {
    return new Response('Invalid signature', { status: 401 });
  }
  const event = await req.json();
  return new Response(JSON.stringify({ received: true, id: event?.data?.id ?? null }), {
    status: 200, headers: { 'content-type': 'application/json' }
  });
}
