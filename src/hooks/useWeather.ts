import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GeoLocation, TemperatureUnit } from "@/types/weather";
import {
  fetchCurrentWeather,
  fetchAirQuality,
  searchLocations,
} from "@/lib/weather-api";

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      // Fallback to Delhi
      setLocation({ latitude: 28.6139, longitude: 77.209, name: "New Delhi", country: "India" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1`
          );
          // Use coordinates directly
          setLocation({ latitude, longitude, name: "Current Location" });
        } catch {
          setLocation({ latitude, longitude, name: "Current Location" });
        }
        setLoading(false);
      },
      () => {
        setError("Location access denied");
        setLocation({ latitude: 28.6139, longitude: 77.209, name: "New Delhi", country: "India" });
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  return { location, setLocation, error, loading };
}

export function useWeatherData(location: GeoLocation | null) {
  return useQuery({
    queryKey: ["weather", location?.latitude, location?.longitude],
    queryFn: () =>
      location
        ? fetchCurrentWeather(location.latitude, location.longitude)
        : Promise.reject("No location"),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useAirQuality(location: GeoLocation | null) {
  return useQuery({
    queryKey: ["airquality", location?.latitude, location?.longitude],
    queryFn: () =>
      location
        ? fetchAirQuality(location.latitude, location.longitude)
        : Promise.reject("No location"),
    enabled: !!location,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const r = await searchLocations(q);
      setResults(r);
    } catch {
      setResults([]);
    }
    setIsSearching(false);
  }, []);

  return { query, setQuery, results, isSearching, search };
}

export function useTemperatureUnit() {
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");
  const toggle = () => setUnit((u) => (u === "celsius" ? "fahrenheit" : "celsius"));
  return { unit, toggle };
}
