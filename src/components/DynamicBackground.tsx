import React from "react";
import { getWeatherDescription } from "@/lib/weather-api";

interface Props {
  weatherCode: number;
  isDay: boolean;
}

const DynamicBackground: React.FC<Props> = ({ weatherCode, isDay }) => {
  const weather = getWeatherDescription(weatherCode);

  const getGradient = () => {
    if (!isDay) {
      return "radial-gradient(ellipse at 30% 20%, hsl(240, 30%, 12%) 0%, hsl(220, 20%, 7%) 70%)";
    }
    if (weatherCode === 0) {
      return "radial-gradient(ellipse at 70% 20%, hsl(199, 50%, 18%) 0%, hsl(220, 20%, 7%) 70%)";
    }
    if (weatherCode <= 3) {
      return "radial-gradient(ellipse at 50% 30%, hsl(210, 30%, 15%) 0%, hsl(220, 20%, 7%) 70%)";
    }
    if (weatherCode <= 69) {
      return "radial-gradient(ellipse at 40% 40%, hsl(215, 35%, 14%) 0%, hsl(220, 20%, 7%) 70%)";
    }
    if (weatherCode <= 79) {
      return "radial-gradient(ellipse at 50% 30%, hsl(200, 15%, 18%) 0%, hsl(220, 20%, 7%) 70%)";
    }
    if (weatherCode <= 99) {
      return "radial-gradient(ellipse at 30% 50%, hsl(260, 25%, 12%) 0%, hsl(220, 20%, 7%) 70%)";
    }
    return "radial-gradient(ellipse at 50% 30%, hsl(210, 20%, 12%) 0%, hsl(220, 20%, 7%) 70%)";
  };

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-1000"
      style={{ background: getGradient() }}
    >
      {/* Subtle animated orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03] animate-pulse-glow"
        style={{
          background: isDay
            ? "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)"
            : "radial-gradient(circle, hsl(240, 40%, 30%) 0%, transparent 70%)",
          top: "10%",
          right: "-10%",
        }}
      />
    </div>
  );
};

export default DynamicBackground;
