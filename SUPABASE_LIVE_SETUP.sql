-- OBSESSKIN Supabase setup
-- Run in Supabase Dashboard > SQL Editor.
-- This script intentionally stops if admin_content has duplicate section values;
-- resolve duplicates before creating the unique index so no saved content is lost.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.admin_content
    GROUP BY section
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'admin_content contains duplicate section values. Review them first; no rows were deleted.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS admin_content_section_unique
  ON public.admin_content (section);

CREATE INDEX IF NOT EXISTS reviews_product_approved_created_idx
  ON public.reviews (product_name, is_approved, created_at DESC);

CREATE INDEX IF NOT EXISTS orders_created_at_desc_idx
  ON public.orders (created_at DESC);

-- Confirm expected review column exists. This project uses review_text.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'reviews'
      AND column_name = 'review_text'
  ) THEN
    RAISE EXCEPTION 'Missing public.reviews.review_text column. Check the reviews table schema before continuing.';
  END IF;
END $$;
