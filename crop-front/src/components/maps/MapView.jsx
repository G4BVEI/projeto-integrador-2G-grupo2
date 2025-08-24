'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mapeamento de cores por tipo de sensor
const sensorTypeColors = {
  "Temperatura": "#ef4444", // Vermelho
  "Umidade": "#3b82f6",     // Azul
  "Pluviometro": "#1d4ed8", // Azul escuro
  "Pressao": "#eab308",     // Amarelo
  "Luminosidade": "#f97316",// Laranja
  "Outro": "#6b7280"        // Cinza
};

export default function MapView({ fields = [], selectedIds = [], sensorPoints = [] }) {
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map-view-container').setView([-15.788, -47.879], 13);

      L.tileLayer('http://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();

    const field = fields.find(f => selectedIds.includes(f.id));
    if (field && field.coords && field.coords.length >= 3) {
      const polygon = L.polygon(field.coords, {
        color: '#16a34a',
        weight: 2,
        fillOpacity: 0.3,
      }).addTo(layerRef.current);

      // ⚠️ REMOVIDO: bindTooltip do talhão para evitar popups duplicados
      // O talhão não terá nenhum popup ou tooltip
    }

    sensorPoints.forEach(sensor => {
      if (sensor.localizacao_json?.coordinates) {
        const [lng, lat] = sensor.localizacao_json.coordinates;
        
        // Determina a cor baseada no tipo do sensor
        const color = sensorTypeColors[sensor.tipo] || sensorTypeColors["Outro"];
        
        const marker = L.marker([lat, lng], {
          draggable: false,
          icon: L.divIcon({
            className: 'sensor-marker',
            html: `
              <div style="
                width: 28px;
                height: 28px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 10px;
                  height: 10px;
                  background: white;
                  border-radius: 50%;
                  opacity: 0.8;
                "></div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        }).addTo(layerRef.current);

        // ⚠️ REMOVIDO: tooltip do sensor também para evitar duplicação
        // Apenas o popupContent fornecido será usado

        // USA APENAS o popupContent fornecido (se existir)
        if (sensor.popupContent) {
          marker.bindPopup(sensor.popupContent);
        }
        
        // Mantém o comportamento de hover
        marker.on('mouseover', () => marker.openPopup());
        marker.on('mouseout', () => marker.closePopup());
      }
    });

    const allBounds = new L.LatLngBounds();
    if (field?.coords?.length) field.coords.forEach(coord => allBounds.extend(coord));
    sensorPoints.forEach(sensor => {
      if (sensor.localizacao_json?.coordinates) {
        const [lng, lat] = sensor.localizacao_json.coordinates;
        allBounds.extend([lat, lng]);
      }
    });

    if (!allBounds.isValid()) mapRef.current.setView([-15.788, -47.879], 13);
    else mapRef.current.fitBounds(allBounds, { padding: [20, 20], maxZoom: 17 });
  }, [fields, selectedIds, sensorPoints]);

  return <div id="map-view-container" className="w-full h-full" />;
}