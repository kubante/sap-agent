import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Navigation from "../Navigation";

// Mock the TenantContext
vi.mock("../../contexts/TenantContext", () => ({
  useTenant: () => ({
    tenant: "test-tenant",
    setTenant: vi.fn(),
  }),
}));

// Mock lodash
vi.mock("lodash", () => ({
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

// Mock constants
vi.mock("../../constants", () => ({
  ROUTES: {
    REQUEST: "request",
    STATUS: "status",
  },
}));

describe("Navigation - Simple", () => {
  it("should render the navigation bar", () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText("Travel Agent - Test-tenant")).toBeInTheDocument();
  });

  it("should render navigation buttons", () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText("Request")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });
});
