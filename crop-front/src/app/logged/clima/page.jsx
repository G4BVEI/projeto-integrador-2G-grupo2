"use client";

import { useEffect, useState } from "react";

export default function ClimaPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState(null);

  const lat = -27.25;
  const lon = -52.02;
  const locationName = "Concórdia, SC";

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setDebug(null);

      // pegar a chave (garanta .env.local com NEXT_PUBLIC_OPENWEATHER_API_KEY)
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      // DEBUG: verificação da chave (mascarada)
      if (!apiKey) {
        console.error("API key não encontrada: verifique .env.local e reinicie o dev server.");
        setDebug({ error: "API key missing" });
        setWeather(null);
        setLoading(false);
        return;
      }

      const maskedKey = apiKey.slice(0, 4) + "...";
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`;

      try {
        // logs úteis para debug (remova depois)
        console.log("Fetch URL (sem chave visível):", url.replace(apiKey, "SUA_CHAVE_AQUI"));
        console.log("API key (mascarada):", maskedKey);

        const response = await fetch(url);

        // infos do response para debugar
        const status = response.status;
        const statusText = response.statusText;
        const contentType = response.headers.get("content-type");

        // Tentar ler como JSON (pode falhar / retornar vazio)
        let data = null;
        try {
          // clonar para possibilitar leitura limpa em caso de erro
          data = await response.clone().json();
        } catch (jsonErr) {
          // se não for JSON, pega o texto cru
          try {
            const txt = await response.text();
            data = txt || null;
          } catch (txtErr) {
            data = null;
          }
        }

        // salvar debug para UI também
        setDebug({ status, statusText, contentType, data });

        if (!response.ok) {
          console.error("Erro da API (detalhes):", { status, statusText, contentType, data });
          setWeather(null);
        } else {
          console.log("Dados recebidos:", data);
          setWeather(data);
        }
      } catch (fetchError) {
        console.error("Erro de fetch (network/CORS?):", fetchError);
        setDebug({ error: String(fetchError) });
        setWeather(null);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lon]);

  // UI simples com debug
  if (loading) return <p className="text-gray-500 text-center mt-10">Carregando clima...</p>;

  if (!weather)
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">Não foi possível obter o clima.</p>
        <pre className="text-sm text-left max-w-2xl mx-auto mt-4 p-3 bg-gray-100 rounded">
          {JSON.stringify(debug, null, 2)}
        </pre>
        <p className="text-gray-500 mt-2">Cheque o DevTools → Network para ver a requisição. Veja instruções no terminal abaixo.</p>
      </div>
    );

  const dailyForecast = weather.list?.filter((_, i) => i % 8 === 0).slice(0, 5) || [];

  return (
    <main className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-black-500 mb-6 text-left">Clima em tempo real</h1>

      <div className="max-w-4xl mx-auto bg-green-50 text-black rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-green-500">{locationName}</h2>
            <p className="capitalize text-lg">{weather.list[0].weather?.[0]?.description || "Sem descrição"}</p>
            <p className="text-4xl font-bold mt-2">{Math.round(weather.list[0].main.temp)}°C</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 md:mt-0 text-center">
            <div>
              <p className="font-bold">{weather.list[0].main.humidity}%</p>
              <p className="text-sm">Umidade</p>
            </div>
            <div>
              <p className="font-bold">{weather.list[0].wind.speed} m/s</p>
              <p className="text-sm">Vento</p>
            </div>
            <div>
              <p className="font-bold">{Math.round(weather.list[0].main.temp_max)}° / {Math.round(weather.list[0].main.temp_min)}°</p>
              <p className="text-sm">Máx/Min</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-4 text-center">
          {dailyForecast.map((day, idx) => (
            <div key={idx} className="bg-green-300 text-black-800 rounded-xl p-2">
              <p className="font-bold">{new Date(day.dt * 1000).toLocaleDateString("pt-BR", { weekday: "short" })}</p>
              <img src={`https://openweathermap.org/img/wn/${day.weather?.[0]?.icon}@2x.png`} alt={day.weather?.[0]?.description || ""} className="mx-auto" />
              <p className="text-red-500 font-bold">{Math.round(day.main.temp_max)}°</p>
              <p className="text-blue-500 font-bold">{Math.round(day.main.temp_min)}°</p>
              <p className="text-black-500 text-sm">Umidade {day.main.humidity}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg">
        <iframe
          title="Windy Map"
          src="https://embed.windy.com/embed2.html?lat=-27.25&lon=-52.02&zoom=5&level=surface&overlay=wind&product=ecmwf&menu=&message=false&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=false&metricWind=km%2Fh"
          frameBorder="0"
          className="w-full h-96"
        ></iframe>
      </div>
    </main>
  );
}