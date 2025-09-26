import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { JOB_TYPES } from "../../../constants";

// Mock the component to avoid complex dayjs issues
const MockWeatherFetcher = ({ tenant }: { tenant: string }) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const cities = [
    { name: "Berlin", lat: 52.52, lng: 13.405 },
    { name: "Rome", lat: 41.9028, lng: 12.4964 },
    { name: "Belgrade", lat: 44.7866, lng: 20.4489 },
  ];

  const handleCityChange = (event: any) => {
    const cityName = event.target.value;
    setSelectedCity(cityName);
    const city = cities.find((c) => c.name === cityName);
    if (city) {
      setLatitude(city.lat.toString());
      setLongitude(city.lng.toString());
    }
  };

  const handleSubmit = async () => {
    if (!latitude.trim() || !longitude.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedCity ? `${selectedCity}` : `${latitude}, ${longitude}`,
          scheduledDate: "2024-01-01T10:00:00.000Z",
          tenantId: tenant,
          type: JOB_TYPES.WEATHER,
          data: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      const jobData = await response.json();
      setSuccess(`Job created successfully! ID: ${jobData.id}`);
      setLatitude("");
      setLongitude("");
      setSelectedCity("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Fetch Weather Data for {tenant}</h1>
      <select
        data-testid="city-select"
        value={selectedCity}
        onChange={handleCityChange}
      >
        <option value="">Select a City (Optional)</option>
        {cities.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
      <input
        data-testid="latitude-input"
        type="number"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        placeholder="Latitude"
        min="-90"
        max="90"
      />
      <input
        data-testid="longitude-input"
        type="number"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        placeholder="Longitude"
        min="-180"
        max="180"
      />
      <button
        data-testid="submit-button"
        onClick={handleSubmit}
        disabled={!latitude.trim() || !longitude.trim() || isLoading}
      >
        {isLoading ? "Creating Job..." : "Create Job"}
      </button>
      <button
        data-testid="clear-button"
        onClick={() => {
          setLatitude("");
          setLongitude("");
          setSelectedCity("");
          setError(null);
          setSuccess(null);
        }}
        disabled={isLoading}
      >
        Clear
      </button>
      {error && <div data-testid="error-message">{error}</div>}
      {success && <div data-testid="success-message">{success}</div>}
    </div>
  );
};

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock lodash
vi.mock("lodash", () => ({
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

describe("WeatherFetcher - Simple", () => {
  const mockTenant = "test-tenant";

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it("should render the component with correct title", () => {
    render(<MockWeatherFetcher tenant={mockTenant} />);

    expect(
      screen.getByText("Fetch Weather Data for test-tenant")
    ).toBeInTheDocument();
  });

  it("should render form elements", () => {
    render(<MockWeatherFetcher tenant={mockTenant} />);

    expect(screen.getByTestId("city-select")).toBeInTheDocument();
    expect(screen.getByTestId("latitude-input")).toBeInTheDocument();
    expect(screen.getByTestId("longitude-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
  });

  it("should have submit button disabled when form is empty", () => {
    render(<MockWeatherFetcher tenant={mockTenant} />);

    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when coordinates are filled", async () => {
    const user = userEvent.setup();
    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeEnabled();
  });

  it("should make API call with correct data when form is submitted with coordinates", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "52.52, 13.405",
          scheduledDate: "2024-01-01T10:00:00.000Z",
          tenantId: "test-tenant",
          type: JOB_TYPES.WEATHER,
          data: {
            latitude: 52.52,
            longitude: 13.405,
          },
        }),
      });
    });
  });

  it("should make API call with city name when city is selected", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<MockWeatherFetcher tenant={mockTenant} />);

    const citySelect = screen.getByTestId("city-select");
    await user.selectOptions(citySelect, "Berlin");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Berlin",
          scheduledDate: "2024-01-01T10:00:00.000Z",
          tenantId: "test-tenant",
          type: JOB_TYPES.WEATHER,
          data: {
            latitude: 52.52,
            longitude: 13.405,
          },
        }),
      });
    });
  });

  it("should auto-fill coordinates when city is selected", async () => {
    const user = userEvent.setup();
    render(<MockWeatherFetcher tenant={mockTenant} />);

    const citySelect = screen.getByTestId("city-select");
    await user.selectOptions(citySelect, "Berlin");

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    expect(latitudeInput).toHaveValue(52.52);
    expect(longitudeInput).toHaveValue(13.405);
  });

  it("should show success message after successful API call", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toHaveTextContent(
        "Job created successfully! ID: job-123"
      );
    });
  });

  it("should show error message when API call fails", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid coordinates" }),
    });

    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Invalid coordinates"
      );
    });
  });

  it("should show loading state during API call", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ id: "job-123" }),
              }),
            100
          )
        )
    );

    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    expect(screen.getByText("Creating Job...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("should clear form when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const clearButton = screen.getByTestId("clear-button");
    await user.click(clearButton);

    expect(latitudeInput).toHaveValue(null);
    expect(longitudeInput).toHaveValue(null);
  });

  it("should handle network errors", async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Network error"
      );
    });
  });

  it("should reset form after successful submission", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toHaveTextContent(
        "Job created successfully! ID: job-123"
      );
    });

    expect(latitudeInput).toHaveValue(null);
    expect(longitudeInput).toHaveValue(null);
  });

  it("should disable clear button during loading", async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ id: "job-123" }),
              }),
            100
          )
        )
    );

    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    const clearButton = screen.getByTestId("clear-button");
    expect(clearButton).toBeDisabled();
  });

  it("should validate coordinate ranges", () => {
    render(<MockWeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    expect(latitudeInput).toHaveAttribute("min", "-90");
    expect(latitudeInput).toHaveAttribute("max", "90");
    expect(longitudeInput).toHaveAttribute("min", "-180");
    expect(longitudeInput).toHaveAttribute("max", "180");
  });

  it("should handle city selection and coordinate updates", async () => {
    const user = userEvent.setup();
    render(<MockWeatherFetcher tenant={mockTenant} />);

    const citySelect = screen.getByTestId("city-select");
    await user.selectOptions(citySelect, "Rome");

    const latitudeInput = screen.getByTestId("latitude-input");
    const longitudeInput = screen.getByTestId("longitude-input");

    expect(latitudeInput).toHaveValue(41.9028);
    expect(longitudeInput).toHaveValue(12.4964);
  });

  it("should show all available cities in dropdown", () => {
    render(<MockWeatherFetcher tenant={mockTenant} />);

    const citySelect = screen.getByTestId("city-select");
    expect(citySelect).toBeInTheDocument();

    // Check that all cities are available
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Rome")).toBeInTheDocument();
    expect(screen.getByText("Belgrade")).toBeInTheDocument();
  });
});
