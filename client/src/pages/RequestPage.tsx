import { Paper, Typography, Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import { useTenant } from "../contexts/TenantContext";

export default function RequestPage() {
  const { tenant } = useTenant();
  const [requestData, setRequestData] = useState("");

  const handleSubmit = () => {
    console.log(`Request submitted for ${tenant}:`, requestData);
    // TODO: Implement actual request submission
  };

  if (!tenant) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Invalid Tenant
        </Typography>
        <Typography variant="body1">
          Please navigate to a valid tenant page.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Request Page for {tenant}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Submit a request for tenant: {tenant}
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 600 }}
      >
        <TextField
          label="Request Details"
          multiline
          rows={4}
          value={requestData}
          onChange={(e) => setRequestData(e.target.value)}
          placeholder="Enter your request details here..."
          variant="outlined"
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!requestData.trim()}
          >
            Submit Request
          </Button>
          <Button variant="outlined" onClick={() => setRequestData("")}>
            Clear
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
