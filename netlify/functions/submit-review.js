const { response, sb } = require('./_supabase');
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response(200, { ok: true });
  try {
    if (event.httpMethod === 'GET') {
      const name = String(event.queryStringParameters?.productName || '').trim();
      if (!name) return response(400, { error: 'productName is required.' });
      const r = await sb(`reviews?select=id,customer_name,review_text,rating,created_at,product_name,is_approved&is_approved=eq.true&product_name=eq.${encodeURIComponent(name)}&order=created_at.desc`);
      return response(200, { reviews: r.data || [] });
    }
    if (event.httpMethod !== 'POST') return response(405, { error: 'Method not allowed.' });
    const b = JSON.parse(event.body || '{}');
    const customer = String(b.customerName || '').trim().slice(0, 80);
    const review = String(b.reviewText || '').trim().slice(0, 2000);
    const product = String(b.productName || '').trim().slice(0, 160);
    const rating = Number(b.rating);
    if (!customer || !review || !product || !Number.isInteger(rating) || rating < 1 || rating > 5) return response(400, { error: 'Name, product, review and rating (1–5) are required.' });
    const r = await sb('reviews?select=id,customer_name,review_text,rating,created_at,product_name,is_approved', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ customer_name: customer, review_text: review, rating, product_name: product, is_approved: false }) });
    return response(201, { ok: true, review: r.data?.[0] || null, message: 'Review submitted for admin approval.' });
  } catch (e) { return response(e.statusCode || 500, { error: e.message || 'Review could not be saved.' }); }
};
