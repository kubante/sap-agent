import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import InvalidTenant from "../InvalidTenant";

// Helper function to render component with necessary providers
const renderWithProviders = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe("InvalidTenant", () => {
  it("should render the invalid tenant message", () => {
    renderWithProviders(<InvalidTenant />);

    expect(screen.getByText("Invalid Tenant")).toBeInTheDocument();
    expect(
      screen.getByText("Please select a valid tenant to continue:")
    ).toBeInTheDocument();
  });

  it("should have the correct heading level", () => {
    renderWithProviders(<InvalidTenant />);

    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Invalid Tenant");
  });

  it("should render with Material-UI components", () => {
    renderWithProviders(<InvalidTenant />);

    // Check that the component renders without errors
    expect(screen.getByText("Invalid Tenant")).toBeInTheDocument();
    expect(
      screen.getByText("Please select a valid tenant to continue:")
    ).toBeInTheDocument();
  });

  it("should render tenant buttons", () => {
    renderWithProviders(<InvalidTenant />);

    // Check that tenant buttons are rendered
    expect(screen.getByText("Abdullah")).toBeInTheDocument();
    expect(screen.getByText("Filip")).toBeInTheDocument();
    expect(screen.getByText("Jacob")).toBeInTheDocument();
  });
});
