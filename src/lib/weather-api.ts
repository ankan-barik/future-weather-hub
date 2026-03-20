import type {
  GeoLocation,
  CurrentWeather,
  DailyWeather,
  HourlyWeather,
  AirQuality,
  HistoricalDaily,
} from "@/types/weather";

const BASE = "https://api.open-meteo.com/v1";
const GEO_BASE = "https://geocoding-api.open-meteo.com/v1";
const AQ_BASE = "https://air-quality-api.open-meteo.com/v1";

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query || query.length < 2) return [];
  const res = await fetch(
    `${GEO_BASE}/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
  );
  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    name: r.name,
    country: r.country,
    admin1: r.admin1,
  }));
}

export async function fetchCurrentWeather(
  lat: number,
  lon: number
): Promise<{ current: CurrentWeather; daily: DailyWeather; hourly: HourlyWeather[] }> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
    hourly:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,visibility,wind_speed_10m,wind_direction_10m,cloud_cover,pressure_msl",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant",
    timezone: "auto",
    forecast_days: "1",
  });
  const res = await fetch(`${BASE}/forecast?${params}`);
  if (!res.ok) throw new Error("Failed to fetch weather data");
  const d = await res.json();

  const current: CurrentWeather = {
    temperature: d.current.temperature_2m,
    weatherCode: d.current.weather_code,
    windSpeed: d.current.wind_speed_10m,
    windDirection: d.current.wind_direction_10m,
    humidity: d.current.relative_humidity_2m,
    apparentTemperature: d.current.apparent_temperature,
    isDay: d.current.is_day === 1,
    precipitation: d.current.precipitation,
    pressure: d.current.pressure_msl,
    cloudCover: d.current.cloud_cover,
  };

  const daily: DailyWeather = {
    date: d.daily.time[0],
    tempMax: d.daily.temperature_2m_max[0],
    tempMin: d.daily.temperature_2m_min[0],
    precipitationSum: d.daily.precipitation_sum[0],
    precipitationProbMax: d.daily.precipitation_probability_max[0],
    windSpeedMax: d.daily.wind_speed_10m_max[0],
    windDirection: d.daily.wind_direction_10m_dominant[0],
    sunrise: d.daily.sunrise[0],
    sunset: d.daily.sunset[0],
    uvIndexMax: d.daily.uv_index_max[0],
    weatherCode: d.daily.weather_code[0],
  };

  const hourly: HourlyWeather[] = d.hourly.time.map((t: string, i: number) => ({
    time: t,
    temperature: d.hourly.temperature_2m[i],
    humidity: d.hourly.relative_humidity_2m[i],
    precipitation: d.hourly.precipitation[i],
    visibility: d.hourly.visibility[i],
    windSpeed: d.hourly.wind_speed_10m[i],
    windDirection: d.hourly.wind_direction_10m[i],
    weatherCode: d.hourly.weather_code[i],
    apparentTemperature: d.hourly.apparent_temperature[i],
    cloudCover: d.hourly.cloud_cover[i],
    pressure: d.hourly.pressure_msl[i],
  }));

  return { current, daily, hourly };
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQuality[]> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
    timezone: "auto",
    forecast_days: "1",
  });
  const res = await fetch(`${AQ_BASE}/air-quality?${params}`);
  if (!res.ok) throw new Error("Failed to fetch air quality");
  const d = await res.json();

  return d.hourly.time.map((t: string, i: number) => ({
    time: t,
    aqi: d.hourly.european_aqi?.[i] ?? 0,
    pm10: d.hourly.pm10?.[i] ?? 0,
    pm25: d.hourly.pm2_5?.[i] ?? 0,
    co: d.hourly.carbon_monoxide?.[i] ?? 0,
    no2: d.hourly.nitrogen_dioxide?.[i] ?? 0,
    so2: d.hourly.sulphur_dioxide?.[i] ?? 0,
    o3: d.hourly.ozone?.[i] ?? 0,
  }));
}

export async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<HistoricalDaily[]> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: startDate,
    end_date: endDate,
    daily:
      "temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset",
    timezone: "auto",
  });
  const res = await fetch(`${BASE}/forecast?${params}`);
  if (!res.ok) {
    // Try archive API for older dates
    const archiveRes = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?${params}`
    );
    if (!archiveRes.ok) throw new Error("Failed to fetch historical data");
    const d = await archiveRes.json();
    return mapHistorical(d);
  }
  const d = await res.json();
  return mapHistorical(d);
}

function mapHistorical(d: any): HistoricalDaily[] {
  return (d.daily?.time || []).map((t: string, i: number) => ({
    date: t,
    tempMean: d.daily.temperature_2m_mean?.[i] ?? 0,
    tempMax: d.daily.temperature_2m_max?.[i] ?? 0,
    tempMin: d.daily.temperature_2m_min?.[i] ?? 0,
    precipitationSum: d.daily.precipitation_sum?.[i] ?? 0,
    windSpeedMax: d.daily.wind_speed_10m_max?.[i] ?? 0,
    windDirection: d.daily.wind_direction_10m_dominant?.[i] ?? 0,
    sunrise: d.daily.sunrise?.[i] ?? "",
    sunset: d.daily.sunset?.[i] ?? "",
  }));
}

export async function fetchHistoricalAirQuality(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<{ dates: string[]; pm10: number[]; pm25: number[] }> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: startDate,
    end_date: endDate,
    hourly: "pm10,pm2_5",
    timezone: "auto",
  });
  const res = await fetch(`${AQ_BASE}/air-quality?${params}`);
  if (!res.ok) throw new Error("Failed to fetch historical air quality");
  const d = await res.json();

  // Aggregate hourly to daily averages
  const dailyMap = new Map<string, { pm10: number[]; pm25: number[] }>();
  (d.hourly?.time || []).forEach((t: string, i: number) => {
    const date = t.split("T")[0];
    if (!dailyMap.has(date)) dailyMap.set(date, { pm10: [], pm25: [] });
    const entry = dailyMap.get(date)!;
    if (d.hourly.pm10?.[i] != null) entry.pm10.push(d.hourly.pm10[i]);
    if (d.hourly.pm2_5?.[i] != null) entry.pm25.push(d.hourly.pm2_5[i]);
  });

  const dates: string[] = [];
  const pm10: number[] = [];
  const pm25: number[] = [];
  dailyMap.forEach((v, k) => {
    dates.push(k);
    pm10.push(v.pm10.length ? +(v.pm10.reduce((a, b) => a + b, 0) / v.pm10.length).toFixed(1) : 0);
    pm25.push(v.pm25.length ? +(v.pm25.reduce((a, b) => a + b, 0) / v.pm25.length).toFixed(1) : 0);
  });

  return { dates, pm10, pm25 };
}

export function getWeatherDescription(code: number): { label: string; gradient: string } {
  if (code === 0) return { label: "Clear Sky", gradient: "weather-gradient-clear" };
  if (code <= 3) return { label: "Partly Cloudy", gradient: "weather-gradient-clear" };
  if (code <= 49) return { label: "Foggy", gradient: "weather-gradient-night" };
  if (code <= 59) return { label: "Drizzle", gradient: "weather-gradient-rain" };
  if (code <= 69) return { label: "Rain", gradient: "weather-gradient-rain" };
  if (code <= 79) return { label: "Snow", gradient: "weather-gradient-snow" };
  if (code <= 84) return { label: "Rain Showers", gradient: "weather-gradient-rain" };
  if (code <= 86) return { label: "Snow Showers", gradient: "weather-gradient-snow" };
  if (code <= 99) return { label: "Thunderstorm", gradient: "weather-gradient-storm" };
  return { label: "Unknown", gradient: "weather-gradient-clear" };
}

export function convertTemp(temp: number, unit: 'celsius' | 'fahrenheit'): number {
  if (unit === 'fahrenheit') return +(temp * 9 / 5 + 32).toFixed(1);
  return +temp.toFixed(1);
}

export function getWindDirection(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function getUVLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "text-accent" };
  if (uv <= 5) return { label: "Moderate", color: "text-weather-clear" };
  if (uv <= 7) return { label: "High", color: "text-weather-warm" };
  if (uv <= 10) return { label: "Very High", color: "text-destructive" };
  return { label: "Extreme", color: "text-chart-5" };
}

export function getAQILabel(aqi: number): { label: string; color: string } {
  if (aqi <= 20) return { label: "Good", color: "text-accent" };
  if (aqi <= 40) return { label: "Fair", color: "text-weather-clear" };
  if (aqi <= 60) return { label: "Moderate", color: "text-weather-warm" };
  if (aqi <= 80) return { label: "Poor", color: "text-destructive" };
  return { label: "Very Poor", color: "text-chart-5" };
}
