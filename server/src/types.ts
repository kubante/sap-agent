import type { JOB_STATUS, JOB_TYPES } from "./constants";

// Job interface for the job management system
export interface Job {
  id: string;
  name: string;
  createdDate: Date;
  scheduledDate: Date;
  status: JobStatus;
  type: JobType;
  tenantId: string;
  data?: any;
}

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
