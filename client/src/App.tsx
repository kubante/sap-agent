import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Container } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TENANTS, ROUTES } from "./constants.ts";
import { TenantProvider } from "./contexts/TenantContext";
import Navigation from "./components/Navigation";
import RequestPage from "./pages/RequestPage";
import StatusPage from "./pages/StatusPage";
import InvalidTenant from "./components/InvalidTenant";
import { theme } from "./theme";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale for real-time updates
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                  {TENANTS.map((tenant) => (
                    <Route
                      key={`${tenant}-redirect`}
                      path={`/${tenant}`}
                      element={
                        <Navigate to={`/${tenant}/${ROUTES.REQUEST}`} replace />
                      }
                    />
                  ))}
                  <Route path="*" element={<InvalidTenant />} />
                </Routes>
              </Container>
            </div>
          </TenantProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
