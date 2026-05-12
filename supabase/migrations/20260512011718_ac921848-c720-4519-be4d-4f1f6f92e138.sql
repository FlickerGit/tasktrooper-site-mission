
-- ============================================================
-- Job workflow system
-- ============================================================

-- 1. New enums
DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM (
    'new_request','reviewing','quoted','approved','scheduled',
    'in_progress','completed','invoiced','paid','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.time_window AS ENUM ('morning','afternoon','flexible');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Extend quote_requests
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS customer_id uuid,
  ADD COLUMN IF NOT EXISTS status public.job_status NOT NULL DEFAULT 'new_request',
  ADD COLUMN IF NOT EXISTS preferred_time_window public.time_window,
  ADD COLUMN IF NOT EXISTS scheduled_date date,
  ADD COLUMN IF NOT EXISTS scheduled_time time,
  ADD COLUMN IF NOT EXISTS scheduled_window public.time_window,
  ADD COLUMN IF NOT EXISTS assigned_staff_id uuid,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS subtotal numeric(10,2),
  ADD COLUMN IF NOT EXISTS gst numeric(10,2),
  ADD COLUMN IF NOT EXISTS total numeric(10,2),
  ADD COLUMN IF NOT EXISTS quote_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS quote_decision_at timestamptz,
  ADD COLUMN IF NOT EXISTS quote_rejection_reason text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS invoiced_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS quote_requests_customer_idx ON public.quote_requests(customer_id);
CREATE INDEX IF NOT EXISTS quote_requests_staff_idx ON public.quote_requests(assigned_staff_id);
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON public.quote_requests(status);

-- updated_at trigger
DROP TRIGGER IF EXISTS quote_requests_set_updated_at ON public.quote_requests;
CREATE TRIGGER quote_requests_set_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Staff members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  user_id uuid PRIMARY KEY,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- security definer helper
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_members WHERE user_id = _user_id)
$$;

-- 4. Status history
CREATE TABLE IF NOT EXISTS public.job_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  from_status public.job_status,
  to_status public.job_status NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.job_status_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS job_status_history_job_idx ON public.job_status_history(job_id);

-- 5. Attachments
CREATE TABLE IF NOT EXISTS public.job_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  uploaded_by uuid,
  storage_path text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.job_attachments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS job_attachments_job_idx ON public.job_attachments(job_id);

-- 6. Status-history trigger (auto-log status changes)
CREATE OR REPLACE FUNCTION public.log_job_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.job_status_history (job_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quote_requests_status_log ON public.quote_requests;
CREATE TRIGGER quote_requests_status_log
  AFTER UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_job_status_change();

-- 7. Storage bucket for job photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos','job-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- quote_requests: drop old admin-only select, add multi-role
DROP POLICY IF EXISTS "Admins can view quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins manage quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Customers view own jobs" ON public.quote_requests;
DROP POLICY IF EXISTS "Staff view assigned jobs" ON public.quote_requests;
DROP POLICY IF EXISTS "Customers update own job (approve/reject)" ON public.quote_requests;
DROP POLICY IF EXISTS "Staff update assigned job status" ON public.quote_requests;

CREATE POLICY "Admins manage quote requests"
  ON public.quote_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Customers view own jobs"
  ON public.quote_requests FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Staff view assigned jobs"
  ON public.quote_requests FOR SELECT TO authenticated
  USING (assigned_staff_id = auth.uid() AND public.is_staff(auth.uid()));

CREATE POLICY "Customers update own job (approve/reject)"
  ON public.quote_requests FOR UPDATE TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff update assigned job status"
  ON public.quote_requests FOR UPDATE TO authenticated
  USING (assigned_staff_id = auth.uid() AND public.is_staff(auth.uid()))
  WITH CHECK (assigned_staff_id = auth.uid() AND public.is_staff(auth.uid()));

-- staff_members
DROP POLICY IF EXISTS "Admins manage staff" ON public.staff_members;
DROP POLICY IF EXISTS "Staff view themselves" ON public.staff_members;
DROP POLICY IF EXISTS "Admins view staff" ON public.staff_members;

CREATE POLICY "Admins manage staff"
  ON public.staff_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Staff view themselves"
  ON public.staff_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- job_status_history
DROP POLICY IF EXISTS "Admins view history" ON public.job_status_history;
DROP POLICY IF EXISTS "Customers view own history" ON public.job_status_history;
DROP POLICY IF EXISTS "Staff view assigned history" ON public.job_status_history;
DROP POLICY IF EXISTS "Admins insert history" ON public.job_status_history;

CREATE POLICY "Admins view history"
  ON public.job_status_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Customers view own history"
  ON public.job_status_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quote_requests q
    WHERE q.id = job_status_history.job_id AND q.customer_id = auth.uid()
  ));

CREATE POLICY "Staff view assigned history"
  ON public.job_status_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quote_requests q
    WHERE q.id = job_status_history.job_id AND q.assigned_staff_id = auth.uid()
  ) AND public.is_staff(auth.uid()));

CREATE POLICY "Admins insert history"
  ON public.job_status_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- job_attachments
DROP POLICY IF EXISTS "Admins manage attachments" ON public.job_attachments;
DROP POLICY IF EXISTS "Customers manage own attachments" ON public.job_attachments;
DROP POLICY IF EXISTS "Staff view assigned attachments" ON public.job_attachments;

CREATE POLICY "Admins manage attachments"
  ON public.job_attachments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Customers manage own attachments"
  ON public.job_attachments FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quote_requests q
    WHERE q.id = job_attachments.job_id AND q.customer_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quote_requests q
    WHERE q.id = job_attachments.job_id AND q.customer_id = auth.uid()
  ) AND uploaded_by = auth.uid());

CREATE POLICY "Staff view assigned attachments"
  ON public.job_attachments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quote_requests q
    WHERE q.id = job_attachments.job_id AND q.assigned_staff_id = auth.uid()
  ) AND public.is_staff(auth.uid()));

-- ============================================================
-- Storage policies for job-photos bucket
-- ============================================================
DROP POLICY IF EXISTS "Public can view job photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload job photos" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their job photos" ON storage.objects;

CREATE POLICY "Public can view job photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-photos');

CREATE POLICY "Authenticated can upload job photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'job-photos');

CREATE POLICY "Owners can delete their job photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'job-photos' AND owner = auth.uid());
