"use client";
import Link from "next/link";
import { Home, Leaf, Wrench, Cloud, Info, User } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white text-gray-700 border-r border-gray-200 flex flex-col justify-between">
      {/* Logo */}
      <div className="pt-8 px-6">
        <h1 className="text-2xl font-bold text-green-500">CropSense</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4 flex-1 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/lavouras"
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-100 text-green-700 transition-colors"
        >
          <Leaf size={20} />
          <span>Lavouras</span>
        </Link>
        <Link
          href="/monitoramento"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Wrench size={20} />
          <span>Monitoramento</span>
        </Link>
        <Link
          href="/clima"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Cloud size={20} />
          <span>Clima</span>
        </Link>
        <Link
          href="/sobre"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Info size={20} />
          <span>Sobre</span>
        </Link>
      </nav>

      {/* User Profile */}
      <div className="px-6 pb-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-1 border-2 border-green-500 rounded-full">
            <User size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium">Usuário Agro</p>
            <p className="text-xs text-gray-500">Produtor Rural</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
