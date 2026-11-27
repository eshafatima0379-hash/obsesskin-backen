const { response, sb } = require('./_supabase');
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response(200, { ok: true });
  if (event.httpMethod !== 'POST') return response(405, { error: 'Method not allowed.' });
  try {
    const b = JSON.parse(event.body || '{}');
    const customer = String(b.customerName || '').trim();
    const email = String(b.email || '').trim();
    const phone = String(b.phone || '').trim();
    const address = String(b.address || '').trim();
    const items = Array.isArray(b.items) ? b.items : [];
    if (!customer || !phone || !address || !items.length) return response(400, { error: 'Name, phone, address and products are required.' });
    const names = [...new Set(items.map(x => String(x.name || '').trim()).filter(Boolean))];
    const or = names.map(n => `name.eq.${encodeURIComponent(n)}`).join(',');
    const p = await sb(`products?select=id,name,price,is_active,estimated_delivery_date&or=(${or})`);
    const byName = new Map((p.data || []).map(x => [x.name.toLowerCase(), x]));
    const clean = [];
    for (const item of items) {
      const name = String(item.name || '').trim(); const product = byName.get(name.toLowerCase());
      if (!product || !product.is_active) return response(400, { error: `Product unavailable: ${name}` });
      const quantity = Math.max(1, Math.min(99, parseInt(item.quantity, 10) || 1));
      clean.push({ product_id: product.id, product_name_snapshot: product.name, quantity, price: Number(product.price), estimated_delivery_date: product.estimated_delivery_date || null });
    }
    const subtotal = clean.reduce((sum, x) => sum + x.price * x.quantity, 0);
    const deliveryFee = Math.max(0, Number(b.deliveryFee) || 0);
    const total = subtotal + deliveryFee;
    const method = String(b.paymentMethod || 'cod').slice(0, 40);
    const paymentStatus = String(b.paymentStatus || (method === 'cod' ? 'Cash on Delivery' : 'Wallet payment pending verification')).slice(0, 100);
    const tx = String(b.transactionReference || '').slice(0, 160);
    const inserted = await sb('orders?select=id', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ customer_name: customer, email: email || null, phone, address, subtotal, delivery_fee: deliveryFee, total, payment_method: method, payment_status: paymentStatus, transaction_reference: tx || null, order_status: 'Received' }) });
    const order = inserted.data?.[0]; if (!order?.id) throw new Error('Order record was not returned.');
    const trackingId = `OBS-${order.id.replace(/-/g, '').slice(0, 10).toUpperCase()}`;
    await sb(`orders?id=eq.${encodeURIComponent(order.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ tracking_id: trackingId }) });
    try { await sb('order_items', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(clean.map(x => ({ ...x, order_id: order.id }))) }); }
    catch (e) { await sb(`orders?id=eq.${encodeURIComponent(order.id)}`, { method: 'DELETE' }).catch(() => {}); throw e; }
    return response(201, { ok: true, orderId: order.id, trackingId, total });
  } catch (e) { return response(e.statusCode || 500, { error: e.message || 'Order could not be saved.' }); }
};
