// ============================================
// MAPA MUNICIPAL - Muestra TODOS los reportes
// Archivo: src/components/dashboard/municipal/MapaMunicipal.jsx
// ============================================

import { useState, useEffect } from 'react'
import { Box, Text, Badge, Center, Loader, Group, ActionIcon, Tooltip } from '@mantine/core'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { IconRefresh, IconCurrentLocation } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import L from 'leaflet'

// Centro de Puno
const PUNO_CENTER = [-15.8402, -70.0219]

// Estados
const ESTADOS = {
  nuevo: { label: 'Nuevo', color: '#3b82f6' },
  en_revision: { label: 'En Revisión', color: '#eab308' },
  asignado: { label: 'Asignado', color: '#8b5cf6' },
  en_proceso: { label: 'En Proceso', color: '#f59e0b' },
  resuelto: { label: 'Resuelto', color: '#10b981' },
  rechazado: { label: 'Rechazado', color: '#ef4444' },
}

// Prioridades
const PRIORIDADES = {
  baja: { label: 'Baja', color: '#10b981' },
  media: { label: 'Media', color: '#3b82f6' },
  alta: { label: 'Alta', color: '#f59e0b' },
  critica: { label: 'Crítica', color: '#ef4444' },
}

// Crear icono personalizado
const crearIcono = (colorCategoria, prioridad) => {
  const colorBorde = PRIORIDADES[prioridad]?.color || '#3b82f6'
  const colorFondo = colorCategoria || '#3b82f6'

  return L.divIcon({
    className: 'municipal-marker',
    html: `
      <div style="position: relative; width: 36px; height: 44px;">
        <div style="
          width: 32px;
          height: 32px;
          background: ${colorFondo};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: absolute;
          top: 0;
          left: 2px;
          box-shadow: 0 4px 12px ${colorFondo}50;
          border: 3px solid ${colorBorde};
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
          "></div>
        </div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  })
}

// Componente para eventos del mapa
function MapEventHandler() {
  const map = useMap()

  useEffect(() => {
    const handleCenter = (e) => {
      if (e.detail?.lat && e.detail?.lng) {
        map.flyTo([e.detail.lat, e.detail.lng], 17, { duration: 1.5 })
      }
    }
    window.addEventListener('centerMapMunicipal', handleCenter)
    return () => window.removeEventListener('centerMapMunicipal', handleCenter)
  }, [map])

  return null
}

export default function MapaMunicipal({ reportes = [], onMarkerClick, onRefresh, loading }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  // Ir a ubicación actual
  const goToCurrentLocation = () => {
    if (!navigator.geolocation) {
      notifications.show({
        title: 'Error',
        message: 'Tu navegador no soporta geolocalización',
        color: 'red',
      })
      return
    }

    notifications.show({
      id: 'getting-location',
      title: 'Obteniendo ubicación...',
      message: 'Por favor espera',
      loading: true,
      autoClose: false,
    })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.dispatchEvent(new CustomEvent('centerMapMunicipal', {
          detail: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }))
        notifications.update({
          id: 'getting-location',
          title: 'Ubicación encontrada',
          message: 'El mapa se ha centrado en tu ubicación',
          color: 'green',
          loading: false,
          autoClose: 3000,
        })
      },
      (error) => {
        notifications.update({
          id: 'getting-location',
          title: 'Error',
          message: 'No se pudo obtener la ubicación. Verifica los permisos.',
          color: 'red',
          loading: false,
          autoClose: 3000,
        })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!ready) {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    )
  }

  const reportesConUbicacion = reportes.filter(r => r.latitud && r.longitud)

  return (
    <Box style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Mapa - Z-INDEX BAJO para no sobreponerse a modales */}
      <Box style={{ height: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <MapContainer
          center={PUNO_CENTER}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapEventHandler />

          {reportesConUbicacion.map((reporte) => {
            const estado = ESTADOS[reporte.estado] || ESTADOS.nuevo
            const prioridad = PRIORIDADES[reporte.prioridad] || PRIORIDADES.media
            const icono = crearIcono(reporte.categoria?.color, reporte.prioridad)

            return (
              <Marker
                key={reporte.id}
                position={[reporte.latitud, reporte.longitud]}
                icon={icono}
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(reporte),
                }}
              >
                <Popup>
                  <Box style={{ minWidth: 220, maxWidth: 280 }}>
                    {/* Foto */}
                    {reporte.foto_url && (
                      <Box
                        style={{
                          height: 120,
                          marginBottom: 10,
                          borderRadius: 8,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={reporte.foto_url}
                          alt="Foto"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    )}

                    {/* Código */}
                    <Text size="xs" fw={700} c="dimmed" style={{ fontFamily: 'monospace' }}>
                      {reporte.codigo}
                    </Text>

                    {/* Categoría */}
                    <Text
                      size="sm"
                      fw={700}
                      mt={4}
                      style={{ color: reporte.categoria?.color || '#3b82f6' }}
                    >
                      {reporte.categoria?.nombre || 'Sin categoría'}
                    </Text>

                    {/* Descripción */}
                    <Text size="xs" c="dimmed" mt={6} lineClamp={2}>
                      {reporte.descripcion}
                    </Text>

                    {/* Badges */}
                    <Group gap="xs" mt={10}>
                      <Badge size="sm" style={{ background: estado.color, color: 'white' }}>
                        {estado.label}
                      </Badge>
                      <Badge
                        size="sm"
                        variant="outline"
                        style={{ borderColor: prioridad.color, color: prioridad.color }}
                      >
                        {prioridad.label}
                      </Badge>
                    </Group>

                    {/* Fecha */}
                    <Text size="xs" c="dimmed" mt={8}>
                      📅 {formatFecha(reporte.created_at)}
                    </Text>
                  </Box>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </Box>

      {/* Controles flotantes - z-index moderado */}
      <Box
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <Tooltip label="Actualizar" position="left">
          <ActionIcon
            variant="white"
            size="lg"
            radius="xl"
            onClick={onRefresh}
            loading={loading}
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Box>

      {/* Botón GPS */}
      <Box style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 100 }}>
        <Tooltip label="Mi ubicación">
          <ActionIcon
            variant="white"
            size={48}
            radius="xl"
            onClick={goToCurrentLocation}
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              background: 'white',
            }}
          >
            <IconCurrentLocation size={24} color="#3b82f6" />
          </ActionIcon>
        </Tooltip>
      </Box>

      {/* Estadísticas flotantes */}
      <Box
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 100,
          background: 'white',
          borderRadius: 12,
          padding: '10px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Text size="xs" fw={600} c="dimmed">Reportes en mapa</Text>
        <Text fw={700} size="lg">{reportesConUbicacion.length}</Text>
      </Box>

      {/* Leyenda */}
      <Box
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 100,
          background: 'white',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Text size="xs" fw={600} mb={8}>Prioridad (borde)</Text>
        <Group gap="xs">
          {Object.entries(PRIORIDADES).map(([key, val]) => (
            <Group key={key} gap={4}>
              <Box
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  border: `3px solid ${val.color}`,
                  background: 'white',
                }}
              />
              <Text size="xs" c="dimmed">{val.label}</Text>
            </Group>
          ))}
        </Group>
      </Box>

      {/* Estilos - z-index bajo para el mapa */}
      <style jsx global>{`
        .municipal-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 100 !important;
        }
        .leaflet-popup-pane {
          z-index: 200 !important;
        }
      `}</style>
    </Box>
  )
}
