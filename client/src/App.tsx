import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Container } from "@mui/material";
import { TENANTS, ROUTES } from "./constants.ts";
import { TenantProvider } from "./contexts/TenantContext";
import Navigation from "./components/Navigation";
import RequestPage from "./pages/RequestPage";
import StatusPage from "./pages/StatusPage";
import InvalidTenant from "./components/InvalidTenant";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <TenantProvider>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Navigation />
            <Container
              maxWidth="lg"
              sx={{
                mt: 4,
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Routes>
                {TENANTS.map((tenant) => (
                  <Route
                    key={`${tenant}-request`}
                    path={`/${tenant}/${ROUTES.REQUEST}`}
                    element={<RequestPage />}
                  />
                ))}
                {TENANTS.map((tenant) => (
                  <Route
                    key={`${tenant}-status`}
                    path={`/${tenant}/${ROUTES.STATUS}`}
                    element={<StatusPage />}
                  />
                ))}
                <Route path="*" element={<InvalidTenant />} />
              </Routes>
            </Container>
          </div>
        </TenantProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
