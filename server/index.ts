import axios from "axios";
import express from "express";

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

async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
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

  // Extract coordinates from data object (optional, with defaults)
  const lat = data.latitude || 52.52; // Default to Berlin
  const lng = data.longitude || 13.41; // Default to Berlin

  // Fetch weather data
  console.log(
    `Fetching weather data for new job at coordinates: ${lat}, ${lng}`
  );
  const weatherData = await fetchWeatherData(lat, lng);

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
