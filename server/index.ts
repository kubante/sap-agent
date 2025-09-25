import express from "express";
import { WeatherDataService } from "./WeatherData.ts";

// Define the Job interface
interface Job {
  id: string;
  name: string;
  createdDate: Date;
  scheduledDate: Date;
  status: "completed" | "scheduled" | "failed";
  type: "weather" | "countries";
  tenantId: string;
  data?: any;
}

// In-memory storage for jobs
const jobs: Job[] = [];

// Initialize weather data service
const weatherService = new WeatherDataService();

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

// Function to execute a job
async function executeJob(job: Job): Promise<void> {
  try {
    console.log(`Executing job ${job.id} (${job.name})`);

    // Update job status to indicate execution started
    job.status = "scheduled"; // Keep as scheduled while executing

    // Validate weather request data using the WeatherDataService
    const validationResult = weatherService.validateAndProcessWeatherRequest(
      job.data
    );

    if (!validationResult.isValid) {
      console.error(
        `Job ${job.id} validation failed:`,
        validationResult.errors
      );
      job.status = "failed";
      return;
    }

    const { latitude, longitude } = validationResult.coordinates!;

    // Fetch weather data
    console.log(
      `Fetching weather data for job ${job.id} at coordinates: ${latitude}, ${longitude}`
    );
    const weatherData = await weatherService.fetchWeatherData(
      latitude,
      longitude
    );

    // Update job with weather data and mark as completed
    job.data = weatherData?.current || undefined;
    job.status = "completed";

    console.log(`Job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`Job ${job.id} execution failed:`, error);
    job.status = "failed";
  }
}

// POST /job - Create a new job
app.post("/api/job", async (req, res) => {
  const { name, scheduledDate, type, tenantId, data } = req.body;

  // Validate required fields
  if (!name || !scheduledDate || !tenantId || !data) {
    return res.status(400).json({
      error:
        "Missing required fields: name, scheduledDate, tenantId and data are required",
    });
  }

  // Validate weather request data using the WeatherDataService
  const validationResult =
    weatherService.validateAndProcessWeatherRequest(data);

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
