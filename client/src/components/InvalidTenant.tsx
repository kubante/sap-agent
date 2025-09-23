import { Paper, Typography } from "@mui/material";

export default function InvalidTenant() {
  return (
    <Paper sx={{ p: 3, minHeight: "calc(100vh - 200px)" }}>
      <Typography variant="h4" gutterBottom>
        Invalid Tenant
      </Typography>
      <Typography variant="body1">
        Please navigate to a valid tenant page.
      </Typography>
    </Paper>
  );
}
