export const TENANTS = ["abdullah", "filip", "jacob"] as const;

export const ROUTES = {
  REQUEST: "request",
  STATUS: "status",
} as const;

export type Tenant = (typeof TENANTS)[number];
