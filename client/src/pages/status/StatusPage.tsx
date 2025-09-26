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
  ButtonGroup,
  capitalize,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../contexts/TenantContext";
import InvalidTenant from "../../components/InvalidTenant";
import { useState, useEffect } from "react";
import { ROUTES, JOB_TYPES } from "../../constants";
import type { JobType } from "../../types";

interface Job {
  id: string;
  name: string;
  createdDate: string;
  scheduledDate: string;
  status: "completed" | "scheduled" | "failed";
  type: JobType;
  tenantId: string;
  data?: any;
}

export default function StatusPage() {
  const { tenant } = useTenant();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<"all" | JobType>("all");

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // React Query hook with automatic polling
  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobs", tenant, selectedFilter],
    queryFn: async () => {
      if (!tenant) throw new Error("No tenant selected");

      const url = new URL("/api/jobs", window.location.origin);
      url.searchParams.set("tenantId", tenant);
      if (selectedFilter !== "all") {
        url.searchParams.set("type", selectedFilter);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is not focused
    enabled: !!tenant, // Only run when tenant exists
  });

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

  if (isLoading) {
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
        <Alert severity="error">Error loading jobs: {error.message}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Status Page for {capitalize(tenant)}
          </Typography>
          <Typography variant="body1">
            View the status of your requests for tenant: {tenant}
          </Typography>
        </Box>
        <Box
          sx={{
            textAlign: "right",
            padding: 2,
            borderRadius: 2,
            minWidth: "200px",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {currentTime.toLocaleDateString()}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {currentTime.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined" aria-label="job type filter">
          <Button
            variant={selectedFilter === "all" ? "contained" : "outlined"}
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Button>
          <Button
            variant={
              selectedFilter === JOB_TYPES.COUNTRIES ? "contained" : "outlined"
            }
            onClick={() => setSelectedFilter(JOB_TYPES.COUNTRIES)}
          >
            Countries
          </Button>
          <Button
            variant={
              selectedFilter === JOB_TYPES.WEATHER ? "contained" : "outlined"
            }
            onClick={() => setSelectedFilter(JOB_TYPES.WEATHER)}
          >
            Weather
          </Button>
        </ButtonGroup>
      </Box>

      {jobs.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {selectedFilter === "all"
              ? "You haven't created any jobs yet. Create your first job to get started!"
              : `No ${selectedFilter} jobs found. Try creating a ${selectedFilter} job or switch to "All" to see all jobs.`}
          </Typography>
          <Button
            component={Link}
            to={`/${tenant}/${ROUTES.REQUEST}`}
            variant="contained"
            size="large"
          >
            Create New Job
          </Button>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job: Job) => (
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
      )}

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
            ✕
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
                <strong>Scheduled:</strong>{" "}
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
