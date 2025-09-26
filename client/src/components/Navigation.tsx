import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  capitalize,
} from "@mui/material";
import { useTenant } from "../contexts/TenantContext";
import { ROUTES } from "../constants";

export default function Navigation() {
  const location = useLocation();
  const { tenant: currentTenant } = useTenant();

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Travel Agent {currentTenant && `- ${capitalize(currentTenant)}`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            color="inherit"
            component={Link} // use Link so that the user can right click and open in new tab
            to={`/${currentTenant}/${ROUTES.REQUEST}`}
            variant={
              location.pathname.includes(`/${ROUTES.REQUEST}`)
                ? "outlined"
                : "text"
            }
          >
            Request
          </Button>
          <Button
            color="inherit"
            component={Link}
            to={`/${currentTenant}/${ROUTES.STATUS}`}
            variant={
              location.pathname.includes(`/${ROUTES.STATUS}`)
                ? "outlined"
                : "text"
            }
          >
            Status
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
