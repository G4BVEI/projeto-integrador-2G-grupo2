'use client';

import React from "react";
import { Menu, Bell, User, Home, Leaf, Wrench, Cloud, Info } from "lucide-react";
import Link from "next/link";

export default function LoggedLayout({ children }) {
  return (
    <div>
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo + Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md hover:bg-gray-100">
                <Menu size={24} />
              </button>
              <span className="text-xl font-bold text-green-500">CropSense</span>
            </div>
            
            {/* Search */}
            <div className="flex-1 mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full h-10 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md hover:bg-gray-100">
                <Bell size={24} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <User size={24} />
              </button>
            </div>
            
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="fixed top-16 left-0 h-[calc(100%-4rem)] w-64 bg-white text-gray-700 border-r border-gray-200 flex flex-col justify-between z-40">
        {/* Navigation */}
        <nav className="mt-6 px-4 flex-1 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/lavouras" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-100 text-green-700 transition-colors">
            <Leaf size={20} />
            <span>Lavouras</span>
          </Link>
          <Link href="/monitoramento" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Wrench size={20} />
            <span>Monitoramento</span>
          </Link>
          <Link href="/clima" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Cloud size={20} />
            <span>Clima</span>
          </Link>
          <Link href="/sobre" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
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

      {/* MAIN CONTENT */}
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
}
