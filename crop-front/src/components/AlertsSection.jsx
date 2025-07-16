'use client';

export default function AlertsSection() {
  return (
    <section className="mt-6 bg-white rounded-xl p-5 shadow">
      <h3 className="text-xl font-bold mb-4">Alertas</h3>
      <ul className="text-base space-y-2">
        <li>⚠️ Baixa umidade no "Campo Sombreado" → irrigar</li>
        <li>ℹ️ Temperatura ideal no "Vale Oeste"</li>
        <li>🗓 Planejar fertilização em "Costa Norte" para semana que vem</li>
      </ul>
    </section>
  );
}
