// Job interface for the job management system
export interface Job {
  id: string;
  name: string;
  createdDate: Date;
  scheduledDate: Date;
  status: "completed" | "scheduled" | "failed";
  type: "weather" | "countries";
  tenantId: string;
  data?: any;
}
