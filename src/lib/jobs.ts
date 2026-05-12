import type { Database } from "@/integrations/supabase/types";

export type JobStatus = Database["public"]["Enums"]["job_status"];
export type TimeWindow = Database["public"]["Enums"]["time_window"];

export const JOB_STATUSES: JobStatus[] = [
  "new_request",
  "reviewing",
  "quoted",
  "approved",
  "scheduled",
  "in_progress",
  "completed",
  "invoiced",
  "paid",
  "cancelled",
];

export const STATUS_LABEL: Record<JobStatus, string> = {
  new_request: "New Request",
  reviewing: "Reviewing",
  quoted: "Quoted",
  approved: "Approved",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  invoiced: "Invoiced",
  paid: "Paid",
  cancelled: "Cancelled",
};

// Tailwind classes per status — uses semantic tokens where possible
export const STATUS_BADGE: Record<JobStatus, string> = {
  new_request: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  reviewing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  quoted: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  scheduled: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  in_progress: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  completed: "bg-primary/15 text-primary border-primary/30",
  invoiced: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  paid: "bg-green-600/20 text-green-300 border-green-600/40",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const TIME_WINDOW_LABEL: Record<TimeWindow, string> = {
  morning: "Morning (8am – 12pm)",
  afternoon: "Afternoon (12pm – 5pm)",
  flexible: "Flexible",
};

export const GST_RATE = 0.10;

export function calcQuote(subtotal: number) {
  const sub = Math.max(0, Math.round(subtotal * 100) / 100);
  const gst = Math.round(sub * GST_RATE * 100) / 100;
  const total = Math.round((sub + gst) * 100) / 100;
  return { subtotal: sub, gst, total };
}

export function formatAUD(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

/**
 * Allowed next-statuses per role. Admin can do almost anything.
 * Customer is limited to approve/reject of a quoted job.
 * Staff is limited to scheduled → in_progress → completed.
 */
export function allowedNextStatuses(
  current: JobStatus,
  role: "admin" | "customer" | "staff",
): JobStatus[] {
  if (role === "admin") {
    const map: Record<JobStatus, JobStatus[]> = {
      new_request: ["reviewing", "quoted", "cancelled"],
      reviewing: ["quoted", "cancelled"],
      quoted: ["approved", "reviewing", "cancelled"],
      approved: ["scheduled", "cancelled"],
      scheduled: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: ["invoiced"],
      invoiced: ["paid"],
      paid: [],
      cancelled: [],
    };
    return map[current] ?? [];
  }
  if (role === "customer") {
    if (current === "quoted") return ["approved", "reviewing"]; // approve | reject (back to reviewing)
    return [];
  }
  // staff
  if (current === "scheduled") return ["in_progress"];
  if (current === "in_progress") return ["completed"];
  return [];
}

/* ------------------------------------------------------------------ */
/* Notification placeholders                                           */
/* Single seam for hooking up email / HubSpot / Zapier / QuickBooks    */
/* later. Swap the bodies; do not change the call sites.               */
/* ------------------------------------------------------------------ */

function log(event: string, payload: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.info(`[notify placeholder] ${event}`, payload);
}

export const notify = {
  adminNewQuoteRequest: (jobId: string) =>
    log("admin:new-quote-request", { jobId }),
  customerQuoteSent: (jobId: string, customerEmail?: string | null) =>
    log("customer:quote-sent", { jobId, customerEmail }),
  adminQuoteApproved: (jobId: string) =>
    log("admin:quote-approved", { jobId }),
  adminQuoteRejected: (jobId: string, reason?: string | null) =>
    log("admin:quote-rejected", { jobId, reason }),
  customerJobScheduled: (jobId: string, customerEmail?: string | null) =>
    log("customer:job-scheduled", { jobId, customerEmail }),
  triggerInvoiceWorkflow: (jobId: string) =>
    log("workflow:trigger-invoice", { jobId }),
};

export type Job = Database["public"]["Tables"]["quote_requests"]["Row"];