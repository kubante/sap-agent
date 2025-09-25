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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
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
  data?: any;
}

export default function StatusPage() {
  const { tenant } = useTenant();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleDetailsClick = (job: Job) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedJob(null);
  };

  const renderJsonData = (data: any) => {
    if (!data) {
      return (
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      );
    }

    try {
      const jsonString =
        typeof data === "string" ? data : JSON.stringify(data, null, 2);
      return (
        <Box
          component="pre"
          sx={{
            backgroundColor: "#f5f5f5",
            padding: 2,
            borderRadius: 1,
            overflow: "auto",
            maxHeight: "400px",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {jsonString}
        </Box>
      );
    } catch (error) {
      return (
        <Typography variant="body2" color="error">
          Error parsing JSON data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Typography>
      );
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
              <TableCell>Details</TableCell>
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
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDetailsClick(job)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Job Details - {selectedJob?.name}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Job Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>ID:</strong> {selectedJob?.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Type:</strong> {selectedJob?.type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Status:</strong> {selectedJob?.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Created:</strong>{" "}
                {selectedJob
                  ? new Date(selectedJob.createdDate).toLocaleString()
                  : ""}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Executed:</strong>{" "}
                {selectedJob
                  ? new Date(selectedJob.scheduledDate).toLocaleString()
                  : ""}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
              Job Data
            </Typography>
            {renderJsonData(selectedJob?.data)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
