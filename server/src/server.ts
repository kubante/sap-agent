import express from "express";
import { executeJob } from "./job-executor";
import { serviceRegistry } from "./services/service-registry";
import { Job } from "./types";

// In-memory storage for jobs
const jobs: Job[] = [];

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for handling json
app.use(express.json());

// GET /jobs - Retrieve jobs filtered by tenantId
app.get("/api/jobs", (req, res) => {
  const { tenantId } = req.query;

  if (!tenantId) {
    return res.status(400).json({
      error: "Missing required parameter: tenantId is required",
    });
  }

  // Filter jobs by tenantId
  const filteredJobs = jobs.filter((job) => job.tenantId === tenantId);
  res.json(filteredJobs);
});

// POST /job - Create a new job
app.post("/api/job", async (req, res) => {
  const { name, scheduledDate, type, tenantId, data } = req.body;

  // Validate required fields
  if (!name || !scheduledDate || !tenantId || !data || !type) {
    return res.status(400).json({
      error:
        "Missing required fields: name, scheduledDate, tenantId, type and data are required",
    });
  }

  // Get the appropriate service based on job type
  const service = serviceRegistry.getService(type);
  if (!service) {
    return res.status(400).json({
      error: `Invalid job type "${type}". Available types: ${serviceRegistry
        .getAvailableTypes()
        .join(", ")}`,
    });
  }

  // Validate request data using the appropriate service
  const validationResult = service.validate(data);

  if (!validationResult.isValid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationResult.errors,
    });
  }

  // Create new job
  const newJob: Job = {
    id: Date.now().toString(), // Simple ID generation
    name,
    createdDate: new Date(),
    scheduledDate: new Date(scheduledDate),
    status: "scheduled",
    type,
    tenantId,
    data, // Store the original request data, not weather data yet
  };

  jobs.push(newJob);

  // Check if the job should be executed immediately or scheduled
  const now = new Date();
  const scheduledTime = new Date(scheduledDate);

  if (scheduledTime <= now) {
    // Execute immediately if scheduled date is in the past
    console.log(
      `Job ${newJob.id} scheduled for past date, executing immediately`
    );
    executeJob(newJob);
  } else {
    // Schedule for future execution
    const delayMs = scheduledTime.getTime() - now.getTime();
    console.log(
      `Job ${newJob.id} scheduled for future execution in ${delayMs}ms`
    );

    setTimeout(() => {
      executeJob(newJob);
    }, delayMs);
  }

  res.status(201).json(newJob);
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
