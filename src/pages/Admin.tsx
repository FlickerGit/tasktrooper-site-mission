import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";
import { JOB_STATUSES, STATUS_LABEL, type Job, type JobStatus } from "@/lib/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Contact = { id: string; created_at: string; full_name: string; email: string; message: string };
type StaffRow = { user_id: string; display_name: string | null; created_at: string; profile_email?: string };
type ProfileLite = { id: string; email: string | null; display_name: string | null };

const fmt = (iso: string) => new Date(iso).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Team
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [staffEmail, setStaffEmail] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);

  useEffect(() => { document.title = "Admin Dashboard | TaskTroopers"; }, []);

  const load = async () => {
    setLoading(true);
    const [q, c, s, p] = await Promise.all([
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("staff_members").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,email,display_name"),
    ]);
    const profiles = (p.data ?? []) as ProfileLite[];
    const profMap = new Map(profiles.map((pr) => [pr.id, pr]));
    setJobs((q.data ?? []) as Job[]);
    setContacts((c.data ?? []) as Contact[]);
    setStaff(
      ((s.data ?? []) as StaffRow[]).map((row) => ({
        ...row,
        profile_email: profMap.get(row.user_id)?.email ?? undefined,
        display_name: row.display_name ?? profMap.get(row.user_id)?.display_name ?? null,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }
    if (!isAdmin) { navigate("/", { replace: true }); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, authLoading]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !j.full_name.toLowerCase().includes(s) &&
          !j.email.toLowerCase().includes(s) &&
          !j.address.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [jobs, statusFilter, search]);

  useEffect(() => {
    if (filteredJobs.length === 0) { setSelectedId(null); return; }
    if (!filteredJobs.find((j) => j.id === selectedId)) setSelectedId(filteredJobs[0].id);
  }, [filteredJobs, selectedId]);

  const selected = jobs.find((j) => j.id === selectedId) ?? null;

  const addStaff = async () => {
    if (!staffEmail.trim()) return;
    setAddingStaff(true);
    // Look up profile by email
    const { data: prof } = await supabase
      .from("profiles")
      .select("id,email,display_name")
      .eq("email", staffEmail.trim())
      .maybeSingle();
    if (!prof) {
      toast({ title: "User not found", description: "That user must sign up first before being added as staff.", variant: "destructive" });
      setAddingStaff(false);
      return;
    }
    const { error } = await supabase
      .from("staff_members")
      .insert({ user_id: prof.id, display_name: prof.display_name });
    setAddingStaff(false);
    if (error) {
      toast({ title: "Could not add staff", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Staff added" });
    setStaffEmail("");
    load();
  };

  const removeStaff = async (userId: string) => {
    const { error } = await supabase.from("staff_members").delete().eq("user_id", userId);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Staff removed" });
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage jobs, quotes, schedule, staff and customer messages.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue="jobs">
              <TabsList className="mb-6">
                <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
                <TabsTrigger value="contacts">Contact Messages ({contacts.length})</TabsTrigger>
                <TabsTrigger value="team">Team ({staff.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | "all")}>
                    <SelectTrigger className="w-[200px] bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {JOB_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search name, email or address"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-background max-w-sm"
                  />
                  <span className="text-sm text-muted-foreground">{filteredJobs.length} shown</span>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">No jobs match.</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
                    <div className="space-y-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                      {filteredJobs.map((j) => (
                        <JobCard key={j.id} job={j} selected={j.id === selectedId} onSelect={() => setSelectedId(j.id)} />
                      ))}
                    </div>
                    <div>
                      {selected && user && (
                        <JobDetailPanel job={selected} role="admin" currentUserId={user.id} onUpdated={load} />
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contacts">
                <Card>
                  <CardHeader><CardTitle>Contact Messages</CardTitle></CardHeader>
                  <CardContent>
                    {contacts.length === 0 ? (
                      <p className="text-muted-foreground">No contact messages yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Message</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contacts.map((c) => (
                              <TableRow key={c.id}>
                                <TableCell className="whitespace-nowrap text-xs">{fmt(c.created_at)}</TableCell>
                                <TableCell className="font-medium">{c.full_name}</TableCell>
                                <TableCell className="text-xs">{c.email}</TableCell>
                                <TableCell className="max-w-xl text-xs whitespace-pre-wrap">{c.message}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardHeader><CardTitle>Add staff member</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      The person must already have a TaskTroopers account. Enter their account email below to grant staff access.
                    </p>
                    <div className="flex gap-2 max-w-md">
                      <Input
                        placeholder="staff@example.com"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        className="bg-background"
                      />
                      <Button onClick={addStaff} disabled={addingStaff || !staffEmail.trim()} className="bg-gradient-primary hover:opacity-90">
                        <UserPlus className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader><CardTitle>Current staff</CardTitle></CardHeader>
                  <CardContent>
                    {staff.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No staff yet.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {staff.map((s) => (
                            <TableRow key={s.user_id}>
                              <TableCell className="font-medium">{s.display_name ?? "—"}</TableCell>
                              <TableCell className="text-xs">{s.profile_email ?? s.user_id.slice(0, 8)}</TableCell>
                              <TableCell className="text-xs">{fmt(s.created_at)}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="ghost" onClick={() => removeStaff(s.user_id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;