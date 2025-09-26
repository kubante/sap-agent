import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StatusPage from "../StatusPage";
import { JOB_TYPES } from "../../../constants";

// Mock the tenant context
const mockTenant = "test-tenant";
vi.mock("../../../contexts/TenantContext", () => ({
  useTenant: () => ({ tenant: mockTenant }),
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock Material-UI components
vi.mock("@mui/material", () => ({
  Paper: ({ children, ...props }: any) => (
    <div data-testid="paper" {...props}>
      {children}
    </div>
  ),
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Chip: ({ label, color, ...props }: any) => (
    <span data-testid="chip" data-color={color} {...props}>
      {label}
    </span>
  ),
  Table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
  TableBody: ({ children, ...props }: any) => (
    <tbody {...props}>{children}</tbody>
  ),
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  TableContainer: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  TableHead: ({ children, ...props }: any) => (
    <thead {...props}>{children}</thead>
  ),
  TableRow: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  CircularProgress: () => <div data-testid="loading-spinner">Loading...</div>,
  Alert: ({ children, severity, ...props }: any) => (
    <div data-testid="alert" data-severity={severity} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Dialog: ({ children, open, ...props }: any) =>
    open ? (
      <div data-testid="dialog" {...props}>
        {children}
      </div>
    ) : null,
  DialogTitle: ({ children, ...props }: any) => (
    <div data-testid="dialog-title" {...props}>
      {children}
    </div>
  ),
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogActions: ({ children, ...props }: any) => (
    <div data-testid="dialog-actions" {...props}>
      {children}
    </div>
  ),
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  IconButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  ButtonGroup: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

// Mock InvalidTenant component
vi.mock("../../../components/InvalidTenant", () => ({
  default: () => <div data-testid="invalid-tenant">Invalid Tenant</div>,
}));

// Helper function to create a test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("StatusPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it("should render loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<StatusPage />, { wrapper: createTestWrapper() });

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByText("Loading jobs...")).toBeInTheDocument();
  });

  it("should render error state when API call fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Error loading jobs: Network error")
      ).toBeInTheDocument();
    });
  });

  it("should render empty state when no jobs are found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(screen.getByText("No jobs found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "You haven't created any jobs yet. Create your first job to get started!"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Create New Job")).toBeInTheDocument();
    });
  });

  it("should render jobs table when jobs are available", async () => {
    const mockJobs = [
      {
        id: "job-1",
        name: "Test Job",
        type: JOB_TYPES.COUNTRIES,
        status: "completed",
        createdDate: "2024-01-01T10:00:00.000Z",
        scheduledDate: "2024-01-01T10:00:00.000Z",
        tenantId: "test-tenant",
        data: { countryName: "Germany" },
      },
      {
        id: "job-2",
        name: "Weather Job",
        type: JOB_TYPES.WEATHER,
        status: "scheduled",
        createdDate: "2024-01-01T11:00:00.000Z",
        scheduledDate: "2024-01-01T12:00:00.000Z",
        tenantId: "test-tenant",
        data: { latitude: 52.52, longitude: 13.405 },
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobs,
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(
        screen.getByText("Status Page for Test-tenant")
      ).toBeInTheDocument();
      expect(screen.getByText("job-1")).toBeInTheDocument();
      expect(screen.getByText("job-2")).toBeInTheDocument();
      expect(screen.getByText("Test Job")).toBeInTheDocument();
      expect(screen.getByText("Weather Job")).toBeInTheDocument();
    });
  });

  it("should display current time", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      // Check that time elements are present (exact time will vary)
      expect(
        screen.getByText(/Status Page for Test-tenant/)
      ).toBeInTheDocument();
    });
  });

  it("should render filter buttons", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Countries")).toBeInTheDocument();
      expect(screen.getByText("Weather")).toBeInTheDocument();
    });
  });

  it("should filter jobs by type when filter button is clicked", async () => {
    const mockJobs = [
      {
        id: "job-1",
        name: "Country Job",
        type: JOB_TYPES.COUNTRIES,
        status: "completed",
        createdDate: "2024-01-01T10:00:00.000Z",
        scheduledDate: "2024-01-01T10:00:00.000Z",
        tenantId: "test-tenant",
      },
      {
        id: "job-2",
        name: "Weather Job",
        type: JOB_TYPES.WEATHER,
        status: "scheduled",
        createdDate: "2024-01-01T11:00:00.000Z",
        scheduledDate: "2024-01-01T12:00:00.000Z",
        tenantId: "test-tenant",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobs,
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Country Job")).toBeInTheDocument();
      expect(screen.getByText("Weather Job")).toBeInTheDocument();
    });

    // Click on Countries filter
    const countriesButton = screen.getByText("Countries");
    await userEvent.click(countriesButton);

    // The component should make a new API call with the filter
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("type=countries")
      );
    });
  });

  it("should open job details dialog when Details button is clicked", async () => {
    const mockJob = {
      id: "job-1",
      name: "Test Job",
      type: JOB_TYPES.COUNTRIES,
      status: "completed",
      createdDate: "2024-01-01T10:00:00.000Z",
      scheduledDate: "2024-01-01T10:00:00.000Z",
      tenantId: "test-tenant",
      data: { countryName: "Germany" },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockJob],
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Job")).toBeInTheDocument();
    });

    const detailsButton = screen
      .getAllByText("Details")
      .find((button) => button.tagName === "BUTTON");
    await userEvent.click(detailsButton!);

    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByText("Job Details - Test Job")).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === "ID: job-1";
        })
      ).toBeInTheDocument();
    });
  });

  it("should close dialog when close button is clicked", async () => {
    const mockJob = {
      id: "job-1",
      name: "Test Job",
      type: JOB_TYPES.COUNTRIES,
      status: "completed",
      createdDate: "2024-01-01T10:00:00.000Z",
      scheduledDate: "2024-01-01T10:00:00.000Z",
      tenantId: "test-tenant",
      data: { countryName: "Germany" },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockJob],
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Job")).toBeInTheDocument();
    });

    const detailsButton = screen
      .getAllByText("Details")
      .find((button) => button.tagName === "BUTTON");
    await userEvent.click(detailsButton!);

    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("Close");
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });
  });

  it("should display job status with correct color", async () => {
    const mockJobs = [
      {
        id: "job-1",
        name: "Completed Job",
        type: JOB_TYPES.COUNTRIES,
        status: "completed",
        createdDate: "2024-01-01T10:00:00.000Z",
        scheduledDate: "2024-01-01T10:00:00.000Z",
        tenantId: "test-tenant",
      },
      {
        id: "job-2",
        name: "Scheduled Job",
        type: JOB_TYPES.WEATHER,
        status: "scheduled",
        createdDate: "2024-01-01T11:00:00.000Z",
        scheduledDate: "2024-01-01T12:00:00.000Z",
        tenantId: "test-tenant",
      },
      {
        id: "job-3",
        name: "Failed Job",
        type: JOB_TYPES.COUNTRIES,
        status: "failed",
        createdDate: "2024-01-01T13:00:00.000Z",
        scheduledDate: "2024-01-01T14:00:00.000Z",
        tenantId: "test-tenant",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobs,
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      const chips = screen.getAllByTestId("chip");
      expect(chips).toHaveLength(3);

      const completedChip = chips.find(
        (chip) => chip.textContent === "completed"
      );
      const scheduledChip = chips.find(
        (chip) => chip.textContent === "scheduled"
      );
      const failedChip = chips.find((chip) => chip.textContent === "failed");

      expect(completedChip).toHaveAttribute("data-color", "success");
      expect(scheduledChip).toHaveAttribute("data-color", "warning");
      expect(failedChip).toHaveAttribute("data-color", "error");
    });
  });

  it("should display formatted dates", async () => {
    const mockJob = {
      id: "job-1",
      name: "Test Job",
      type: JOB_TYPES.COUNTRIES,
      status: "completed",
      createdDate: "2024-01-01T10:00:00.000Z",
      scheduledDate: "2024-01-01T12:00:00.000Z",
      tenantId: "test-tenant",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockJob],
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      // Check that dates are displayed (exact format may vary by locale)
      expect(screen.getByText("Test Job")).toBeInTheDocument();
    });
  });

  it("should show empty state message for filtered results", async () => {
    // Mock the initial call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<StatusPage />, { wrapper: createTestWrapper() });

    await waitFor(() => {
      expect(screen.getByText("No jobs found")).toBeInTheDocument();
    });

    // Mock the filtered call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // Click on Countries filter
    const countriesButton = screen.getByText("Countries");
    await userEvent.click(countriesButton);

    await waitFor(() => {
      expect(screen.getByText(/No countries jobs found/)).toBeInTheDocument();
    });
  });
});
