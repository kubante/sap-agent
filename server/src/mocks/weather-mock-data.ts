/**
 * Mock weather data for Berlin when offline
 * This is a realistic response from the Open-Meteo API for Berlin coordinates
 */
export const BERLIN_WEATHER_MOCK_DATA = {
  latitude: 52.52,
  longitude: 13.405,
  generationtime_ms: 0.12302398681640625,
  utc_offset_seconds: 0,
  timezone: "Europe/Berlin",
  timezone_abbreviation: "CET",
  elevation: 38.0,
  current_units: {
    time: "iso8601",
    interval: "seconds",
    temperature_2m: "°C",
    wind_speed_10m: "km/h",
  },
  current: {
    time: "2024-01-15T10:00",
    interval: 900,
    temperature_2m: 2.1,
    wind_speed_10m: 12.2,
  },
  hourly_units: {
    time: "iso8601",
    temperature_2m: "°C",
    relative_humidity_2m: "%",
    wind_speed_10m: "km/h",
  },
  hourly: {
    time: [
      "2024-01-15T00:00",
      "2024-01-15T01:00",
      "2024-01-15T02:00",
      "2024-01-15T03:00",
      "2024-01-15T04:00",
      "2024-01-15T05:00",
      "2024-01-15T06:00",
      "2024-01-15T07:00",
      "2024-01-15T08:00",
      "2024-01-15T09:00",
      "2024-01-15T10:00",
      "2024-01-15T11:00",
      "2024-01-15T12:00",
      "2024-01-15T13:00",
      "2024-01-15T14:00",
      "2024-01-15T15:00",
      "2024-01-15T16:00",
      "2024-01-15T17:00",
      "2024-01-15T18:00",
      "2024-01-15T19:00",
      "2024-01-15T20:00",
      "2024-01-15T21:00",
      "2024-01-15T22:00",
      "2024-01-15T23:00",
    ],
    temperature_2m: [
      1.2, 0.8, 0.5, 0.1, -0.2, -0.5, -0.8, -1.1, -1.3, -1.5, 2.1, 3.2, 4.1,
      4.8, 5.2, 5.4, 5.3, 4.9, 4.2, 3.4, 2.6, 1.9, 1.3, 0.8,
    ],
    relative_humidity_2m: [
      85, 87, 89, 91, 93, 95, 97, 98, 99, 100, 78, 76, 74, 72, 70, 68, 66, 64,
      62, 60, 58, 56, 54, 52,
    ],
    wind_speed_10m: [
      8.5, 9.2, 10.1, 11.3, 12.8, 14.2, 15.6, 16.9, 18.1, 19.2, 12.2, 11.8,
      11.5, 11.2, 10.9, 10.6, 10.3, 10.0, 9.7, 9.4, 9.1, 8.8, 8.5, 8.2,
    ],
  },
};
