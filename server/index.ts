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
}

// In-memory storage for jobs
const jobs: Job[] = [];

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for handling json
app.use(express.json());

// GET /jobs - Retrieve all jobs
app.get("/jobs", (req, res) => {
  res.json(jobs);
});

// POST /job - Create a new job
app.post("/job", (req, res) => {
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

  // Create new job
  const newJob: Job = {
    id: Date.now().toString(), // Simple ID generation
    name,
    createdDate: new Date(),
    scheduledDate: new Date(scheduledDate),
    status,
    tags: tags || [],
    tenantId,
  };

  jobs.push(newJob);

  res.status(201).json(newJob);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
