import { useState, useEffect } from 'react'
import { Box, Loader, Center, Text } from '@mantine/core'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '@/lib/supabase'

// Centro de Puno
const PUNO_CENTER = [-15.8402, -70.0219]

// Crear iconos por categoría
const crearIcono = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 30px;
        height: 36px;
        position: relative;
      ">
        <div style="
          width: 30px;
          height: 30px;
          background: ${color || '#3b82f6'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
        </div>
      </div>
    `,
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -36],
  })
}

export default function DashboardMap() {
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        // Cargar TODOS los reportes públicos desde Supabase
        const { data, error } = await supabase
          .from('reportes')
          .select(`
            id,
            codigo,
            descripcion,
            direccion,
            latitud,
            longitud,
            estado,
            foto_url,
            created_at,
            categoria:categorias(nombre, icono, color)
          `)
          .not('latitud', 'is', null)
          .not('longitud', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        setReportes(data || [])
      } catch (error) {
        console.error('Error cargando reportes para mapa:', error)
        setReportes([])
      } finally {
        setLoading(false)
      }
    }

    cargarReportes()
  }, [])

  if (loading) {
    return (
      <Center h="100%">
        <Loader size="lg" />
      </Center>
    )
  }

  return (
    <Box style={{ height: '100%', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
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

        {reportes.map((reporte) => {
          if (!reporte.latitud || !reporte.longitud) return null

          const icono = crearIcono(reporte.categoria?.color)

          return (
            <Marker
              key={reporte.id}
              position={[reporte.latitud, reporte.longitud]}
              icon={icono}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <Text size="xs" c="dimmed" fw={600}>{reporte.codigo}</Text>
                  <Text size="sm" fw={600} mt="xs">{reporte.categoria?.nombre}</Text>
                  <Text size="xs" mt="xs" lineClamp={2}>{reporte.descripcion}</Text>
                  {reporte.direccion && (
                    <Text size="xs" c="dimmed" mt="xs">{reporte.direccion}</Text>
                  )}
                  <Text size="xs" c="dimmed" mt="xs">
                    Estado: <strong>{reporte.estado}</strong>
                  </Text>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {reportes.length === 0 && (
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.9)',
            padding: '16px 24px',
            borderRadius: 8,
            zIndex: 1000,
          }}
        >
          <Text size="sm" c="dimmed">No hay reportes para mostrar</Text>
        </Box>
      )}

      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </Box>
  )
}