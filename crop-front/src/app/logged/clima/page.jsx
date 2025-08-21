"use client";

import { useState, useEffect } from "react";

export default function ClimaPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const lat = -27.25;
  const lon = -52.02;
  const locationName = "Concórdia, SC";

  useEffect(() => {
    async function fetchWeather() {
      try {
        const apiKey = "c1a01ddb4d54bf9903e1cefe8c0a35f3";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`
        );
        const data = await response.json();
        if (!response.ok) {
          console.error("Erro da API:", data);
          setWeather(null);
        } else {
          setWeather(data);
        }
      } catch (error) {
        console.error("Erro ao buscar clima:", error);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lon]);

  if (loading) return <p className="text-gray-500 text-center mt-10">Carregando clima...</p>;
  if (!weather) return <p className="text-red-500 text-center mt-10">Não foi possível obter o clima.</p>;

  // Pegando os próximos 5 dias da previsão (OpenWeatherMap retorna a cada 3h, simplificamos para 5 dias)
  const dailyForecast = weather.list.filter((_, i) => i % 8 === 0).slice(0, 5);

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Clima em tempo real</h1>

      {/* Card clima atual */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">{locationName}</h2>
            <p className="capitalize text-lg">{weather.list[0].weather?.[0]?.description || "Sem descrição"}</p>
            <p className="text-4xl font-bold mt-2">{Math.round(weather.list[0].main.temp)}°C</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 md:mt-0 text-center">
            <div>
              <p className="font-bold">{weather.list[0].main.humidity}%</p>
              <p className="text-sm text-gray-500">Umidade</p>
            </div>
            <div>
              <p className="font-bold">{weather.list[0].wind.speed} m/s</p>
              <p className="text-sm text-gray-500">Vento</p>
            </div>
            <div>
              <p className="font-bold">{weather.list[0].main.temp_max}° / {weather.list[0].main.temp_min}°</p>
              <p className="text-sm text-gray-500">Máx/Min</p>
            </div>
          </div>
        </div>

        {/* Previsão 5 dias */}
        <div className="mt-6 grid grid-cols-5 gap-4 text-center">
          {dailyForecast.map((day, idx) => (
            <div key={idx} className="bg-gray-100 rounded-xl p-2">
              <p className="font-bold">{new Date(day.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather?.[0]?.icon}@2x.png`}
                alt={day.weather?.[0]?.description || ""}
                className="mx-auto"
              />
              <p className="text-red-500 font-bold">{Math.round(day.main.temp_max)}°</p>
              <p className="text-blue-500 font-bold">{Math.round(day.main.temp_min)}°</p>
              <p className="text-gray-500 text-sm">Umidade: {day.main.humidity}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Iframe Windy */}
      <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg">
        <iframe
          title="Windy Map"
          src="https://embed.windy.com/embed2.html?lat=-27.25&lon=-52.02&detailLat=-27.25&detailLon=-52.02&width=650&height=450&zoom=5&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=true&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1"
          frameBorder="0"
          className="w-full h-96"
        ></iframe>
      </div>
    </main>
  );
}
