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
import { Button } from "@/components/ui/button";
import { ContactDetailsDialog } from "@/components/ContactDetailsDialog";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "My Jobs | TaskTroopers";
  }, []);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    // Link any prior quote requests submitted with this email to the account
    await supabase.rpc("claim_quote_requests_by_email");
    const { data } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    const list = (data ?? []) as Job[];
    setJobs(list);
    setSelectedId((cur) => cur ?? list[0]?.id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const selected = jobs.find((j) => j.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">My Jobs</h1>
              <p className="text-muted-foreground">Track your requests, approve quotes and view confirmed bookings.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <ContactDetailsDialog />
              <ChangePasswordDialog />
              <Button onClick={() => navigate("/#quote")} className="bg-gradient-primary hover:opacity-90">
                Request a new quote
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : jobs.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground mb-4">You haven't submitted any quote requests yet.</p>
              <Button onClick={() => navigate("/#quote")} className="bg-gradient-primary hover:opacity-90">Request a quote</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              <div className="space-y-3">
                {jobs.map((j) => (
                  <JobCard key={j.id} job={j} selected={j.id === selectedId} onSelect={() => setSelectedId(j.id)} />
                ))}
              </div>
              <div>
                {selected && user && (
                  <JobDetailPanel
                    job={selected}
                    role="customer"
                    currentUserId={user.id}
                    onUpdated={load}
                  />
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

export default Dashboard;