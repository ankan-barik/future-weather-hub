import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import type { HourlyWeather, TemperatureUnit } from "@/types/weather";
import { convertTemp } from "@/lib/weather-api";

interface Props {
  data: HourlyWeather[];
  unit: TemperatureUnit;
}

const chartMargin = { top: 8, right: 8, left: -20, bottom: 0 };
const gridStyle = { strokeDasharray: "3 3", stroke: "hsl(220, 14%, 18%)" };
const axisStyle = { fontSize: 11, fill: "hsl(215, 12%, 52%)" };

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs space-y-1">
      <p className="text-muted-foreground font-mono">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const formatHour = (t: string) => {
  try {
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return t;
  }
};

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass-card p-4 md:p-5">
    <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">{title}</h3>
    <div className="h-56 md:h-64 overflow-x-auto scrollbar-thin">
      <div className="min-w-[600px] h-full">
        {children}
      </div>
    </div>
  </div>
);

const HourlyCharts: React.FC<Props> = ({ data, unit }) => {
  const chartData = data.map((h) => ({
    time: formatHour(h.time),
    temp: convertTemp(h.temperature, unit),
    feelsLike: convertTemp(h.apparentTemperature, unit),
    humidity: h.humidity,
    precipitation: h.precipitation,
    visibility: +(h.visibility / 1000).toFixed(1),
    windSpeed: h.windSpeed,
  }));

  return (
    <div className="space-y-4 animate-reveal-delay-2">
      <h2 className="text-lg font-semibold text-foreground">Hourly Forecast</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer title={`Temperature (°${unit === "celsius" ? "C" : "F"})`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="temp" name="Temp" stroke="hsl(var(--chart-3))" fill="url(#tempGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="feelsLike" name="Feels Like" stroke="hsl(var(--chart-1))" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Relative Humidity (%)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="humidity" name="Humidity" stroke="hsl(var(--chart-1))" fill="url(#humGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Precipitation (mm)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={chartMargin}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="precipitation" name="Precip." fill="hsl(var(--weather-rain))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Visibility (km)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="visibility" name="Visibility" stroke="hsl(var(--chart-2))" fill="url(#visGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Wind Speed (km/h)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="windSpeed" name="Wind" stroke="hsl(var(--chart-4))" fill="url(#windGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default HourlyCharts;
