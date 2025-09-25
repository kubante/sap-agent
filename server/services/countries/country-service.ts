import axios from "axios";
import { COUNTRIES } from "./countries";

// Country data interface based on the REST Countries API response
export interface CountryData {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
  tld: string[];
  cca2: string;
  ccn3: string;
  cioc: string;
  independent: boolean;
  status: string;
  unMember: boolean;
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
  idd: {
    root: string;
    suffixes: string[];
  };
  capital: string[];
  altSpellings: string[];
  region: string;
  subregion: string;
  languages: {
    [key: string]: string;
  };
  latlng: [number, number];
  landlocked: boolean;
  borders: string[];
  area: number;
  demonyms: {
    [key: string]: {
      f: string;
      m: string;
    };
  };
  cca3: string;
  translations: {
    [key: string]: {
      official: string;
      common: string;
    };
  };
  flag: string;
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
  population: number;
  gini?: {
    [key: string]: number;
  };
  fifa: string;
  car: {
    signs: string[];
    side: string;
  };
  timezones: string[];
  continents: string[];
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
  coatOfArms: {
    png: string;
    svg: string;
  };
  startOfWeek: string;
  capitalInfo: {
    latlng: [number, number];
  };
  postalCode?: {
    format: string;
    regex: string;
  };
}

// Validation error interface (reusing from WeatherData)
export interface ValidationError {
  field: string;
  message: string;
}

export class CountryDataService {
  /**
   * Fetches country data from the REST Countries API
   * @param countryName - The name of the country
   * @returns Promise<CountryData[] | null> - Country data array or null if fetch fails
   */
  async fetchCountryData(countryName: string): Promise<CountryData[] | null> {
    try {
      const response = await axios.get(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching country data:", error);
      return null;
    }
  }

  /**
   * Validates country name
   * @param countryName - The country name to validate
   * @returns ValidationError[] - Array of validation errors (empty if valid)
   */
  validateCountryName(countryName: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if country name exists
    if (!countryName) {
      errors.push({
        field: "countryName",
        message: "Country name is required",
      });
      return errors;
    }

    // Check if country name is a string
    if (typeof countryName !== "string") {
      errors.push({
        field: "countryName",
        message: "Country name must be a string",
      });
      return errors;
    }

    // Check if country name is not empty
    if (countryName.trim().length === 0) {
      errors.push({
        field: "countryName",
        message: "Country name cannot be empty",
      });
      return errors;
    }

    // Check if country name is in our valid countries list
    const normalizedCountryName = countryName.trim();
    const isValidCountry = COUNTRIES.some(
      (country) => country.toLowerCase() === normalizedCountryName.toLowerCase()
    );

    if (!isValidCountry) {
      errors.push({
        field: "countryName",
        message: `"${normalizedCountryName}" is not a valid country name`,
      });
    }

    return errors;
  }

  /**
   * Validates and processes country request data
   * @param countryName - The country name to validate
   * @returns Object with validation result and processed country name
   */
  validateAndProcessCountryRequest(countryName: string): {
    isValid: boolean;
    errors: ValidationError[];
    processedCountryName?: string;
  } {
    const errors = this.validateCountryName(countryName);

    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      errors: [],
      processedCountryName: countryName.trim(),
    };
  }
}
