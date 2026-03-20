import React, { useState } from "react";
import { MapPin, Thermometer, History, Loader2, RefreshCw } from "lucide-react";
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

      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center gap-4 animate-reveal">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              <span className="text-gradient-primary">Atmos</span>
            </h1>
            {location && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
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
        <div className="flex items-center gap-3 flex-wrap animate-reveal-delay-1">
          <div className="flex bg-secondary rounded-xl p-0.5">
            <button
              onClick={() => setTab("current")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "current"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Thermometer className="w-4 h-4" />
              <span className="hidden sm:inline">Current</span>
            </button>
            <button
              onClick={() => setTab("historical")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "historical"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historical</span>
            </button>
          </div>

          <button
            onClick={toggle}
            className="px-3 py-2 rounded-lg bg-secondary text-sm font-mono text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            °{unit === "celsius" ? "C" : "F"} → °{unit === "celsius" ? "F" : "C"}
          </button>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors active:scale-95"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Fetching weather data...</p>
          </div>
        )}

        {/* Current Weather Tab */}
        {!isLoading && weatherData && tab === "current" && (
          <div className="space-y-6">
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
        <footer className="text-center py-6 text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open-Meteo
          </a>{" "}
          · Data refreshes every 5 min
        </footer>
      </div>
    </div>
  );
};

export default Index;
