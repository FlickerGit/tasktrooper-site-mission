ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS service_date date,
  ADD COLUMN IF NOT EXISTS product_service text,
  ADD COLUMN IF NOT EXISTS quote_description text;