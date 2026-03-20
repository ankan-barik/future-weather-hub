import React from "react";
import {
  Thermometer, Droplets, Wind, Sun, Sunrise, Sunset,
  Eye, Cloud, Gauge, ArrowUp, Compass,
} from "lucide-react";
import type { CurrentWeather, DailyWeather, TemperatureUnit } from "@/types/weather";
import { convertTemp, getWindDirection, getUVLabel, getWeatherDescription } from "@/lib/weather-api";

interface Props {
  current: CurrentWeather;
  daily: DailyWeather;
  unit: TemperatureUnit;
}

const WeatherIcon: React.FC<{ code: number; isDay: boolean }> = ({ code, isDay }) => {
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
  return (
    <div className="relative">
      <span className="text-7xl md:text-8xl block" style={{ animation: 'float 5s ease-in-out infinite' }}>
        {getEmoji()}
      </span>
      {/* Glow behind icon */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20"
        style={{ background: `hsl(var(--primary) / 0.4)` }}
      />
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  className?: string;
}> = ({ icon, label, value, sub, accent, className = "" }) => (
  <div className={`glass-card-hover shimmer-line p-4 flex flex-col gap-2.5 ${className}`}>
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="p-1.5 rounded-lg bg-primary/10">
        {icon}
      </div>
      <span className="text-[11px] font-medium uppercase tracking-widest">{label}</span>
    </div>
    <p className={`text-xl font-bold font-mono tracking-tight ${accent || 'text-foreground'}`}>
      {value}
    </p>
    {sub && <p className="text-[11px] text-muted-foreground leading-tight">{sub}</p>}
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

  // Compute daylight progress
  const now = new Date();
  const sunriseTime = new Date(daily.sunrise);
  const sunsetTime = new Date(daily.sunset);
  const totalDaylight = sunsetTime.getTime() - sunriseTime.getTime();
  const elapsed = now.getTime() - sunriseTime.getTime();
  const daylightProgress = Math.max(0, Math.min(100, (elapsed / totalDaylight) * 100));

  return (
    <div className="space-y-5">
      {/* Hero Card */}
      <div className={`glass-card overflow-hidden animate-reveal`}>
        <div className={`p-6 md:p-8 ${weather.gradient}`}>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Weather Icon */}
            <div className="shrink-0">
              <WeatherIcon code={current.weatherCode} isDay={current.isDay} />
            </div>

            {/* Main Temperature */}
            <div className="text-center md:text-left flex-1 space-y-2">
              <p className="text-7xl md:text-8xl lg:text-9xl font-bold text-foreground font-mono tracking-tighter glow-temp leading-none">
                {convertTemp(current.temperature, unit)}°
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-base md:text-lg text-muted-foreground">{weather.label}</span>
                <span className="text-xs text-muted-foreground/60">•</span>
                <span className="text-sm text-muted-foreground">
                  Feels {convertTemp(current.apparentTemperature, unit)}°
                </span>
              </div>
            </div>

            {/* Right column - Hi/Lo & Sun */}
            <div className="shrink-0 space-y-4 text-center md:text-right">
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-end">
                  <ArrowUp className="w-3.5 h-3.5 text-weather-warm" />
                  <span className="text-lg font-mono font-semibold text-foreground">
                    {convertTemp(daily.tempMax, unit)}°
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-end">
                  <ArrowUp className="w-3.5 h-3.5 text-weather-cool rotate-180" />
                  <span className="text-lg font-mono font-semibold text-foreground">
                    {convertTemp(daily.tempMin, unit)}°
                  </span>
                </div>
              </div>

              {/* Daylight bar */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center md:justify-end">
                  <Sunrise className="w-3 h-3" />
                  <span className="font-mono">{formatTime(daily.sunrise)}</span>
                  <span className="text-muted-foreground/40">—</span>
                  <Sunset className="w-3 h-3" />
                  <span className="font-mono">{formatTime(daily.sunset)}</span>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${daylightProgress}%`,
                      background: 'linear-gradient(90deg, hsl(var(--weather-clear)), hsl(var(--weather-warm)))',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Droplets className="w-4 h-4 text-primary" />}
          label="Humidity"
          value={`${current.humidity}%`}
          sub={current.humidity > 70 ? "High moisture" : current.humidity < 30 ? "Dry air" : "Comfortable"}
          className="animate-reveal-delay-1"
        />
        <StatCard
          icon={<Wind className="w-4 h-4 text-primary" />}
          label="Wind"
          value={`${current.windSpeed} km/h`}
          sub={`${getWindDirection(current.windDirection)} direction`}
          className="animate-reveal-delay-1"
        />
        <StatCard
          icon={<Droplets className="w-4 h-4 text-primary" />}
          label="Rain"
          value={`${current.precipitation} mm`}
          sub={`${daily.precipitationProbMax}% probability`}
          className="animate-reveal-delay-2"
        />
        <StatCard
          icon={<Sun className="w-4 h-4 text-primary" />}
          label="UV Index"
          value={`${daily.uvIndexMax}`}
          sub={uv.label}
          accent={uv.color}
          className="animate-reveal-delay-2"
        />
        <StatCard
          icon={<Gauge className="w-4 h-4 text-primary" />}
          label="Pressure"
          value={`${current.pressure}`}
          sub="hPa"
          className="animate-reveal-delay-3"
        />
        <StatCard
          icon={<Cloud className="w-4 h-4 text-primary" />}
          label="Cloud Cover"
          value={`${current.cloudCover}%`}
          sub={current.cloudCover > 80 ? "Overcast" : current.cloudCover > 40 ? "Partly cloudy" : "Clear skies"}
          className="animate-reveal-delay-3"
        />
        <StatCard
          icon={<Compass className="w-4 h-4 text-primary" />}
          label="Wind Dir."
          value={getWindDirection(current.windDirection)}
          sub={`${current.windDirection}° bearing`}
          className="animate-reveal-delay-4"
        />
        <StatCard
          icon={<Thermometer className="w-4 h-4 text-primary" />}
          label="Dew Point"
          value={`${convertTemp(current.temperature - ((100 - current.humidity) / 5), unit)}°`}
          sub="Approximate"
          className="animate-reveal-delay-4"
        />
      </div>
    </div>
  );
};

export default CurrentWeatherPanel;
