export const JOB_TYPES = {
  WEATHER: "weather",
  COUNTRIES: "countries",
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
