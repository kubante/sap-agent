import axios from "axios";
import { GERMANY_COUNTRY_MOCK_DATA } from "../../mocks/country-mock-data";
import { checkInternetConnectivity } from "../../utils/connectivity";
import {
  DataService,
  ValidationError,
  ValidationResult,
} from "../common/service-interface";
import { COUNTRIES } from "./countries";
import { CountryData, CountryProcessedData } from "./types";

export class CountryDataService
  implements DataService<CountryData[], CountryProcessedData>
{
  /**
   * Fetches country data from the REST Countries API or returns mock data if offline
   * @param processedData - The processed country name
   * @returns Promise<CountryData[] | null> - Country data array or null if fetch fails
   */
  async fetchData(
    processedData: CountryProcessedData
  ): Promise<CountryData[] | null> {
    try {
      // Check internet connectivity first
      const hasInternet = await checkInternetConnectivity();

      if (!hasInternet) {
        console.log(
          "No internet connectivity detected, returning mock country data for Germany"
        );
        return GERMANY_COUNTRY_MOCK_DATA as unknown as CountryData[];
      }

      // Fetch live data from API
      const response = await axios.get(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(
          processedData.countryName
        )}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching country data:", error);
      // If API call fails, return mock data as fallback
      console.log("API call failed, returning mock country data for Germany");
      return GERMANY_COUNTRY_MOCK_DATA as unknown as CountryData[];
    }
  }

  /**
   * Validates country request data
   * @param data - The request data object
   * @returns ValidationResult with validation status and processed country name
   */
  validate(data: any): ValidationResult<CountryProcessedData> {
    const errors: ValidationError[] = [];

    // Check if data object exists
    if (!data) {
      errors.push({
        field: "data",
        message: "Data object is required",
      });
      return { isValid: false, errors };
    }

    // Check if country name exists
    if (!data.countryName) {
      errors.push({
        field: "countryName",
        message: "Country name is required",
      });
      return { isValid: false, errors };
    }

    // Check if country name is a string
    if (typeof data.countryName !== "string") {
      errors.push({
        field: "countryName",
        message: "Country name must be a string",
      });
      return { isValid: false, errors };
    }

    // Check if country name is not empty
    if (data.countryName.trim().length === 0) {
      errors.push({
        field: "countryName",
        message: "Country name cannot be empty",
      });
      return { isValid: false, errors };
    }

    // Check if country name is in our valid countries list
    const normalizedCountryName = data.countryName.trim();
    const isValidCountry = COUNTRIES.some(
      (country) => country.toLowerCase() === normalizedCountryName.toLowerCase()
    );

    if (!isValidCountry) {
      errors.push({
        field: "countryName",
        message: `"${normalizedCountryName}" is not a valid country name`,
      });
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      processedData: {
        countryName: normalizedCountryName,
      },
    };
  }
}
