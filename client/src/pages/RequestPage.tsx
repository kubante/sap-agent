import { Paper, Typography, Box, Button } from "@mui/material";
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

  const handleSubmit = () => {
    console.log(`Request submitted for ${tenant}:`, selectedDateTime);
    // TODO: Implement actual request submission
  };

  if (!tenant) {
    return <InvalidTenant />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Request Page for {tenant}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Select a date and time for your request: {tenant}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 600,
          }}
        >
          <DateTimePicker
            label="Select Date and Time"
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
              disabled={!selectedDateTime}
            >
              Submit Request
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedDateTime(null)}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
}
