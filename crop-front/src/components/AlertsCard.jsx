export default function AlertsCard({ alerts }) {
  return (
    <section className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Alertas</h3>
      <ul className="space-y-2">
        {alerts.map((alert, index) => (
          <li key={index} className="text-sm p-2 bg-gray-50 rounded text-gray-700">
            {alert}
          </li>
        ))}
      </ul>
    </section>
  )
}

