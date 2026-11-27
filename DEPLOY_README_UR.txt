OBSESSKIN - NETLIFY + SUPABASE (Roman Urdu guide)

1) Supabase SQL setup
- Supabase Dashboard > SQL Editor kholo.
- SUPABASE_LIVE_SETUP.sql file ka poora code paste karke Run karo.
- Agar duplicate section ka error aaye to ruk jao. Pehle duplicates check/share karo; data delete mat karna.

2) Netlify environment variables
Netlify > Site configuration / Project configuration > Environment variables mein ye 3 values set hon:
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
Service role key sirf Netlify environment variables mein rahe. Isay HTML, GitHub ya chat mein kabhi paste na karo.

3) Deployment
Is project mein Netlify Functions hain. Sirf static drag-and-drop deploy se functions deploy nahi hotay.
Git provider se repository connect karke build/deploy karo, ya Netlify CLI ka supported workflow use karo.
Deploy ke baad functions ke endpoints test karo.

4) Admin access
- Supabase Authentication > Users mein admin email/password user hona chahiye.
- Us user ki UUID public.admin_users table mein honi chahiye.
- Existing admin login design/code ko change na karo.

5) Is package mein is update ke andar
- Review APIs ab public.reviews.review_text column use karti hain (reviews column nahi).
- Admin content upsert ke liye admin_content.section unique index SQL diya gaya hai.
- Existing server-side admin authorization ko preserve kiya gaya hai.

IMPORTANT - honest feature status
Yeh ZIP review-column fix aur Supabase SQL setup provide karti hai. Is se yeh guarantee nahi hoti ke index.html ke har admin tab ka har control cloud-synced hai. Current index.html mein ab bhi kai features localStorage use karte hain (misal: kuch product controls, media, categories, email settings, aur delivery settings). Media files ko Storage mein upload karne ka complete workflow bhi is package mein shamil nahi. In tabs ko alag alag integrate aur test karna hoga before production-live claim.

Storage notes
- product-images bucket public ho sakta hai sirf public product media ke liye.
- payment-proofs bucket private rakho.
- Private payment proof upload/read policies ko verify kiye baghair public mat karo.

Never put SUPABASE_SERVICE_ROLE_KEY in browser code, HTML, GitHub, or chat.
