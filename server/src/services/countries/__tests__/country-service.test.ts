import { CountryDataService } from "../country-service";

describe("CountryDataService", () => {
  let countryService: CountryDataService;

  beforeEach(() => {
    countryService = new CountryDataService();
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
});
