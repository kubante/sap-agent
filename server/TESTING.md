# Testing Guide

This project uses **Jest** as the testing framework for validating the service functions.

## Setup

The testing framework is already configured with:
- Jest with TypeScript support
- Coverage reporting
- ES module support

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
├── services/
│   ├── weather/
│   │   ├── __tests__/
│   │   │   └── weather-service.test.ts
│   │   └── weather-service.ts
│   └── countries/
│       ├── __tests__/
│       │   └── country-service.test.ts
│       └── country-service.ts
```

## Test Coverage

The validation functions have comprehensive test coverage including:

### WeatherDataService Tests
- ✅ Valid coordinate validation (various formats, boundary values)
- ✅ Invalid data rejection (missing fields, wrong types, out-of-range values)
- ✅ Edge cases (null, undefined, empty strings)
- ✅ Multiple validation errors

### CountryDataService Tests
- ✅ Valid country name validation (case insensitive, whitespace handling)
- ✅ Invalid data rejection (missing fields, wrong types, invalid countries)
- ✅ Edge cases (null, undefined, empty strings, special characters)
- ✅ Case sensitivity testing

## Test Commands

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Adding New Tests

When adding new validation functions or services:

1. Create a `__tests__` directory next to your service file
2. Create a `.test.ts` file with the same name as your service
3. Follow the existing test patterns:
   - Group tests by functionality (`describe` blocks)
   - Test valid cases first, then invalid cases
   - Include edge cases and error conditions
   - Use descriptive test names

Example test structure:
```typescript
describe('YourService', () => {
  describe('validate', () => {
    describe('valid data', () => {
      it('should validate correct input', () => {
        // Test valid cases
      });
    });

    describe('invalid data', () => {
      it('should reject invalid input', () => {
        // Test invalid cases
      });
    });
  });
});
```
