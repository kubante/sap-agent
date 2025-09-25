# SAP Travel Agent

A travel agent application that delivers information about countries and weather at given locations. The system can schedule weather predictions and country data fetching for future use, acting as an intelligent agent that manages different job types across multiple tenants.

## 🎯 What the App Does

This travel agent application provides:

- **Weather Information**: Get current weather data for specific coordinates or cities
- **Country Information**: Retrieve detailed country data including population, capital, languages, and more
- **Job Scheduling**: Schedule future weather predictions and country data fetching
- **Multi-tenant Support**: Serve different tenants (filip, abdullah, jacob) with isolated data
- **Offline Capability**: Graceful fallback to mock data when internet connectivity is unavailable

## 🛠️ Technologies Used

### Frontend
- **React 19** with TypeScript
- **Material-UI (MUI)** for modern, responsive UI components
- **React Router** for client-side routing
- **TanStack React Query** for efficient data fetching and caching
- **Vite** as the build tool and development server
- **Vitest** for testing with React Testing Library

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Axios** for HTTP requests to external APIs
- **Jest** for comprehensive testing

### Testing
- **Client**: Vitest + React Testing Library + JSDOM (36 tests)
- **Server**: Jest + TypeScript (91 tests total)
- **Coverage**: Both client and server have comprehensive test coverage

## 🚀 How to Serve the Apps

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Client Setup
```bash
cd client
npm install
npm run dev
```
The client will be available at `http://localhost:5173`

### Server Setup
```bash
cd server
npm install
npm run dev
```
The server will be available at `http://localhost:3000`

### Production Build
```bash
# Client
cd client
npm run build
npm run preview

# Server
cd server
npm start
```

## 🧪 How to Test

### Client Testing
Refer to [client/TESTING.md](client/TESTING.md) for detailed testing instructions:

```bash
cd client
npm test                    # Run tests in watch mode
npm run test:run           # Run tests once
npm run test:coverage      # Run tests with coverage
```

**Test Coverage**: 36 tests covering components, API integration, form validation, and user interactions.

### Server Testing
Refer to [server/TESTING.md](server/TESTING.md) for detailed testing instructions:

```bash
cd server
npm test                   # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
```

**Test Coverage**: 91 tests covering API endpoints, service validation, connectivity utilities, and error handling.

## 🤖 Agent Architecture

The server acts as an intelligent agent that:

### Job Management
- **Tracks Two Job Types**: Weather and Country data fetching
- **Supports Three Tenants**: filip, abdullah, and jacob (hardcoded in frontend via URL paths)
- **Agnostic Execution**: Uses a service registry to automatically route jobs to appropriate services
- **Real-time Updates**: Frontend polls for job status updates

### Service Registry Pattern
The agent uses a service registry pattern where:
- Each service implements a common `DataService` interface
- Services are registered by type (weather, countries)
- The `executeJob` function is completely agnostic and automatically selects the right service
- New services can be added without modifying existing code

### API Endpoints
- `POST /api/job` - Create new jobs
- `GET /api/jobs/:tenantId` - Get jobs for a specific tenant
- `GET /api/jobs/:tenantId/:type` - Get jobs filtered by type

## 🌐 Frontend Integration

The agent can work with any frontend that respects the POST endpoints model:

### Required API Contract
```typescript
// Job creation
POST /api/job
{
  "name": string,
  "scheduledDate": string,
  "type": "weather" | "countries",
  "tenantId": string,
  "data": object
}

// Job retrieval
GET /api/jobs/:tenantId
GET /api/jobs/:tenantId/:type
```

### Real-time Updates
The frontend polls the server for job status updates, making it compatible with any HTTP client.

## 🔧 Adding New Services

To add new services, follow the instructions in [server/test-agnostic-system.md](server/test-agnostic-system.md):

1. **Create Service Class**: Implement the `DataService` interface
2. **Register Service**: Add to the service registry
3. **No Code Changes**: The `executeJob` function automatically handles new services

### Example Service Structure
```typescript
class NewDataService implements DataService {
  validate(data: any): ValidationResult { /* validation logic */ }
  fetchData(data: any): Promise<any> { /* data fetching logic */ }
}
```

## 📋 Assumptions & Design Decisions

### Multi-tenancy
- **URL-based Tenants**: Uses URL paths (`/filip`, `/abdullah`, `/jacob`) instead of subdomains or authentication
- **Simplified for Demo**: Chosen for coding challenge simplicity over production-ready authentication

### Persistence
- **In-Memory Storage**: Jobs are stored in memory and deleted when server restarts
- **No Database**: Chosen for simplicity and demo purposes
- **Stateless Design**: Each server restart starts with a clean slate

### Offline Usage
- **Connectivity Utility**: Checks internet connection before making external API calls
- **Mock Data Fallback**: Returns mock data when offline or when external services fail
- **Graceful Degradation**: Application remains functional even without internet

### API Keys
- **No Environment Variables**: Both weather and country APIs work without API keys
- **Public APIs**: Uses free, public APIs that don't require authentication
- **Zero Configuration**: No `.env` file needed for basic functionality

### Messaging Protocol
- **HTTP Polling**: Frontend polls server for real-time updates
- **Simple Implementation**: Chosen over WebSockets for simplicity
- **Stateless Communication**: Each request is independent

## 📁 Project Structure

```
sap-agent/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── __tests__/      # Client tests
│   └── TESTING.md          # Client testing guide
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── __tests__/      # Server tests
│   └── TESTING.md          # Server testing guide
└── README.md              # This file
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies for both client and server
3. Start both applications
4. Visit `http://localhost:5173` to access the application
5. Navigate to different tenant paths to see multi-tenant functionality

## 📚 Additional Documentation

- [Client Testing Guide](client/TESTING.md) - Comprehensive testing instructions for the frontend
- [Server Testing Guide](server/TESTING.md) - Testing instructions for the backend
- [Agnostic System Guide](server/test-agnostic-system.md) - How to add new services to the agent

## 🤝 Contributing

When adding new features:
1. Follow the existing service registry pattern
2. Add comprehensive tests
3. Update documentation
4. Ensure offline functionality is maintained
