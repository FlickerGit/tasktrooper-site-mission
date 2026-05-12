import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type Quote = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  service_type: string;
  description: string;
  preferred_date: string | null;
};

type Contact = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  message: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard | TaskTroopers";
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      setLoading(true);
      const [q, c] = await Promise.all([
        supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      ]);
      if (q.data) setQuotes(q.data as Quote[]);
      if (c.data) setContacts(c.data as Contact[]);
      setLoading(false);
    })();
  }, [user, isAdmin, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">View incoming quote requests and contact messages.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue="quotes">
              <TabsList className="mb-6">
                <TabsTrigger value="quotes">Quote Requests ({quotes.length})</TabsTrigger>
                <TabsTrigger value="contacts">Contact Messages ({contacts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="quotes">
                <Card>
                  <CardHeader><CardTitle>Quote Requests</CardTitle></CardHeader>
                  <CardContent>
                    {quotes.length === 0 ? (
                      <p className="text-muted-foreground">No quote requests yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Service</TableHead>
                              <TableHead>Address</TableHead>
                              <TableHead>Preferred</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quotes.map((q) => (
                              <TableRow key={q.id}>
                                <TableCell className="whitespace-nowrap text-xs">{formatDate(q.created_at)}</TableCell>
                                <TableCell className="font-medium">{q.full_name}</TableCell>
                                <TableCell className="text-xs">
                                  <div>{q.email}</div>
                                  <div className="text-muted-foreground">{q.phone}</div>
                                </TableCell>
                                <TableCell>{q.service_type}</TableCell>
                                <TableCell className="max-w-xs text-xs">{q.address}</TableCell>
                                <TableCell className="text-xs">{q.preferred_date ?? "—"}</TableCell>
                                <TableCell className="max-w-md text-xs whitespace-pre-wrap">{q.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                                <TableCell className="whitespace-nowrap text-xs">{formatDate(c.created_at)}</TableCell>
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
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
