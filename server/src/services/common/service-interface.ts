// Common interface for all data services
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: ValidationError[];
  processedData?: T;
}

// Generic service interface that all services must implement
export interface DataService<TData = any, TProcessedData = any> {
  /**
   * Validates the input data for the service
   * @param data - The input data to validate
   * @returns ValidationResult with validation status and processed data
   */
  validate(data: any): ValidationResult<TProcessedData>;

  /**
   * Fetches data from the external API
   * @param processedData - The processed/validated data to use for fetching
   * @returns Promise<TData | null> - The fetched data or null if failed
   */
  fetchData(processedData: TProcessedData): Promise<TData | null>;
}
