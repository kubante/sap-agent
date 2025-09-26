import axios from "axios";
import { BERLIN_WEATHER_MOCK_DATA } from "../../../mocks/weather-mock-data";
import { checkInternetConnectivity } from "../../../utils/connectivity";
import { WeatherDataService } from "../weather-service";

// Mock dependencies
jest.mock("axios");
jest.mock("../../../utils/connectivity");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCheckInternetConnectivity =
  checkInternetConnectivity as jest.MockedFunction<
    typeof checkInternetConnectivity
  >;

describe("WeatherDataService", () => {
  let weatherService: WeatherDataService;

  beforeEach(() => {
    weatherService = new WeatherDataService();
    jest.clearAllMocks();
  });

  describe("validate", () => {
    describe("valid data", () => {
      it("should validate correct latitude and longitude", () => {
        const validData = {
          latitude: "52.5200",
          longitude: "13.4050",
        };

        const result = weatherService.validate(validData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.processedData).toEqual({
          latitude: 52.52,
          longitude: 13.405,
        });
      });

      it("should validate integer coordinates", () => {
        const validData = {
          latitude: "0",
          longitude: "0",
        };

        const result = weatherService.validate(validData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.processedData).toEqual({
          latitude: 0,
          longitude: 0,
        });
      });

      it("should validate negative coordinates", () => {
        const validData = {
          latitude: "-33.9249",
          longitude: "18.4241",
        };

        const result = weatherService.validate(validData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.processedData).toEqual({
          latitude: -33.9249,
          longitude: 18.4241,
        });
      });

      it("should validate boundary values", () => {
        const validData = {
          latitude: "90",
          longitude: "180",
        };

        const result = weatherService.validate(validData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.processedData).toEqual({
          latitude: 90,
          longitude: 180,
        });
      });
    });

    describe("invalid data", () => {
      it("should reject null data", () => {
        const result = weatherService.validate(null);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "data",
          message: "Data object is required",
        });
      });

      it("should reject undefined data", () => {
        const result = weatherService.validate(undefined);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "data",
          message: "Data object is required",
        });
      });

      it("should reject missing latitude", () => {
        const invalidData = {
          longitude: "13.4050",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "latitude",
          message: "Latitude is required",
        });
      });

      it("should reject missing longitude", () => {
        const invalidData = {
          latitude: "52.5200",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "longitude",
          message: "Longitude is required",
        });
      });

      it("should reject both missing latitude and longitude", () => {
        const invalidData = {};

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContainEqual({
          field: "latitude",
          message: "Latitude is required",
        });
        expect(result.errors).toContainEqual({
          field: "longitude",
          message: "Longitude is required",
        });
      });

      it("should reject non-numeric latitude", () => {
        const invalidData = {
          latitude: "not-a-number",
          longitude: "13.4050",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "latitude",
          message: "Latitude must be a valid number",
        });
      });

      it("should reject non-numeric longitude", () => {
        const invalidData = {
          latitude: "52.5200",
          longitude: "not-a-number",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "longitude",
          message: "Longitude must be a valid number",
        });
      });

      it("should reject latitude out of range (too high)", () => {
        const invalidData = {
          latitude: "91",
          longitude: "13.4050",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "latitude",
          message: "Latitude must be between -90 and 90 degrees",
        });
      });

      it("should reject latitude out of range (too low)", () => {
        const invalidData = {
          latitude: "-91",
          longitude: "13.4050",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "latitude",
          message: "Latitude must be between -90 and 90 degrees",
        });
      });

      it("should reject longitude out of range (too high)", () => {
        const invalidData = {
          latitude: "52.5200",
          longitude: "181",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "longitude",
          message: "Longitude must be between -180 and 180 degrees",
        });
      });

      it("should reject longitude out of range (too low)", () => {
        const invalidData = {
          latitude: "52.5200",
          longitude: "-181",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "longitude",
          message: "Longitude must be between -180 and 180 degrees",
        });
      });

      it("should reject multiple validation errors", () => {
        const invalidData = {
          latitude: "not-a-number",
          longitude: "not-a-number",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContainEqual({
          field: "latitude",
          message: "Latitude must be a valid number",
        });
        expect(result.errors).toContainEqual({
          field: "longitude",
          message: "Longitude must be a valid number",
        });
      });

      it("should reject empty string latitude", () => {
        const invalidData = {
          latitude: "",
          longitude: "13.4050",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContainEqual({
          field: "latitude",
          message: "Latitude is required",
        });
        expect(result.errors).toContainEqual({
          field: "latitude",
          message: "Latitude must be a valid number",
        });
      });

      it("should reject empty string longitude", () => {
        const invalidData = {
          latitude: "52.5200",
          longitude: "",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContainEqual({
          field: "longitude",
          message: "Longitude is required",
        });
        expect(result.errors).toContainEqual({
          field: "longitude",
          message: "Longitude must be a valid number",
        });
      });
    });

    describe("edge cases", () => {
      it("should handle undefined latitude", () => {
        const invalidData = {
          latitude: undefined,
          longitude: "13.4050",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "latitude",
          message: "Latitude is required",
        });
      });

      it("should handle undefined longitude", () => {
        const invalidData = {
          latitude: "52.5200",
          longitude: undefined,
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "longitude",
          message: "Longitude is required",
        });
      });

      it("should handle null latitude", () => {
        const invalidData = {
          latitude: null,
          longitude: "13.4050",
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContainEqual({
          field: "latitude",
          message: "Latitude is required",
        });
        expect(result.errors).toContainEqual({
          field: "latitude",
          message: "Latitude must be a valid number",
        });
      });

      it("should handle null longitude", () => {
        const invalidData = {
          latitude: "52.5200",
          longitude: null,
        };

        const result = weatherService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContainEqual({
          field: "longitude",
          message: "Longitude is required",
        });
        expect(result.errors).toContainEqual({
          field: "longitude",
          message: "Longitude must be a valid number",
        });
      });
    });
  });

  describe("fetchData", () => {
    const mockWeatherData = {
      latitude: 52.52,
      longitude: 13.405,
      current: {
        time: "2024-01-15T10:00",
        temperature_2m: 2.1,
        wind_speed_10m: 12.2,
      },
      current_units: {
        temperature_2m: "°C",
        wind_speed_10m: "km/h",
      },
    };

    describe("when internet is available", () => {
      beforeEach(() => {
        mockedCheckInternetConnectivity.mockResolvedValue(true);
      });

      it("should fetch live data from Open-Meteo API", async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: mockWeatherData,
        });

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(mockedCheckInternetConnectivity).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.405&current=temperature_2m,wind_speed_10m"
        );
        expect(result).toEqual(mockWeatherData);
      });

      it("should handle different coordinate values", async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: mockWeatherData,
        });

        const processedData = { latitude: -33.9249, longitude: 18.4241 };
        await weatherService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.open-meteo.com/v1/forecast?latitude=-33.9249&longitude=18.4241&current=temperature_2m,wind_speed_10m"
        );
      });

      it("should handle boundary coordinate values", async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: mockWeatherData,
        });

        const processedData = { latitude: 90, longitude: 180 };
        await weatherService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.open-meteo.com/v1/forecast?latitude=90&longitude=180&current=temperature_2m,wind_speed_10m"
        );
      });

      it("should handle negative boundary coordinates", async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: mockWeatherData,
        });

        const processedData = { latitude: -90, longitude: -180 };
        await weatherService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.open-meteo.com/v1/forecast?latitude=-90&longitude=-180&current=temperature_2m,wind_speed_10m"
        );
      });

      it("should return mock data when API call fails", async () => {
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation();
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
        mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error fetching weather data:",
          expect.any(Error)
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "API call failed, returning mock weather data for Berlin"
        );
        expect(result).toEqual(BERLIN_WEATHER_MOCK_DATA);
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
      });

      it("should handle API timeout", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedAxios.get.mockRejectedValueOnce(new Error("timeout"));

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(result).toEqual(BERLIN_WEATHER_MOCK_DATA);
        consoleSpy.mockRestore();
      });

      it("should handle API returning 404", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedAxios.get.mockRejectedValueOnce(new Error("404 Not Found"));

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(result).toEqual(BERLIN_WEATHER_MOCK_DATA);
        consoleSpy.mockRestore();
      });

      it("should handle API rate limiting", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedAxios.get.mockRejectedValueOnce(
          new Error("429 Too Many Requests")
        );

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(result).toEqual(BERLIN_WEATHER_MOCK_DATA);
        consoleSpy.mockRestore();
      });
    });

    describe("when internet is not available", () => {
      beforeEach(() => {
        mockedCheckInternetConnectivity.mockResolvedValue(false);
      });

      it("should return mock data without making API call", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(mockedCheckInternetConnectivity).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
          "No internet connectivity detected, returning mock weather data for Berlin"
        );
        expect(result).toEqual(BERLIN_WEATHER_MOCK_DATA);
        consoleSpy.mockRestore();
      });

      it("should return mock data for any coordinates when offline", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        const processedData = { latitude: -33.9249, longitude: 18.4241 };
        const result = await weatherService.fetchData(processedData);

        expect(result).toEqual(BERLIN_WEATHER_MOCK_DATA);
        consoleSpy.mockRestore();
      });
    });

    describe("error handling", () => {
      it("should handle connectivity check failure", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedCheckInternetConnectivity.mockRejectedValueOnce(
          new Error("Connectivity check failed")
        );

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(result).toEqual(BERLIN_WEATHER_MOCK_DATA);
        consoleSpy.mockRestore();
      });

      it("should handle malformed API response", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockResolvedValueOnce({
          data: null,
        });

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(result).toEqual(null);
        consoleSpy.mockRestore();
      });

      it("should handle API returning invalid JSON", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockRejectedValueOnce(new Error("Invalid JSON"));

        const processedData = { latitude: 52.52, longitude: 13.405 };
        const result = await weatherService.fetchData(processedData);

        expect(result).toEqual(BERLIN_WEATHER_MOCK_DATA);
        consoleSpy.mockRestore();
      });
    });

    describe("edge cases", () => {
      it("should handle very precise coordinates", async () => {
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockResolvedValueOnce({
          data: mockWeatherData,
        });

        const processedData = {
          latitude: 52.520008,
          longitude: 13.404954,
        };
        await weatherService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.open-meteo.com/v1/forecast?latitude=52.520008&longitude=13.404954&current=temperature_2m,wind_speed_10m"
        );
      });

      it("should handle zero coordinates", async () => {
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockResolvedValueOnce({
          data: mockWeatherData,
        });

        const processedData = { latitude: 0, longitude: 0 };
        await weatherService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m,wind_speed_10m"
        );
      });

      it("should handle coordinates at the international date line", async () => {
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockResolvedValueOnce({
          data: mockWeatherData,
        });

        const processedData = { latitude: 0, longitude: 180 };
        await weatherService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.open-meteo.com/v1/forecast?latitude=0&longitude=180&current=temperature_2m,wind_speed_10m"
        );
      });

      it("should handle coordinates at the antimeridian", async () => {
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockResolvedValueOnce({
          data: mockWeatherData,
        });

        const processedData = { latitude: 0, longitude: -180 };
        await weatherService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.open-meteo.com/v1/forecast?latitude=0&longitude=-180&current=temperature_2m,wind_speed_10m"
        );
      });
    });
  });
});
