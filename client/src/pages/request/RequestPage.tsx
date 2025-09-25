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
    <>
      <WeatherFetcher tenant={tenant} />
      <br />
      <CountryFetcher tenant={tenant} />
    </>
  );
}
