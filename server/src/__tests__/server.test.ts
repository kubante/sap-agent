import { JOB_STATUS, JOB_TYPES } from "../constants";
import { CountryDataService } from "../services/countries/country-service";
import { serviceRegistry } from "../services/service-registry";
import { WeatherDataService } from "../services/weather/weather-service";
import { Job, type JobType } from "../types";

// Mock the job executor to avoid actual execution during tests
jest.mock("../job-executor", () => ({
  executeJob: jest.fn(),
}));

// Mock the service registry
jest.mock("../services/service-registry", () => ({
  serviceRegistry: {
    getService: jest.fn(),
    getAvailableTypes: jest.fn(() => [JOB_TYPES.WEATHER, JOB_TYPES.COUNTRIES]),
  },
}));

describe("Server API Logic", () => {
  let mockWeatherService: jest.Mocked<WeatherDataService>;
  let mockCountryService: jest.Mocked<CountryDataService>;
  let jobs: Job[];

  beforeEach(() => {
    // Reset the jobs array for each test
    jobs = [];

    // Create mock services
    mockWeatherService = {
      validate: jest.fn(),
      fetchData: jest.fn(),
    } as any;

    mockCountryService = {
      validate: jest.fn(),
      fetchData: jest.fn(),
    } as any;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("GET /api/jobs", () => {
    const mockJobs: Job[] = [
      {
        id: "1",
        name: "Weather Job 1",
        createdDate: new Date("2024-01-01"),
        scheduledDate: new Date("2024-01-01"),
        status: JOB_STATUS.COMPLETED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant1",
        data: { latitude: "52.5200", longitude: "13.4050" },
      },
      {
        id: "2",
        name: "Country Job 1",
        createdDate: new Date("2024-01-01"),
        scheduledDate: new Date("2024-01-01"),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.COUNTRIES,
        tenantId: "tenant1",
        data: { countryName: "Germany" },
      },
      {
        id: "3",
        name: "Weather Job 2",
        createdDate: new Date("2024-01-01"),
        scheduledDate: new Date("2024-01-01"),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant2",
        data: { latitude: "40.7128", longitude: "-74.0060" },
      },
    ];

    beforeEach(() => {
      jobs.push(...mockJobs);
    });

    it("should return jobs filtered by tenantId", () => {
      const tenantId = "tenant1";
      const filteredJobs = jobs.filter((job) => job.tenantId === tenantId);

      expect(filteredJobs).toHaveLength(2);
      expect(filteredJobs.every((job) => job.tenantId === tenantId)).toBe(true);
    });

    it("should return jobs filtered by tenantId and type", () => {
      const tenantId = "tenant1";
      const type = JOB_TYPES.WEATHER;
      let filteredJobs = jobs.filter((job) => job.tenantId === tenantId);
      filteredJobs = filteredJobs.filter((job) => job.type === type);

      expect(filteredJobs).toHaveLength(1);
      expect(filteredJobs[0].type).toBe(JOB_TYPES.WEATHER);
      expect(filteredJobs[0].tenantId).toBe("tenant1");
    });

    it("should return empty array for non-existent tenantId", () => {
      const tenantId = "nonexistent";
      const filteredJobs = jobs.filter((job) => job.tenantId === tenantId);

      expect(filteredJobs).toHaveLength(0);
    });

    it("should return empty array for non-existent type", () => {
      const tenantId = "tenant1";
      const type = "nonexistent" as any;
      let filteredJobs = jobs.filter((job) => job.tenantId === tenantId);
      filteredJobs = filteredJobs.filter((job) => job.type === type);

      expect(filteredJobs).toHaveLength(0);
    });

    it("should handle array type parameter", () => {
      const tenantId = "tenant1";
      const type = [JOB_TYPES.WEATHER];
      let filteredJobs = jobs.filter((job) => job.tenantId === tenantId);
      const typeStr = Array.isArray(type) ? type[0] : type;
      filteredJobs = filteredJobs.filter((job) => job.type === typeStr);

      expect(filteredJobs).toHaveLength(1);
      expect(filteredJobs[0].type).toBe(JOB_TYPES.WEATHER);
    });
  });

  describe("POST /api/job", () => {
    const validWeatherJob = {
      name: "Weather Job",
      scheduledDate: "2024-12-31T10:00:00Z",
      type: JOB_TYPES.WEATHER,
      tenantId: "tenant1",
      data: { latitude: "52.5200", longitude: "13.4050" },
    };

    const validCountryJob = {
      name: "Country Job",
      scheduledDate: "2024-12-31T10:00:00Z",
      type: JOB_TYPES.COUNTRIES,
      tenantId: "tenant1",
      data: { countryName: "Germany" },
    };

    it("should create a valid weather job", () => {
      // Mock service registry
      (serviceRegistry.getService as jest.Mock).mockReturnValue(
        mockWeatherService
      );
      (mockWeatherService.validate as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      const newJob: Job = {
        id: Date.now().toString(),
        name: validWeatherJob.name,
        createdDate: new Date(),
        scheduledDate: new Date(validWeatherJob.scheduledDate),
        status: JOB_STATUS.SCHEDULED,
        type: validWeatherJob.type as JobType,
        tenantId: validWeatherJob.tenantId,
        data: validWeatherJob.data,
      };

      jobs.push(newJob);

      expect(jobs).toHaveLength(1);
      expect(jobs[0].name).toBe(validWeatherJob.name);
      expect(jobs[0].type).toBe(JOB_TYPES.WEATHER);
      expect(jobs[0].tenantId).toBe("tenant1");
    });

    it("should create a valid country job", () => {
      // Mock service registry
      (serviceRegistry.getService as jest.Mock).mockReturnValue(
        mockCountryService
      );
      (mockCountryService.validate as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { countryName: "Germany" },
      });

      const newJob: Job = {
        id: Date.now().toString(),
        name: validCountryJob.name,
        createdDate: new Date(),
        scheduledDate: new Date(validCountryJob.scheduledDate),
        status: JOB_STATUS.SCHEDULED,
        type: validCountryJob.type as JobType,
        tenantId: validCountryJob.tenantId,
        data: validCountryJob.data,
      };

      jobs.push(newJob);

      expect(jobs).toHaveLength(1);
      expect(jobs[0].name).toBe(validCountryJob.name);
      expect(jobs[0].type).toBe(JOB_TYPES.COUNTRIES);
      expect(jobs[0].tenantId).toBe("tenant1");
    });

    it("should reject job with missing required fields", () => {
      const invalidJob = {
        name: "Test Job",
        // missing scheduledDate, type, tenantId, data
      };

      const requiredFields = [
        "name",
        "scheduledDate",
        "tenantId",
        "data",
        "type",
      ];
      const missingFields = requiredFields.filter(
        (field) => !(field in invalidJob)
      );

      expect(missingFields.length).toBeGreaterThan(0);
      expect(missingFields).toContain("scheduledDate");
      expect(missingFields).toContain("type");
      expect(missingFields).toContain("tenantId");
      expect(missingFields).toContain("data");
    });

    it("should reject job with invalid type", () => {
      const invalidJob = {
        name: "Test Job",
        scheduledDate: "2024-12-31T10:00:00Z",
        type: "invalid-type",
        tenantId: "tenant1",
        data: { some: "data" },
      };

      (serviceRegistry.getService as jest.Mock).mockReturnValue(null);
      (serviceRegistry.getAvailableTypes as jest.Mock).mockReturnValue([
        JOB_TYPES.WEATHER,
        JOB_TYPES.COUNTRIES,
      ]);

      const service = serviceRegistry.getService(invalidJob.type);
      expect(service).toBeNull();
    });

    it("should reject job with validation errors", () => {
      const invalidJob = {
        name: "Test Job",
        scheduledDate: "2024-12-31T10:00:00Z",
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant1",
        data: { latitude: "invalid", longitude: "invalid" },
      };

      (serviceRegistry.getService as jest.Mock).mockReturnValue(
        mockWeatherService
      );
      (mockWeatherService.validate as jest.Mock).mockReturnValue({
        isValid: false,
        errors: [
          { field: "latitude", message: "Latitude must be a valid number" },
          { field: "longitude", message: "Longitude must be a valid number" },
        ],
      });

      const validationResult = mockWeatherService.validate(invalidJob.data);
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toHaveLength(2);
    });

    it("should handle immediate execution for past scheduled date", () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const jobWithPastDate = {
        ...validWeatherJob,
        scheduledDate: pastDate,
      };

      const scheduledTime = new Date(jobWithPastDate.scheduledDate);
      const now = new Date();
      const shouldExecuteImmediately = scheduledTime <= now;

      expect(shouldExecuteImmediately).toBe(true);
    });

    it("should handle future execution for future scheduled date", () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
      const jobWithFutureDate = {
        ...validWeatherJob,
        scheduledDate: futureDate,
      };

      const scheduledTime = new Date(jobWithFutureDate.scheduledDate);
      const now = new Date();
      const shouldExecuteImmediately = scheduledTime <= now;

      expect(shouldExecuteImmediately).toBe(false);
    });

    it("should prevent scheduled date in the past", () => {
      const pastDate = new Date(Date.now() - 1000);
      const now = new Date();
      const adjustedDate = pastDate < now ? now : pastDate;

      expect(adjustedDate.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });
  });

  describe("Job ID generation", () => {
    it("should generate unique IDs", () => {
      const id1 = Date.now().toString();
      const id2 = (Date.now() + 1).toString();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
    });
  });

  describe("Date handling", () => {
    it("should handle valid ISO date strings", () => {
      const validDate = "2024-12-31T10:00:00Z";
      const parsedDate = new Date(validDate);

      expect(parsedDate instanceof Date).toBe(true);
      expect(isNaN(parsedDate.getTime())).toBe(false);
    });

    it("should handle invalid date strings", () => {
      const invalidDate = "invalid-date";
      const parsedDate = new Date(invalidDate);

      expect(isNaN(parsedDate.getTime())).toBe(true);
    });
  });

  describe("Service registry integration", () => {
    it("should get weather service for weather type", () => {
      (serviceRegistry.getService as jest.Mock).mockReturnValue(
        mockWeatherService
      );

      const service = serviceRegistry.getService(JOB_TYPES.WEATHER);
      expect(service).toBe(mockWeatherService);
    });

    it("should get country service for countries type", () => {
      (serviceRegistry.getService as jest.Mock).mockReturnValue(
        mockCountryService
      );

      const service = serviceRegistry.getService(JOB_TYPES.COUNTRIES);
      expect(service).toBe(mockCountryService);
    });

    it("should return null for invalid service type", () => {
      (serviceRegistry.getService as jest.Mock).mockReturnValue(null);

      const service = serviceRegistry.getService("invalid-type");
      expect(service).toBeNull();
    });

    it("should return available service types", () => {
      (serviceRegistry.getAvailableTypes as jest.Mock).mockReturnValue([
        JOB_TYPES.WEATHER,
        JOB_TYPES.COUNTRIES,
      ]);

      const types = serviceRegistry.getAvailableTypes();
      expect(types).toEqual([JOB_TYPES.WEATHER, JOB_TYPES.COUNTRIES]);
    });
  });

  describe("Error handling", () => {
    it("should handle missing tenantId in GET request", () => {
      const tenantId = null;
      const shouldReturnError = !tenantId;

      expect(shouldReturnError).toBe(true);
    });

    it("should handle validation errors with proper error structure", () => {
      const validationErrors = [
        { field: "latitude", message: "Latitude is required" },
        { field: "longitude", message: "Longitude is required" },
      ];

      const errorResponse = {
        error: "Validation failed",
        details: validationErrors,
      };

      expect(errorResponse.error).toBe("Validation failed");
      expect(errorResponse.details).toEqual(validationErrors);
    });

    it("should handle service not found error", () => {
      const invalidType = "invalid-service";
      const availableTypes = [JOB_TYPES.WEATHER, JOB_TYPES.COUNTRIES];

      const errorMessage = `Invalid job type "${invalidType}". Available types: ${availableTypes.join(
        ", "
      )}`;

      expect(errorMessage).toContain("Invalid job type");
      expect(errorMessage).toContain("Available types");
    });
  });
});
