// WeatherSection.jsx
"use client";

import React, { useEffect, useState } from 'react';

export default function WeatherSection({ lat = -27.25, lon = -52.02, apiKey = '', locationName = 'Minha cidade' }) {
  const [data, setData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sampleData = {
    current: {
      temp: 13,
      humidity: 60,
      wind_speed: 10,
      uvi: 8,
      weather: [{ main: 'Clear', description: 'céu limpo', icon: '01d' }]
    },
    daily: [
      { dt: 0, temp: { max: 22, min: 22 }, weather: [{ main: 'Sunny' }], humidity: 30, wind_speed: 11, pop: 0.1 },
      { dt: 1, temp: { max: 33, min: 23 }, weather: [{ main: 'Sunny' }], humidity: 20, wind_speed: 20, pop: 0.2 },
      { dt: 2, temp: { max: 31, min: 22 }, weather: [{ main: 'Clouds' }], humidity: 45, wind_speed: 15, pop: 0.33 },
      { dt: 3, temp: { max: 29, min: 21 }, weather: [{ main: 'Rain' }], humidity: 40, wind_speed: 8, pop: 0.85 },
      { dt: 4, temp: { max: 28, min: 20 }, weather: [{ main: 'Rain' }], humidity: 40, wind_speed: 12, pop: 0.83 }
    ]
  };

  useEffect(() => {
    let mounted = true;
    async function fetchWeather() {
      setLoading(true);
      setError(null);
      if (!apiKey) {
        setTimeout(() => {
          if (mounted) {
            setData(sampleData);
            setLoading(false);
          }
        }, 300);
        return;
      }

      try {
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&exclude=minutely,hourly,alerts&appid=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao buscar dados do clima');
        const json = await res.json();
        if (mounted) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o clima.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchWeather();
    return () => (mounted = false);
  }, [lat, lon, apiKey]);

  function dayLabel(index) {
    const names = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return names[index % 7];
  }

  if (loading) return (
    <div className="p-6">Carregando clima...</div>
  );
  if (error) return (
    <div className="p-6 text-red-600">{error}</div>
  );

  const cur = data.current;
  const daily = data.daily.slice(0, 5);

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-none bg-white rounded-xl p-6 w-full md:w-1/3 border border-gray-100 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500">{locationName}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-5xl font-bold">{Math.round(cur.temp)}°C</div>
                  <div className="text-sm text-gray-500">{cur.weather?.[0]?.description}</div>
                </div>
              </div>
              <div className="text-4xl">
                <img src={`https://openweathermap.org/img/wn/${cur.weather?.[0]?.icon || '01d'}@2x.png`} alt="icon" />
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500 space-y-1">
              <div>Umidade: <span className="text-gray-700">{cur.humidity}%</span></div>
              <div>Vento: <span className="text-gray-700">{cur.wind_speed} km/h</span></div>
              <div>UV: <span className="text-gray-700">{cur.uvi}</span></div>
              <div>Prec.: <span className="text-gray-700">{Math.round((daily[0].pop || 0) * 100)}%</span></div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex gap-4 overflow-x-auto py-2">
              {daily.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-none w-36 p-4 rounded-xl border ${selectedDay === i ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200'} shadow-sm bg-white text-left`}
                >
                  <div className="text-sm text-gray-500">{dayLabel(i)}</div>
                  <div className="mt-2 text-lg font-semibold">
                    <span className="text-red-500">{Math.round(d.temp.max)}°</span>
                    <span className="text-gray-400"> {Math.round(d.temp.min)}°</span>
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    Umidade: <span className="text-gray-600">{d.humidity}%</span>
                    <br />Vento: <span className="text-gray-600">{d.wind_speed} km/h</span>
                    <br />Prec.: <span className="text-gray-600">{Math.round((d.pop || 0) * 100)}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="h-80 md:h-[500px] rounded-lg overflow-hidden">
          <iframe
            title="Windy Map"
            width="100%"
            height="100%"
            src={`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=5&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=true&metricWind=km%2Fh`}
            frameBorder="0"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h4 className="font-semibold mb-2">Detalhes - {dayLabel(selectedDay)}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <div className="text-xs text-gray-500">Máx</div>
            <div className="font-medium">{Math.round(daily[selectedDay].temp.max)}°C</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Mín</div>
            <div className="font-medium">{Math.round(daily[selectedDay].temp.min)}°C</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Precipitação</div>
            <div className="font-medium">{Math.round((daily[selectedDay].pop || 0) * 100)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Vento</div>
            <div className="font-medium">{daily[selectedDay].wind_speed} km/h</div>
          </div>
        </div>
      </div>
    </section>
  );
}