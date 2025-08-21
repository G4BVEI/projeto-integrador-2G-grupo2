// app/components/Map.jsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ plots, selectedPlot, heatmapType, isSimulating }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({
    plots: [],
    heatmap: [],
    grid: []
  });
  const heatmapGridRef = useRef([]);
  const animationRef = useRef(null);

  // Initialize heatmap grid
  useEffect(() => {
    if (!plots.length) return;
    
    // Create a grid of data points for the heatmap
    const grid = [];
    const gridSize = 20; // 20x20 grid
    
    // Find the bounds of all plots
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    plots.forEach(plot => {
      plot.coordenadas.forEach(([lat, lng]) => {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      });
    });
    
    // Add some padding
    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;
    minLat -= latPadding;
    maxLat += latPadding;
    minLng -= lngPadding;
    maxLng += lngPadding;
    
    // Create grid points
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = minLat + (i / (gridSize - 1)) * (maxLat - minLat);
        const lng = minLng + (j / (gridSize - 1)) * (maxLng - minLng);
        
        // Find which plot this point belongs to (if any)
        const plot = plots.find(p => isPointInPolygon([lat, lng], p.coordenadas));
        
        if (plot) {
          let value;
          if (heatmapType === 'umidade') value = plot.umidade;
          else if (heatmapType === 'temperatura') value = plot.temperatura;
          else value = plot.fertilidade;
          
          // Add some random variation
          const variation = (Math.random() - 0.5) * 10;
          grid.push({
            lat,
            lng,
            value: Math.max(30, Math.min(90, value + variation)),
            plotId: plot.id
          });
        }
      }
    }
    
    heatmapGridRef.current = grid;
  }, [plots, heatmapType]);

  // Initialize map and draw elements
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // Initialize map
      mapInstance.current = L.map(mapRef.current).setView([-15.7801, -47.9292], 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    }

    // Draw plots and heatmap
    drawPlots();
    drawHeatmap();

    // Start animation if simulating
    if (isSimulating) {
      startHeatmapAnimation();
    } else {
      stopHeatmapAnimation();
    }

    return () => {
      stopHeatmapAnimation();
    };
  }, [plots, selectedPlot, heatmapType, isSimulating]);

  // Draw plot polygons
  const drawPlots = () => {
    if (!mapInstance.current) return;
    
    // Clear existing plot layers
    layersRef.current.plots.forEach(layer => {
      mapInstance.current.removeLayer(layer);
    });
    layersRef.current.plots = [];

    // Add plot polygons
    plots.forEach(plot => {
      const polygon = L.polygon(plot.coordenadas, {
        color: '#2e7d32',
        weight: 2,
        fillColor: getColorForValue(plot, heatmapType),
        fillOpacity: 0.3
      }).addTo(mapInstance.current);
      
      // Add popup with plot info
      polygon.bindPopup(`
        <strong>${plot.nome}</strong><br>
        Cultura: ${plot.tipo_cultura}<br>
        Área: ${plot.area} ha<br>
        Umidade: ${plot.umidade}%<br>
        Temperatura: ${plot.temperatura}°C<br>
        Fertilidade: ${plot.fertilidade}%
      `);
      
      // Store reference to layer
      layersRef.current.plots.push(polygon);
      
      // If this is the selected plot, zoom to it
      if (selectedPlot && selectedPlot.id === plot.id) {
        mapInstance.current.fitBounds(polygon.getBounds().pad(0.1));
      }
    });
  };

  // Draw heatmap
  const drawHeatmap = () => {
    if (!mapInstance.current || !heatmapGridRef.current.length) return;
    
    // Clear existing heatmap layers
    layersRef.current.heatmap.forEach(layer => {
      mapInstance.current.removeLayer(layer);
    });
    layersRef.current.heatmap = [];
    
    // Draw heatmap points
    heatmapGridRef.current.forEach(point => {
      const radius = 30;
      const color = getHeatmapColor(point.value, heatmapType);
      
      const circle = L.circle([point.lat, point.lng], {
        radius,
        color: 'transparent',
        fillColor: color,
        fillOpacity: 0.7
      }).addTo(mapInstance.current);
      
      layersRef.current.heatmap.push(circle);
    });
  };

  // Animate heatmap
  const startHeatmapAnimation = () => {
    let lastTime = 0;
    const delay = 100; // Update every 100ms
    
    const animate = (time) => {
      if (!lastTime || time - lastTime > delay) {
        lastTime = time;
        
        // Update heatmap values with cloth-like interaction
        simulateClothLikeInteraction();
        drawHeatmap();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopHeatmapAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // Simulate cloth-like interaction between data points
  const simulateClothLikeInteraction = () => {
    const grid = heatmapGridRef.current;
    const newGrid = [...grid];
    
    for (let i = 0; i < grid.length; i++) {
      // Find neighbors (simple implementation)
      const neighbors = [];
      const point = grid[i];
      
      for (let j = 0; j < grid.length; j++) {
        if (i !== j) {
          const otherPoint = grid[j];
          const distance = Math.sqrt(
            Math.pow(point.lat - otherPoint.lat, 2) + 
            Math.pow(point.lng - otherPoint.lng, 2)
          );
          
          if (distance < 0.01) { // Adjust this threshold as needed
            neighbors.push(otherPoint);
          }
        }
      }
      
      // Calculate new value based on neighbors (cloth-like interaction)
      if (neighbors.length > 0) {
        let sum = 0;
        neighbors.forEach(neighbor => {
          sum += neighbor.value;
        });
        
        const average = sum / neighbors.length;
        const tension = 0.1; // Adjust this for more/less interaction
        
        // Apply slight change toward neighbor average
        newGrid[i].value = point.value + (average - point.value) * tension;
        
        // Add some random fluctuation
        newGrid[i].value += (Math.random() - 0.5) * 2;
        
        // Clamp values
        newGrid[i].value = Math.max(30, Math.min(90, newGrid[i].value));
      }
    }
    
    heatmapGridRef.current = newGrid;
  };

  // Helper function to determine polygon color based on value
  const getColorForValue = (plot, type) => {
    let value;
    if (type === 'umidade') value = plot.umidade;
    else if (type === 'temperatura') value = plot.temperatura;
    else value = plot.fertilidade;
    
    return getHeatmapColor(value, type);
  };

  // Helper function to generate heatmap color with smooth gradient
  const getHeatmapColor = (value, type) => {
    if (type === 'umidade') {
      // Blue to green gradient for humidity
      if (value < 40) return `rgb(255, ${Math.round(87 + (value/40)*168)}, 34)`; // Red to orange
      if (value < 60) return `rgb(255, ${Math.round(255 - ((value-40)/20)*78)}, ${Math.round(100 + ((value-40)/20)*55)})`; // Orange to yellow
      return `rgb(${Math.round(100 + ((90-value)/30)*155)}, 205, ${Math.round(50 + ((value-60)/40)*105)})`; // Yellow to green to blue
    } else if (type === 'temperatura') {
      // Blue to red gradient for temperature
      if (value < 20) return `rgb(0, ${Math.round(100 + (value/20)*55)}, ${Math.round(150 + (value/20)*105)})`; // Dark to light blue
      if (value < 25) return `rgb(0, ${Math.round(155 + ((value-20)/5)*100)}, ${Math.round(255 - ((value-20)/5)*155)})`; // Blue to green
      if (value < 30) return `rgb(${Math.round(((value-25)/5)*255)}, 255, 0)`; // Green to yellow
      return `rgb(255, ${Math.round(255 - ((value-30)/2)*255)}, 0)`; // Yellow to red
    } else {
      // Brown to green gradient for fertility
      if (value < 40) return `rgb(${Math.round(139 + (value/40)*116)}, ${Math.round(69 + (value/40)*86)}, 19)`; // Brown to light brown
      if (value < 60) return `rgb(${Math.round(255 - ((value-40)/20)*55)}, ${Math.round(155 + ((value-40)/20)*100)}, ${Math.round(74 + ((value-40)/20)*51)})`; // Light brown to olive
      return `rgb(${Math.round(200 - ((value-60)/40)*100)}, ${Math.round(255 - ((value-60)/40)*55)}, ${Math.round(125 - ((value-60)/40)*66)})`; // Olive to green
    }
  };

  // Helper function to check if a point is inside a polygon
  const isPointInPolygon = (point, vs) => {
    const x = point[0], y = point[1];
    let inside = false;
    
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  };

  return <div ref={mapRef} className="h-full w-full" />;
};

export default Map;