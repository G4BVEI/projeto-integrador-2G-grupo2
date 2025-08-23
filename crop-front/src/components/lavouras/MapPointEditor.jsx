'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import * as turf from '@turf/turf'

// Fix para ícones padrão do Leaflet em Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPointEditor({ 
  fields = [], 
  selectedIds = [], 
  sensorPoints = [],
  onSensorAdd, // Nova prop: callback quando um sensor é adicionado
  tileLayer = 'openstreetmap',
  editableSensors = [], // Agora recebe a lista completa de sensores
  onSensorUpdate, // Callback para atualizar qualquer sensor
  showCoordinates = false
}) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markersRef = useRef({})
  const [selectedField, setSelectedField] = useState(null)

  // Função para verificar se um ponto está dentro do talhão
  const isPointInsideField = (point, fieldCoords) => {
    if (!fieldCoords || fieldCoords.length < 3) return false;
    
    try {
      const pointFeature = turf.point([point[1], point[0]]);
      const polygonFeature = turf.polygon([fieldCoords.map(coord => [coord[1], coord[0]])]);
      
      return turf.booleanPointInPolygon(pointFeature, polygonFeature);
    } catch (error) {
      console.error('Erro ao verificar ponto:', error);
      return false;
    }
  };

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('map-point-editor-container').setView([-15.788, -47.879], 13)

      // Adicionar camada base
      if (tileLayer === 'google') {
        L.tileLayer('http://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          attribution: '© Google',
          maxZoom: 20
        }).addTo(map)
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map)
      }

      mapRef.current = map
      layerRef.current = L.layerGroup().addTo(map)

      // Adicionar evento de clique para adicionar sensores
      map.on('click', (e) => {
        const newPoint = [e.latlng.lat, e.latlng.lng];
        
        // Verificar se o ponto está dentro do talhão selecionado
        if (selectedField && selectedField.coords) {
          const isInside = isPointInsideField(newPoint, selectedField.coords);
          if (!isInside) {
            alert('O sensor deve ser posicionado dentro do talhão selecionado!');
            return;
          }
        }

        // Criar novo sensor com nome padrão
        const newSensor = {
          nome: `Sensor ${editableSensors.length + 1}`,
          tipo: '',
          unidade: '',
          parametros: '',
          point: newPoint,
          isNew: true // Marcar como novo para edição
        };

        if (onSensorAdd) {
          onSensorAdd(newSensor);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [editableSensors, selectedField, onSensorAdd])

  // Função para adicionar marcador
  const addMarker = (sensor, id, isEditable = false) => {
    if (!sensor.point || markersRef.current[id]) return;

    const marker = L.marker(sensor.point, {
      draggable: isEditable,
      icon: L.divIcon({
        className: isEditable ? 'sensor-marker-editable' : 'sensor-marker',
        html: `
          <div class="${isEditable ? 'sensor-pin-editable' : 'sensor-pin'}"></div>
          <span>${sensor.nome || 'Sensor'}</span>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      })
    }).addTo(layerRef.current);

    if (isEditable) {
      marker.on('dragend', (e) => {
        const draggedPoint = [e.target.getLatLng().lat, e.target.getLatLng().lng];
        
        // Verificar se o novo ponto está dentro do talhão
        if (selectedField && selectedField.coords) {
          const isInside = isPointInsideField(draggedPoint, selectedField.coords);
          if (!isInside) {
            alert('O sensor deve permanecer dentro do talhão!');
            e.target.setLatLng(sensor.point); // Volta para posição original
            return;
          }
        }

        // Atualizar sensor com nova posição
        const updatedSensor = {
          ...sensor,
          point: draggedPoint
        };

        if (onSensorUpdate) {
          onSensorUpdate(updatedSensor, id);
        }
      });

      marker.on('dblclick', () => {
        if (onSensorUpdate) {
          onSensorUpdate(null, id); // Remove o sensor
        }
        
        layerRef.current.removeLayer(marker);
        delete markersRef.current[id];
      });
    }

    markersRef.current[id] = marker;
  };

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;

    // Encontrar o campo selecionado
    const field = fields.find(field => selectedIds.includes(field.id));
    setSelectedField(field);

    // Limpar camadas
    layerRef.current.clearLayers();
    markersRef.current = {};

    // Adicionar campo (talhão) como referência
    if (field && field.coords) {
      // Adicionar marcadores para cada ponto do campo
      field.coords.forEach((coord, index) => {
        L.marker(coord, {
          draggable: false,
          icon: L.divIcon({
            className: 'field-marker',
            html: `<div class="field-pin"></div><span>${index + 1}</span>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
          })
        }).addTo(layerRef.current);
      });

      // Desenhar polígono do campo
      if (field.coords.length >= 3) {
        L.polygon(field.coords, {
          color: '#16a34a',
          weight: 2,
          fillOpacity: 0.2
        }).addTo(layerRef.current);
      }
    }

    // Adicionar sensores existentes (não editáveis)
    if (sensorPoints && sensorPoints.length > 0) {
      sensorPoints.forEach((sensor, index) => {
        if (sensor.localizacao) {
          addMarker(
            { ...sensor, point: sensor.localizacao },
            `existing-${index}`,
            false
          );
        }
      });
    }

    // Adicionar sensores editáveis
    editableSensors.forEach((sensor, index) => {
      if (sensor.point) {
        addMarker(sensor, `editable-${index}`, true);
      }
    });

    // Ajustar visualização para mostrar todos os elementos
    const allPoints = [];
    
    if (field && field.coords) {
      allPoints.push(...field.coords);
    }
    
    if (sensorPoints && sensorPoints.length > 0) {
      sensorPoints.forEach(sensor => {
        if (sensor.localizacao) {
          allPoints.push(sensor.localizacao);
        }
      });
    }
    
    editableSensors.forEach(sensor => {
      if (sensor.point) {
        allPoints.push(sensor.point);
      }
    });
    
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }

  }, [fields, selectedIds, sensorPoints, editableSensors]);

  return (
    <div className="relative w-full h-full">
      <div id="map-point-editor-container" className="w-full h-full" />
      
      {showCoordinates && editableSensors.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-white p-3 rounded shadow z-1000 max-w-md">
          <h3 className="font-medium mb-2">Sensores em Edição:</h3>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {editableSensors.map((sensor, index) => (
              sensor.point && (
                <div key={index} className="font-mono">
                  {sensor.nome}: {sensor.point[0].toFixed(6)}, {sensor.point[1].toFixed(6)}
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}