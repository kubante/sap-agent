# Client Testing Guide

This project uses **Vitest** as the testing framework for React components, integrated seamlessly with Vite.

## Setup

The testing framework is already configured with:
- Vitest with TypeScript support
- React Testing Library for component testing
- JSDOM environment for browser simulation
- Jest DOM matchers for better assertions

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI (interactive)
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized in `__tests__` directories alongside the source files:

```
src/
├── components/
│   ├── __tests__/
│   │   ├── InvalidTenant.test.tsx
│   │   └── Navigation.simple.test.tsx
│   ├── InvalidTenant.tsx
│   └── Navigation.tsx
└── test/
    └── setup.ts
```

## Test Coverage

The client has comprehensive test coverage including:

### Component Tests (5 tests)
- ✅ **InvalidTenant Component** - Error state rendering
- ✅ **Navigation Component** - Navigation bar and buttons
- ✅ **Material-UI Integration** - Component rendering with MUI
- ✅ **React Router Integration** - Navigation links and routing
- ✅ **Context Integration** - Tenant context usage

## Available Test Commands

- `npm test` - Run tests in watch mode (re-runs on file changes)
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Run tests with coverage report

## Writing Tests

### Basic Component Test

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MyComponent from "../MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

### Testing with Context

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import MyComponent from "../MyComponent";

// Mock context
vi.mock("../contexts/MyContext", () => ({
  useMyContext: () => ({
    value: "test-value",
    setValue: vi.fn(),
  }),
}));

describe("MyComponent", () => {
  it("should render with context", () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText("test-value")).toBeInTheDocument();
  });
});
```

### Testing with Material-UI

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@mui/material";

describe("Material-UI Component", () => {
  it("should render MUI component", () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

## Testing Best Practices

1. **Test Behavior, Not Implementation** - Focus on what the user sees and does
2. **Use Semantic Queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock External Dependencies** - Mock APIs, contexts, and external libraries
4. **Keep Tests Simple** - One test should verify one behavior
5. **Use Descriptive Names** - Test names should explain what they're testing

## Common Patterns

### Mocking React Router
```typescript
import { BrowserRouter } from "react-router-dom";

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};
```

### Mocking Context
```typescript
vi.mock("../contexts/MyContext", () => ({
  useMyContext: () => ({
    value: "mock-value",
    setValue: vi.fn(),
  }),
}));
```

### Mocking External Libraries
```typescript
vi.mock("lodash", () => ({
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));
```

## Troubleshooting

### Common Issues

1. **Theme Errors** - Mock Material-UI theme properly
2. **Router Errors** - Wrap components in `BrowserRouter`
3. **Context Errors** - Mock context providers
4. **Import Errors** - Use proper ES module imports

### Debugging Tests

```typescript
// Use screen.debug() to see rendered HTML
render(<MyComponent />);
screen.debug(); // Prints the DOM structure
```

## Adding New Tests

When adding new components:

1. Create a `__tests__` directory next to your component
2. Create a `.test.tsx` file with the same name as your component
3. Follow the existing test patterns
4. Mock external dependencies
5. Test user interactions and behavior

Example:
```typescript
// src/components/MyComponent/__tests__/MyComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MyComponent from "../MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```
