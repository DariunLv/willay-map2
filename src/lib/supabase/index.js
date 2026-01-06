// ============================================================================
// WILLAY MAP - Exportación de todos los servicios de Supabase
// ============================================================================

// Cliente principal
export { supabase, TABLES, STORAGE_BUCKETS, CATEGORIAS_REPORTE, ESTADOS_REPORTE, PRIORIDADES } from './client'

// Servicios
export { authService } from './auth'
export { reportesService } from './reportes'
export { eventosService, alertasService, notificacionesService } from './eventos'

// Default export con todos los servicios
import { supabase } from './client'
import { authService } from './auth'
import { reportesService } from './reportes'
import { eventosService, alertasService, notificacionesService } from './eventos'

export default {
  supabase,
  auth: authService,
  reportes: reportesService,
  eventos: eventosService,
  alertas: alertasService,
  notificaciones: notificacionesService,
}