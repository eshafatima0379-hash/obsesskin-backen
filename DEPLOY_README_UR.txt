OBSESSKIN - NETLIFY + SUPABASE PROJECT

IMPORTANT:
- This project includes index.html and server-side Netlify Functions.
- Do not paste SUPABASE_SERVICE_ROLE_KEY into HTML, JavaScript, this ZIP, or chat.
- Add these variables in Netlify > Project configuration > Environment variables:
  SUPABASE_URL
  SUPABASE_PUBLISHABLE_KEY
  SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_SERVICE_ROLE_KEY must be a Supabase Secret/service_role key and is used only by Netlify Functions.
- SUPABASE_PUBLISHABLE_KEY is public and is served to the browser by /.netlify/functions/supabase-config.
- After adding/updating environment variables, create a new deploy.

ADMIN LOGIN SETUP:
1. Create an email/password user in Supabase Authentication > Users.
2. Copy that user's UUID.
3. Add the UUID to public.admin_users using the SQL editor:
   insert into public.admin_users(user_id) values ('AUTH-USER-UUID') on conflict do nothing;

DEPLOYMENT LIMITATION:
A plain static drag-and-drop deploy in Netlify does not reliably build/deploy the functions in this project.
The functions must be deployed using a Netlify build/deploy workflow that processes netlify/functions (for example Netlify CLI or a connected Git provider).
Do not treat a successful static upload as proof that Supabase backend functions are live.

FEATURE NOTES:
This package contains order saving, review submission/approval, product/order admin functions.
It does not include email notifications or payment screenshot uploads.
