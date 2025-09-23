import {
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTenant } from "../contexts/TenantContext";
import InvalidTenant from "../components/InvalidTenant";
import { useState, useEffect } from "react";

interface Job {
  id: string;
  name: string;
  createdDate: string;
  scheduledDate: string;
  status: "completed" | "scheduled" | "failed";
  type: "weather" | "countries";
  tenantId: string;
}

export default function StatusPage() {
  const { tenant } = useTenant();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      if (!tenant) return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/jobs?tenantId=${tenant}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [tenant]);

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "scheduled":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  if (!tenant) {
    return <InvalidTenant />;
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading jobs...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">Error loading jobs: {error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Status Page for {tenant}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        View the status of your requests for tenant: {tenant}
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Executed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.id}</TableCell>
                <TableCell>{job.type}</TableCell>
                <TableCell>{job.name}</TableCell>
                <TableCell>
                  <Chip
                    label={job.status}
                    color={getStatusColor(job.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(job.createdDate).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(job.scheduledDate).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
