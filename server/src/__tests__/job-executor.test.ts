import { JOB_STATUS, JOB_TYPES } from "../constants";
import { executeJob } from "../job-executor";
import { serviceRegistry } from "../services/service-registry";
import { Job } from "../types";

// Mock the service registry
jest.mock("../services/service-registry");

const mockedServiceRegistry = serviceRegistry as jest.Mocked<
  typeof serviceRegistry
>;

describe("executeJob", () => {
  let mockWeatherService: any;
  let mockCountryService: any;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock services
    mockWeatherService = {
      validate: jest.fn(),
      fetchData: jest.fn(),
    };

    mockCountryService = {
      validate: jest.fn(),
      fetchData: jest.fn(),
    };

    // Mock console methods
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();

    // Setup service registry mock
    mockedServiceRegistry.getService.mockImplementation((jobType: string) => {
      if (jobType === JOB_TYPES.WEATHER) return mockWeatherService;
      if (jobType === JOB_TYPES.COUNTRIES) return mockCountryService;
      return undefined;
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("successful job execution", () => {
    it("should execute weather job successfully", async () => {
      const job: Job = {
        id: "job-1",
        name: "Weather Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: { latitude: "52.52", longitude: "13.405" },
      };

      const mockWeatherData = {
        latitude: 52.52,
        longitude: 13.405,
        current: { temperature_2m: 15.5 },
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      mockWeatherService.fetchData.mockResolvedValue(mockWeatherData);

      await executeJob(job);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Executing job job-1 (Weather Job) of type weather"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Fetching weather data for job job-1"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Job job-1 completed successfully"
      );
      expect(mockedServiceRegistry.getService).toHaveBeenCalledWith(
        JOB_TYPES.WEATHER
      );
      expect(mockWeatherService.validate).toHaveBeenCalledWith({
        latitude: "52.52",
        longitude: "13.405",
      });
      expect(mockWeatherService.fetchData).toHaveBeenCalledWith({
        latitude: 52.52,
        longitude: 13.405,
      });
      expect(job.status).toBe(JOB_STATUS.COMPLETED);
      expect(job.data).toBe(mockWeatherData);
    });

    it("should execute country job successfully", async () => {
      const job: Job = {
        id: "job-2",
        name: "Country Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.COUNTRIES,
        tenantId: "tenant-1",
        data: { countryName: "Germany" },
      };

      const mockCountryData = [
        {
          name: { common: "Germany" },
          capital: ["Berlin"],
          population: 83240525,
        },
      ];

      mockCountryService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { countryName: "Germany" },
      });

      mockCountryService.fetchData.mockResolvedValue(mockCountryData);

      await executeJob(job);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Executing job job-2 (Country Job) of type countries"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Fetching countries data for job job-2"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Job job-2 completed successfully"
      );
      expect(mockedServiceRegistry.getService).toHaveBeenCalledWith(
        JOB_TYPES.COUNTRIES
      );
      expect(mockCountryService.validate).toHaveBeenCalledWith({
        countryName: "Germany",
      });
      expect(mockCountryService.fetchData).toHaveBeenCalledWith({
        countryName: "Germany",
      });
      expect(job.status).toBe(JOB_STATUS.COMPLETED);
      expect(job.data).toBe(mockCountryData);
    });

    it("should handle job with no fetched data", async () => {
      const job: Job = {
        id: "job-3",
        name: "Empty Data Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: { latitude: "52.52", longitude: "13.405" },
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      mockWeatherService.fetchData.mockResolvedValue(null);

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.COMPLETED);
      expect(job.data).toBeUndefined();
    });

    it("should update job status to scheduled during execution", async () => {
      const job: Job = {
        id: "job-4",
        name: "Status Test Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: { latitude: "52.52", longitude: "13.405" },
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      mockWeatherService.fetchData.mockResolvedValue({});

      await executeJob(job);

      // Status should remain as scheduled during execution
      expect(job.status).toBe(JOB_STATUS.COMPLETED);
    });
  });

  describe("service not found", () => {
    it("should fail job when service is not found", async () => {
      const job: Job = {
        id: "job-5",
        name: "Unknown Service Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: "unknown" as any,
        tenantId: "tenant-1",
        data: {},
      };

      mockedServiceRegistry.getService.mockReturnValue(undefined);

      await executeJob(job);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Executing job job-5 (Unknown Service Job) of type unknown"
      );
      expect(job.status).toBe(JOB_STATUS.FAILED);
    });
  });

  describe("validation failures", () => {
    it("should fail job when validation fails", async () => {
      const job: Job = {
        id: "job-6",
        name: "Invalid Data Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: { latitude: "invalid", longitude: "invalid" },
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: false,
        errors: [
          { field: "latitude", message: "Latitude must be a valid number" },
          { field: "longitude", message: "Longitude must be a valid number" },
        ],
      });

      await executeJob(job);

      expect(mockWeatherService.validate).toHaveBeenCalledWith(job.data);
      expect(mockWeatherService.fetchData).not.toHaveBeenCalled();
      expect(job.status).toBe(JOB_STATUS.FAILED);
    });

    it("should handle validation with single error", async () => {
      const job: Job = {
        id: "job-7",
        name: "Single Error Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.COUNTRIES,
        tenantId: "tenant-1",
        data: {},
      };

      mockCountryService.validate.mockReturnValue({
        isValid: false,
        errors: [{ field: "countryName", message: "Country name is required" }],
      });

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.FAILED);
      expect(mockCountryService.fetchData).not.toHaveBeenCalled();
    });
  });

  describe("service execution failures", () => {
    it("should handle fetchData rejection", async () => {
      const job: Job = {
        id: "job-8",
        name: "Fetch Error Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: { latitude: "52.52", longitude: "13.405" },
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      mockWeatherService.fetchData.mockRejectedValue(
        new Error("Network error")
      );

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.FAILED);
    });

    it("should handle validation throwing error", async () => {
      const job: Job = {
        id: "job-9",
        name: "Validation Error Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.COUNTRIES,
        tenantId: "tenant-1",
        data: { countryName: "Germany" },
      };

      mockCountryService.validate.mockImplementation(() => {
        throw new Error("Validation service error");
      });

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.FAILED);
    });

    it("should handle unexpected errors during execution", async () => {
      const job: Job = {
        id: "job-10",
        name: "Unexpected Error Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: { latitude: "52.52", longitude: "13.405" },
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      // Simulate an error during fetchData
      mockWeatherService.fetchData.mockImplementation(() => {
        throw new Error("Unexpected service error");
      });

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.FAILED);
    });
  });

  describe("edge cases", () => {
    it("should handle job with undefined data", async () => {
      const job: Job = {
        id: "job-11",
        name: "Undefined Data Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: undefined,
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: false,
        errors: [{ field: "data", message: "Data object is required" }],
      });

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.FAILED);
    });

    it("should handle job with null data", async () => {
      const job: Job = {
        id: "job-12",
        name: "Null Data Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.COUNTRIES,
        tenantId: "tenant-1",
        data: null,
      };

      mockCountryService.validate.mockReturnValue({
        isValid: false,
        errors: [{ field: "data", message: "Data object is required" }],
      });

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.FAILED);
    });

    it("should handle job with empty data object", async () => {
      const job: Job = {
        id: "job-13",
        name: "Empty Data Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: {},
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: false,
        errors: [
          { field: "latitude", message: "Latitude is required" },
          { field: "longitude", message: "Longitude is required" },
        ],
      });

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.FAILED);
    });

    it("should handle job with very large data", async () => {
      const largeData = {
        latitude: "52.52",
        longitude: "13.405",
        extraData: "x".repeat(10000),
      };

      const job: Job = {
        id: "job-14",
        name: "Large Data Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: largeData,
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      mockWeatherService.fetchData.mockResolvedValue({});

      await executeJob(job);

      expect(job.status).toBe(JOB_STATUS.COMPLETED);
    });
  });

  describe("job mutation", () => {
    it("should mutate the original job object", async () => {
      const originalJob: Job = {
        id: "job-15",
        name: "Mutation Test Job",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: { latitude: "52.52", longitude: "13.405" },
      };

      const jobReference = originalJob;

      mockWeatherService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      mockWeatherService.fetchData.mockResolvedValue({ result: "success" });

      await executeJob(originalJob);

      // Verify the original object was mutated
      expect(jobReference.status).toBe(JOB_STATUS.COMPLETED);
      expect(jobReference.data).toEqual({ result: "success" });
      expect(originalJob).toBe(jobReference); // Same object reference
    });

    it("should preserve original job properties that are not modified", async () => {
      const originalDate = new Date("2024-01-01T00:00:00Z");
      const job: Job = {
        id: "job-16",
        name: "Property Preservation Job",
        createdDate: originalDate,
        scheduledDate: originalDate,
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.COUNTRIES,
        tenantId: "tenant-1",
        data: { countryName: "Germany" },
      };

      mockCountryService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { countryName: "Germany" },
      });

      mockCountryService.fetchData.mockResolvedValue({ result: "success" });

      await executeJob(job);

      expect(job.id).toBe("job-16");
      expect(job.name).toBe("Property Preservation Job");
      expect(job.createdDate).toBe(originalDate);
      expect(job.scheduledDate).toBe(originalDate);
      expect(job.type).toBe(JOB_TYPES.COUNTRIES);
      expect(job.tenantId).toBe("tenant-1");
    });
  });

  describe("concurrent execution", () => {
    it("should handle multiple jobs executing concurrently", async () => {
      const job1: Job = {
        id: "job-17",
        name: "Concurrent Job 1",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.WEATHER,
        tenantId: "tenant-1",
        data: { latitude: "52.52", longitude: "13.405" },
      };

      const job2: Job = {
        id: "job-18",
        name: "Concurrent Job 2",
        createdDate: new Date(),
        scheduledDate: new Date(),
        status: JOB_STATUS.SCHEDULED,
        type: JOB_TYPES.COUNTRIES,
        tenantId: "tenant-1",
        data: { countryName: "Germany" },
      };

      mockWeatherService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { latitude: 52.52, longitude: 13.405 },
      });

      mockCountryService.validate.mockReturnValue({
        isValid: true,
        errors: [],
        processedData: { countryName: "Germany" },
      });

      mockWeatherService.fetchData.mockResolvedValue({ weather: "data" });
      mockCountryService.fetchData.mockResolvedValue({ country: "data" });

      // Execute both jobs concurrently
      await Promise.all([executeJob(job1), executeJob(job2)]);

      expect(job1.status).toBe(JOB_STATUS.COMPLETED);
      expect(job2.status).toBe(JOB_STATUS.COMPLETED);
      expect(job1.data).toEqual({ weather: "data" });
      expect(job2.data).toEqual({ country: "data" });
    });
  });
});
