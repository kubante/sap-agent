import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Container } from "@mui/material";
import { TENANTS, ROUTES } from "./constants.ts";
import { TenantProvider } from "./contexts/TenantContext";
import Navigation from "./components/Navigation";
import RequestPage from "./pages/RequestPage";
import StatusPage from "./pages/StatusPage";

// Create a theme instance
const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <TenantProvider>
          <Navigation />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
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
            </Routes>
          </Container>
        </TenantProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
