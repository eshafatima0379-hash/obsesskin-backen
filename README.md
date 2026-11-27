# OBSESSKIN — Netlify + Supabase

This repository is arranged for GitHub-connected Netlify deployment.

## Repository structure

```text
OBSESSKIN_GITHUB_READY/
├── index.html
├── netlify.toml
├── .gitignore
├── .env.example
├── README.md
├── DEPLOY_README_UR.txt
└── netlify/
    └── functions/
        ├── _supabase.js
        ├── supabase-config.js
        ├── admin-manage.js
        ├── submit-review.js
        └── create-order.js
```

## Deploy through GitHub

1. Create a new GitHub repository.
2. Upload the **contents of this folder** to the repository root (do not upload an extra nested folder).
3. In Netlify, choose **Add new site → Import an existing project** and connect that GitHub repository.
4. Keep the build settings compatible with `netlify.toml`:
   - Build command: leave empty
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
5. Add these environment variables in Netlify site configuration:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Trigger a new deploy after setting the variables.

## Security

- Never put `SUPABASE_SERVICE_ROLE_KEY` in `index.html`, browser JavaScript, GitHub, or a public file.
- Set the service-role key only in Netlify environment variables.
- `.env` files are ignored by Git.

## Important: backend setup is still required

This ZIP contains the frontend and Netlify function files, but it does **not** contain the Supabase SQL/database schema. Before live checkout, reviews, and admin management can work, the matching Supabase tables, columns, relationships, and admin user record must exist. Do not treat a successful Netlify deploy as proof that the database integration is working.

The included functions cover order creation, review submission/listing, and admin retrieval/updates. The package notes that email notifications and payment screenshot uploads are not included.
