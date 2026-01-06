import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { Box, Text, Badge, Group, Button } from '@mantine/core'
import { IconNavigation, IconClock, IconMapPin } from '@tabler/icons-react'

// Configuración de iconos de Leaflet
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

// Colores por tipo de problema
const typeConfig = {
  bache: { emoji: '🕳️', label: 'Bache' },
  alumbrado: { emoji: '💡', label: 'Alumbrado' },
  basura: { emoji: '🗑️', label: 'Basura' },
  agua: { emoji: '💧', label: 'Agua' },
}

// Colores por prioridad
const priorityColors = {
  critica: '#ef4444',
  alta: '#f59e0b',
  media: '#3b82f6',
  baja: '#10b981',
}

// Crear icono personalizado
const createCustomIcon = (type, priority) => {
  const color = priorityColors[priority] || '#6b7280'
  const config = typeConfig[type] || { emoji: '📍', label: 'Otro' }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 44px;
        height: 52px;
        position: relative;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
      ">
        <div style="
          width: 44px;
          height: 44px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1);
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 20px;
            line-height: 1;
          ">${config.emoji}</span>
        </div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -52],
  })
}

// Componente para centrar el mapa en la ubicación del usuario
function LocationButton() {
  const map = useMap()

  const handleClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.flyTo([latitude, longitude], 16, { duration: 1.5 })
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
        }
      )
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Button
        onClick={handleClick}
        variant="white"
        size="sm"
        radius="xl"
        leftSection={<IconNavigation size={16} />}
        style={{
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e2e8f0',
        }}
      >
        Mi ubicación
      </Button>
    </div>
  )
}

// Componente de marcadores animados
function AnimatedMarkers({ reports, viewMode }) {
  const map = useMap()

  if (viewMode === 'heatmap') {
    return (
      <>
        {reports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.lat, report.lng]}
            radius={20}
            pathOptions={{
              color: priorityColors[report.priority],
              fillColor: priorityColors[report.priority],
              fillOpacity: 0.4,
              weight: 2,
            }}
          />
        ))}
      </>
    )
  }

  return (
    <>
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={createCustomIcon(report.type, report.priority)}
        >
          <Popup>
            <Box style={{ minWidth: 200, padding: 4 }}>
              <Group justify="space-between" mb="xs">
                <Text fw={700} size="sm">{report.title}</Text>
                <Badge
                  size="xs"
                  color={
                    report.status === 'resolved' ? 'green' :
                    report.status === 'inProgress' ? 'blue' : 'orange'
                  }
                >
                  {report.status === 'resolved' ? 'Resuelto' :
                   report.status === 'inProgress' ? 'En proceso' : 'Pendiente'}
                </Badge>
              </Group>
              
              <Group gap="xs" mb="xs">
                <Badge 
                  size="xs" 
                  variant="light"
                  style={{ background: `${priorityColors[report.priority]}20`, color: priorityColors[report.priority] }}
                >
                  Prioridad {report.priority}
                </Badge>
                <Badge size="xs" variant="light" color="gray">
                  {typeConfig[report.type]?.emoji} {typeConfig[report.type]?.label}
                </Badge>
              </Group>

              <Group gap={4} c="dimmed">
                <IconClock size={12} />
                <Text size="xs">Hace 2 horas</Text>
              </Group>

              <Button 
                variant="light" 
                color="blue" 
                size="xs" 
                fullWidth 
                mt="sm"
                radius="md"
              >
                Ver detalles
              </Button>
            </Box>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default function MapComponent({ reports = [], viewMode = 'markers', height = 400 }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fixLeafletIcons()
  }, [])

  if (!isClient) {
    return (
      <Box
        style={{
          height: height,
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text c="dimmed">Cargando mapa...</Text>
      </Box>
    )
  }

  return (
    <MapContainer
      center={[-15.5006, -70.1349]}
      zoom={14}
      style={{ height: height, width: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <AnimatedMarkers reports={reports} viewMode={viewMode} />
      <LocationButton />
    </MapContainer>
  )
}