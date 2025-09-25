import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import InvalidTenant from "../InvalidTenant";

describe("InvalidTenant", () => {
  it("should render the invalid tenant message", () => {
    render(<InvalidTenant />);

    expect(screen.getByText("Invalid Tenant")).toBeInTheDocument();
    expect(
      screen.getByText("Please navigate to a valid tenant page.")
    ).toBeInTheDocument();
  });

  it("should have the correct heading level", () => {
    render(<InvalidTenant />);

    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Invalid Tenant");
  });

  it("should render with Material-UI components", () => {
    render(<InvalidTenant />);

    // Check that the component renders without errors
    expect(screen.getByText("Invalid Tenant")).toBeInTheDocument();
    expect(
      screen.getByText("Please navigate to a valid tenant page.")
    ).toBeInTheDocument();
  });
});
