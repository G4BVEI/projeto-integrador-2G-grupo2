'use client';
import { Home, Leaf, Wrench, Cloud, Info } from 'lucide-react';

export default function Sidebar({ menuOpen }) {
  return (
    <nav className={`h-full border-r bg-white transition-all duration-300 ${menuOpen ? 'w-64' : 'w-20'} flex flex-col`}>
      <div className="relative p-4 flex items-center font-bold text-xl text-emerald-500">
        {menuOpen && 'CropSense'}
      </div>
      <div className="border-t" />
      <div className="flex flex-col gap-2 p-2 text-gray-700 flex-1">
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-emerald-100 cursor-pointer">
          <Home size={20} className="lucide-icon" />{menuOpen && 'Dashboard'}
        </div>
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-emerald-100 cursor-pointer">
          <Leaf size={20} className="lucide-icon" />{menuOpen && 'Lavouras'}
        </div>
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-emerald-100 cursor-pointer">
          <Wrench size={20} className="lucide-icon" />{menuOpen && 'Monitoramento'}
        </div>
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-emerald-100 cursor-pointer">
          <Cloud size={20} className="lucide-icon" />{menuOpen && 'Clima'}
        </div>
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-emerald-100 cursor-pointer">
          <Info size={20} className="lucide-icon" />{menuOpen && 'Sobre'}
        </div>
      </div>
      <div className="border-t p-4 flex items-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
        {menuOpen && <span className="text-sm text-gray-500">Usuário Agro – Produtor Rural</span>}
      </div>
    </nav>
  );
}