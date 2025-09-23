import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState } from "react";
import { useTenant } from "../contexts/TenantContext";
import InvalidTenant from "../components/InvalidTenant";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

export default function RequestPage() {
  const { tenant } = useTenant();
  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(
    dayjs()
  );
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !selectedDateTime) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          scheduledDate: selectedDateTime.toISOString(),
          status: "scheduled", // Default status
          tenantId: tenant,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      const jobData = await response.json();
      setSuccess(`Job created successfully! ID: ${jobData.id}`);

      // Reset form
      setName("");
      setSelectedDateTime(dayjs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!tenant) {
    return <InvalidTenant />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create Job for {tenant}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Fill in the details to create a new job with weather data
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 600,
          }}
        >
          <TextField
            label="Job Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            fullWidth
            required
          />

          <DateTimePicker
            label="Scheduled Date and Time"
            value={selectedDateTime}
            onChange={(newValue) => setSelectedDateTime(newValue)}
            slotProps={{
              textField: {
                variant: "outlined",
                fullWidth: true,
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!selectedDateTime || !name.trim() || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Creating Job..." : "Create Job"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setName("");
                setSelectedDateTime(dayjs());
                setError(null);
                setSuccess(null);
              }}
              disabled={isLoading}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
}
