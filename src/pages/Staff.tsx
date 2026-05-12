import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";
import { Loader2 } from "lucide-react";
import type { Job } from "@/lib/jobs";

const Staff = () => {
  const navigate = useNavigate();
  const { user, isStaff, isAdmin, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { document.title = "Staff Jobs | TaskTroopers"; }, []);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("assigned_staff_id", user.id)
      .order("created_at", { ascending: false });
    const list = (data ?? []) as Job[];
    setJobs(list);
    setSelectedId((cur) => cur ?? list[0]?.id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }
    if (!isStaff && !isAdmin) { navigate("/", { replace: true }); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isStaff, isAdmin, authLoading]);

  const selected = jobs.find((j) => j.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">Assigned Jobs</h1>
            <p className="text-muted-foreground">Jobs assigned to you. Update status as you work through them.</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : jobs.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">
              No jobs assigned yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              <div className="space-y-3">
                {jobs.map((j) => (
                  <JobCard key={j.id} job={j} selected={j.id === selectedId} onSelect={() => setSelectedId(j.id)} showFinancials={false} />
                ))}
              </div>
              <div>
                {selected && user && (
                  <JobDetailPanel job={selected} role="staff" currentUserId={user.id} onUpdated={load} />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Staff;