import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { formatAUD, type Job, TIME_WINDOW_LABEL } from "@/lib/jobs";
import { Calendar, MapPin } from "lucide-react";

type Props = {
  job: Job;
  onSelect: () => void;
  selected?: boolean;
  showFinancials?: boolean;
};

export const JobCard = ({ job, onSelect, selected, showFinancials = true }: Props) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full text-left rounded-lg border transition-all ${
      selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
    }`}
  >
    <Card className="border-0 bg-transparent shadow-none">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground leading-tight">{job.full_name}</h3>
            <p className="text-xs text-muted-foreground">{job.service_type}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> <span className="truncate">{job.address}</span></div>
        {(job.scheduled_date || job.preferred_date) && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {job.scheduled_date ? (
              <span>Scheduled {job.scheduled_date}{job.scheduled_window ? ` · ${TIME_WINDOW_LABEL[job.scheduled_window]}` : ""}</span>
            ) : (
              <span>Preferred {job.preferred_date}</span>
            )}
          </div>
        )}
        {showFinancials && job.total != null && (
          <div className="text-sm font-semibold text-primary">{formatAUD(job.total)}</div>
        )}
      </CardContent>
    </Card>
  </button>
);