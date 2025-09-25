import { WeatherDataService } from "../weather-service";

describe("WeatherDataService", () => {
  let weatherService: WeatherDataService;

  beforeEach(() => {
    weatherService = new WeatherDataService();
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
});
