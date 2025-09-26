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
│   │   └── Navigation.test.tsx
│   ├── InvalidTenant.tsx
│   └── Navigation.tsx
├── contexts/
│   ├── __tests__/
│   │   └── TenantContext.test.tsx
│   └── TenantContext.tsx
├── pages/
│   ├── request/
│   │   ├── __tests__/
│   │   │   ├── CountryFetcher.test.tsx
│   │   │   └── WeatherFetcher.test.tsx
│   │   ├── CountryFetcher.tsx
│   │   └── WeatherFetcher.tsx
│   └── status/
│       ├── __tests__/
│       │   └── StatusPage.test.tsx
│       └── StatusPage.tsx
└── test/
    └── setup.ts
```

## Test Coverage

The client has comprehensive test coverage including:

### Component Tests (72 tests total)

#### **InvalidTenant Component** (4 tests)
- ✅ Error state rendering and messaging
- ✅ Correct heading level validation
- ✅ Material-UI component integration
- ✅ Tenant button rendering and functionality

#### **Navigation Component** (2 tests)
- ✅ Navigation bar rendering with tenant name
- ✅ Navigation buttons (Request/Status) functionality

#### **CountryFetcher Component** (12 tests)
- ✅ Component rendering with correct title
- ✅ Form elements rendering (date picker, country select, buttons)
- ✅ Form validation (submit button disabled when empty)
- ✅ Form submission with API integration
- ✅ Success/error message handling
- ✅ Loading states during API calls
- ✅ Form clearing functionality
- ✅ Network error handling
- ✅ Form reset after successful submission
- ✅ Button state management during loading

#### **WeatherFetcher Component** (17 tests)
- ✅ Component rendering with correct title
- ✅ Form elements rendering (date picker, city select, coordinate inputs)
- ✅ Form validation and button states
- ✅ Coordinate input validation and ranges
- ✅ City selection with auto-fill coordinates
- ✅ API integration for both coordinate and city-based requests
- ✅ Success/error message handling
- ✅ Loading states during API calls
- ✅ Form clearing and reset functionality
- ✅ Network error handling
- ✅ City dropdown with all available cities
- ✅ Coordinate range validation (-90 to 90 for latitude, -180 to 180 for longitude)

#### **StatusPage Component** (12 tests)
- ✅ Loading state rendering
- ✅ Error state handling for API failures
- ✅ Empty state when no jobs found
- ✅ Jobs table rendering with data
- ✅ Current time display
- ✅ Filter buttons (All, Countries, Weather)
- ✅ Job filtering by type
- ✅ Job details dialog functionality
- ✅ Dialog close functionality
- ✅ Job status color coding (completed, scheduled, failed)
- ✅ Formatted date display
- ✅ Empty state for filtered results

#### **TenantContext Component** (25 tests)
- ✅ Loading state management
- ✅ URL parsing for tenant extraction
- ✅ Invalid tenant handling
- ✅ Valid tenant extraction from various URL formats
- ✅ Case sensitivity handling
- ✅ Special character URL handling
- ✅ Context provider behavior
- ✅ Hook usage outside provider (error handling)
- ✅ URL change handling
- ✅ Edge cases (empty paths, multiple slashes, query parameters, hash fragments)

### Integration Features Tested

- ✅ **Material-UI Integration** - All components with MUI rendering
- ✅ **React Router Integration** - Navigation and routing
- ✅ **Context Integration** - Tenant context usage across components
- ✅ **Form Validation** - Button states, input validation, error handling
- ✅ **API Integration** - Request/response handling, error states, loading states
- ✅ **User Interactions** - Form submissions, loading states, user events
- ✅ **Error Handling** - Network errors, validation errors, edge cases
- ✅ **State Management** - Loading states, form resets, data persistence

## Available Test Commands

- `npm test` - Run tests in watch mode (re-runs on file changes)
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Run tests with coverage report

## Test Categories

### **Component Tests (6 test files)**
- `InvalidTenant.test.tsx` - 4 tests
- `Navigation.test.tsx` - 2 tests  
- `CountryFetcher.test.tsx` - 12 tests
- `WeatherFetcher.test.tsx` - 17 tests
- `StatusPage.test.tsx` - 12 tests
- `TenantContext.test.tsx` - 25 tests

### **Total: 72 tests across 6 test files**

## Test Features

- **Comprehensive Mocking** - Material-UI components, React Router, fetch API
- **User Event Testing** - Form interactions, button clicks, input changes
- **Async Testing** - API calls, loading states, error handling
- **Edge Case Coverage** - Invalid inputs, network errors, empty states
- **Integration Testing** - Context providers, routing, component interactions

