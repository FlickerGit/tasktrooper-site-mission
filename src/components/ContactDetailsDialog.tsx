import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, UserCog } from "lucide-react";

export const ContactDetailsDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("display_name, first_name, last_name, phone, street, suburb, postcode, state, country")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        let fn = data?.first_name ?? "";
        let ln = data?.last_name ?? "";
        if (!fn && !ln && data?.display_name) {
          const parts = data.display_name.trim().split(/\s+/);
          fn = parts[0] ?? "";
          ln = parts.slice(1).join(" ");
        }
        setFirstName(fn);
        setLastName(ln);
        setPhone(data?.phone ?? "");
        setStreet(data?.street ?? "");
        setSuburb(data?.suburb ?? "");
        setPostcode(data?.postcode ?? "");
        setState(data?.state ?? "");
        setCountry(data?.country ?? "");
        setLoading(false);
      });
  }, [open, user]);

  const handleSave = async () => {
    if (!user) return;
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: "First and last name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const fullAddress = [street, suburb, state, postcode, country]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim() || null,
        street: street.trim() || null,
        suburb: suburb.trim() || null,
        postcode: postcode.trim() || null,
        state: state.trim() || null,
        country: country.trim() || null,
        address: fullAddress || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Contact details updated" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserCog className="h-4 w-4 mr-2" />
          Edit contact details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit contact details</DialogTitle>
          <DialogDescription>
            Update your name, phone and address. Email is linked to your account and cannot be changed.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} maxLength={150} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="suburb">Suburb</Label>
                <Input id="suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} maxLength={80} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} maxLength={10} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} maxLength={80} />
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || loading} className="bg-gradient-primary hover:opacity-90">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
