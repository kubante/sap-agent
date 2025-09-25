# Testing the Agnostic Job System

## Overview
The system now supports both weather and country services through a unified interface. The `executeJob` function is completely agnostic and automatically selects the appropriate service based on the job type.

## How it works

1. **Service Registry**: A central registry maps job types to their corresponding services
2. **Common Interface**: Both services implement the same `DataService` interface with `validate()` and `fetchData()` methods
3. **Agnostic Execution**: The `executeJob` function uses the service registry to get the right service and calls the same methods regardless of type

## Example API Calls

### Weather Job
```bash
curl -X POST http://localhost:3000/api/job \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weather Check",
    "scheduledDate": "2024-01-01T10:00:00Z",
    "type": "weather",
    "tenantId": "tenant1",
    "data": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

### Country Job
```bash
curl -X POST http://localhost:3000/api/job \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Country Info",
    "scheduledDate": "2024-01-01T10:00:00Z",
    "type": "countries",
    "tenantId": "tenant1",
    "data": {
      "countryName": "United States"
    }
  }'
```

## Benefits

1. **Extensibility**: Adding new services only requires:
   - Creating a new service class implementing `DataService`
   - Registering it in the service registry
   - No changes to `executeJob` function

2. **Consistency**: All services follow the same pattern for validation and data fetching

3. **Type Safety**: TypeScript ensures proper implementation of the interface

4. **Maintainability**: Single point of control for job execution logic
