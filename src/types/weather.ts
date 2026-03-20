export interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  pressure: number;
  cloudCover: number;
}

export interface DailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbMax: number;
  windSpeedMax: number;
  windDirection: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  weatherCode: number;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  apparentTemperature: number;
  cloudCover: number;
  pressure: number;
}

export interface AirQuality {
  time: string;
  aqi: number;
  pm10: number;
  pm25: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
}

export interface HistoricalDaily {
  date: string;
  tempMean: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  windSpeedMax: number;
  windDirection: number;
  sunrise: string;
  sunset: string;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface WeatherCondition {
  label: string;
  icon: string;
  gradient: string;
}
