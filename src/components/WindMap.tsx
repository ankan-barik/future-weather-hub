import React from "react";
import type { HourlyWeather } from "@/types/weather";
import { getWindDirection } from "@/lib/weather-api";

interface Props {
  data: HourlyWeather[];
}

const WindMap: React.FC<Props> = ({ data }) => {
  const maxWind = Math.max(...data.map((d) => d.windSpeed), 1);

  return (
    <div className="glass-card p-5 animate-reveal-delay-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Wind Map</h2>
      <div className="overflow-x-auto scrollbar-thin">
        <div className="flex gap-1.5 min-w-[600px] pb-2">
          {data.map((h, i) => {
            const intensity = h.windSpeed / maxWind;
            const hue = 199 - intensity * 80; // blue to orange
            const hour = new Date(h.time).getHours();

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-[24px]">
                <div
                  className="relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: `hsl(${hue}, ${60 + intensity * 30}%, ${40 + intensity * 15}%)`,
                    opacity: 0.4 + intensity * 0.6,
                  }}
                  title={`${h.windSpeed} km/h ${getWindDirection(h.windDirection)}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5"
                    style={{ transform: `rotate(${h.windDirection}deg)` }}
                  >
                    <path
                      d="M12 2L8 10h8L12 2z"
                      fill="currentColor"
                      className="text-foreground"
                    />
                    <line x1="12" y1="10" x2="12" y2="22" stroke="currentColor" strokeWidth="2" className="text-foreground" />
                  </svg>
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">
                  {h.windSpeed.toFixed(0)}
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">
                  {String(hour).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(199, 70%, 48%)" }} />
          Calm
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(159, 75%, 48%)" }} />
          Moderate
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(119, 80%, 50%)" }} />
          Strong
        </div>
      </div>
    </div>
  );
};

export default WindMap;
