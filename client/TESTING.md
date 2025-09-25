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

### Component Tests (36 tests)

- ✅ **InvalidTenant Component** (3 tests) - Error state rendering
- ✅ **Navigation Component** (2 tests) - Navigation bar and buttons
- ✅ **CountryFetcher Component** (12 tests) - Form validation, API calls, user interactions
- ✅ **WeatherFetcher Component** (13 tests) - Coordinate validation, city selection, API calls
- ✅ **Material-UI Integration** - Component rendering with MUI
- ✅ **React Router Integration** - Navigation links and routing
- ✅ **Context Integration** - Tenant context usage
- ✅ **Form Validation** - Button states, input validation
- ✅ **API Integration** - Request/response handling, error states
- ✅ **User Interactions** - Form submissions, loading states

## Available Test Commands

- `npm test` - Run tests in watch mode (re-runs on file changes)
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Run tests with coverage report

