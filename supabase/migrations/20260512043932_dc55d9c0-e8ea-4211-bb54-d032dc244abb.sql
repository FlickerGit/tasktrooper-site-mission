ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS quote_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS customer_message text;