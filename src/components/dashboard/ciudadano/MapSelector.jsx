// ============================================================================
// WILLAY MAP - Selector de Ubicación en Mapa
// Para seleccionar ubicación al crear un reporte
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Box, Paper, Text, Group, Button, TextInput, Loader } from '@mantine/core'
import { IconMapPin, IconCurrentLocation, IconSearch } from '@tabler/icons-react'

// Importar componentes de Leaflet dinámicamente (sin SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
)

// Centro de Puno por defecto
const PUNO_CENTER = [-15.8402, -70.0219]

// Componente para manejar clicks en el mapa
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      })
    },
  })
  return null
}

// Componente para centrar el mapa
function MapCenterHandler({ center, zoom }) {
  const map = useMapEvents({})
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 17, { duration: 1 })
    }
  }, [center, zoom, map])
  
  return null
}

export default function MapSelector({ value, onChange, error }) {
  const [mapReady, setMapReady] = useState(false)
  const [position, setPosition] = useState(value || null)
  const [address, setAddress] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  // Cargar Leaflet CSS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet/dist/leaflet.css')
      setMapReady(true)
    }
  }, [])

  // Crear icono personalizado
  const createIcon = useCallback(() => {
    if (typeof window === 'undefined') return null
    const L = require('leaflet')
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 40px;
          height: 48px;
          position: relative;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            border: 3px solid white;
            animation: bounce 0.5s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 18px;
            ">📍</span>
          </div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
    })
  }, [])

  // Manejar selección de ubicación
  const handleLocationSelect = useCallback(async (coords) => {
    setPosition(coords)
    onChange?.(coords)
    
    // Geocodificación inversa para obtener dirección
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      if (data.display_name) {
        setAddress(data.display_name)
      }
    } catch (error) {
      console.error('Error obteniendo dirección:', error)
    }
  }, [onChange])

  // Obtener ubicación actual
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        handleLocationSelect(coords)
        setGettingLocation(false)
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error)
        alert('No se pudo obtener tu ubicación. Por favor selecciona manualmente en el mapa.')
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Buscar dirección
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Puno, Peru')}&limit=1`
      )
      const data = await response.json()
      
      if (data.length > 0) {
        const result = data[0]
        const coords = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        }
        handleLocationSelect(coords)
      } else {
        alert('No se encontró la dirección. Intenta con otra búsqueda.')
      }
    } catch (error) {
      console.error('Error buscando dirección:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Paper p="sm" radius="md" mb="sm" withBorder>
        <Group gap="sm">
          <TextInput
            placeholder="Buscar dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
          />
          <Button
            variant="light"
            onClick={handleSearchAddress}
            loading={loading}
          >
            Buscar
          </Button>
          <Button
            variant="filled"
            color="blue"
            leftSection={<IconCurrentLocation size={18} />}
            onClick={handleGetCurrentLocation}
            loading={gettingLocation}
          >
            Mi ubicación
          </Button>
        </Group>
      </Paper>

      {/* Mapa */}
      <Box
        style={{
          height: 350,
          borderRadius: 12,
          overflow: 'hidden',
          border: error ? '2px solid #fa5252' : '2px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {mapReady ? (
          <MapContainer
            center={position ? [position.lat, position.lng] : PUNO_CENTER}
            zoom={position ? 17 : 14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            
            {position && (
              <>
                <MapCenterHandler center={[position.lat, position.lng]} zoom={17} />
                <Marker
                  position={[position.lat, position.lng]}
                  icon={createIcon()}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target
                      const pos = marker.getLatLng()
                      handleLocationSelect({ lat: pos.lat, lng: pos.lng })
                    },
                  }}
                />
              </>
            )}
          </MapContainer>
        ) : (
          <Box
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f1f5f9',
            }}
          >
            <Loader size="lg" />
          </Box>
        )}

        {/* Instrucciones */}
        {!position && (
          <Paper
            p="sm"
            radius="md"
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Group gap="xs">
              <IconMapPin size={18} color="#3b82f6" />
              <Text size="sm" fw={500}>
                Haz clic en el mapa para marcar la ubicación
              </Text>
            </Group>
          </Paper>
        )}
      </Box>

      {/* Dirección seleccionada */}
      {address && (
        <Paper p="sm" radius="md" mt="sm" bg="#f0f9ff" withBorder>
          <Group gap="xs">
            <IconMapPin size={18} color="#3b82f6" />
            <Box style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">Ubicación seleccionada:</Text>
              <Text size="sm" fw={500} lineClamp={2}>{address}</Text>
            </Box>
          </Group>
        </Paper>
      )}

      {/* Error */}
      {error && (
        <Text size="sm" c="red" mt="xs">
          {error}
        </Text>
      )}

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: rotate(-45deg) translateY(0); }
          50% { transform: rotate(-45deg) translateY(-10px); }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </Box>
  )
}