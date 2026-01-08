'use client'

// ============================================================================
// WILLAY MAP - Map Component
// Archivo: src/components/dashboard/ciudadano/MapComponent.jsx
// ============================================================================

import { useEffect, useState, useMemo } from 'react'
import { Box, Text } from '@mantine/core'

// Colores
const COLORES_PRIORIDAD = {
  critica: '#ef4444',
  alta: '#f59e0b',
  media: '#3b82f6',
  baja: '#10b981',
}

const COLORES_ESTADO = {
  nuevo: '#3b82f6',
  en_revision: '#06b6d4',
  asignado: '#8b5cf6',
  en_proceso: '#f59e0b',
  resuelto: '#10b981',
  rechazado: '#ef4444',
}

const PUNO_CENTER = [-15.8402, -70.0219]

function MapComponent({ reportes = [], viewMode = 'markers' }) {
  const [isMounted, setIsMounted] = useState(false)
  const [leafletReady, setLeafletReady] = useState(false)
  const [L, setL] = useState(null)
  const [ReactLeaflet, setReactLeaflet] = useState(null)

  // Cargar Leaflet solo en cliente
  useEffect(() => {
    setIsMounted(true)
    
    const loadLeaflet = async () => {
      try {
        const leaflet = await import('leaflet')
        const reactLeaflet = await import('react-leaflet')
        setL(leaflet.default)
        setReactLeaflet(reactLeaflet)
        setLeafletReady(true)
      } catch (error) {
        console.error('Error cargando Leaflet:', error)
      }
    }
    
    loadLeaflet()
  }, [])

  // Crear icono
  const crearIcono = (color, prioridad) => {
    if (!L) return null
    const colorFinal = COLORES_PRIORIDAD[prioridad] || color || '#3b82f6'
    
    return L.divIcon({
      className: 'willay-marker',
      html: `
        <div style="position: relative; width: 36px; height: 44px;">
          <div style="
            width: 32px; height: 32px;
            background: ${colorFinal};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            position: absolute; top: 0; left: 2px;
            display: flex; align-items: center; justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 14px ${colorFinal}60;
          ">
            <div style="width: 12px; height: 12px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
          <div style="
            position: absolute; bottom: 0; left: 50%;
            transform: translateX(-50%);
            width: 14px; height: 14px;
            background: ${colorFinal};
            border-radius: 50%;
            opacity: 0.3;
            animation: pulse-marker 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    })
  }

  // Heat points
  const heatPoints = useMemo(() => {
    if (!reportes || reportes.length === 0) return []
    const clusters = []
    const processed = new Set()
    const RADIO = 0.004

    reportes.forEach((reporte, index) => {
      if (processed.has(index) || !reporte.latitud || !reporte.longitud) return
      const cluster = { lat: reporte.latitud, lng: reporte.longitud, count: 1, prioridad: reporte.prioridad || 'media' }

      reportes.forEach((otro, otroIndex) => {
        if (otroIndex !== index && !processed.has(otroIndex) && otro.latitud && otro.longitud) {
          const dist = Math.sqrt(Math.pow(reporte.latitud - otro.latitud, 2) + Math.pow(reporte.longitud - otro.longitud, 2))
          if (dist < RADIO) {
            cluster.count++
            cluster.lat = (cluster.lat * (cluster.count - 1) + otro.latitud) / cluster.count
            cluster.lng = (cluster.lng * (cluster.count - 1) + otro.longitud) / cluster.count
            processed.add(otroIndex)
            if (otro.prioridad === 'critica') cluster.prioridad = 'critica'
            else if (otro.prioridad === 'alta' && cluster.prioridad !== 'critica') cluster.prioridad = 'alta'
          }
        }
      })
      processed.add(index)
      clusters.push(cluster)
    })
    return clusters
  }, [reportes])

  const formatFecha = (fecha) => {
    if (!fecha) return ''
    return new Date(fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getEstadoLabel = (estado) => {
    const labels = { nuevo: 'Nuevo', en_revision: 'En Revisión', asignado: 'Asignado', en_proceso: 'En Proceso', resuelto: 'Resuelto', rechazado: 'Rechazado' }
    return labels[estado] || estado
  }

  // Loading state
  if (!isMounted || !leafletReady || !ReactLeaflet) {
    return (
      <Box style={{ height: '100%', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text c="dimmed">Cargando mapa...</Text>
      </Box>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } = ReactLeaflet

  // Event handler component
  function EventHandler() {
    const map = useMap()
    useEffect(() => {
      const handleCenter = (e) => {
        if (e.detail?.lat && e.detail?.lng) {
          map.flyTo([e.detail.lat, e.detail.lng], 16, { duration: 1.5 })
        }
      }
      window.addEventListener('centerMap', handleCenter)
      return () => window.removeEventListener('centerMap', handleCenter)
    }, [map])
    return null
  }

  return (
    <Box style={{ height: '100%', width: '100%' }}>
      <style jsx global>{`
        .willay-marker { background: transparent !important; border: none !important; }
        @keyframes pulse-marker { 0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; } 50% { transform: translateX(-50%) scale(2); opacity: 0; } }
        .leaflet-popup-content-wrapper { border-radius: 14px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important; }
        .leaflet-popup-content { margin: 14px !important; }
      `}</style>
      
      <MapContainer center={PUNO_CENTER} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={true}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <EventHandler />

        {/* Heatmap */}
        {viewMode === 'heatmap' && heatPoints.map((cluster, i) => {
          const color = COLORES_PRIORIDAD[cluster.prioridad] || '#3b82f6'
          const radius = Math.min(100 + cluster.count * 50, 500)
          const opacity = Math.min(0.12 + cluster.count * 0.06, 0.45)
          return <Circle key={`heat-${i}`} center={[cluster.lat, cluster.lng]} radius={radius} pathOptions={{ color: 'transparent', fillColor: color, fillOpacity: opacity, weight: 0 }} />
        })}

        {/* Markers */}
        {viewMode === 'markers' && reportes.map((reporte) => {
          if (!reporte.latitud || !reporte.longitud) return null
          const color = reporte.categoria?.color || '#3b82f6'
          const icono = crearIcono(color, reporte.prioridad)
          const estadoColor = COLORES_ESTADO[reporte.estado] || '#64748b'
          if (!icono) return null

          return (
            <Marker key={reporte.id} position={[reporte.latitud, reporte.longitud]} icon={icono}>
              <Popup>
                <Box style={{ minWidth: 220, maxWidth: 280 }}>
                  {reporte.foto_url && (
                    <Box style={{ height: 110, marginBottom: 12, borderRadius: 10, overflow: 'hidden' }}>
                      <img src={reporte.foto_url} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  )}
                  <Text size="xs" fw={700} style={{ color: '#64748b', fontFamily: 'monospace' }}>{reporte.codigo}</Text>
                  <Text size="sm" fw={700} style={{ color, marginTop: 4 }}>{reporte.categoria?.nombre || 'Sin categoría'}</Text>
                  <Text size="xs" style={{ color: '#475569', marginTop: 6, marginBottom: 8 }} lineClamp={2}>{reporte.descripcion || 'Sin descripción'}</Text>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                    <Box style={{ padding: '4px 10px', borderRadius: 6, background: `${estadoColor}15`, color: estadoColor, fontSize: 11, fontWeight: 600 }}>{getEstadoLabel(reporte.estado)}</Box>
                    <Text size="xs" c="dimmed">{formatFecha(reporte.created_at)}</Text>
                  </Box>
                </Box>
              </Popup>
            </Marker>
          )
        })}

        {/* Dots en heatmap */}
        {viewMode === 'heatmap' && reportes.map((reporte) => {
          if (!reporte.latitud || !reporte.longitud) return null
          const color = COLORES_PRIORIDAD[reporte.prioridad] || '#3b82f6'
          return <CircleMarker key={`dot-${reporte.id}`} center={[reporte.latitud, reporte.longitud]} radius={5} pathOptions={{ color: 'white', weight: 2, fillColor: color, fillOpacity: 1 }} />
        })}
      </MapContainer>
    </Box>
  )
}

export default MapComponent