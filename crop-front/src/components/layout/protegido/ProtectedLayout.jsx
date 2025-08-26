'use client';

import React, { useState, useEffect } from "react";
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
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GlobalSearch from "../GlobalSearch"; // Importa o GlobalSearch
import Footer from "../../../components/layout/Footer"; // Importação do Footer

function NavLink({ href, icon: Icon, children, collapsed, session }) {
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

export default function ProtectedLayout({ children }) {
  
  const [collapsed, setCollapsed] = useState(false);
  const [session, setSession] = useState(null);
  const router = useRouter();
  const supabase = createClient();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from("user_data") // ⚠️ your table name
          .select("username, img_url")
          .eq("id", session.user.id)
          .single();
        if (!error) setUserData(data);
      }
    };

    getUserData();
  }, [session, supabase]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
      } else {
        setSession(session);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.push("/auth/login");
    });

    return () => subscription?.unsubscribe();
  }, [router, supabase.auth]);

  if (!session) {
    return null;
  }

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

          {/* Search - COMPONENTE ATUALIZADO */}
          <div className="flex-1 max-w-xl mx-auto">
            <GlobalSearch />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Link href="/protegido/notificacoes">
              <button className="p-2 rounded-md hover:bg-gray-100">
                <Bell size={24} />
              </button>
            </Link>
            <Link href="/protegido/perfil">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <User size={24} />
              </button>
            </Link>
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
          <NavLink href="/protegido/dashboard" icon={Home} collapsed={collapsed} session={session}>
            Dashboard
          </NavLink>
          <NavLink href="/protegido/lavouras" icon={Leaf} collapsed={collapsed} session={session}>
            Lavouras
          </NavLink>
          <NavLink href="/protegido/monitoramento" icon={Wrench} collapsed={collapsed} session={session}>
            Monitoramento
          </NavLink>
          <NavLink href="/protegido/clima" icon={Cloud} collapsed={collapsed} session={session}>
            Clima
          </NavLink>
          <NavLink href="/protegido/atividades/novo" icon={Info} collapsed={collapsed} session={session}>
            Nova Atividade
          </NavLink>
        </nav>

        {/* User Profile */}
        <Link
          href="/protegido/perfil"
          className="px-2 pb-6 pt-4 border-t border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {userData?.img_url ? (
              <img
                src={userData.img_url}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-green-500 object-cover"
              />
            ) : (
              <div className="p-1 border-2 border-green-500 rounded-full">
                <User size={24} className="text-green-500" />
              </div>
            )}

            {!collapsed && (
              <div>
                <p className="text-sm font-medium">{session.user.email}</p>
                <p className="text-xs text-gray-500">
                  {userData?.username || "Usuário"}
                </p>
              </div>
            )}
          </div>
        </Link>

      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`mt-16 p-6 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
        style={{
          height: "calc(100vh - 4rem)",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
