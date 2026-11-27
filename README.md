# OBSESSKIN Netlify + Supabase

This project includes the storefront (`index.html`) and Netlify Functions under `netlify/functions`.

## Environment variables
Set these in Netlify environment variables:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code, HTML, GitHub, or chat.**

## Supabase SQL
Run `SUPABASE_LIVE_SETUP.sql` in the Supabase SQL Editor. It creates the unique index needed by `admin_content?on_conflict=section` and useful read indexes. It stops safely if duplicate `admin_content.section` values exist; inspect and resolve those without deleting saved content.

## Admin access
Create/use the admin email/password user in Supabase Auth, then add that Auth user's UUID to `public.admin_users`. Existing server-side authorization checks the authenticated user against this allow-list.

## Deployment
This project uses Netlify Functions. Deploy through a connected Git provider or Netlify CLI/build workflow that processes `netlify/functions`; a static drag-and-drop upload alone does not deploy the functions reliably.

## Scope and limitations
The review functions use the existing `public.reviews.review_text` column. The dashboard's `admin_content` sync covers the keys already mapped in `index.html`, but other dashboard controls still use browser `localStorage` (including some product controls, media, categories, delivery settings, and email settings). This package does not implement a complete Storage upload workflow for media or payment proofs, and it does not provide email notifications. Test each admin area before treating it as fully cloud-synced.
