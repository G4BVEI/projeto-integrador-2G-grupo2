'use client'

import { Menu } from 'lucide-react'

export default function MenuToggle({ isOpen, onToggle }) {
  return (
    <div className="relative">
      <div
        className="absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} className="text-gray-600" />
      </div>
    </div>
  )
}

