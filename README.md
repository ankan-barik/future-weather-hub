
# Atmos — React Weather Intelligence Dashboard

Production-grade React weather dashboard built for the Lattice Junior Frontend Developer selection test.

---

## Quick Start



cd future-weather-hub

# 2. Install dependencies
npm install

# 3. Start dev server
npm start
```

Opens at `http://localhost:8080` — allow location access when prompted.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 (Create React App) |
| **Charts** | Recharts 2.x |
| **Weather API** | Open-Meteo (free, no key needed) |
| **Air Quality API** | Open-Meteo Air Quality |
| **Geocoding** | Open-Meteo Geocoding API |
| **Reverse Geocoding** | Nominatim / OpenStreetMap |
| **Background** | HTML5 Canvas (requestAnimationFrame) |
| **Styling** | Pure CSS with CSS Variables |
| **State** | React Hooks (useState, useEffect, useCallback, useMemo) |



---

## Features

### Page 1 — Current & Hourly
- Auto GPS detection + reverse geocoding to city name
- City search bar (global, 195+ countries via Open-Meteo Geocoding API)
- Temperature Min / Max / Current with °C / °F toggle
- Precipitation, Humidity, UV Index, Sunrise & Sunset
- Max Wind Speed + Wind Direction Compass
- Precipitation Probability & Total
- Air Quality: AQI (European), PM10, PM2.5, CO, NO₂, SO₂
- 6 Hourly Charts: Temperature · Humidity · Precipitation · Visibility · Wind Speed · PM10+PM2.5

### Page 2 — Historical (max 2 years)
- Date range picker + 1M / 3M / 6M / 1Y / 2Y presets
- Temperature trends (Max / Mean / Min)
- Sun Cycle chart (Sunrise & Sunset in IST decimal hours)
- Precipitation total
- Max Wind Speed
- PM10 & PM2.5 with WHO reference lines
- Horizontal scroll on all charts



### Dynamic Animated Background
| Weather | Animation |
|---|---|
| Rain / Drizzle | Falling raindrop particles |
| Thunderstorm | Heavy rain + random lightning bolts |
| Snow | Drifting snowflakes |
| Fog | Slow glowing fog blobs |
| Clear Night | Twinkling star field |
| Clear Day | Atmospheric glow particles |
| Cloudy | Drifting cloud shapes |

---

## APIs Used (All Free, No API Key)



## Build for Production

```bash
npm run build
```

Outputs to `/build` — deploy to Vercel.

---

Gets a live URL like ` `

---

## Contact
hr@thelattice.in
