import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Corregir el problema de iconos de Leaflet en Next.js
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

// Iconos personalizados por tipo de problema
const createCustomIcon = (type, status) => {
  const colors = {
    bache: { bg: '#ef4444', icon: '🕳️' },
    alumbrado: { bg: '#f59e0b', icon: '💡' },
    basura: { bg: '#10b981', icon: '🗑️' },
    agua: { bg: '#3b82f6', icon: '💧' },
    default: { bg: '#6b7280', icon: '📍' }
  }

  const statusOpacity = {
    pending: 1,
    inProgress: 0.8,
    resolved: 0.5
  }

  const { bg, icon } = colors[type] || colors.default
  const opacity = statusOpacity[status] || 1

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${bg};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        opacity: ${opacity};
        border: 3px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">${icon}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
}

// Componente para animar marcadores
function AnimatedMarkers({ points }) {
  const map = useMap()
  const markersRef = useRef([])

  useEffect(() => {
    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => map.removeLayer(marker))
    markersRef.current = []

    // Agregar marcadores con animación
    points.forEach((point, index) => {
      setTimeout(() => {
        const marker = L.marker([point.lat, point.lng], {
          icon: createCustomIcon(point.type, point.status)
        })
        
        marker.bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <strong style="font-size: 14px; color: #1e293b;">
              ${point.type.charAt(0).toUpperCase() + point.type.slice(1)}
            </strong>
            <br/>
            <span style="font-size: 12px; color: #64748b;">
              Estado: ${point.status === 'pending' ? 'Pendiente' : point.status === 'inProgress' ? 'En proceso' : 'Resuelto'}
            </span>
          </div>
        `)
        
        marker.addTo(map)
        markersRef.current.push(marker)
      }, index * 200) // Delay escalonado para efecto de animación
    })

    return () => {
      markersRef.current.forEach(marker => map.removeLayer(marker))
    }
  }, [map, points])

  return null
}

export default function PublicMap({ points = [], height = 400, center = [-15.5006, -70.1349], zoom = 14 }) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: height, width: '100%', borderRadius: 16 }}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <AnimatedMarkers points={points} />
    </MapContainer>
  )
}