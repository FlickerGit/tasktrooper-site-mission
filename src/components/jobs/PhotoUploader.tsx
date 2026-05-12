import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

type Props = {
  jobId: string;
  uploaderId: string;
  onUploaded?: () => void;
};

export const PhotoUploader = ({ jobId, uploaderId, onUploaded }: Props) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const upload = async () => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${jobId}/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("job-photos")
          .upload(path, file, { upsert: false });
        if (uploadErr) throw uploadErr;
        const { error: insertErr } = await supabase
          .from("job_attachments")
          .insert({ job_id: jobId, uploaded_by: uploaderId, storage_path: path, caption: caption || null });
        if (insertErr) throw insertErr;
      }
      toast({ title: "Uploaded", description: "Photos added to this job." });
      setFiles(null);
      setCaption("");
      onUploaded?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="bg-background"
      />
      <Input
        type="text"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="bg-background"
      />
      <Button type="button" onClick={upload} disabled={!files || busy} size="sm">
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
        Upload
      </Button>
    </div>
  );
};