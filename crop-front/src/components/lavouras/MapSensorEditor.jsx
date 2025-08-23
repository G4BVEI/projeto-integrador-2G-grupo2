'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';

// Fix para ícones padrão do Leaflet em Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapSensorEditor({ 
  talhao, 
  point, 
  setPoint 
}) {
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markerRef = useRef(null);

  // Verifica se ponto está dentro do polígono do talhão
  const isPointInsideField = (p, fieldCoords) => {
    if (!fieldCoords || fieldCoords.length < 3) return false;
    try {
      const pointFeature = turf.point([p[1], p[0]]);
      const polygonFeature = turf.polygon([fieldCoords.map(c => [c[1], c[0]])]);
      return turf.booleanPointInPolygon(pointFeature, polygonFeature);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map-sensor-editor').setView(
        talhao?.localizacao_json?.coordinates?.[0]?.length
          ? [talhao.localizacao_json.coordinates[0][0][0], talhao.localizacao_json.coordinates[0][0][1]]
          : [-15.788, -47.879], 
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);

      // Adicionar clique para definir sensor
      map.on('click', (e) => {
        const newPoint = [e.latlng.lat, e.latlng.lng];

        if (talhao && talhao.localizacao_json?.coordinates) {
          const inside = isPointInsideField(newPoint, talhao.localizacao_json.coordinates[0]);
          if (!inside) {
            alert('O sensor deve estar dentro do talhão!');
            return;
          }
        }

        setPoint(newPoint);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [talhao]);

  // Atualiza marcador sempre que point mudar
  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng(point);
    } else if (point) {
      const marker = L.marker(point, { draggable: true }).addTo(layerRef.current);
      marker.on('dragend', (e) => {
        const newCoords = [e.target.getLatLng().lat, e.target.getLatLng().lng];

        if (talhao && talhao.localizacao_json?.coordinates) {
          const inside = isPointInsideField(newCoords, talhao.localizacao_json.coordinates[0]);
          if (!inside) {
            alert('O sensor deve permanecer dentro do talhão!');
            marker.setLatLng(point);
            return;
          }
        }

        setPoint(newCoords);
      });
      markerRef.current = marker;
    }
  }, [point, talhao]);

  // Desenha polígono do talhão
  useEffect(() => {
    if (!mapRef.current || !layerRef.current || !talhao?.localizacao_json?.coordinates) return;

    const coords = talhao.localizacao_json.coordinates[0].map(c => [c[0], c[1]]);
    L.polygon(coords, { color: '#16a34a', weight: 2, fillOpacity: 0.2 }).addTo(layerRef.current);

    mapRef.current.fitBounds(coords);
  }, [talhao]);

  return <div id="map-sensor-editor" className="w-full h-96 rounded" />;
}
