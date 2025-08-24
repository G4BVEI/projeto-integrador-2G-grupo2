export default function NotificationItem({ notification }) {
  return (
    <div
      className={`p-4 rounded-xl border shadow-sm transition ${
        notification.lida ? "bg-white" : "bg-yellow-50 border-yellow-300"
      }`}
    >
      <h3 className="font-semibold text-gray-800">{notification.titulo}</h3>
      <p className="text-gray-600 text-sm">{notification.descricao}</p>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
        <span>{new Date(notification.criado_em).toLocaleString()}</span>
        {!notification.lida && (
          <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
            Novo
          </span>
        )}
      </div>
    </div>
  );
}