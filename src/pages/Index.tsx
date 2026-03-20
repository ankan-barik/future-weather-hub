import React, { useState } from "react";
import { MapPin, Thermometer, History, Loader2, RefreshCw, CloudSun } from "lucide-react";
import { useGeolocation, useWeatherData, useAirQuality, useTemperatureUnit } from "@/hooks/useWeather";
import SearchBar from "@/components/SearchBar";
import CurrentWeatherPanel from "@/components/CurrentWeatherPanel";
import HourlyCharts from "@/components/HourlyCharts";
import AirQualityPanel from "@/components/AirQualityPanel";
import WindMap from "@/components/WindMap";
import HistoricalView from "@/components/HistoricalView";
import DynamicBackground from "@/components/DynamicBackground";

type Tab = "current" | "historical";

const Index: React.FC = () => {
  const { location, setLocation, loading: geoLoading } = useGeolocation();
  const { data: weatherData, isLoading: weatherLoading, refetch } = useWeatherData(location);
  const { data: airData, isLoading: aqLoading } = useAirQuality(location);
  const { unit, toggle } = useTemperatureUnit();
  const [tab, setTab] = useState<Tab>("current");

  const isLoading = geoLoading || weatherLoading;

  const locationLabel = location
    ? [location.name, location.admin1, location.country].filter(Boolean).join(", ")
    : "";

  return (
    <div className="min-h-screen relative">
      {weatherData && (
        <DynamicBackground
          weatherCode={weatherData.current.weatherCode}
          isDay={weatherData.current.isDay}
        />
      )}

      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center gap-4 animate-reveal">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <CloudSun className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                <span className="text-gradient-primary">Atmos</span>
              </h1>
            </div>
            {location && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </div>
            )}
          </div>
          <SearchBar
            onSelect={setLocation}
            currentLocation={locationLabel}
          />
        </header>

        {/* Controls */}
        <div className="flex items-center gap-2.5 flex-wrap animate-reveal-delay-1">
          <div className="flex bg-card/40 backdrop-blur-xl rounded-xl p-0.5 border border-border/40">
            <button
              onClick={() => setTab("current")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-300 ${
                tab === "current"
                  ? "bg-primary text-primary-foreground shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Current</span>
            </button>
            <button
              onClick={() => setTab("historical")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-300 ${
                tab === "historical"
                  ? "bg-primary text-primary-foreground shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Historical</span>
            </button>
          </div>

          <button
            onClick={toggle}
            className="px-3 py-2 rounded-xl bg-card/40 backdrop-blur-xl border border-border/40 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all active:scale-95"
          >
            °{unit === "celsius" ? "C" : "F"} → °{unit === "celsius" ? "F" : "C"}
          </button>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-card/40 backdrop-blur-xl border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all active:scale-95"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="absolute inset-0 rounded-full blur-xl bg-primary/20" />
            </div>
            <p className="text-sm text-muted-foreground">Fetching weather data...</p>
          </div>
        )}

        {/* Current Weather Tab */}
        {!isLoading && weatherData && tab === "current" && (
          <div className="space-y-5">
            <CurrentWeatherPanel
              current={weatherData.current}
              daily={weatherData.daily}
              unit={unit}
            />
            <HourlyCharts data={weatherData.hourly} unit={unit} />
            <WindMap data={weatherData.hourly} />
            {!aqLoading && airData && <AirQualityPanel data={airData} />}
          </div>
        )}

        {/* Historical Tab */}
        {!isLoading && location && tab === "historical" && (
          <HistoricalView location={location} />
        )}

        {/* Footer */}
        <footer className="text-center py-8 text-[11px] text-muted-foreground/60">
          Powered by{" "}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 hover:text-primary transition-colors"
          >
            Open-Meteo
          </a>{" "}
          · Auto-refreshes every 5 min
        </footer>
      </div>
    </div>
  );
};

export default Index;
