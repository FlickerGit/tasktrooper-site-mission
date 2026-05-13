DROP POLICY IF EXISTS "New visitors and account owners can submit quote requests" ON public.quote_requests;

DROP FUNCTION IF EXISTS public.can_insert_quote_request(text, uuid);

CREATE POLICY "Visitors and account owners can create quote requests"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND customer_id IS NULL)
  OR
  (auth.uid() IS NOT NULL AND customer_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.enforce_quote_request_customer_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_email text;
  normalised_email text := lower(trim(NEW.email));
BEGIN
  IF normalised_email IS NULL OR normalised_email = '' THEN
    RAISE EXCEPTION 'Email address is required.';
  END IF;

  IF current_user_id IS NULL THEN
    IF NEW.customer_id IS NOT NULL THEN
      RAISE EXCEPTION 'Please sign in to submit a quote for this customer.';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.quote_requests qr
      WHERE lower(trim(qr.email)) = normalised_email
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE lower(trim(p.email)) = normalised_email
    ) THEN
      RAISE EXCEPTION 'That email is already linked to an existing customer. Please sign in to request another quote.';
    END IF;

    RETURN NEW;
  END IF;

  SELECT lower(trim(email))
  INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;

  IF NEW.customer_id IS DISTINCT FROM current_user_id THEN
    RAISE EXCEPTION 'Quote requests must be linked to the signed-in customer account.';
  END IF;

  IF current_user_email IS DISTINCT FROM normalised_email THEN
    RAISE EXCEPTION 'Please use the email address linked to your signed-in account for quote requests.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_quote_request_customer_identity() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_quote_request_customer_identity() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_quote_request_customer_identity() FROM authenticated;

DROP TRIGGER IF EXISTS enforce_quote_request_customer_identity_before_insert ON public.quote_requests;

CREATE TRIGGER enforce_quote_request_customer_identity_before_insert
BEFORE INSERT ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_quote_request_customer_identity();