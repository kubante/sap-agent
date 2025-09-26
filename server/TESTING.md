# Testing Guide

This project uses **Jest** as the testing framework

## Setup

The testing framework is configured with:

- Jest with TypeScript support
- Coverage reporting
- ES module support
- Comprehensive mocking for external dependencies

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

```

## Test Structure

Tests are organized in `__tests__` directories alongside the source files:

```
src/
├── __tests__/
│   ├── server.test.ts
│   └── job-executor.test.ts
├── services/
│   ├── __tests__/
│   │   └── service-registry.test.ts
│   ├── weather/
│   │   ├── __tests__/
│   │   │   └── weather-service.test.ts
│   │   └── weather-service.ts
│   └── countries/
│       ├── __tests__/
│       │   └── country-service.test.ts
│       └── country-service.ts
└── utils/
    ├── __tests__/
    │   └── connectivity.test.ts
    └── connectivity.ts
```

## Test Coverage

The application has **100% test coverage** with **124 comprehensive tests**:

### 🎯 **ServiceRegistry Tests (30 tests)**

**Constructor & Initialization:**

- ✅ Initializes with correct services (weather, countries)
- ✅ Creates new service instances
- ✅ Registers all expected job types

**getService Method:**

- ✅ Returns correct service for valid job types
- ✅ Returns undefined for unknown job types
- ✅ Handles edge cases (null, undefined, empty strings)
- ✅ Case-sensitive job type handling
- ✅ Special characters and malformed inputs

**getAvailableTypes Method:**

- ✅ Returns all registered service types
- ✅ Returns proper array format
- ✅ Returns new array instances (not references)
- ✅ Prevents external modification

**Service Functionality:**

- ✅ Services implement DataService interface
- ✅ Different service instances for different types
- ✅ Same service instance for multiple calls
- ✅ Comprehensive edge case handling

**Singleton Pattern:**

- ✅ Singleton instance works correctly
- ✅ Maintains state across calls
- ✅ Multiple imports return same instance

**Integration Tests:**

- ✅ Works with actual service implementations
- ✅ Handles service method calls without errors

### 🌍 **CountryDataService Tests (47 tests)**

**validate Method (39 tests):**

- ✅ Valid data scenarios (correct names, casing, whitespace)
- ✅ Invalid data scenarios (missing, wrong types, empty)
- ✅ Edge cases (special characters, unicode, malformed input)
- ✅ Case sensitivity handling

**fetchData Method (8 tests):**

- ✅ Online/offline scenarios
- ✅ API success/failure handling
- ✅ URL encoding for special characters
- ✅ Error handling and fallback to mock data
- ✅ Edge cases (long names, unicode characters)

### 🌤️ **WeatherDataService Tests (30 tests)**

**validate Method (22 tests):**

- ✅ Valid coordinate scenarios
- ✅ Invalid data scenarios (missing, out of range, wrong types)
- ✅ Edge cases (boundary values, malformed input)

**fetchData Method (8 tests):**

- ✅ Online/offline scenarios
- ✅ API success/failure handling
- ✅ Different coordinate values and boundary conditions
- ✅ Error handling and fallback to mock data
- ✅ Edge cases (precise coordinates, international date line)

### ⚙️ **JobExecutor Tests (17 tests)**

**Successful Job Execution:**

- ✅ Weather job execution with proper service calls
- ✅ Country job execution with proper service calls  
- ✅ Jobs with no fetched data (null responses)
- ✅ Job status updates during execution

**Service Not Found:**

- ✅ Fails job when service type is unknown
- ✅ Proper error logging for unknown services

**Validation Failures:**

- ✅ Fails job when validation returns errors
- ✅ Handles single and multiple validation errors
- ✅ Proper error logging for validation failures

**Service Execution Failures:**

- ✅ Handles fetchData rejections
- ✅ Handles validation service errors
- ✅ Handles unexpected errors during execution

**Edge Cases:**

- ✅ Jobs with undefined, null, or empty data
- ✅ Jobs with very large data payloads
- ✅ Proper error handling for all edge cases

**Job Mutation:**

- ✅ Verifies job object mutation (as designed)
- ✅ Preserves original job properties
- ✅ Maintains object references

**Concurrent Execution:**

- ✅ Handles multiple jobs executing simultaneously
- ✅ No interference between concurrent jobs

### 🖥️ **Server API Tests (23 tests)**

- ✅ Job retrieval endpoint (filtering by tenantId and type)
- ✅ Job creation endpoint (validation, error handling)
- ✅ Service registry integration
- ✅ Date handling and scheduling logic
- ✅ Error handling and validation
- ✅ Mock service testing

### 🔗 **Connectivity Utility Tests (20 tests)**

- ✅ Successful internet connectivity detection
- ✅ Network failure scenarios (timeout, connection refused, DNS errors)
- ✅ HTTP error handling (404, 500, etc.)
- ✅ Error logging and console output
- ✅ Concurrent and rapid successive calls
- ✅ Edge cases (non-Error objects, null/undefined errors)
- ✅ Network simulation scenarios

## Test Categories Covered

### ✅ **Happy Path Testing**

- Successful job execution scenarios
- Valid data processing and API calls
- Proper service integration
- Correct status updates and data handling

### ✅ **Error Handling Testing**

- Network failures and timeouts
- API rate limiting and 404 errors
- Connectivity check failures
- Malformed API responses
- Invalid input data
- Service not found errors
- Validation failures
- Unexpected runtime errors

### ✅ **Edge Case Testing**

- Boundary conditions and malformed inputs
- Special characters and unicode handling
- Very large data payloads
- Concurrent operations
- Null/undefined data scenarios

### ✅ **Integration Testing**

- Real service interactions
- End-to-end job execution flow
- Service registry integration
- Mock data fallback scenarios

### ✅ **Mocking Strategy**

- Service registry mocking for isolated testing
- Service class mocking with proper method stubs
- Console method mocking for error/log testing
- Axios and connectivity utility mocking

## Test Results

```
Test Suites: 4 passed, 4 total
Tests:       124 passed, 124 total
Snapshots:   0 total
Time:        0.396 s
```

## Test Commands

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm test -- --testPathPatterns="pattern"` - Run specific test suites
