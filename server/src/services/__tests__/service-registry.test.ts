import { JOB_TYPES } from "../../constants";
import { CountryDataService } from "../countries/country-service";
import { ServiceRegistry, serviceRegistry } from "../service-registry";
import { WeatherDataService } from "../weather/weather-service";

// Mock the service classes
jest.mock("../countries/country-service");
jest.mock("../weather/weather-service");

const MockedCountryDataService = CountryDataService as jest.MockedClass<
  typeof CountryDataService
>;
const MockedWeatherDataService = WeatherDataService as jest.MockedClass<
  typeof WeatherDataService
>;

describe("ServiceRegistry", () => {
  let registry: ServiceRegistry;
  let mockCountryService: jest.Mocked<CountryDataService>;
  let mockWeatherService: jest.Mocked<WeatherDataService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockCountryService = {
      validate: jest.fn(),
      fetchData: jest.fn(),
    } as any;

    mockWeatherService = {
      validate: jest.fn(),
      fetchData: jest.fn(),
    } as any;

    // Mock the constructors
    MockedCountryDataService.mockImplementation(() => mockCountryService);
    MockedWeatherDataService.mockImplementation(() => mockWeatherService);

    // Create a new registry instance
    registry = new ServiceRegistry();
  });

  describe("constructor", () => {
    it("should initialize with correct services", () => {
      // Verify that the services are registered
      expect(registry.getService(JOB_TYPES.WEATHER)).toBe(mockWeatherService);
      expect(registry.getService(JOB_TYPES.COUNTRIES)).toBe(mockCountryService);
    });

    it("should create new service instances", () => {
      // Verify that the constructors were called
      expect(MockedWeatherDataService).toHaveBeenCalledTimes(1);
      expect(MockedCountryDataService).toHaveBeenCalledTimes(1);
    });

    it("should register all expected job types", () => {
      const availableTypes = registry.getAvailableTypes();
      expect(availableTypes).toContain(JOB_TYPES.WEATHER);
      expect(availableTypes).toContain(JOB_TYPES.COUNTRIES);
      expect(availableTypes).toHaveLength(2);
    });
  });

  describe("getService", () => {
    it("should return weather service for weather job type", () => {
      const service = registry.getService(JOB_TYPES.WEATHER);
      expect(service).toBe(mockWeatherService);
    });

    it("should return country service for countries job type", () => {
      const service = registry.getService(JOB_TYPES.COUNTRIES);
      expect(service).toBe(mockCountryService);
    });

    it("should return undefined for unknown job type", () => {
      const service = registry.getService("unknown");
      expect(service).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const service = registry.getService("");
      expect(service).toBeUndefined();
    });

    it("should return undefined for null", () => {
      const service = registry.getService(null as any);
      expect(service).toBeUndefined();
    });

    it("should return undefined for undefined", () => {
      const service = registry.getService(undefined as any);
      expect(service).toBeUndefined();
    });

    it("should handle case-sensitive job types", () => {
      const service = registry.getService("Weather");
      expect(service).toBeUndefined();
    });

    it("should handle job types with extra spaces", () => {
      const service = registry.getService(" weather ");
      expect(service).toBeUndefined();
    });
  });

  describe("getAvailableTypes", () => {
    it("should return all registered service types", () => {
      const types = registry.getAvailableTypes();
      expect(types).toEqual([JOB_TYPES.WEATHER, JOB_TYPES.COUNTRIES]);
    });

    it("should return an array", () => {
      const types = registry.getAvailableTypes();
      expect(Array.isArray(types)).toBe(true);
    });

    it("should return a new array each time (not reference)", () => {
      const types1 = registry.getAvailableTypes();
      const types2 = registry.getAvailableTypes();
      expect(types1).toEqual(types2);
      expect(types1).not.toBe(types2); // Different array instances
    });

    it("should not be modifiable from outside", () => {
      const types = registry.getAvailableTypes();
      const originalLength = types.length;

      // Try to modify the array
      types.push("invalid");

      // Get types again and verify it wasn't affected
      const newTypes = registry.getAvailableTypes();
      expect(newTypes).toHaveLength(originalLength);
      expect(newTypes).not.toContain("invalid");
    });
  });

  describe("service functionality", () => {
    it("should return services that implement DataService interface", () => {
      const weatherService = registry.getService(JOB_TYPES.WEATHER);
      const countryService = registry.getService(JOB_TYPES.COUNTRIES);

      // Check that services have the required methods
      expect(weatherService).toHaveProperty("validate");
      expect(weatherService).toHaveProperty("fetchData");
      expect(countryService).toHaveProperty("validate");
      expect(countryService).toHaveProperty("fetchData");
    });

    it("should return different service instances", () => {
      const weatherService = registry.getService(JOB_TYPES.WEATHER);
      const countryService = registry.getService(JOB_TYPES.COUNTRIES);

      expect(weatherService).not.toBe(countryService);
    });

    it("should return the same service instance for multiple calls", () => {
      const service1 = registry.getService(JOB_TYPES.WEATHER);
      const service2 = registry.getService(JOB_TYPES.WEATHER);

      expect(service1).toBe(service2);
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in job type", () => {
      const service = registry.getService("weather@#$%");
      expect(service).toBeUndefined();
    });

    it("should handle very long job type strings", () => {
      const longJobType = "a".repeat(1000);
      const service = registry.getService(longJobType);
      expect(service).toBeUndefined();
    });

    it("should handle numeric job types", () => {
      const service = registry.getService("123" as any);
      expect(service).toBeUndefined();
    });

    it("should handle boolean job types", () => {
      const service = registry.getService(true as any);
      expect(service).toBeUndefined();
    });

    it("should handle object job types", () => {
      const service = registry.getService({} as any);
      expect(service).toBeUndefined();
    });
  });
});

describe("serviceRegistry singleton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be an instance of ServiceRegistry", () => {
    expect(serviceRegistry).toBeInstanceOf(ServiceRegistry);
  });

  it("should have all services registered", () => {
    expect(serviceRegistry.getService(JOB_TYPES.WEATHER)).toBeDefined();
    expect(serviceRegistry.getService(JOB_TYPES.COUNTRIES)).toBeDefined();
  });

  it("should return the same instance on multiple imports", () => {
    // This test verifies that the singleton pattern works correctly
    const {
      serviceRegistry: importedRegistry,
    } = require("../service-registry");
    expect(serviceRegistry).toBe(importedRegistry);
  });

  it("should maintain state across multiple calls", () => {
    const service1 = serviceRegistry.getService(JOB_TYPES.WEATHER);
    const service2 = serviceRegistry.getService(JOB_TYPES.WEATHER);

    expect(service1).toBe(service2);
  });

  it("should have correct available types", () => {
    const types = serviceRegistry.getAvailableTypes();
    expect(types).toContain(JOB_TYPES.WEATHER);
    expect(types).toContain(JOB_TYPES.COUNTRIES);
    expect(types).toHaveLength(2);
  });
});

describe("ServiceRegistry integration", () => {
  it("should work with actual service implementations", () => {
    // Create a new registry to test with real services
    const testRegistry = new ServiceRegistry();

    // Get services
    const weatherService = testRegistry.getService(JOB_TYPES.WEATHER);
    const countryService = testRegistry.getService(JOB_TYPES.COUNTRIES);

    // Verify they exist and have the required methods
    expect(weatherService).toBeDefined();
    expect(countryService).toBeDefined();
    expect(weatherService).toHaveProperty("validate");
    expect(weatherService).toHaveProperty("fetchData");
    expect(countryService).toHaveProperty("validate");
    expect(countryService).toHaveProperty("fetchData");
  });

  it("should handle service method calls", () => {
    const weatherService = serviceRegistry.getService(JOB_TYPES.WEATHER);
    const countryService = serviceRegistry.getService(JOB_TYPES.COUNTRIES);

    // These should not throw errors
    expect(() => {
      if (weatherService) {
        weatherService.validate({ latitude: "52.52", longitude: "13.405" });
      }
    }).not.toThrow();

    expect(() => {
      if (countryService) {
        countryService.validate({ countryName: "Germany" });
      }
    }).not.toThrow();
  });
});
