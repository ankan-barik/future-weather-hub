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
const gridStyle = { strokeDasharray: "3 3", stroke: "hsl(220, 14%, 16%)" };
const axisStyle = { fontSize: 10, fill: "hsl(215, 12%, 48%)" };

const tooltipStyle = {
  background: 'hsl(220, 18%, 11%)',
  border: '1px solid hsl(220, 14%, 20%)',
  borderRadius: '12px',
  fontSize: '11px',
  boxShadow: '0 8px 32px -4px hsl(220, 20%, 5% / 0.5)',
};

const formatHour = (t: string) => {
  try {
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return t;
  }
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
  title, children, className = "",
}) => (
  <div className={`glass-card p-4 md:p-5 ${className}`}>
    <h3 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest">{title}</h3>
    <div className="h-52 md:h-56 overflow-x-auto scrollbar-thin">
      <div className="min-w-[550px] h-full">
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
      <h2 className="text-base font-semibold text-foreground tracking-tight">24-Hour Forecast</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard title={`Temperature (°${unit === "celsius" ? "C" : "F"})`}>
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
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="temp" name="Temp" stroke="hsl(var(--chart-3))" fill="url(#tempGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="feelsLike" name="Feels Like" stroke="hsl(var(--chart-1))" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Relative Humidity (%)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="humidity" name="Humidity" stroke="hsl(var(--chart-1))" fill="url(#humGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Precipitation (mm)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={chartMargin}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="precipitation"
                name="Rain"
                fill="hsl(var(--weather-rain))"
                radius={[6, 6, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Visibility (km)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="visibility" name="Visibility" stroke="hsl(var(--chart-2))" fill="url(#visGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Wind Speed (km/h)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="windSpeed" name="Wind" stroke="hsl(var(--chart-4))" fill="url(#windGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default HourlyCharts;
