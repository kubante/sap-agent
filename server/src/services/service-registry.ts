import { JOB_TYPES } from "../constants";
import { DataService } from "./common/service-interface";
import { CountryDataService } from "./countries/country-service";
import { WeatherDataService } from "./weather/weather-service";

// Service registry to map job types to their corresponding services
export class ServiceRegistry {
  private services: Map<string, DataService> = new Map();

  constructor() {
    // Register services
    this.services.set(JOB_TYPES.WEATHER, new WeatherDataService());
    this.services.set(JOB_TYPES.COUNTRIES, new CountryDataService());
  }

  /**
   * Get a service by job type
   * @param jobType - The type of job (weather, countries, etc.)
   * @returns The corresponding service or undefined if not found
   */
  getService(jobType: string): DataService | undefined {
    return this.services.get(jobType);
  }

  /**
   * Get all available service types
   * @returns Array of available service types
   */
  getAvailableTypes(): string[] {
    return Array.from(this.services.keys());
  }
}

// Export a singleton instance
export const serviceRegistry = new ServiceRegistry();
