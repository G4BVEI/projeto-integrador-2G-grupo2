'use client';

export default function LoggedHeader() {
  return (
    <header className="flex items-center justify-between py-4 border-b mb-6">
      <div className="flex-1 flex justify-center">
        <input
          type="search"
          placeholder="Buscar..."
          className="w-full max-w-md px-4 py-2 border rounded-full text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>
      <div className="flex gap-4 text-xl text-gray-500 pr-4">
        <div title="Notificações">🔔</div>
        <div title="Usuário">👤</div>
      </div>
    </header>
  );
}
