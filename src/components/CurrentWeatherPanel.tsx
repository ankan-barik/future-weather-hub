import React from "react";
import {
  Thermometer, Droplets, Wind, Sun, Sunrise, Sunset,
  Eye, Cloud, Gauge, ArrowUp,
} from "lucide-react";
import type { CurrentWeather, DailyWeather, TemperatureUnit } from "@/types/weather";
import { convertTemp, getWindDirection, getUVLabel, getWeatherDescription } from "@/lib/weather-api";

interface Props {
  current: CurrentWeather;
  daily: DailyWeather;
  unit: TemperatureUnit;
}

const WeatherIcon: React.FC<{ code: number; isDay: boolean; size?: string }> = ({
  code, isDay, size = "w-16 h-16",
}) => {
  const getEmoji = () => {
    if (code === 0) return isDay ? "☀️" : "🌙";
    if (code <= 3) return isDay ? "⛅" : "☁️";
    if (code <= 49) return "🌫️";
    if (code <= 59) return "🌦️";
    if (code <= 69) return "🌧️";
    if (code <= 79) return "🌨️";
    if (code <= 84) return "🌧️";
    if (code <= 86) return "❄️";
    if (code <= 99) return "⛈️";
    return "🌤️";
  };
  return <span className={`${size} flex items-center justify-center text-5xl animate-float`}>{getEmoji()}</span>;
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}> = ({ icon, label, value, sub, className = "" }) => (
  <div className={`glass-card-hover p-4 flex flex-col gap-2 ${className}`}>
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xl font-semibold text-foreground font-mono">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const CurrentWeatherPanel: React.FC<Props> = ({ current, daily, unit }) => {
  const weather = getWeatherDescription(current.weatherCode);
  const uv = getUVLabel(daily.uvIndexMax);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className={`glass-card p-6 md:p-8 ${weather.gradient} animate-reveal`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <WeatherIcon code={current.weatherCode} isDay={current.isDay} />
          <div className="text-center md:text-left flex-1">
            <p className="text-6xl md:text-7xl font-bold text-foreground font-mono tracking-tight">
              {convertTemp(current.temperature, unit)}°
              <span className="text-2xl text-muted-foreground ml-1">
                {unit === "celsius" ? "C" : "F"}
              </span>
            </p>
            <p className="text-lg text-muted-foreground mt-1">{weather.label}</p>
            <p className="text-sm text-muted-foreground">
              Feels like {convertTemp(current.apparentTemperature, unit)}°
            </p>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p className="text-sm text-muted-foreground">
              H: <span className="text-foreground font-mono">{convertTemp(daily.tempMax, unit)}°</span>
              {" "}L: <span className="text-foreground font-mono">{convertTemp(daily.tempMin, unit)}°</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Droplets className="w-4 h-4" />}
          label="Humidity"
          value={`${current.humidity}%`}
          className="animate-reveal-delay-1"
        />
        <StatCard
          icon={<Wind className="w-4 h-4" />}
          label="Wind"
          value={`${current.windSpeed} km/h`}
          sub={getWindDirection(current.windDirection)}
          className="animate-reveal-delay-1"
        />
        <StatCard
          icon={<Droplets className="w-4 h-4" />}
          label="Precipitation"
          value={`${current.precipitation} mm`}
          sub={`${daily.precipitationProbMax}% chance`}
          className="animate-reveal-delay-2"
        />
        <StatCard
          icon={<Sun className="w-4 h-4" />}
          label="UV Index"
          value={`${daily.uvIndexMax}`}
          sub={uv.label}
          className="animate-reveal-delay-2"
        />
        <StatCard
          icon={<Sunrise className="w-4 h-4" />}
          label="Sunrise"
          value={formatTime(daily.sunrise)}
          className="animate-reveal-delay-3"
        />
        <StatCard
          icon={<Sunset className="w-4 h-4" />}
          label="Sunset"
          value={formatTime(daily.sunset)}
          className="animate-reveal-delay-3"
        />
        <StatCard
          icon={<Gauge className="w-4 h-4" />}
          label="Pressure"
          value={`${current.pressure} hPa`}
          className="animate-reveal-delay-4"
        />
        <StatCard
          icon={<Cloud className="w-4 h-4" />}
          label="Cloud Cover"
          value={`${current.cloudCover}%`}
          className="animate-reveal-delay-4"
        />
      </div>
    </div>
  );
};

export default CurrentWeatherPanel;
