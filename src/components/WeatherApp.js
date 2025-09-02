import React, { useState } from "react";
import "./WeatherApp.css"; // 👈 custom CSS

export default function WeatherApp() {
  const [city, setCity] = useState("Herndon");
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(false);

  const toF = (c) => ((c * 9) / 5 + 32).toFixed(1);

  const getWeatherIcon = (code) => {
    if ([0].includes(code)) return "☀️";
    if ([1, 2].includes(code)) return "🌤️";
    if ([3].includes(code)) return "☁️";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "🌧️";
    if ([66, 67, 71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([80, 81, 82].includes(code)) return "🌦️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "❓";
  };

  const getWeatherDesc = (code) => {
    if ([0].includes(code)) return "Clear Sky";
    if ([1].includes(code)) return "Mainly Clear";
    if ([2].includes(code)) return "Partly Cloudy";
    if ([3].includes(code)) return "Overcast";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55].includes(code)) return "Drizzle";
    if ([61, 63, 65].includes(code)) return "Rain";
    if ([66, 67].includes(code)) return "Freezing Rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowfall";
    if ([80, 81, 82].includes(code)) return "Rain Showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Unknown";
  };

  const fetchCoordinates = async (cityName) => {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country,
      };
    }
    return null;
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setWeather(null);
      setHourly([]);
      setDaily([]);

      const location = await fetchCoordinates(city);
      if (!location) {
        alert("City not found!");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,cloudcover,windspeed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode&timezone=auto`
      );
      const data = await res.json();

      // Get index of current hour
      const now = new Date();
      const currentHourIndex = data.hourly.time.findIndex(
        (t) => new Date(t).getHours() === now.getHours()
      );

      // current weather
      setWeather({
        city: location.name,
        country: location.country,
        temp: data.current_weather.temperature,
        wind: data.current_weather.windspeed,
        code: data.current_weather.weathercode,
        humidity:
          currentHourIndex !== -1
            ? data.hourly.relativehumidity_2m[currentHourIndex]
            : null,
        clouds:
          currentHourIndex !== -1
            ? data.hourly.cloudcover[currentHourIndex]
            : null,
      });

      // hourly forecast → next 12 hours
      const hourlyData = data.hourly.time
        .map((time, i) => ({
          time,
          temp: data.hourly.temperature_2m[i],
          humidity: data.hourly.relativehumidity_2m[i],
          clouds: data.hourly.cloudcover[i],
          code: data.hourly.weathercode[i],
        }))
        .filter((h) => new Date(h.time) > now)
        .slice(0, 12);

      setHourly(hourlyData);

      // daily forecast
      const dailyData = data.daily.time.map((day, i) => ({
        day,
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
        code: data.daily.weathercode[i],
      }));
      setDaily(dailyData.slice(1)); // skip today

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="weather-container">
      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Search</button>
      </div>

      {loading && <p>Loading...</p>}

      {/* Current Weather */}
      {weather && (
        <div className="weather-current">
          <h2>
            {weather.city}, {weather.country}
          </h2>
          <div className="current-details">
            <div className="current-left">
              <div className="icon">{getWeatherIcon(weather.code)}</div>
              <div className="temp">
                {weather.temp}°C | {toF(weather.temp)}°F
              </div>
              <p>{getWeatherDesc(weather.code)}</p>
            </div>
            <div className="current-right">
              <p>Humidity: {weather.humidity ?? "N/A"}%</p>
              <p>Cloud Cover: {weather.clouds ?? "N/A"}%</p>
              <p>Wind: {weather.wind} m/s</p>
              <p>Feels like: {weather.temp}°</p>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Forecast */}
      {hourly.length > 0 && (
        <div className="hourly-container">
          <h3>Next 12 Hours</h3>
          <div className="hourly-list">
            {hourly.map((h, i) => (
              <div key={i} className="hourly-item">
                <p>
                  {new Date(h.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="icon">{getWeatherIcon(h.code)}</div>
                <p>{h.temp}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Forecast */}
      {/* Weekly Forecast */}
{daily.length > 0 && (
  <div className="weekly-container">
    <h3>Weekly Forecast</h3>
    <div className="weekly-list">
      {daily.map((d, i) => (
        <div key={i} className="weekly-item">
          <div className="day">
            {new Date(d.day).toLocaleDateString("en-US", {
              weekday: "long",
            })}
          </div>
          <div className="icon">{getWeatherIcon(d.code)}</div>
          <div className="desc">{getWeatherDesc(d.code)}</div>
          <div className="temps">
            {d.max}°C / {d.min}°C
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
}
