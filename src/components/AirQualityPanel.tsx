import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import type { AirQuality } from "@/types/weather";
import { getAQILabel } from "@/lib/weather-api";

interface Props {
  data: AirQuality[];
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
    co: d.co,
    no2: d.no2,
    so2: d.so2,
    o3: d.o3,
  }));

  return (
    <div className="space-y-4 animate-reveal-delay-3">
      <h2 className="text-lg font-semibold text-foreground">Air Quality</h2>

      {/* AQI Overview */}
      {currentAQ && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">AQI</p>
              <p className="text-4xl font-bold font-mono text-foreground">{currentAQ.aqi}</p>
              <p className={`text-sm font-medium ${aqiInfo.color}`}>{aqiInfo.label}</p>
            </div>
            <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: "PM10", value: currentAQ.pm10, unit: "μg/m³" },
                { label: "PM2.5", value: currentAQ.pm25, unit: "μg/m³" },
                { label: "CO", value: currentAQ.co, unit: "μg/m³" },
                { label: "NO₂", value: currentAQ.no2, unit: "μg/m³" },
                { label: "SO₂", value: currentAQ.so2, unit: "μg/m³" },
                { label: "O₃", value: currentAQ.o3, unit: "μg/m³" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-mono font-semibold text-foreground">{m.value?.toFixed(1) ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{m.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PM Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">PM10 & PM2.5</h3>
          <div className="h-56 overflow-x-auto scrollbar-thin">
            <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={chartMargin}>
                  <defs>
                    <linearGradient id="pm10Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="time" tick={axisStyle} />
                  <YAxis tick={axisStyle} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="pm10" name="PM10" stroke="hsl(var(--chart-3))" fill="url(#pm10Grad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pm25" name="PM2.5" stroke="hsl(var(--chart-5))" fill="url(#pm25Grad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Gases</h3>
          <div className="h-56 overflow-x-auto scrollbar-thin">
            <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={chartMargin}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="time" tick={axisStyle} />
                  <YAxis tick={axisStyle} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
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
