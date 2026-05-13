CREATE OR REPLACE FUNCTION public.can_insert_quote_request(_email text, _customer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_email text;
  normalised_email text := lower(trim(_email));
BEGIN
  IF normalised_email IS NULL OR normalised_email = '' THEN
    RETURN false;
  END IF;

  IF current_user_id IS NULL THEN
    RETURN NOT EXISTS (
      SELECT 1
      FROM public.quote_requests qr
      WHERE lower(trim(qr.email)) = normalised_email
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE lower(trim(p.email)) = normalised_email
    );
  END IF;

  SELECT lower(trim(email))
  INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;

  RETURN _customer_id = current_user_id
    AND current_user_email = normalised_email;
END;
$$;

DROP POLICY IF EXISTS "Anyone can submit a quote request" ON public.quote_requests;

CREATE POLICY "New visitors and account owners can submit quote requests"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (public.can_insert_quote_request(email, customer_id));