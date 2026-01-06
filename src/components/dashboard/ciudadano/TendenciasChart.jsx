// ============================================================================
// WILLAY MAP - Gráfico de Tendencias con ECharts
// Muestra estadísticas de reportes en el dashboard
// ============================================================================

import { useState, useEffect, useRef } from 'react'
import { Paper, Group, Text, SegmentedControl, Box, Stack } from '@mantine/core'
import { IconTrendingUp, IconChartBar, IconChartPie } from '@tabler/icons-react'
import { motion } from 'framer-motion'

const MotionPaper = motion(Paper)

// Datos de ejemplo
const datosSemanales = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  reportados: [12, 19, 15, 25, 22, 18, 8],
  resueltos: [8, 14, 12, 18, 20, 15, 6],
}

const datosMensuales = {
  labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
  reportados: [45, 62, 58, 71],
  resueltos: [38, 55, 52, 64],
}

const datosCategorias = [
  { name: 'Baches', value: 35, color: '#6b7280' },
  { name: 'Alumbrado', value: 25, color: '#f59e0b' },
  { name: 'Basura', value: 20, color: '#84cc16' },
  { name: 'Agua', value: 12, color: '#3b82f6' },
  { name: 'Otros', value: 8, color: '#8b5cf6' },
]

export default function TendenciasChart() {
  const chartRef = useRef(null)
  const pieChartRef = useRef(null)
  const [periodo, setPeriodo] = useState('semana')
  const [chartInstance, setChartInstance] = useState(null)
  const [pieChartInstance, setPieChartInstance] = useState(null)

  // Inicializar gráfico de barras
  useEffect(() => {
    let chart = null
    
    const initChart = async () => {
      if (!chartRef.current) return
      
      const echarts = await import('echarts')
      
      if (chartInstance) {
        chartInstance.dispose()
      }
      
      chart = echarts.init(chartRef.current)
      setChartInstance(chart)
      
      const datos = periodo === 'semana' ? datosSemanales : datosMensuales
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          textStyle: {
            color: '#1e293b',
          },
        },
        legend: {
          data: ['Reportados', 'Resueltos'],
          bottom: 0,
          textStyle: {
            color: '#64748b',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: datos.labels,
          axisLine: {
            lineStyle: {
              color: '#e2e8f0',
            },
          },
          axisLabel: {
            color: '#64748b',
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: '#f1f5f9',
            },
          },
          axisLabel: {
            color: '#64748b',
          },
        },
        series: [
          {
            name: 'Reportados',
            type: 'bar',
            data: datos.reportados,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: '#1d4ed8' },
                ],
              },
              borderRadius: [4, 4, 0, 0],
            },
            barWidth: '35%',
          },
          {
            name: 'Resueltos',
            type: 'bar',
            data: datos.resueltos,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#10b981' },
                  { offset: 1, color: '#059669' },
                ],
              },
              borderRadius: [4, 4, 0, 0],
            },
            barWidth: '35%',
          },
        ],
      }
      
      chart.setOption(option)
    }
    
    initChart()
    
    // Resize handler
    const handleResize = () => {
      chart?.resize()
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      chart?.dispose()
    }
  }, [periodo])

  // Inicializar gráfico de pie
  useEffect(() => {
    let chart = null
    
    const initPieChart = async () => {
      if (!pieChartRef.current) return
      
      const echarts = await import('echarts')
      
      if (pieChartInstance) {
        pieChartInstance.dispose()
      }
      
      chart = echarts.init(pieChartRef.current)
      setPieChartInstance(chart)
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          textStyle: {
            color: '#1e293b',
          },
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold',
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)',
              },
            },
            data: datosCategorias.map((item) => ({
              value: item.value,
              name: item.name,
              itemStyle: { color: item.color },
            })),
          },
        ],
      }
      
      chart.setOption(option)
    }
    
    initPieChart()
    
    // Resize handler
    const handleResize = () => {
      chart?.resize()
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      chart?.dispose()
    }
  }, [])

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      p="lg"
      radius="lg"
      withBorder
      style={{ height: '100%' }}
    >
      <Stack gap="md" h="100%">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="sm">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconTrendingUp size={20} color="white" />
            </Box>
            <Text fw={600} size="lg">Tendencias</Text>
          </Group>
          
          <SegmentedControl
            size="xs"
            value={periodo}
            onChange={setPeriodo}
            data={[
              { value: 'semana', label: 'Semana' },
              { value: 'mes', label: 'Mes' },
            ]}
          />
        </Group>

        {/* Gráfico de barras */}
        <Box style={{ flex: 1, minHeight: 180 }}>
          <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
        </Box>

        {/* Separador */}
        <Group gap="sm">
          <IconChartPie size={16} color="#64748b" />
          <Text size="xs" c="dimmed" fw={500}>Por Categoría</Text>
        </Group>

        {/* Gráfico de pie */}
        <Box style={{ height: 150 }}>
          <div ref={pieChartRef} style={{ width: '100%', height: '100%' }} />
        </Box>

        {/* Leyenda del pie */}
        <Group gap="xs" justify="center" wrap="wrap">
          {datosCategorias.map((cat) => (
            <Group key={cat.name} gap={4}>
              <Box
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: cat.color,
                }}
              />
              <Text size="xs" c="dimmed">{cat.name}</Text>
            </Group>
          ))}
        </Group>
      </Stack>
    </MotionPaper>
  )
}