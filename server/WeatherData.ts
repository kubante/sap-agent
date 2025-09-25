import axios from "axios";

// Weather data interface
export interface WeatherData {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    wind_speed_10m: number;
  };
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
}

export class WeatherDataService {
  /**
   * Fetches weather data from the Open-Meteo API
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @returns Promise<WeatherData | null> - Weather data or null if fetch fails
   */
  async fetchWeatherData(
    latitude: number,
    longitude: number
  ): Promise<WeatherData | null> {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  }

  /**
   * Validates weather request data
   * @param data - The request data object
   * @returns ValidationError[] - Array of validation errors (empty if valid)
   */
  validateWeatherRequest(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if data object exists
    if (!data) {
      errors.push({
        field: "data",
        message: "Data object is required",
      });
      return errors;
    }

    // Check for required coordinates
    if (!data.latitude) {
      errors.push({
        field: "latitude",
        message: "Latitude is required",
      });
    }

    if (!data.longitude) {
      errors.push({
        field: "longitude",
        message: "Longitude is required",
      });
    }

    // If coordinates exist, validate their format and ranges
    if (data.latitude !== undefined) {
      const lat = parseFloat(data.latitude);
      if (isNaN(lat)) {
        errors.push({
          field: "latitude",
          message: "Latitude must be a valid number",
        });
      } else if (lat < -90 || lat > 90) {
        errors.push({
          field: "latitude",
          message: "Latitude must be between -90 and 90 degrees",
        });
      }
    }

    if (data.longitude !== undefined) {
      const lng = parseFloat(data.longitude);
      if (isNaN(lng)) {
        errors.push({
          field: "longitude",
          message: "Longitude must be a valid number",
        });
      } else if (lng < -180 || lng > 180) {
        errors.push({
          field: "longitude",
          message: "Longitude must be between -180 and 180 degrees",
        });
      }
    }

    return errors;
  }

  /**
   * Validates and processes weather request data
   * @param data - The request data object
   * @returns Object with validation result and processed coordinates
   */
  validateAndProcessWeatherRequest(data: any): {
    isValid: boolean;
    errors: ValidationError[];
    coordinates?: { latitude: number; longitude: number };
  } {
    const errors = this.validateWeatherRequest(data);

    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      errors: [],
      coordinates: {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      },
    };
  }
}
