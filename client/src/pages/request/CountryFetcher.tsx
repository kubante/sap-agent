import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { capitalize } from "lodash";
import { COUNTRIES } from "../../constants";

interface CountryFetcherProps {
  tenant: string;
}

export default function CountryFetcher({ tenant }: CountryFetcherProps) {
  const [scheduledTime, setScheduledTime] = useState<Dayjs | null>(dayjs());
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!scheduledTime || !selectedCountry) {
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
          name: selectedCountry,
          scheduledDate: scheduledTime.toISOString(),
          tenantId: tenant,
          type: "countries",
          data: {
            countryName: selectedCountry,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      const jobData = await response.json();
      setSuccess(`Job created successfully! ID: ${jobData.id}`);

      // Reset form
      setSelectedCountry(null);
      setScheduledTime(dayjs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Fetch Country Data for {capitalize(tenant)}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Select a country or enter a country name to fetch country data, also
          schedule the request to be executed at a later time.
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
          <DateTimePicker
            label="Scheduled Date and Time"
            value={scheduledTime}
            onChange={(newValue) => setScheduledTime(newValue)}
            slotProps={{
              textField: {
                variant: "outlined",
                fullWidth: true,
              },
            }}
          />

          <Autocomplete
            value={selectedCountry}
            onChange={(_, newValue) => {
              setSelectedCountry(newValue);
            }}
            options={COUNTRIES}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Country"
                variant="outlined"
                required
                placeholder="Type to search countries..."
              />
            )}
            freeSolo
            fullWidth
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!scheduledTime || !selectedCountry || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Creating Job..." : "Create Job"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCountry(null);
                setScheduledTime(dayjs());
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
