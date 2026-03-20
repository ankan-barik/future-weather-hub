import React from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import type { AirQuality } from "@/types/weather";
import { getAQILabel } from "@/lib/weather-api";

interface Props {
  data: AirQuality[];
}

const chartMargin = { top: 8, right: 8, left: -20, bottom: 0 };
const gridStyle = { strokeDasharray: "3 3", stroke: "hsl(220, 14%, 16%)" };
const axisStyle = { fontSize: 10, fill: "hsl(215, 12%, 48%)" };

const formatHour = (t: string) => {
  try {
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return t;
  }
};

const AirQualityPanel: React.FC<Props> = ({ data }) => {
  const currentAQ = data.find((_, i) => {
    const h = new Date(data[i].time).getHours();
    return h === new Date().getHours();
  }) || data[0];

  const aqiInfo = currentAQ ? getAQILabel(currentAQ.aqi) : { label: "N/A", color: "text-muted-foreground" };

  const chartData = data.map((d) => ({
    time: formatHour(d.time),
    pm10: d.pm10,
    pm25: d.pm25,
    aqi: d.aqi,
    no2: d.no2,
    so2: d.so2,
    o3: d.o3,
  }));

  // AQI ring progress (0-100 scale, maxed at 100)
  const aqiPercent = currentAQ ? Math.min(currentAQ.aqi, 100) : 0;
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (aqiPercent / 100) * circumference;

  const getAQIColor = (aqi: number) => {
    if (aqi <= 20) return 'hsl(var(--accent))';
    if (aqi <= 40) return 'hsl(var(--weather-clear))';
    if (aqi <= 60) return 'hsl(var(--weather-warm))';
    if (aqi <= 80) return 'hsl(var(--destructive))';
    return 'hsl(var(--chart-5))';
  };

  return (
    <div className="space-y-4 animate-reveal-delay-3">
      <h2 className="text-base font-semibold text-foreground tracking-tight">Air Quality</h2>

      {/* AQI Hero */}
      {currentAQ && (
        <div className="glass-card p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Ring gauge */}
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="hsl(220, 14%, 16%)"
                  strokeWidth="6"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke={getAQIColor(currentAQ.aqi)}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 6px ${getAQIColor(currentAQ.aqi)})`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-foreground">{currentAQ.aqi}</span>
                <span className={`text-[10px] font-medium ${aqiInfo.color}`}>{aqiInfo.label}</span>
              </div>
            </div>

            {/* Pollutant cards */}
            <div className="flex-1 grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
              {[
                { label: "PM10", value: currentAQ.pm10 },
                { label: "PM2.5", value: currentAQ.pm25 },
                { label: "CO", value: currentAQ.co },
                { label: "NO₂", value: currentAQ.no2 },
                { label: "SO₂", value: currentAQ.so2 },
                { label: "O₃", value: currentAQ.o3 },
              ].map((m) => (
                <div
                  key={m.label}
                  className="text-center p-2.5 rounded-xl bg-secondary/50 border border-border/50 transition-colors hover:border-primary/20"
                >
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                  <p className="text-sm font-mono font-bold text-foreground mt-1 tabular-nums">
                    {m.value?.toFixed(1) ?? "—"}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5">μg/m³</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="glass-card p-4 md:p-5">
          <h3 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest">Particulate Matter</h3>
          <div className="h-52 overflow-x-auto scrollbar-thin">
            <div className="min-w-[550px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={chartMargin}>
                  <defs>
                    <linearGradient id="pm10G" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pm25G" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="time" tick={axisStyle} />
                  <YAxis tick={axisStyle} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(220, 18%, 11%)',
                      border: '1px solid hsl(220, 14%, 20%)',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="pm10" name="PM10" stroke="hsl(var(--chart-3))" fill="url(#pm10G)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pm25" name="PM2.5" stroke="hsl(var(--chart-5))" fill="url(#pm25G)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 md:p-5">
          <h3 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest">Gaseous Pollutants</h3>
          <div className="h-52 overflow-x-auto scrollbar-thin">
            <div className="min-w-[550px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={chartMargin}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="time" tick={axisStyle} />
                  <YAxis tick={axisStyle} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(220, 18%, 11%)',
                      border: '1px solid hsl(220, 14%, 20%)',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="no2" name="NO₂" stroke="hsl(var(--chart-1))" fill="none" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="so2" name="SO₂" stroke="hsl(var(--chart-4))" fill="none" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="o3" name="O₃" stroke="hsl(var(--chart-2))" fill="none" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityPanel;
