import { render } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CountryFetcher from "../CountryFetcher";
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
  TextField: ({ label, value, onChange, ...props }: any) => (
    <input
      data-testid={props["data-testid"] || "text-field"}
      placeholder={label}
      value={value || ""}
      onChange={onChange}
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
  Autocomplete: ({ value, onChange, options, renderInput, ...props }: any) => {
    const [inputValue, setInputValue] = React.useState("");
    return (
      <div>
        {renderInput({
          ...props,
          value: inputValue,
          onChange: (e: any) => setInputValue(e.target.value),
          inputProps: {
            "data-testid": "country-input",
            placeholder: "Select Country",
          },
        })}
        <select
          data-testid="country-select"
          value={value || ""}
          onChange={(e) => onChange(null, e.target.value)}
        >
          <option value="">Select a country</option>
          {options.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  },
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

// Mock React for Autocomplete
const React = {
  useState: (initial: any) => {
    let state = initial;
    return [
      state,
      (newState: any) => {
        state = newState;
      },
    ];
  },
};

describe("CountryFetcher", () => {
  const mockTenant = "test-tenant";

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it("should render the component with correct title", () => {
    render(<CountryFetcher tenant={mockTenant} />);

    expect(
      screen.getByText("Fetch Country Data for Test-tenant")
    ).toBeInTheDocument();
  });

  it("should render form elements", () => {
    render(<CountryFetcher tenant={mockTenant} />);

    expect(screen.getByTestId("date-time-picker")).toBeInTheDocument();
    expect(screen.getByTestId("country-select")).toBeInTheDocument();
    expect(screen.getByText("Create Job")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("should have submit button disabled when form is empty", () => {
    render(<CountryFetcher tenant={mockTenant} />);

    const submitButton = screen.getByText("Create Job");
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when form is filled", async () => {
    const user = userEvent.setup();
    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

    const submitButton = screen.getByText("Create Job");
    expect(submitButton).toBeEnabled();
  });

  it("should make API call with correct data when form is submitted", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "job-123" }),
    });

    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

    const submitButton = screen.getByText("Create Job");
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

    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

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
      json: async () => ({ error: "Validation failed" }),
    });

    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

    const submitButton = screen.getByText("Create Job");
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

    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

    const submitButton = screen.getByText("Create Job");
    await user.click(submitButton);

    expect(screen.getByText("Creating Job...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("should clear form when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

    const clearButton = screen.getByText("Clear");
    await user.click(clearButton);

    expect(countrySelect).toHaveValue("");
  });

  it("should handle network errors", async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

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

    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

    const submitButton = screen.getByText("Create Job");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("success-message")).toHaveTextContent(
        "Job created successfully! ID: job-123"
      );
    });

    expect(countrySelect).toHaveValue("");
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

    render(<CountryFetcher tenant={mockTenant} />);

    const countrySelect = screen.getByTestId("country-select");
    await user.selectOptions(countrySelect, "Germany");

    const submitButton = screen.getByText("Create Job");
    await user.click(submitButton);

    const clearButton = screen.getByText("Clear");
    expect(clearButton).toBeDisabled();
  });
});
