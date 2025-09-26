import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WeatherFetcher from "../WeatherFetcher";
import { JOB_TYPES } from "../../../constants";

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock Material-UI components to avoid complex rendering issues
vi.mock("@mui/material", () => ({
  Paper: ({ children, ...props }: any) => (
    <div data-testid="paper" {...props}>
      {children}
    </div>
  ),
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  TextField: ({ label, value, onChange, slotProps, ...props }: any) => (
    <input
      data-testid={props["data-testid"] || "text-field"}
      placeholder={label}
      value={value === undefined ? "" : value}
      onChange={onChange}
      {...(slotProps?.htmlInput || {})}
      {...props}
    />
  ),
  Alert: ({ children, severity, ...props }: any) => (
    <div
      data-testid={severity === "error" ? "error-message" : "success-message"}
      {...props}
    >
      {children}
    </div>
  ),
  CircularProgress: () => <div data-testid="loading-spinner">Loading...</div>,
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  FormControl: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  InputLabel: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
  Select: ({ value, onChange, children, ...props }: any) => (
    <select
      data-testid="city-select"
      value={value || ""}
      onChange={onChange}
      {...props}
    >
      {children}
    </select>
  ),
  MenuItem: ({ children, value, ...props }: any) => (
    <option value={value} {...props}>
      {typeof children === "string"
        ? children
        : children?.props?.children || children}
    </option>
  ),
}));

// Mock Material-UI date picker
vi.mock("@mui/x-date-pickers/DateTimePicker", () => ({
  DateTimePicker: ({ value, onChange, ...props }: any) => {
    const mockDayjs = (date?: any) => {
      const d = date ? new Date(date) : new Date("2024-01-01T10:00:00.000Z");
      return {
        format: (format: string) => {
          if (format === "YYYY-MM-DDTHH:mm") {
            return d.toISOString().slice(0, 16);
          }
          return d.toISOString();
        },
        toISOString: () => d.toISOString(),
        isValid: () => true,
      };
    };

    return (
      <input
        data-testid="date-time-picker"
        type="datetime-local"
        value={value ? value.format("YYYY-MM-DDTHH:mm") : ""}
        onChange={(e) => {
          const newValue = e.target.value ? mockDayjs(e.target.value) : null;
          onChange(newValue);
        }}
        {...props}
      />
    );
  },
}));

// Mock Material-UI localization provider
vi.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock dayjs adapter
vi.mock("@mui/x-date-pickers/AdapterDayjs", () => ({
  AdapterDayjs: {},
}));

// Mock dayjs
vi.mock("dayjs", () => {
  const mockDayjs = (date?: any) => {
    const d = date ? new Date(date) : new Date("2024-01-01T10:00:00.000Z");
    return {
      format: (format: string) => {
        if (format === "YYYY-MM-DDTHH:mm") {
          return d.toISOString().slice(0, 16);
        }
        return d.toISOString();
      },
      toISOString: () => d.toISOString(),
      isValid: () => true,
    };
  };
  return {
    default: mockDayjs,
    __esModule: true,
  };
});

describe("WeatherFetcher", () => {
  const mockTenant = "test-tenant";

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it("should render the component with correct title", () => {
    render(<WeatherFetcher tenant={mockTenant} />);

    expect(
      screen.getByText("Fetch Weather Data for Test-tenant")
    ).toBeInTheDocument();
  });

  it("should render form elements", () => {
    render(<WeatherFetcher tenant={mockTenant} />);

    expect(screen.getByTestId("date-time-picker")).toBeInTheDocument();
    expect(screen.getByTestId("city-select")).toBeInTheDocument();
    expect(screen.getByText("Create Job")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("should have submit button disabled when form is empty", () => {
    render(<WeatherFetcher tenant={mockTenant} />);

    const submitButton = screen.getByText("Create Job");
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when coordinates are filled", async () => {
    const user = userEvent.setup();
    render(<WeatherFetcher tenant={mockTenant} />);

    // Find the latitude and longitude inputs by their labels
    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByText("Create Job");
    expect(submitButton).toBeEnabled();
  });

  it("should make API call with correct data when form is submitted with coordinates", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByText("Create Job");
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

    render(<WeatherFetcher tenant={mockTenant} />);

    const citySelect = screen.getByTestId("city-select");
    await user.selectOptions(citySelect, "Berlin");

    const submitButton = screen.getByText("Create Job");
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
    render(<WeatherFetcher tenant={mockTenant} />);

    const citySelect = screen.getByTestId("city-select");
    await user.selectOptions(citySelect, "Berlin");

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    expect(latitudeInput).toHaveValue(52.52);
    expect(longitudeInput).toHaveValue(13.405);
  });

  it("should show success message after successful API call", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByText("Create Job");
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

    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByText("Create Job");
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

    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByText("Create Job");
    await user.click(submitButton);

    expect(screen.getByText("Creating Job...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("should clear form when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const clearButton = screen.getByText("Clear");
    await user.click(clearButton);

    // Check that the inputs are cleared by looking at their value attribute
    await waitFor(() => {
      const inputs = screen.getAllByDisplayValue("");
      expect(inputs).toHaveLength(2); // Both latitude and longitude should be empty
    });
  });

  it("should handle network errors", async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByText("Create Job");
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

    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByText("Create Job");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toHaveTextContent(
        "Job created successfully! ID: job-123"
      );
    });

    // Check that the form is reset by looking for empty inputs
    await waitFor(() => {
      const inputs = screen.getAllByDisplayValue("");
      expect(inputs).toHaveLength(2); // Both latitude and longitude should be empty
    });
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

    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    await user.type(latitudeInput, "52.52");
    await user.type(longitudeInput, "13.405");

    const submitButton = screen.getByText("Create Job");
    await user.click(submitButton);

    const clearButton = screen.getByText("Clear");
    expect(clearButton).toBeDisabled();
  });

  it("should validate coordinate ranges", () => {
    render(<WeatherFetcher tenant={mockTenant} />);

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    expect(latitudeInput).toHaveAttribute("min", "-90");
    expect(latitudeInput).toHaveAttribute("max", "90");
    expect(longitudeInput).toHaveAttribute("min", "-180");
    expect(longitudeInput).toHaveAttribute("max", "180");
  });

  it("should handle city selection and coordinate updates", async () => {
    const user = userEvent.setup();
    render(<WeatherFetcher tenant={mockTenant} />);

    const citySelect = screen.getByTestId("city-select");
    await user.selectOptions(citySelect, "Rome");

    const latitudeInput = screen.getByPlaceholderText("Latitude");
    const longitudeInput = screen.getByPlaceholderText("Longitude");

    expect(latitudeInput).toHaveValue(41.9028);
    expect(longitudeInput).toHaveValue(12.4964);
  });

  it("should show all available cities in dropdown", () => {
    render(<WeatherFetcher tenant={mockTenant} />);

    const citySelect = screen.getByTestId("city-select");
    expect(citySelect).toBeInTheDocument();

    // Check that all cities are available
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Rome")).toBeInTheDocument();
    expect(screen.getByText("Belgrade")).toBeInTheDocument();
    expect(screen.getByText("Kalamata")).toBeInTheDocument();
    expect(screen.getByText("Athens")).toBeInTheDocument();
  });
});
