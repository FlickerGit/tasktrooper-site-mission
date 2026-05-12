CREATE OR REPLACE FUNCTION public.claim_quote_requests_by_email()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
  updated_count integer;
BEGIN
  IF uid IS NULL THEN
    RETURN 0;
  END IF;

  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF uemail IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.quote_requests
  SET customer_id = uid
  WHERE customer_id IS NULL
    AND lower(email) = lower(uemail);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_quote_requests_by_email() TO authenticated;