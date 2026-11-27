const { response } = require('./_supabase');
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response(200, { ok: true });
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
  if (!supabaseUrl || !publishableKey) return response(500, { error: 'Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Netlify environment variables.' });
  return response(200, { supabaseUrl, publishableKey });
};
