'use client';

import React from "react";
import { Menu, Bell, User } from "lucide-react";

export default function LoggedHeader() {
  return (
    <header className="w-full bg-white shadow-sm top-0 z-[100] fixed">
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
              {/* Se quiser colocar um ícone dentro do input */}
              {/* <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /> */}
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
  );
}
