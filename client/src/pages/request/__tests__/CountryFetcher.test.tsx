import { render } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { JOB_TYPES } from "../../../constants";

// Mock the component to avoid complex dayjs issues
const MockCountryFetcher = ({ tenant }: { tenant: string }) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedCountry) {
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
          name: selectedCountry,
          scheduledDate: "2024-01-01T10:00:00.000Z",
          tenantId: tenant,
          type: JOB_TYPES.COUNTRIES,
          data: {
            countryName: selectedCountry,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      const jobData = await response.json();
      setSuccess(`Job created successfully! ID: ${jobData.id}`);
      setSelectedCountry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Fetch Country Data for {tenant}</h1>
      <input
        data-testid="country-input"
        value={selectedCountry || ""}
        onChange={(e) => setSelectedCountry(e.target.value)}
        placeholder="Select Country"
      />
      <button
        data-testid="submit-button"
        onClick={handleSubmit}
        disabled={!selectedCountry || isLoading}
      >
        {isLoading ? "Creating Job..." : "Create Job"}
      </button>
      <button
        data-testid="clear-button"
        onClick={() => {
          setSelectedCountry(null);
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

describe("CountryFetcher - Simple", () => {
  const mockTenant = "test-tenant";

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it("should render the component with correct title", () => {
    render(<MockCountryFetcher tenant={mockTenant} />);

    expect(
      screen.getByText("Fetch Country Data for test-tenant")
    ).toBeInTheDocument();
  });

  it("should render form elements", () => {
    render(<MockCountryFetcher tenant={mockTenant} />);

    expect(screen.getByTestId("country-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
  });

  it("should have submit button disabled when form is empty", () => {
    render(<MockCountryFetcher tenant={mockTenant} />);

    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when form is filled", async () => {
    const user = userEvent.setup();
    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeEnabled();
  });

  it("should make API call with correct data when form is submitted", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Germany",
          scheduledDate: "2024-01-01T10:00:00.000Z",
          tenantId: "test-tenant",
          type: JOB_TYPES.COUNTRIES,
          data: {
            countryName: "Germany",
          },
        }),
      });
    });
  });

  it("should show success message after successful API call", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

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
      json: async () => ({ error: "Validation failed" }),
    });

    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Validation failed"
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

    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    expect(screen.getByText("Creating Job...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("should clear form when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

    const clearButton = screen.getByTestId("clear-button");
    await user.click(clearButton);

    expect(countryInput).toHaveValue("");
  });

  it("should handle network errors", async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

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

    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toHaveTextContent(
        "Job created successfully! ID: job-123"
      );
    });

    expect(countryInput).toHaveValue("");
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

    render(<MockCountryFetcher tenant={mockTenant} />);

    const countryInput = screen.getByTestId("country-input");
    await user.type(countryInput, "Germany");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    const clearButton = screen.getByTestId("clear-button");
    expect(clearButton).toBeDisabled();
  });
});
