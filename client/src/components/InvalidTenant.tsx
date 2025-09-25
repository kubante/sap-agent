import { Paper, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { TENANTS } from "../constants";
import { capitalize } from "lodash";

export default function InvalidTenant() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Invalid Tenant
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Please select a valid tenant to continue:
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {TENANTS.map((tenant) => (
          <Button
            key={tenant}
            variant="contained"
            component={Link}
            to={`/${tenant}`}
            sx={{
              minWidth: 120,
              textTransform: "capitalize",
            }}
          >
            {capitalize(tenant)}
          </Button>
        ))}
      </Box>
    </Paper>
  );
}
