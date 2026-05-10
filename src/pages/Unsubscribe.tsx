import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Status = "validating" | "ready" | "already" | "invalid" | "submitting" | "done" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("validating");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
        } else if (data.valid) {
          setStatus("ready");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setStatus("submitting");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    if (data?.success === false && data?.reason === "already_unsubscribed") {
      setStatus("already");
    } else {
      setStatus("done");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full bg-card border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">
            <span className="bg-gradient-primary bg-clip-text text-transparent">TaskTroopers</span> Email Preferences
          </CardTitle>
          <CardDescription>Manage your email subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "validating" && <p className="text-muted-foreground">Validating your link…</p>}
          {status === "invalid" && (
            <p className="text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
          )}
          {status === "already" && (
            <p className="text-foreground">You've already been unsubscribed. No further action is needed.</p>
          )}
          {status === "ready" && (
            <>
              <p className="text-foreground">
                Click below to confirm you'd like to unsubscribe from TaskTroopers emails.
              </p>
              <Button
                onClick={confirm}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                Confirm Unsubscribe
              </Button>
            </>
          )}
          {status === "submitting" && <p className="text-muted-foreground">Processing…</p>}
          {status === "done" && (
            <p className="text-foreground">You've been unsubscribed successfully.</p>
          )}
          {status === "error" && (
            <p className="text-destructive">Something went wrong: {errorMsg}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;