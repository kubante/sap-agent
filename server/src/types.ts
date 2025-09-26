import type { JOB_TYPES } from "./constants";

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

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
