import type { COUNTRIES, JOB_STATUS, JOB_TYPES, TENANTS } from "./constants";

export type Tenant = (typeof TENANTS)[number];
export type CountryName = (typeof COUNTRIES)[number];
export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
