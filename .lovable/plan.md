# Job Workflow System

Extend TaskTroopers with a full job lifecycle, role-based dashboards (customer / staff / admin), quote approval flow, scheduling, and notification placeholders. Existing public quote form, login, and admin dashboard stay in place — this builds on top.

## Database changes

### New enums
- `job_status`: `new_request`, `reviewing`, `quoted`, `approved`, `scheduled`, `in_progress`, `completed`, `invoiced`, `paid`, `cancelled`
- `time_window`: `morning`, `afternoon`, `flexible`
- Extend `app_role` enum with `staff`

### Promote `quote_requests` → `jobs` (extend in place, don't replace)
Add columns to `quote_requests`:
- `customer_id uuid` (links to auth.users when submitted while logged in; nullable for anonymous form)
- `status job_status` default `new_request`
- `preferred_time_window time_window` nullable
- `scheduled_date date`, `scheduled_time time`, `scheduled_window time_window` nullable
- `assigned_staff_id uuid` nullable
- `admin_notes text`, `internal_notes text` nullable
- `subtotal numeric(10,2)`, `gst numeric(10,2)`, `total numeric(10,2)` nullable
- `quote_sent_at`, `quote_decision_at`, `quote_rejection_reason`, `completed_at`, `invoiced_at`, `paid_at` (timestamps / text)
- `customer_photos text[]` nullable

### New tables
- `job_status_history` — `job_id`, `from_status`, `to_status`, `changed_by`, `note`, `created_at` (audit trail)
- `job_attachments` — `job_id`, `uploaded_by`, `storage_path`, `caption`, `created_at` (customer/admin photo uploads)

### Storage bucket
- `job-photos` (public read, authenticated write) for uploads

### RLS
- `quote_requests`:
  - Insert: anyone (existing public form keeps working)
  - Select: admin (all), staff (only `assigned_staff_id = auth.uid()`), customer (only `customer_id = auth.uid()`)
  - Update: admin (all fields), staff (only `status` for own jobs, restricted to scheduled→in_progress→completed transitions via trigger), customer (only `status` for approve/reject of their own quoted job + `customer_photos` append)
- `job_status_history`: insert/select via has_role + customer/staff own-job rules
- `job_attachments`: customer can insert/select for own job; admin all; staff for assigned

### `has_role` extension
Helper view `is_staff_or_admin(uid)` for cleaner policies.

## Frontend changes

### New shared lib
`src/lib/jobs.ts` — status enum labels, color tokens per status, GST calc (`subtotal * 0.10`), allowed transitions per role, notification placeholder functions:
```ts
notify.adminNewQuoteRequest(jobId)
notify.customerQuoteSent(jobId)
notify.adminQuoteApproved(jobId)
notify.customerJobScheduled(jobId)
notify.triggerInvoiceWorkflow(jobId)
```
Each just `console.info("[notify placeholder] …")` for now — single seam for real integrations later.

### Customer dashboard — `/dashboard` (new)
- Lists customer's own jobs (cards) with status badge, service, address, scheduled date if any
- Click → detail drawer/page:
  - Request details (read-only)
  - Quote section (when status ≥ `quoted`): subtotal / GST / total, **Approve** / **Reject** buttons (reject opens reason textarea)
  - Confirmed booking section (when scheduled): date + time window
  - Upload extra photos + add note
- Header link "My Jobs" appears when logged in (non-admin)

### Admin dashboard — extend `/admin`
Replace flat table with job cards + filters by status. Each card shows all required fields. Detail panel actions:
- Status dropdown (with allowed transitions)
- "Create / edit quote" — subtotal input, auto-calc GST (10%) + total
- "Send quote to customer" — sets status `quoted`, stamps `quote_sent_at`, fires `notify.customerQuoteSent`
- "Schedule" — date + time + window inputs → status `scheduled`, fires `notify.customerJobScheduled`
- "Assign staff" — dropdown of staff users
- "Mark in progress / completed / invoiced / paid / cancelled"
- Edit `admin_notes` and `internal_notes`
- View customer photos + status history timeline

### Staff dashboard — `/staff` (new)
- Lists only jobs where `assigned_staff_id = current user`
- Shows non-financial fields only (no subtotal/GST/total)
- Status update buttons limited to `Scheduled → In Progress → Completed`

### Quote form (existing public form)
- If user is logged in, attach `customer_id = auth.uid()` on insert
- Add optional **preferred time window** select (morning / afternoon / flexible) and **photo upload** to `job-photos`
- After submit, fires `notify.adminNewQuoteRequest`

### Auth + routing
- `useAuth` already exposes `isAdmin`. Add `isStaff` derived from `user_roles`.
- `<Header>`: when logged in show "My Jobs" (customer), "Staff" (if staff), "Admin" (if admin)
- New routes: `/dashboard`, `/staff`, plus update `/admin`
- Role-gate redirects in each page

## Files to add / change

**Add**
- `supabase/migrations/<ts>_job_workflow.sql`
- `src/lib/jobs.ts` (statuses, transitions, GST, notify placeholders)
- `src/pages/Dashboard.tsx` (customer)
- `src/pages/Staff.tsx`
- `src/components/jobs/JobCard.tsx`
- `src/components/jobs/JobDetailPanel.tsx`
- `src/components/jobs/QuoteEditor.tsx`
- `src/components/jobs/StatusBadge.tsx`
- `src/components/jobs/ScheduleEditor.tsx`
- `src/components/jobs/PhotoUploader.tsx`

**Edit**
- `src/App.tsx` — add `/dashboard`, `/staff` routes
- `src/components/Header.tsx` — role-aware nav links
- `src/components/QuoteForm.tsx` — time window + photo upload + customer_id
- `src/pages/Admin.tsx` — switch to job cards + actions panel
- `src/hooks/use-auth.tsx` — add `isStaff`

## What's intentionally NOT done
- No real email / HubSpot / Zapier / QuickBooks — only `notify.*` console placeholders
- No staff invite flow UI yet — admin assigns the `staff` role manually via a small "Team" section in `/admin` (add/remove role for an existing user by email)
- No full calendar UI — admin uses a date+time picker; customers never see calendar

## Approach notes
- One migration containing enum changes, table extensions, new tables, storage bucket, RLS, and triggers.
- All money handled as `numeric(10,2)`; client computes GST at 10% and persists all three values for auditability.
- Status transitions enforced in a Postgres trigger so RLS + UI can't be bypassed.
- Existing anonymous quote form keeps working unchanged for non-logged-in visitors.

Sound good? On approval I'll run the migration first, then ship the frontend.