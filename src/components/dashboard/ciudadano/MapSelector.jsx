// ============================================================================
// WILLAY MAP - Map Selector Component
// Archivo: src/components/dashboard/ciudadano/MapSelector.jsx
// Selector de ubicación con GPS real y marcador arrastrable
// ============================================================================

import { useEffect, useState, useRef } from 'react'
import { Box, Text, Button, TextInput, Group, Alert, ActionIcon, Tooltip } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMapEvents, 
  useMap 
} from 'react-leaflet'
import L from 'leaflet'
import {
  IconCurrentLocation,
  IconSearch,
  IconCheck,
  IconX,
  IconMapPin,
} from '@tabler/icons-react'

// Centro de Puno por defecto
const PUNO_CENTER = { lat: -15.8402, lng: -70.0219 }

// Crear icono personalizado animado
const crearIconoSeleccion = () => {
  return L.divIcon({
    className: 'selector-marker',
    html: `
      <div class="selector-container">
        <div class="selector-pin">
          <div class="selector-inner">📍</div>
        </div>
        <div class="selector-shadow"></div>
        <div class="selector-pulse"></div>
      </div>
    `,
    iconSize: [50, 60],
    iconAnchor: [25, 60],
  })
}

// Componente para manejar clics en el mapa
function LocationPicker({ position, onPositionChange }) {
  const map = useMapEvents({
    click(e) {
      onPositionChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      })
    },
  })

  return null
}

// Marcador arrastrable
function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null)

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current
      if (marker) {
        const pos = marker.getLatLng()
        onPositionChange({
          lat: pos.lat,
          lng: pos.lng,
        })
      }
    },
  }

  if (!position) return null

  return (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={crearIconoSeleccion()}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  )
}

// Componente para centrar el mapa
function MapController({ center }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 17, { duration: 1 })
    }
  }, [center, map])

  return null
}

export default function MapSelector({ value, onChange }) {
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [address, setAddress] = useState('')

  const position = value || null
  const defaultCenter = position || PUNO_CENTER

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Obtener dirección desde coordenadas (geocodificación inversa)
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await response.json()
      if (data.display_name) {
        setAddress(data.display_name)
      }
    } catch (error) {
      console.error('Error geocodificación inversa:', error)
    }
  }

  // Manejar selección de ubicación
  const handleLocationSelect = (coords) => {
    onChange(coords)
    getAddressFromCoords(coords.lat, coords.lng)
  }

  // Obtener ubicación GPS REAL
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      notifications.show({
        title: 'Error',
        message: 'Tu navegador no soporta geolocalización',
        color: 'red',
        icon: <IconX size={18} />,
      })
      return
    }

    setGettingLocation(true)

    notifications.show({
      id: 'gps-location',
      title: 'Obteniendo ubicación GPS...',
      message: 'Por favor permite el acceso a tu ubicación',
      loading: true,
      autoClose: false,
    })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        
        handleLocationSelect(coords)
        
        notifications.update({
          id: 'gps-location',
          title: '¡Ubicación obtenida!',
          message: `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`,
          color: 'green',
          icon: <IconCheck size={18} />,
          loading: false,
          autoClose: 3000,
        })
        
        setGettingLocation(false)
      },
      (error) => {
        console.error('Error GPS:', error)
        
        let mensaje = 'No se pudo obtener tu ubicación'
        if (error.code === 1) mensaje = 'Permiso de ubicación denegado. Habilítalo en la configuración de tu navegador.'
        else if (error.code === 2) mensaje = 'Ubicación no disponible. Verifica que el GPS esté activado.'
        else if (error.code === 3) mensaje = 'Tiempo de espera agotado. Intenta de nuevo.'
        
        notifications.update({
          id: 'gps-location',
          title: 'Error de ubicación',
          message: mensaje,
          color: 'red',
          icon: <IconX size={18} />,
          loading: false,
          autoClose: 5000,
        })
        
        setGettingLocation(false)
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0 
      }
    )
  }

  // Buscar dirección
  const searchAddress = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=pe`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        }
        handleLocationSelect(coords)
        setAddress(data[0].display_name)
        
        notifications.show({
          title: 'Dirección encontrada',
          message: data[0].display_name.slice(0, 60) + '...',
          color: 'green',
          icon: <IconCheck size={18} />,
        })
      } else {
        notifications.show({
          title: 'No encontrado',
          message: 'No se encontró la dirección. Intenta con otra búsqueda.',
          color: 'orange',
        })
      }
    } catch (error) {
      console.error('Error buscando dirección:', error)
      notifications.show({
        title: 'Error',
        message: 'Error al buscar la dirección',
        color: 'red',
      })
    } finally {
      setSearching(false)
    }
  }

  if (!isClient) {
    return (
      <Box
        style={{
          height: 350,
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box ta="center">
          <IconMapPin size={40} color="#3b82f6" />
          <Text size="sm" c="dimmed" mt="md">Cargando mapa...</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      {/* Barra de búsqueda y GPS */}
      <Group mb="md" gap="sm">
        <TextInput
          placeholder="Buscar dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
          style={{ flex: 1 }}
          radius="md"
          leftSection={<IconSearch size={16} />}
        />
        <Button 
          onClick={searchAddress} 
          loading={searching}
          variant="light"
          radius="md"
        >
          Buscar
        </Button>
        <Tooltip label="Usar mi ubicación GPS">
          <Button
            variant="gradient"
            gradient={{ from: '#3b82f6', to: '#1d4ed8' }}
            leftSection={<IconCurrentLocation size={18} />}
            onClick={getCurrentLocation}
            loading={gettingLocation}
            radius="md"
          >
            Mi ubicación
          </Button>
        </Tooltip>
      </Group>

      {/* Mapa */}
      <Box
        style={{
          height: 350,
          borderRadius: 16,
          overflow: 'hidden',
          border: '2px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <LocationPicker 
            position={position} 
            onPositionChange={handleLocationSelect} 
          />
          
          <DraggableMarker 
            position={position} 
            onPositionChange={handleLocationSelect} 
          />
          
          {position && <MapController center={position} />}
        </MapContainer>

        {/* Instrucción si no hay ubicación */}
        {!position && (
          <Box
            style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              padding: '10px 20px',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              pointerEvents: 'none',
            }}
          >
            <Text size="sm" fw={500} c="dark">
              👆 Haz clic en el mapa o usa el botón GPS
            </Text>
          </Box>
        )}
      </Box>

      {/* Información de ubicación seleccionada */}
      {position && (
        <Alert
          icon={<IconCheck size={18} />}
          color="green"
          mt="md"
          radius="md"
          styles={{ message: { marginTop: 0 } }}
        >
          <Group justify="space-between" wrap="wrap">
            <Box>
              <Text size="sm" fw={600}>Ubicación seleccionada</Text>
              <Text size="xs" c="dimmed">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </Text>
              {address && (
                <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
                  📍 {address}
                </Text>
              )}
            </Box>
            <Tooltip label="Quitar ubicación">
              <ActionIcon 
                variant="subtle" 
                color="red" 
                onClick={() => {
                  onChange(null)
                  setAddress('')
                }}
              >
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Alert>
      )}

      {/* Estilos del marcador */}
      <style jsx global>{`
        .selector-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .selector-container {
          position: relative;
          width: 50px;
          height: 60px;
        }
        
        .selector-pin {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: absolute;
          top: 0;
          left: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid white;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
          animation: bounceMarker 0.5s ease;
        }
        
        .selector-inner {
          transform: rotate(45deg);
          font-size: 18px;
        }
        
        .selector-shadow {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          filter: blur(2px);
        }
        
        .selector-pulse {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          animation: pulseMarker 2s infinite;
        }
        
        @keyframes bounceMarker {
          0% { transform: rotate(-45deg) translateY(-20px); opacity: 0; }
          60% { transform: rotate(-45deg) translateY(5px); }
          100% { transform: rotate(-45deg) translateY(0); opacity: 1; }
        }
        
        @keyframes pulseMarker {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.4; }
          50% { transform: translateX(-50%) scale(2); opacity: 0; }
        }
      `}</style>
    </Box>
  )
}