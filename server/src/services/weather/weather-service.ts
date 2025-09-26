import axios from "axios";
import { BERLIN_WEATHER_MOCK_DATA } from "../../mocks/weather-mock-data";
import { checkInternetConnectivity } from "../../utils/connectivity";
import {
  DataService,
  ValidationError,
  ValidationResult,
} from "../common/service-interface";
import { WeatherData, WeatherProcessedData } from "./types";

export class WeatherDataService
  implements DataService<WeatherData, WeatherProcessedData>
{
  /**
   * Fetches weather data from the Open-Meteo API or returns mock data if offline
   * @param processedData - The processed coordinates
   * @returns Promise<WeatherData | null> - Weather data or null if fetch fails
   */
  async fetchData(
    processedData: WeatherProcessedData
  ): Promise<WeatherData | null> {
    try {
      // Check internet connectivity first
      const hasInternet = await checkInternetConnectivity();

      if (!hasInternet) {
        console.log(
          "No internet connectivity detected, returning mock weather data for Berlin"
        );
        return BERLIN_WEATHER_MOCK_DATA;
      }

      // Fetch live data from API
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${processedData.latitude}&longitude=${processedData.longitude}&current=temperature_2m,wind_speed_10m`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      // If API call fails, return mock data as fallback
      console.log("API call failed, returning mock weather data for Berlin");
      return BERLIN_WEATHER_MOCK_DATA;
    }
  }

  /**
   * Validates weather request data
   * @param data - The request data object
   * @returns ValidationResult with validation status and processed coordinates
   */
  validate(data: any): ValidationResult<WeatherProcessedData> {
    const errors: ValidationError[] = [];

    // Check if data object exists
    if (!data) {
      errors.push({
        field: "data",
        message: "Data object is required",
      });
      return { isValid: false, errors };
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

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      processedData: {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      },
    };
  }
}
