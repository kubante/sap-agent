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

  const { latitude, longitude } = validationResult.coordinates!;

  // Fetch weather data
  console.log(
    `Fetching weather data for new job at coordinates: ${latitude}, ${longitude}`
  );
  const weatherData = await weatherService.fetchWeatherData(
    latitude,
    longitude
  );

  // Create new job
  const newJob: Job = {
    id: Date.now().toString(), // Simple ID generation
    name,
    createdDate: new Date(),
    scheduledDate: new Date(scheduledDate),
    status: "scheduled",
    type,
    tenantId,
    data: weatherData?.current || undefined,
  };

  jobs.push(newJob);

  res.status(201).json(newJob);
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
