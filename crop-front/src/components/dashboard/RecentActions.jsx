'use client'

import { useRouter } from "next/navigation";

export default function RecentActions({ actions }) {
  const router = useRouter();

  return (
    <aside className="w-80 bg-white rounded-lg shadow-sm p-4">
      <h2 className="flex justify-between items-center mb-4 text-lg font-semibold text-gray-800">
        Ações Recentes
        <button
          onClick={() => router.push("/protegido/dashboard/atividades")}
          className="text-sm text-green-500 hover:underline"
        >
          Ver todos
        </button>
      </h2>
      <ul className="space-y-2">
        {actions.map((action, index) => (
          <li
            key={index}
            className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded transition-colors"
          >
            {action}
          </li>
        ))}
      </ul>
    </aside>
  )
}
