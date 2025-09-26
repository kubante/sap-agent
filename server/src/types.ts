import type { JobType } from "./constants";

// Job interface for the job management system
export interface Job {
  id: string;
  name: string;
  createdDate: Date;
  scheduledDate: Date;
  status: "completed" | "scheduled" | "failed";
  type: JobType;
  tenantId: string;
  data?: any;
}
