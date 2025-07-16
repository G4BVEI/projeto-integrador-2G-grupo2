'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Chart } from 'chart.js/auto';
import 'leaflet/dist/leaflet.css';
import Sidebar from '@/components/Sidebar';
import MenuToggle from '@/components/MenuToggle';
import MapSection from '@/components/MapSection';
import ChartsSection from '@/components/ChartSection';
import AlertsSection from '@/components/AlertsSection';
import LoggedHeader from '@/components/LoggedHeader';

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(true);
  const precipChartRef = useRef(null);
  const tempChartRef = useRef(null);
  const precipChartInstance = useRef(null);
  const tempChartInstance = useRef(null);

  useEffect(() => {
    const map = L.map('map').setView([-27.23, -52.02], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    const markers = [
      { pos: [-27.21, -52.00], label: 'Encosta Alta' },
      { pos: [-27.25, -52.05], label: 'Vale Verde' },
      { pos: [-27.22, -52.03], label: 'Campo Sombreado' },
      { pos: [-27.20, -52.01], label: 'Costa Norte' },
    ];

    markers.forEach(({ pos, label }) => {
      L.marker(pos).addTo(map).bindPopup(label);
    });

    if (precipChartRef.current) {
      if (precipChartInstance.current) precipChartInstance.current.destroy();
      precipChartInstance.current = new Chart(precipChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
          datasets: [
            {
              label: 'mm',
              data: [12, 5, 8, 20, 15],
              backgroundColor: '#00d084',
              borderRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    if (tempChartRef.current) {
      if (tempChartInstance.current) tempChartInstance.current.destroy();
      tempChartInstance.current = new Chart(tempChartRef.current, {
        type: 'line',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
          datasets: [
            {
              label: '°C',
              data: [22, 24, 23, 25, 26],
              borderColor: '#00d084',
              backgroundColor: 'rgba(0, 208, 132, 0.2)',
              fill: true,
              tension: 0.3,
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: false } },
        },
      });
    }

    return () => {
      if (precipChartInstance.current) precipChartInstance.current.destroy();
      if (tempChartInstance.current) tempChartInstance.current.destroy();
      map.remove();
    };
  }, []);

  return (
    <div className="flex h-screen font-sans text-gray-900 overflow-hidden">
      <Sidebar menuOpen={menuOpen} />
      <MenuToggle menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="flex-1 overflow-y-auto px-6 py-4">
        <LoggedHeader />
        <MapSection />
        <ChartsSection precipChartRef={precipChartRef} tempChartRef={tempChartRef} />
        <AlertsSection />
      </main>
    </div>
  );
}