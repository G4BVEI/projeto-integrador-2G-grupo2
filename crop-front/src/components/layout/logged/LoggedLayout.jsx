"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  User,
  Home,
  Leaf,
  Wrench,
  Cloud,
  Info,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, icon: Icon, children, collapsed }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-green-100 text-green-700"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <Icon size={20} />
      {!collapsed && <span>{children}</span>}
    </Link>
  );
}

export default function LoggedLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      {/* HEADER */}
<header className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm z-[100] px-8">
  <div className="flex items-center justify-between h-16 px-2">
    {/* Logo + Menu */}
    <div className="flex items-center space-x-4 flex-shrink-0">
      <span className="text-xl font-bold text-green-500">CropSense</span>
      <button
        className="p-2 rounded-md hover:bg-gray-100"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu size={24} />
      </button>
    </div>

    {/* Search */}
    <div className="flex-1 max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full h-10 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center space-x-4 flex-shrink-0">
      <button className="p-2 rounded-md hover:bg-gray-100">
        <Bell size={24} />
      </button>
      <button className="p-2 rounded-full hover:bg-gray-100">
        <User size={24} />
      </button>
    </div>
  </div>
</header>


      {/* SIDEBAR */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100%-4rem)] bg-white text-gray-700 border-r border-gray-200 flex flex-col justify-between z-40 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Navigation */}
        <nav className="mt-6 px-2 flex-1 space-y-2">
          <NavLink href="/logged/dashboard" icon={Home} collapsed={collapsed}>
            Dashboard
          </NavLink>
          <NavLink href="/logged/lavouras" icon={Leaf} collapsed={collapsed}>
            Lavouras
          </NavLink>
          <NavLink
            href="/logged/monitoramento"
            icon={Wrench}
            collapsed={collapsed}
          >
            Monitoramento
          </NavLink>
          <NavLink href="/logged/clima" icon={Cloud} collapsed={collapsed}>
            Clima
          </NavLink>
          <NavLink href="/sobre" icon={Info} collapsed={collapsed}>
            Sobre
          </NavLink>
        </nav>

        {/* User Profile */}
        <div className="px-2 pb-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-1 border-2 border-green-500 rounded-full">
              <User size={24} className="text-green-500" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-medium">Usuário Agro</p>
                <p className="text-xs text-gray-500">Produtor Rural</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`mt-16 p-6 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
