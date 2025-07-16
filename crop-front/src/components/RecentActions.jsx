'use client';

export default function RecentActions() {
  return (
    <aside className="bg-gray-50 rounded-xl p-5 shadow w-full max-w-sm">
      <h2 className="text-xl font-bold flex justify-between items-center mb-3">
        Ações Recentes
        <button className="text-emerald-500 border border-emerald-500 px-3 py-1 rounded hover:bg-emerald-500 hover:text-white text-sm font-semibold">Ver todos</button>
      </h2>
      <ul className="space-y-2 text-sm text-gray-700">
        <li>Irrigação 24/06 – Encosta Alta</li>
        <li>Pulverização 23/06 – Vale Verde</li>
        <li>Plantio 22/06 – Campo Sombreado</li>
        <li>Adubação 21/06 – Costa Norte</li>
        <li>Irrigação 20/06 – Encosta Alta</li>
        <li>Pulverização 19/06 – Vale Verde</li>
      </ul>
    </aside>
  );
}