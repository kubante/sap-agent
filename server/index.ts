import axios from "axios";
import express from "express";

// Define the Job interface
interface Job {
  id: string;
  name: string;
  createdDate: Date;
  scheduledDate: Date;
  status: "completed" | "scheduled" | "failed";
  tags: string[];
  tenantId: string;
  data?: any;
}

// Weather data interface
interface WeatherData {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
  };
}

// In-memory storage for jobs
const jobs: Job[] = [];

// Function to fetch weather data
async function fetchWeatherData(): Promise<WeatherData | null> {
  try {
    const response = await axios.get(
      "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for handling json
app.use(express.json());

// GET /jobs - Retrieve all jobs
app.get("/api/jobs", (req, res) => {
  res.json(jobs);
});

// POST /job - Create a new job
app.post("/api/job", async (req, res) => {
  const { name, scheduledDate, status, tags, tenantId } = req.body;

  // Validate required fields
  if (!name || !scheduledDate || !status || !tenantId) {
    return res.status(400).json({
      error:
        "Missing required fields: name, scheduledDate, status, tenantId are required",
    });
  }

  // Validate status
  if (!["completed", "scheduled", "failed"].includes(status)) {
    return res.status(400).json({
      error: "Invalid status. Must be one of: completed, scheduled, failed",
    });
  }

  // Fetch weather data
  console.log("Fetching weather data for new job...");
  const weatherData = await fetchWeatherData();

  // Create new job
  const newJob: Job = {
    id: Date.now().toString(), // Simple ID generation
    name,
    createdDate: new Date(),
    scheduledDate: new Date(scheduledDate),
    status,
    tags: tags || [],
    tenantId,
    data: weatherData || undefined,
  };

  jobs.push(newJob);

  console.log(`Job created with ID: ${newJob.id}`);
  if (weatherData) {
    console.log(
      `Weather data fetched - Current temperature: ${weatherData.current.temperature_2m}°C`
    );
  } else {
    console.log("Failed to fetch weather data");
  }

  res.status(201).json(newJob);
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
