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
const gridStyle = { strokeDasharray: "3 3", stroke: "hsl(220, 14%, 16%)" };
const axisStyle = { fontSize: 10, fill: "hsl(215, 12%, 48%)" };

const tooltipStyle = {
  background: 'hsl(220, 18%, 11%)',
  border: '1px solid hsl(220, 14%, 20%)',
  borderRadius: '12px',
  fontSize: '11px',
  boxShadow: '0 8px 32px -4px hsl(220, 20%, 5% / 0.5)',
};

const HistoricalView: React.FC<Props> = ({ location }) => {
  const today = new Date().toISOString().split("T")[0];
  const oneMonthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);

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
    () => (weatherData || []).map((d) => ({ date: d.date, max: d.tempMax, min: d.tempMin, mean: d.tempMean })),
    [weatherData]
  );

  const precipData = useMemo(
    () => (weatherData || []).map((d) => ({ date: d.date, precip: d.precipitationSum })),
    [weatherData]
  );

  const windData = useMemo(
    () => (weatherData || []).map((d) => ({ date: d.date, speed: d.windSpeedMax })),
    [weatherData]
  );

  const sunData = useMemo(
    () => (weatherData || []).map((d) => {
      const sunrise = d.sunrise ? new Date(d.sunrise).getHours() + new Date(d.sunrise).getMinutes() / 60 : 0;
      const sunset = d.sunset ? new Date(d.sunset).getHours() + new Date(d.sunset).getMinutes() / 60 : 0;
      return { date: d.date, sunrise: +sunrise.toFixed(2), sunset: +sunset.toFixed(2) };
    }),
    [weatherData]
  );

  const aqChartData = useMemo(
    () => (aqData?.dates || []).map((d, i) => ({ date: d, pm10: aqData!.pm10[i], pm25: aqData!.pm25[i] })),
    [aqData]
  );

  const ChartBox: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
    title, children, className = "",
  }) => (
    <div className={`glass-card p-4 md:p-5 ${className}`}>
      <h3 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest">{title}</h3>
      <div className="h-56 overflow-x-auto scrollbar-thin">
        <div className="min-w-[550px] h-full">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-reveal">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 tracking-tight">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <CalendarDays className="w-4 h-4 text-primary" />
          </div>
          Historical Data
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-card/40 backdrop-blur-xl text-foreground text-sm px-3 py-2 rounded-xl border border-border/60 outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
          <span className="text-muted-foreground/60 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-card/40 backdrop-blur-xl text-foreground text-sm px-3 py-2 rounded-xl border border-border/60 outline-none focus:ring-1 focus:ring-primary/40 transition-all"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
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
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="precip" name="Precipitation" fill="hsl(var(--weather-rain))" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Wind Speed (km/h)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={windData} margin={chartMargin}>
                <defs>
                  <linearGradient id="hWindG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="speed" name="Max Speed" stroke="hsl(var(--chart-4))" fill="url(#hWindG)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Sun Cycle (Hours)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sunData} margin={chartMargin}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} domain={[4, 20]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="sunrise" name="Sunrise" stroke="hsl(var(--weather-clear))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sunset" name="Sunset" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          {aqChartData.length > 0 && (
            <ChartBox title="Air Quality — PM10 & PM2.5" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aqChartData} margin={chartMargin}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="date" tick={axisStyle} />
                  <YAxis tick={axisStyle} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
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
