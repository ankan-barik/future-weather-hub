import React, { useMemo } from "react";

interface Props {
  weatherCode: number;
  isDay: boolean;
}

const DynamicBackground: React.FC<Props> = ({ weatherCode, isDay }) => {
  const getGradient = () => {
    if (!isDay) {
      return "radial-gradient(ellipse at 20% 10%, hsl(240, 35%, 14%) 0%, hsl(220, 20%, 5%) 60%, hsl(220, 20%, 3%) 100%)";
    }
    if (weatherCode === 0) {
      return "radial-gradient(ellipse at 75% 15%, hsl(199, 55%, 22%) 0%, hsl(210, 25%, 10%) 50%, hsl(220, 20%, 6%) 100%)";
    }
    if (weatherCode <= 3) {
      return "radial-gradient(ellipse at 50% 20%, hsl(210, 30%, 16%) 0%, hsl(220, 20%, 8%) 60%, hsl(220, 20%, 5%) 100%)";
    }
    if (weatherCode <= 69) {
      return "radial-gradient(ellipse at 40% 30%, hsl(215, 40%, 15%) 0%, hsl(220, 22%, 8%) 50%, hsl(220, 20%, 5%) 100%)";
    }
    if (weatherCode <= 79) {
      return "radial-gradient(ellipse at 50% 20%, hsl(200, 18%, 20%) 0%, hsl(210, 15%, 10%) 50%, hsl(220, 20%, 5%) 100%)";
    }
    if (weatherCode <= 99) {
      return "radial-gradient(ellipse at 30% 40%, hsl(260, 30%, 14%) 0%, hsl(240, 20%, 8%) 50%, hsl(220, 20%, 4%) 100%)";
    }
    return "radial-gradient(ellipse at 50% 30%, hsl(210, 20%, 12%) 0%, hsl(220, 20%, 7%) 70%)";
  };

  const isRainy = weatherCode >= 50 && weatherCode <= 69;
  const isStormy = weatherCode >= 80 && weatherCode <= 99;
  const isSnowy = weatherCode >= 70 && weatherCode <= 79;
  const isClear = weatherCode <= 3;

  // Generate stars for night
  const stars = useMemo(() => {
    if (isDay) return [];
    return Array.from({ length: 40 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      size: 1 + Math.random() * 2,
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 3}s`,
    }));
  }, [isDay]);

  // Rain drops
  const rainDrops = useMemo(() => {
    if (!isRainy && !isStormy) return [];
    return Array.from({ length: isStormy ? 30 : 15 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.5 + Math.random() * 0.8}s`,
      opacity: 0.15 + Math.random() * 0.15,
    }));
  }, [isRainy, isStormy]);

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-[1500ms]"
      style={{ background: getGradient() }}
    >
      {/* Primary orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: '700px',
          height: '700px',
          top: '-5%',
          right: '-15%',
          background: isDay
            ? 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 65%)'
            : 'radial-gradient(circle, hsl(240 40% 25% / 0.08) 0%, transparent 65%)',
          animation: 'drift 25s ease-in-out infinite',
        }}
      />

      {/* Secondary orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          bottom: '-10%',
          left: '-10%',
          background: isDay
            ? 'radial-gradient(circle, hsl(var(--accent) / 0.04) 0%, transparent 65%)'
            : 'radial-gradient(circle, hsl(260 30% 20% / 0.06) 0%, transparent 65%)',
          animation: 'drift 30s ease-in-out infinite reverse',
        }}
      />

      {/* Clear day: subtle warm glow */}
      {isClear && isDay && (
        <div
          className="absolute rounded-full"
          style={{
            width: '300px',
            height: '300px',
            top: '5%',
            right: '10%',
            background: 'radial-gradient(circle, hsl(45 93% 58% / 0.06) 0%, transparent 70%)',
            animation: 'pulse-glow 4s ease-in-out infinite',
          }}
        />
      )}

      {/* Night stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-foreground"
          style={{
            width: s.size,
            height: s.size,
            left: s.left,
            top: s.top,
            animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}

      {/* Rain effect */}
      {rainDrops.map((d, i) => (
        <div
          key={i}
          className="absolute w-px bg-weather-rain"
          style={{
            height: '20px',
            left: d.left,
            top: '-20px',
            opacity: d.opacity,
            animation: `rain-fall ${d.duration} linear ${d.delay} infinite`,
          }}
        />
      ))}

      {/* Storm flash */}
      {isStormy && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'hsl(0 0% 100% / 0.04)',
            animation: 'flash 6s ease-in-out infinite',
          }}
        />
      )}

      {/* Snow shimmer */}
      {isSnowy && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, hsl(200 20% 90% / 0.02) 0%, transparent 50%)',
            animation: 'pulse-glow 5s ease-in-out infinite',
          }}
        />
      )}

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
};

export default DynamicBackground;
