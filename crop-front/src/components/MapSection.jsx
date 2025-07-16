'use client';
import RecentActions from './RecentActions';

export default function MapSection() {
  return (
    <section className="flex flex-wrap gap-6 mb-6">
      <div id="map" className="flex-grow min-w-[300px] h-96 rounded-xl border" />
      <RecentActions />
    </section>
  );
}