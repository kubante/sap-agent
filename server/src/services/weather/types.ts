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

// Processed weather request data
export interface WeatherProcessedData {
  latitude: number;
  longitude: number;
}
