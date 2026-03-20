import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { CalendarDays, Loader2 } from "lucide-react";
import type { GeoLocation } from "@/types/weather";
import { fetchHistoricalWeather, fetchHistoricalAirQuality } from "@/lib/weather-api";

interface Props {
  location: GeoLocation;
}

const chartMargin = { top: 8, right: 8, left: -20, bottom: 0 };
const gridStyle = { strokeDasharray: "3 3", stroke: "hsl(220, 14%, 18%)" };
const axisStyle = { fontSize: 10, fill: "hsl(215, 12%, 52%)" };

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs space-y-1">
      <p className="text-muted-foreground font-mono">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-semibold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const HistoricalView: React.FC<Props> = ({ location }) => {
  const today = new Date().toISOString().split("T")[0];
  const oneMonthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);

  // Validate max 2 years
  const dateDiff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000;
  const isValid = dateDiff > 0 && dateDiff <= 730;

  const { data: weatherData, isLoading: wLoading } = useQuery({
    queryKey: ["historical", location.latitude, location.longitude, startDate, endDate],
    queryFn: () => fetchHistoricalWeather(location.latitude, location.longitude, startDate, endDate),
    enabled: isValid,
    staleTime: 30 * 60 * 1000,
  });

  const { data: aqData, isLoading: aqLoading } = useQuery({
    queryKey: ["historical-aq", location.latitude, location.longitude, startDate, endDate],
    queryFn: () => fetchHistoricalAirQuality(location.latitude, location.longitude, startDate, endDate),
    enabled: isValid,
    staleTime: 30 * 60 * 1000,
  });

  const isLoading = wLoading || aqLoading;

  const tempData = useMemo(
    () =>
      (weatherData || []).map((d) => ({
        date: d.date,
        max: d.tempMax,
        min: d.tempMin,
        mean: d.tempMean,
      })),
    [weatherData]
  );

  const precipData = useMemo(
    () => (weatherData || []).map((d) => ({ date: d.date, precip: d.precipitationSum })),
    [weatherData]
  );

  const windData = useMemo(
    () => (weatherData || []).map((d) => ({ date: d.date, speed: d.windSpeedMax, dir: d.windDirection })),
    [weatherData]
  );

  const sunData = useMemo(
    () =>
      (weatherData || []).map((d) => {
        const sunrise = d.sunrise ? new Date(d.sunrise).getHours() + new Date(d.sunrise).getMinutes() / 60 : 0;
        const sunset = d.sunset ? new Date(d.sunset).getHours() + new Date(d.sunset).getMinutes() / 60 : 0;
        return { date: d.date, sunrise: +sunrise.toFixed(2), sunset: +sunset.toFixed(2) };
      }),
    [weatherData]
  );

  const aqChartData = useMemo(
    () =>
      (aqData?.dates || []).map((d, i) => ({
        date: d,
        pm10: aqData!.pm10[i],
        pm25: aqData!.pm25[i],
      })),
    [aqData]
  );

  const ChartBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">{title}</h3>
      <div className="h-64 overflow-x-auto scrollbar-thin">
        <div className="min-w-[600px] h-full">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Historical Data
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {!isValid && (
          <p className="text-xs text-destructive">Select a valid range (max 2 years)</p>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {!isLoading && weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartBox title="Temperature (°C)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempData} margin={chartMargin}>
                <defs>
                  <linearGradient id="hMaxG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hMinG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="max" name="Max" stroke="hsl(var(--chart-3))" fill="url(#hMaxG)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="mean" name="Mean" stroke="hsl(var(--chart-2))" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                <Area type="monotone" dataKey="min" name="Min" stroke="hsl(var(--chart-1))" fill="url(#hMinG)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Precipitation (mm)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={precipData} margin={chartMargin}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="precip" name="Precipitation" fill="hsl(var(--weather-rain))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Wind Speed (km/h)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={windData} margin={chartMargin}>
                <defs>
                  <linearGradient id="hWindG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="speed" name="Max Speed" stroke="hsl(var(--chart-4))" fill="url(#hWindG)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Sun Cycle (Hours IST)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sunData} margin={chartMargin}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} domain={[4, 20]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="sunrise" name="Sunrise" stroke="hsl(var(--weather-clear))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sunset" name="Sunset" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          {aqChartData.length > 0 && (
            <ChartBox title="Air Quality - PM10 & PM2.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aqChartData} margin={chartMargin}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="date" tick={axisStyle} />
                  <YAxis tick={axisStyle} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="pm10" name="PM10" stroke="hsl(var(--chart-3))" fill="none" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="pm25" name="PM2.5" stroke="hsl(var(--chart-5))" fill="none" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoricalView;
