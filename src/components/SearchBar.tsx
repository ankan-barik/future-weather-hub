import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { useLocationSearch } from "@/hooks/useWeather";
import type { GeoLocation } from "@/types/weather";

interface SearchBarProps {
  onSelect: (location: GeoLocation) => void;
  currentLocation?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelect, currentLocation }) => {
  const { query, setQuery, results, isSearching, search } = useLocationSearch();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (loc: GeoLocation) => {
    onSelect(loc);
    setQuery("");
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
          isFocused
            ? "border-primary/40 bg-card/80 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.2)]"
            : "border-border bg-card/40"
        } backdrop-blur-xl`}
      >
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={currentLocation || "Search city, state, or country..."}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {isSearching && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
        {query && (
          <button
            onClick={() => { setQuery(""); search(""); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isFocused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl z-50 max-h-72 overflow-y-auto scrollbar-thin">
          {results.map((loc, i) => (
            <button
              key={`${loc.latitude}-${loc.longitude}-${i}`}
              onClick={() => handleSelect(loc)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/60 transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{loc.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[loc.admin1, loc.country].filter(Boolean).join(", ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
