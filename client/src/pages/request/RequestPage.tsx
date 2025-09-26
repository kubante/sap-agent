import { Box } from "@mui/material";
import { useTenant } from "../../contexts/TenantContext";
import InvalidTenant from "../../components/InvalidTenant";
import WeatherFetcher from "./WeatherFetcher";
import CountryFetcher from "./CountryFetcher";

export default function RequestPage() {
  const { tenant } = useTenant();

  if (!tenant) {
    return <InvalidTenant />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "16px",
        marginBottom: "16px",
      }}
    >
      <WeatherFetcher tenant={tenant} />
      <CountryFetcher tenant={tenant} />
    </Box>
  );
}
