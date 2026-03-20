import React from "react";
import type { HourlyWeather } from "@/types/weather";
import { getWindDirection } from "@/lib/weather-api";

interface Props {
  data: HourlyWeather[];
}

const WindMap: React.FC<Props> = ({ data }) => {
  const maxWind = Math.max(...data.map((d) => d.windSpeed), 1);

  // Color based on wind speed intensity
  const getColor = (speed: number) => {
    const t = speed / maxWind;
    if (t < 0.25) return { bg: 'hsl(199, 80%, 48%)', glow: 'hsl(199, 80%, 48% / 0.3)' };
    if (t < 0.5) return { bg: 'hsl(172, 70%, 48%)', glow: 'hsl(172, 70%, 48% / 0.3)' };
    if (t < 0.75) return { bg: 'hsl(45, 90%, 55%)', glow: 'hsl(45, 90%, 55% / 0.3)' };
    return { bg: 'hsl(24, 95%, 53%)', glow: 'hsl(24, 95%, 53% / 0.3)' };
  };

  return (
    <div className="glass-card p-5 md:p-6 animate-reveal-delay-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-foreground tracking-tight">Wind Direction Map</h2>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {[
            { label: 'Calm', color: 'hsl(199, 80%, 48%)' },
            { label: 'Moderate', color: 'hsl(172, 70%, 48%)' },
            { label: 'Breezy', color: 'hsl(45, 90%, 55%)' },
            { label: 'Strong', color: 'hsl(24, 95%, 53%)' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin -mx-1">
        <div className="flex gap-px min-w-[650px] px-1 pb-2">
          {data.map((h, i) => {
            const intensity = h.windSpeed / maxWind;
            const colors = getColor(h.windSpeed);
            const hour = new Date(h.time).getHours();

            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 flex-1 min-w-[26px] group"
              >
                {/* Wind arrow with glow */}
                <div
                  className="relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-125"
                  style={{
                    background: colors.bg,
                    opacity: 0.35 + intensity * 0.65,
                    boxShadow: `0 0 ${8 + intensity * 16}px ${colors.glow}`,
                  }}
                  title={`${h.windSpeed} km/h ${getWindDirection(h.windDirection)}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 text-foreground transition-transform duration-300"
                    style={{ transform: `rotate(${h.windDirection}deg)` }}
                  >
                    <path d="M12 2L8 10h8L12 2z" fill="currentColor" />
                    <line x1="12" y1="10" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>

                {/* Speed label */}
                <span className="text-[9px] text-muted-foreground font-mono tabular-nums leading-none">
                  {h.windSpeed.toFixed(0)}
                </span>

                {/* Hour label */}
                <span className="text-[9px] text-muted-foreground/60 font-mono tabular-nums leading-none">
                  {String(hour).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WindMap;
