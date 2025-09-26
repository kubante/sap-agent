import axios from "axios";
import { GERMANY_COUNTRY_MOCK_DATA } from "../../../mocks/country-mock-data";
import { checkInternetConnectivity } from "../../../utils/connectivity";
import { CountryDataService } from "../country-service";

// Mock dependencies
jest.mock("axios");
jest.mock("../../../utils/connectivity");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCheckInternetConnectivity =
  checkInternetConnectivity as jest.MockedFunction<
    typeof checkInternetConnectivity
  >;

describe("CountryDataService", () => {
  let countryService: CountryDataService;

  beforeEach(() => {
    countryService = new CountryDataService();
    jest.clearAllMocks();
  });

  describe("validate", () => {
    describe("valid data", () => {
      it("should validate correct country name", () => {
        const validData = {
          countryName: "Germany",
        };

        const result = countryService.validate(validData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.processedData).toEqual({
          countryName: "Germany",
        });
      });

      it("should validate country name with different casing", () => {
        const validData = {
          countryName: "germany",
        };

        const result = countryService.validate(validData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.processedData).toEqual({
          countryName: "germany",
        });
      });

      it("should validate country name with mixed casing", () => {
        const validData = {
          countryName: "GeRmAnY",
        };

        const result = countryService.validate(validData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.processedData).toEqual({
          countryName: "GeRmAnY",
        });
      });

      it("should validate country name with leading/trailing spaces", () => {
        const validData = {
          countryName: "  Germany  ",
        };

        const result = countryService.validate(validData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.processedData).toEqual({
          countryName: "Germany",
        });
      });

      it("should validate various valid countries", () => {
        const validCountries = [
          "United States",
          "United Kingdom",
          "South Korea",
          "New Zealand",
          "Bosnia and Herzegovina",
          "Saint Vincent and the Grenadines",
        ];

        validCountries.forEach((country) => {
          const validData = { countryName: country };
          const result = countryService.validate(validData);

          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
          expect(result.processedData).toEqual({
            countryName: country,
          });
        });
      });
    });

    describe("invalid data", () => {
      it("should reject null data", () => {
        const result = countryService.validate(null);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "data",
          message: "Data object is required",
        });
      });

      it("should reject undefined data", () => {
        const result = countryService.validate(undefined);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "data",
          message: "Data object is required",
        });
      });

      it("should reject missing countryName", () => {
        const invalidData = {};

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name is required",
        });
      });

      it("should reject null countryName", () => {
        const invalidData = {
          countryName: null,
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name is required",
        });
      });

      it("should reject undefined countryName", () => {
        const invalidData = {
          countryName: undefined,
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name is required",
        });
      });

      it("should reject non-string countryName", () => {
        const invalidData = {
          countryName: 123,
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name must be a string",
        });
      });

      it("should reject object countryName", () => {
        const invalidData = {
          countryName: {},
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name must be a string",
        });
      });

      it("should reject array countryName", () => {
        const invalidData = {
          countryName: [],
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name must be a string",
        });
      });

      it("should reject empty string countryName", () => {
        const invalidData = {
          countryName: "",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name is required",
        });
      });

      it("should reject whitespace-only countryName", () => {
        const invalidData = {
          countryName: "   ",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name cannot be empty",
        });
      });

      it("should reject invalid country name", () => {
        const invalidData = {
          countryName: "InvalidCountry",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: '"InvalidCountry" is not a valid country name',
        });
      });

      it("should reject partial country name", () => {
        const invalidData = {
          countryName: "Germ",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: '"Germ" is not a valid country name',
        });
      });

      it("should reject country name with typos", () => {
        const invalidData = {
          countryName: "Garmany",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: '"Garmany" is not a valid country name',
        });
      });

      it("should reject country name with extra characters", () => {
        const invalidData = {
          countryName: "Germany123",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: '"Germany123" is not a valid country name',
        });
      });

      it("should reject country name with special characters", () => {
        const invalidData = {
          countryName: "Germany!",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: '"Germany!" is not a valid country name',
        });
      });
    });

    describe("edge cases", () => {
      it("should handle country name with only spaces", () => {
        const invalidData = {
          countryName: " ",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name cannot be empty",
        });
      });

      it("should handle country name with tabs and newlines", () => {
        const invalidData = {
          countryName: "\t\n",
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name cannot be empty",
        });
      });

      it("should handle boolean countryName", () => {
        const invalidData = {
          countryName: true,
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name must be a string",
        });
      });

      it("should handle function countryName", () => {
        const invalidData = {
          countryName: () => {},
        };

        const result = countryService.validate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          field: "countryName",
          message: "Country name must be a string",
        });
      });
    });

    describe("case sensitivity", () => {
      it("should validate lowercase country names", () => {
        const testCases = [
          "germany",
          "united states",
          "south korea",
          "bosnia and herzegovina",
        ];

        testCases.forEach((country) => {
          const validData = { countryName: country };
          const result = countryService.validate(validData);

          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
          expect(result.processedData).toEqual({
            countryName: country,
          });
        });
      });

      it("should validate uppercase country names", () => {
        const testCases = [
          "GERMANY",
          "UNITED STATES",
          "SOUTH KOREA",
          "BOSNIA AND HERZEGOVINA",
        ];

        testCases.forEach((country) => {
          const validData = { countryName: country };
          const result = countryService.validate(validData);

          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
          expect(result.processedData).toEqual({
            countryName: country,
          });
        });
      });
    });
  });

  describe("fetchData", () => {
    const mockCountryData = [
      {
        name: { common: "Germany", official: "Federal Republic of Germany" },
        capital: ["Berlin"],
        population: 83240525,
        region: "Europe",
      },
    ];

    describe("when internet is available", () => {
      beforeEach(() => {
        mockedCheckInternetConnectivity.mockResolvedValue(true);
      });

      it("should fetch live data from REST Countries API", async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: mockCountryData,
        });

        const processedData = { countryName: "Germany" };
        const result = await countryService.fetchData(processedData);

        expect(mockedCheckInternetConnectivity).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://restcountries.com/v3.1/name/Germany"
        );
        expect(result).toEqual(mockCountryData);
      });

      it("should encode country name in URL", async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: mockCountryData,
        });

        const processedData = { countryName: "United States" };
        await countryService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://restcountries.com/v3.1/name/United%20States"
        );
      });

      it("should handle country names with special characters", async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: mockCountryData,
        });

        const processedData = { countryName: "Côte d'Ivoire" };
        await countryService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://restcountries.com/v3.1/name/C%C3%B4te%20d'Ivoire"
        );
      });

      it("should return mock data when API call fails", async () => {
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation();
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
        mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

        const processedData = { countryName: "Germany" };
        const result = await countryService.fetchData(processedData);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error fetching country data:",
          expect.any(Error)
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "API call failed, returning mock country data for Germany"
        );
        expect(result).toEqual(GERMANY_COUNTRY_MOCK_DATA);
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
      });

      it("should handle API timeout", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedAxios.get.mockRejectedValueOnce(new Error("timeout"));

        const processedData = { countryName: "Germany" };
        const result = await countryService.fetchData(processedData);

        expect(result).toEqual(GERMANY_COUNTRY_MOCK_DATA);
        consoleSpy.mockRestore();
      });

      it("should handle API returning empty response", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedAxios.get.mockRejectedValueOnce(new Error("404 Not Found"));

        const processedData = { countryName: "Germany" };
        const result = await countryService.fetchData(processedData);

        expect(result).toEqual(GERMANY_COUNTRY_MOCK_DATA);
        consoleSpy.mockRestore();
      });
    });

    describe("when internet is not available", () => {
      beforeEach(() => {
        mockedCheckInternetConnectivity.mockResolvedValue(false);
      });

      it("should return mock data without making API call", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        const processedData = { countryName: "Germany" };
        const result = await countryService.fetchData(processedData);

        expect(mockedCheckInternetConnectivity).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
          "No internet connectivity detected, returning mock country data for Germany"
        );
        expect(result).toEqual(GERMANY_COUNTRY_MOCK_DATA);
        consoleSpy.mockRestore();
      });

      it("should return mock data for any country when offline", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        const processedData = { countryName: "France" };
        const result = await countryService.fetchData(processedData);

        expect(result).toEqual(GERMANY_COUNTRY_MOCK_DATA);
        consoleSpy.mockRestore();
      });
    });

    describe("error handling", () => {
      it("should handle connectivity check failure", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedCheckInternetConnectivity.mockRejectedValueOnce(
          new Error("Connectivity check failed")
        );

        const processedData = { countryName: "Germany" };
        const result = await countryService.fetchData(processedData);

        expect(result).toEqual(GERMANY_COUNTRY_MOCK_DATA);
        consoleSpy.mockRestore();
      });

      it("should handle malformed API response", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockResolvedValueOnce({
          data: null,
        });

        const processedData = { countryName: "Germany" };
        const result = await countryService.fetchData(processedData);

        expect(result).toEqual(null);
        consoleSpy.mockRestore();
      });
    });

    describe("edge cases", () => {
      it("should handle very long country names", async () => {
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockResolvedValueOnce({
          data: mockCountryData,
        });

        const longCountryName = "A".repeat(1000);
        const processedData = { countryName: longCountryName };
        await countryService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(
            longCountryName
          )}`
        );
      });

      it("should handle country names with unicode characters", async () => {
        mockedCheckInternetConnectivity.mockResolvedValue(true);
        mockedAxios.get.mockResolvedValueOnce({
          data: mockCountryData,
        });

        const processedData = { countryName: "Россия" };
        await countryService.fetchData(processedData);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://restcountries.com/v3.1/name/%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F"
        );
      });
    });
  });
});
