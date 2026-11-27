const { response, sb, requireAdmin } = require('./_supabase');
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response(200, { ok: true });
  try {
    await requireAdmin(event);
    if (event.httpMethod === 'GET') {
      const kind = event.queryStringParameters?.kind || 'orders'; let r;
      if (kind === 'orders') r = await sb('orders?select=*,order_items(id,order_id,product_id,quantity,price,estimated_delivery_date,product_name_snapshot)&order=created_at.desc');
      else if (kind === 'reviews') { r = await sb('reviews?select=id,customer_name,reviews,rating,created_at,product_name,is_approved&order=created_at.desc'); r.data = (r.data || []).map(x => ({ ...x, review_text: x.reviews })); }
      else if (kind === 'products') r = await sb('products?select=id,name,description,price,image_url,category_id,is_active,created_at,estimated_delivery_date&order=name.asc');
      else return response(400, { error: 'Unknown manager section.' });
      return response(200, { data: r.data || [] });
    }
    if (event.httpMethod === 'PATCH') {
      const b = JSON.parse(event.body || '{}');
      if (b.kind === 'order-status') {
        const allowed = ['Received', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!b.orderId || !allowed.includes(b.orderStatus)) return response(400, { error: 'Invalid order status.' });
        await sb(`orders?id=eq.${encodeURIComponent(b.orderId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ order_status: b.orderStatus }) });
      } else if (b.kind === 'review-approval') {
        if (!b.reviewId || typeof b.approved !== 'boolean') return response(400, { error: 'Invalid review update.' });
        await sb(`reviews?id=eq.${encodeURIComponent(b.reviewId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ is_approved: b.approved }) });
      } else if (b.kind === 'product-delivery') {
        if (!b.productId) return response(400, { error: 'Product ID is required.' });
        const date = b.estimatedDeliveryDate || null;
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return response(400, { error: 'Date must be YYYY-MM-DD.' });
        await sb(`products?id=eq.${encodeURIComponent(b.productId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ estimated_delivery_date: date }) });
      } else return response(400, { error: 'Unknown update type.' });
      return response(200, { ok: true });
    }
    return response(405, { error: 'Method not allowed.' });
  } catch (e) { return response(e.statusCode || 500, { error: e.message || 'Admin request failed.' }); }
};
