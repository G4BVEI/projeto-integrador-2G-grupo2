'use client';
import { Menu } from 'lucide-react';

export default function MenuToggle({ menuOpen, setMenuOpen }) {
  return (
    <div className="absolute left-64 top-4 z-10" style={{ left: menuOpen ? '16rem' : '5rem' }}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-full bg-white shadow-md border text-gray-600 hover:bg-gray-50"
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>
    </div>
  );
}