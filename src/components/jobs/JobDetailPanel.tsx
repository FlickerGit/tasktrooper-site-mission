import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  STATUS_LABEL,
  TIME_WINDOW_LABEL,
  allowedNextStatuses,
  calcQuote,
  formatAUD,
  notify,
  type Job,
  type JobStatus,
  type TimeWindow,
} from "@/lib/jobs";
import { StatusBadge } from "./StatusBadge";
import { PhotoUploader } from "./PhotoUploader";
import { Calendar, ClipboardList, Loader2, Mail, MapPin, Phone, User as UserIcon } from "lucide-react";

type Role = "admin" | "customer" | "staff";

type Attachment = {
  id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
};

type StaffMember = { user_id: string; display_name: string | null };
type HistoryEntry = {
  id: string;
  from_status: JobStatus | null;
  to_status: JobStatus;
  created_at: string;
  note: string | null;
};

type Props = {
  job: Job;
  role: Role;
  currentUserId: string;
  onUpdated: () => void;
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" }) : "—";

const publicUrl = (path: string) =>
  supabase.storage.from("job-photos").getPublicUrl(path).data.publicUrl;

export const JobDetailPanel = ({ job, role, currentUserId, onUpdated }: Props) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  // Editable fields (admin only) — initialize from job
  const [adminNotes, setAdminNotes] = useState(job.admin_notes ?? "");
  const [internalNotes, setInternalNotes] = useState(job.internal_notes ?? "");
  const [subtotalInput, setSubtotalInput] = useState<string>(
    job.subtotal != null ? String(job.subtotal) : "",
  );
  const [scheduledDate, setScheduledDate] = useState(job.scheduled_date ?? "");
  const [scheduledTime, setScheduledTime] = useState(job.scheduled_time ?? "");
  const [scheduledWindow, setScheduledWindow] = useState<TimeWindow | "">(
    job.scheduled_window ?? "",
  );
  const [assignedStaff, setAssignedStaff] = useState<string>(job.assigned_staff_id ?? "");

  // Customer reject reason
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const showFinancials = role !== "staff";

  useEffect(() => {
    setAdminNotes(job.admin_notes ?? "");
    setInternalNotes(job.internal_notes ?? "");
    setSubtotalInput(job.subtotal != null ? String(job.subtotal) : "");
    setScheduledDate(job.scheduled_date ?? "");
    setScheduledTime(job.scheduled_time ?? "");
    setScheduledWindow(job.scheduled_window ?? "");
    setAssignedStaff(job.assigned_staff_id ?? "");
  }, [job.id, job.admin_notes, job.internal_notes, job.subtotal, job.scheduled_date, job.scheduled_time, job.scheduled_window, job.assigned_staff_id]);

  // Load related data
  useEffect(() => {
    (async () => {
      const [{ data: atts }, { data: hist }] = await Promise.all([
        supabase
          .from("job_attachments")
          .select("id,storage_path,caption,created_at")
          .eq("job_id", job.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("job_status_history")
          .select("id,from_status,to_status,created_at,note")
          .eq("job_id", job.id)
          .order("created_at", { ascending: false }),
      ]);
      setAttachments((atts ?? []) as Attachment[]);
      setHistory((hist ?? []) as HistoryEntry[]);
      if (role === "admin") {
        const { data: staff } = await supabase
          .from("staff_members")
          .select("user_id,display_name");
        setStaffList((staff ?? []) as StaffMember[]);
      }
    })();
  }, [job.id, role]);

  const reload = () => {
    onUpdated();
  };

  const updateJob = async (patch: Partial<Job>, successMessage: string) => {
    setBusy(true);
    const { error } = await supabase
      .from("quote_requests")
      .update(patch)
      .eq("id", job.id);
    setBusy(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: successMessage });
    reload();
    return true;
  };

  // --- Admin actions ---
  const setStatus = (status: JobStatus) =>
    updateJob({ status }, `Status set to ${STATUS_LABEL[status]}`);

  const saveNotes = () =>
    updateJob({ admin_notes: adminNotes, internal_notes: internalNotes }, "Notes saved");

  const saveQuote = () => {
    const sub = parseFloat(subtotalInput);
    if (isNaN(sub) || sub < 0) {
      toast({ title: "Enter a valid subtotal", variant: "destructive" });
      return;
    }
    const q = calcQuote(sub);
    return updateJob(
      { subtotal: q.subtotal, gst: q.gst, total: q.total },
      "Quote saved",
    );
  };

  const sendQuote = async () => {
    if (job.subtotal == null) {
      toast({ title: "Add a quote first", variant: "destructive" });
      return;
    }
    const ok = await updateJob(
      { status: "quoted", quote_sent_at: new Date().toISOString() },
      "Quote sent to customer",
    );
    if (ok) notify.customerQuoteSent(job.id, job.email);
  };

  const scheduleJob = async () => {
    if (!scheduledDate) {
      toast({ title: "Pick a date", variant: "destructive" });
      return;
    }
    const ok = await updateJob(
      {
        status: "scheduled",
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime || null,
        scheduled_window: (scheduledWindow || null) as TimeWindow | null,
      },
      "Job scheduled",
    );
    if (ok) notify.customerJobScheduled(job.id, job.email);
  };

  const assignStaff = () =>
    updateJob(
      { assigned_staff_id: assignedStaff || null },
      assignedStaff ? "Staff assigned" : "Staff unassigned",
    );

  const markCompleted = async () => {
    const ok = await updateJob(
      { status: "completed", completed_at: new Date().toISOString() },
      "Marked completed",
    );
    if (ok) notify.triggerInvoiceWorkflow(job.id);
  };
  const markInvoiced = () =>
    updateJob(
      { status: "invoiced", invoiced_at: new Date().toISOString() },
      "Marked invoiced",
    );
  const markPaid = () =>
    updateJob({ status: "paid", paid_at: new Date().toISOString() }, "Marked paid");

  // --- Customer actions ---
  const approveQuote = async () => {
    const ok = await updateJob(
      { status: "approved", quote_decision_at: new Date().toISOString(), quote_rejection_reason: null },
      "Quote approved — thanks!",
    );
    if (ok) notify.adminQuoteApproved(job.id);
  };
  const rejectQuote = async () => {
    if (!rejectReason.trim()) {
      toast({ title: "Please add a reason", variant: "destructive" });
      return;
    }
    const ok = await updateJob(
      {
        status: "reviewing",
        quote_decision_at: new Date().toISOString(),
        quote_rejection_reason: rejectReason.trim(),
      },
      "Quote feedback sent",
    );
    if (ok) {
      notify.adminQuoteRejected(job.id, rejectReason.trim());
      setShowReject(false);
      setRejectReason("");
    }
  };

  // --- Staff actions ---
  const staffStartJob = () =>
    updateJob({ status: "in_progress" }, "Job started");
  const staffCompleteJob = async () => {
    const ok = await updateJob(
      { status: "completed", completed_at: new Date().toISOString() },
      "Job marked completed",
    );
    if (ok) notify.triggerInvoiceWorkflow(job.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-foreground">{job.full_name}</h2>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted {fmtDate(job.created_at)} · Service: <span className="text-foreground">{job.service_type}</span>
          </p>
        </div>
      </div>

      {/* Customer & job details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Job details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex gap-2"><UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" /><div><div className="text-muted-foreground text-xs">Customer</div><div>{job.full_name}</div></div></div>
          <div className="flex gap-2"><Mail className="h-4 w-4 text-muted-foreground mt-0.5" /><div><div className="text-muted-foreground text-xs">Email</div><div>{job.email}</div></div></div>
          <div className="flex gap-2"><Phone className="h-4 w-4 text-muted-foreground mt-0.5" /><div><div className="text-muted-foreground text-xs">Phone</div><div>{job.phone}</div></div></div>
          <div className="flex gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" /><div><div className="text-muted-foreground text-xs">Address</div><div>{job.address}</div></div></div>
          <div className="flex gap-2"><Calendar className="h-4 w-4 text-muted-foreground mt-0.5" /><div><div className="text-muted-foreground text-xs">Preferred date</div><div>{job.preferred_date ?? "—"}</div></div></div>
          <div className="flex gap-2"><ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" /><div><div className="text-muted-foreground text-xs">Preferred time window</div><div>{job.preferred_time_window ? TIME_WINDOW_LABEL[job.preferred_time_window] : "—"}</div></div></div>
          <div className="md:col-span-2">
            <div className="text-muted-foreground text-xs mb-1">Description</div>
            <div className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3">{job.description}</div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmed booking */}
      {(job.scheduled_date || job.scheduled_window) && (
        <Card className="border-cyan-500/30 bg-cyan-500/5">
          <CardHeader><CardTitle className="text-base">Confirmed booking</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div><span className="text-muted-foreground">Date:</span> {job.scheduled_date ?? "—"}</div>
            <div><span className="text-muted-foreground">Time:</span> {job.scheduled_time ?? "—"}</div>
            <div><span className="text-muted-foreground">Window:</span> {job.scheduled_window ? TIME_WINDOW_LABEL[job.scheduled_window] : "—"}</div>
          </CardContent>
        </Card>
      )}

      {/* Quote */}
      {showFinancials && (
        <Card>
          <CardHeader><CardTitle className="text-base">Quote</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {role === "admin" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="subtotal">Subtotal (ex GST)</Label>
                    <Input
                      id="subtotal"
                      type="number"
                      step="0.01"
                      min="0"
                      value={subtotalInput}
                      onChange={(e) => setSubtotalInput(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label>GST (10%)</Label>
                    <div className="h-10 flex items-center px-3 rounded-md border border-border bg-muted/30 text-sm">
                      {formatAUD(subtotalInput ? calcQuote(parseFloat(subtotalInput) || 0).gst : null)}
                    </div>
                  </div>
                  <div>
                    <Label>Total inc. GST</Label>
                    <div className="h-10 flex items-center px-3 rounded-md border border-border bg-muted/30 text-sm font-semibold text-primary">
                      {formatAUD(subtotalInput ? calcQuote(parseFloat(subtotalInput) || 0).total : null)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={saveQuote} disabled={busy} variant="secondary">Save quote</Button>
                  <Button size="sm" onClick={sendQuote} disabled={busy || job.subtotal == null} className="bg-gradient-primary hover:opacity-90">
                    Send quote to customer
                  </Button>
                  {job.quote_sent_at && (
                    <span className="text-xs text-muted-foreground self-center">
                      Last sent {fmtDate(job.quote_sent_at)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3 text-sm">
                {job.subtotal == null ? (
                  <p className="text-muted-foreground">Your quote will appear here once we've prepared it.</p>
                ) : (
                  <>
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatAUD(job.subtotal)}</span></div>
                    <div className="flex justify-between"><span>GST (10%)</span><span>{formatAUD(job.gst)}</span></div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-base"><span>Total inc. GST</span><span className="text-primary">{formatAUD(job.total)}</span></div>

                    {role === "customer" && job.status === "quoted" && (
                      <div className="flex flex-col gap-2 pt-3">
                        <div className="flex gap-2">
                          <Button onClick={approveQuote} disabled={busy} className="bg-gradient-primary hover:opacity-90">
                            Approve quote
                          </Button>
                          <Button variant="outline" onClick={() => setShowReject((v) => !v)} disabled={busy}>
                            Request changes
                          </Button>
                        </div>
                        {showReject && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="What would you like changed?"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="bg-background"
                            />
                            <Button size="sm" variant="secondary" onClick={rejectQuote} disabled={busy}>
                              Send feedback
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {role === "customer" && job.status === "approved" && (
                      <p className="text-emerald-400 text-sm pt-2">You approved this quote — we'll be in touch to schedule.</p>
                    )}
                    {role === "customer" && job.quote_rejection_reason && job.status === "reviewing" && (
                      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                        Your feedback: <span className="text-foreground">{job.quote_rejection_reason}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin: schedule + assign + status + notes */}
      {role === "admin" && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Scheduling</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="sched-date">Date</Label>
                  <Input id="sched-date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="bg-background" />
                </div>
                <div>
                  <Label htmlFor="sched-time">Time</Label>
                  <Input id="sched-time" type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="bg-background" />
                </div>
                <div>
                  <Label htmlFor="sched-win">Window</Label>
                  <Select value={scheduledWindow} onValueChange={(v) => setScheduledWindow(v as TimeWindow)}>
                    <SelectTrigger id="sched-win" className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button size="sm" onClick={scheduleJob} disabled={busy}>Schedule job</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Staff assignment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={assignedStaff || "__none"} onValueChange={(v) => setAssignedStaff(v === "__none" ? "" : v)}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Unassigned</SelectItem>
                  {staffList.map((s) => (
                    <SelectItem key={s.user_id} value={s.user_id}>
                      {s.display_name ?? s.user_id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={assignStaff} disabled={busy} variant="secondary">Save assignment</Button>
              {staffList.length === 0 && (
                <p className="text-xs text-muted-foreground">No staff yet — add one in the Team tab.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allowedNextStatuses(job.status, "admin").map((next) => (
                  <Button
                    key={next}
                    size="sm"
                    variant={next === "cancelled" ? "destructive" : "outline"}
                    disabled={busy}
                    onClick={() => {
                      if (next === "completed") return markCompleted();
                      if (next === "invoiced") return markInvoiced();
                      if (next === "paid") return markPaid();
                      return setStatus(next);
                    }}
                  >
                    Move to {STATUS_LABEL[next]}
                  </Button>
                ))}
                {allowedNextStatuses(job.status, "admin").length === 0 && (
                  <p className="text-sm text-muted-foreground">No further status changes from {STATUS_LABEL[job.status]}.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="admin-notes">Admin notes (visible to customer)</Label>
                <Textarea id="admin-notes" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="bg-background min-h-[80px]" />
              </div>
              <div>
                <Label htmlFor="internal-notes">Internal job notes (admin/staff only)</Label>
                <Textarea id="internal-notes" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className="bg-background min-h-[80px]" />
              </div>
              <Button size="sm" onClick={saveNotes} disabled={busy} variant="secondary">Save notes</Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Customer / Admin shared admin notes display (read-only for non-admin) */}
      {role !== "admin" && job.admin_notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Notes from TaskTroopers</CardTitle></CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{job.admin_notes}</CardContent>
        </Card>
      )}
      {role === "staff" && job.internal_notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Internal notes</CardTitle></CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{job.internal_notes}</CardContent>
        </Card>
      )}

      {/* Staff actions */}
      {role === "staff" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Update status</CardTitle></CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {job.status === "scheduled" && (
              <Button size="sm" onClick={staffStartJob} disabled={busy}>Mark in progress</Button>
            )}
            {job.status === "in_progress" && (
              <Button size="sm" onClick={staffCompleteJob} disabled={busy} className="bg-gradient-primary hover:opacity-90">
                Mark completed
              </Button>
            )}
            {!["scheduled", "in_progress"].includes(job.status) && (
              <p className="text-sm text-muted-foreground">Nothing to do right now.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      <Card>
        <CardHeader><CardTitle className="text-base">Photos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {attachments.map((a) => (
                <a key={a.id} href={publicUrl(a.storage_path)} target="_blank" rel="noreferrer" className="block group">
                  <img src={publicUrl(a.storage_path)} alt={a.caption ?? "Job photo"} className="w-full h-32 object-cover rounded-md border border-border group-hover:opacity-90" />
                  {a.caption && <div className="text-xs text-muted-foreground mt-1 truncate">{a.caption}</div>}
                </a>
              ))}
            </div>
          )}
          {(role === "admin" || role === "customer") && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Add photos</Label>
              <PhotoUploader jobId={job.id} uploaderId={currentUserId} onUploaded={reload} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Activity</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs whitespace-nowrap w-32">{fmtDate(h.created_at)}</span>
                  {h.from_status && (
                    <>
                      <StatusBadge status={h.from_status} />
                      <span className="text-muted-foreground">→</span>
                    </>
                  )}
                  <StatusBadge status={h.to_status} />
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {busy && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-md px-3 py-2 shadow-lg flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </div>
      )}
    </div>
  );
};