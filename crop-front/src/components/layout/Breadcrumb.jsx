'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.href ? (
            <Link
              href={item.href}
              className={`hover:text-blue-600 ${index === items.length - 1 ? 'font-semibold text-gray-900' : ''}`}
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-900">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="w-4 h-4 mx-2" />}
        </div>
      ))}
    </nav>
  );
}
