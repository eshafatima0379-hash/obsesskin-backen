// Public browser-side configuration loader.
// The actual Supabase URL and publishable key are served securely by the
// Netlify Function at /.netlify/functions/supabase-config.
window.loadSupabaseConfig = async function () {
  const response = await fetch('/.netlify/functions/supabase-config', {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });
  const config = await response.json();
  if (!response.ok || !config.supabaseUrl || !config.publishableKey) {
    throw new Error(config.error || 'Supabase public configuration is missing.');
  }
  return config;
};
