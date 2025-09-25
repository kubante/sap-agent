import { useTenant } from "../../contexts/TenantContext";
import InvalidTenant from "../../components/InvalidTenant";
import WeatherFetcher from "../../components/WeatherFetcher";

export default function RequestPage() {
  const { tenant } = useTenant();

  if (!tenant) {
    return <InvalidTenant />;
  }

  return <WeatherFetcher tenant={tenant} />;
}
