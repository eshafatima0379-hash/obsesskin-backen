const URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
function response(statusCode, body) { return { statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS' }, body: JSON.stringify(body) }; }
async function sb(path, options = {}) {
  if (!URL || !KEY) { const e = new Error('Netlify Supabase server environment variables are missing.'); e.statusCode = 500; throw e; }
  const r = await fetch(`${URL}/rest/v1/${path}`, { ...options, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const t = await r.text(); let data = null; try { data = t ? JSON.parse(t) : null; } catch { data = t; }
  if (!r.ok) { const e = new Error(data?.message || data?.details || data?.hint || `Supabase request failed (${r.status}).`); e.statusCode = r.status; throw e; }
  return { data, status: r.status };
}
async function requireAdmin(event) {
  const token = (event.headers?.authorization || event.headers?.Authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) { const e = new Error('Please sign in as admin.'); e.statusCode = 401; throw e; }
  const r = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY || '', Authorization: `Bearer ${token}` } });
  if (!r.ok) { const e = new Error('Admin session is invalid or expired.'); e.statusCode = 401; throw e; }
  const user = await r.json();
  const allowed = await sb(`admin_users?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`);
  if (!allowed.data?.length) { const e = new Error('This account is not listed in admin_users.'); e.statusCode = 403; throw e; }
  return user;
}
module.exports = { response, sb, requireAdmin };
