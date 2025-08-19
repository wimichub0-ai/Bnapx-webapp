export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const tx_id = searchParams.get('transaction_id');
  const ref = searchParams.get('ref') || searchParams.get('tx_ref');

  let verifyUrl;
  if (tx_id) {
    verifyUrl = `https://api.flutterwave.com/v3/transactions/${tx_id}/verify`;
  } else if (ref) {
    verifyUrl = `https://api/flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(ref)}`;
  } else {
    return new Response('Missing transaction_id or ref', { status: 400 });
  }

  const res = await fetch(verifyUrl, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  const data = await res.json();
  const status = data?.data?.status || data?.status || 'unknown';

  const html = `<!doctype html>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment ${status}</title>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px} .card{max-width:560px;margin:0 auto;border:1px solid #e6ebf4;border-radius:14px;padding:20px}</style>
  <div class="card">
    <h2>Payment ${status.toUpperCase()}</h2>
    <p><b>Reference:</b> ${ref || '-'}</p>
    <p><b>Transaction ID:</b> ${tx_id || '-'}</p>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  </div>`;
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html' } });
}
