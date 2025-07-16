'use client';

export default function ChartsSection({ precipChartRef, tempChartRef }) {
  return (
    <section className="flex flex-wrap gap-6 justify-between">
      <div className="bg-white rounded-xl p-5 shadow flex-1 min-w-[280px]">
        <h3 className="text-xl font-bold mb-3">Precipitação</h3>
        <canvas ref={precipChartRef} height="150" />
        <button className="mt-3 bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 font-semibold text-sm">Acessar biblioteca completa</button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow flex-1 min-w-[280px]">
        <h3 className="text-xl font-bold mb-3">Clima</h3>
        <p className="font-semibold mb-1">Concórdia, SC</p>
        <p>Temperatura atual: <strong>25°C</strong></p>
        <p>Temperatura mínima: <strong>18°C</strong></p>
        <canvas ref={tempChartRef} height="100" className="my-2" />
        <p className="text-sm text-gray-500">Previsão para 5 dias...</p>
      </div>
    </section>
  );
}