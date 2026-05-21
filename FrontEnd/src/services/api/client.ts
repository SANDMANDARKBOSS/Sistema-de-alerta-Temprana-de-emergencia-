import { ConfiguracionSistema, Ingreso } from '../../shared/models';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface AlertasResponse {
  data: any[]; // Según api.routes.ts, el backend devuelve { data: [...] }
  ingresos?: Ingreso[]; // Fallback por si acaso
}

// Memory cache
let alertasCache: { data: Ingreso[]; timestamp: number } | null = null;
const CACHE_TTL = 5000;

// Promise cache to deduplicate simultaneous requests
let pendingAlertasPromise: Promise<Ingreso[]> | null = null;

export async function getAlertas(): Promise<Ingreso[]> {
  const now = Date.now();
  
  // 1. Check if we have valid cache
  if (alertasCache && now - alertasCache.timestamp < CACHE_TTL) {
    return alertasCache.data;
  }

  // 2. If there is a request in progress, return that promise
  if (pendingAlertasPromise) {
    return pendingAlertasPromise;
  }

  // 3. Otherwise, create a new request and cache the promise
  pendingAlertasPromise = (async () => {
    try {
      const resp = await fetch(`${API_URL}/api/alertas`, { cache: 'no-store' });
      if (!resp.ok) {
        throw new Error('No fue posible cargar alertas');
      }

      const json = await resp.json();
      
      // Ajuste para el formato real del backend { data: [...] }
      const dataArray = Array.isArray(json.data) ? json.data : (Array.isArray(json.ingresos) ? json.ingresos : []);
      
      const mapped: Ingreso[] = dataArray.map((i: any) => ({
        id: i.id,
        paciente: { id: i.cedulaPaciente, nombre: i.nombre || i.paciente || 'Paciente' },
        motivo: i.hospital,
        horaIngreso: new Date(i.fechaIngreso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        poliza: i.estadoPoliza === 'VIGENTE' ? 'Póliza Válida' : i.estadoPoliza === 'VENCIDA' ? 'Póliza Inválida' : 'En Validación',
        estado: i.notificacionEnviada ? 'Notificada' : 'Pendiente'
      }));

      alertasCache = { data: mapped, timestamp: Date.now() };
      return mapped;
    } catch (error) {
      console.error('Error en getAlertas:', error);
      // If error but we have stale cache, return it
      if (alertasCache) {
        console.warn('Usando datos de caché obsoletos debido a error en API');
        return alertasCache.data;
      }
      return []; // Siempre retornar un array para evitar errores de .filter()
    } finally {
      // Clear the pending promise so future calls can try again if cache expired
      pendingAlertasPromise = null;
    }
  })();

  return pendingAlertasPromise;
}

export async function crearIngreso(payload: { cedula: string; hospital: string }) {
  const resp = await fetch(`${API_URL}/api/webhook/ingreso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ message: 'Error inesperado' }));
    throw new Error(error.message ?? 'Error creando ingreso');
  }

  // Clear cache and promise on new entry to force refresh
  alertasCache = null;
  pendingAlertasPromise = null;
  
  return resp.json();
}

export interface PolizaApiItem {
  polizaId: string;
  cedulaAsegurado: string;
  estado: string;
  cobertura: string;
  preExistencias?: string | null;
  gestorAsignado?: string | null;
  fechaInicio: string;
  fechaFin: string;
  asegurado?: {
    nombre: string;
    cedula: string;
  } | null;
}

export interface CasoHistoricoApiItem {
  id: string;
  nombre: string;
  cedulaPaciente: string;
  polizaId: string;
  fechaIngreso: string;
  estadoPoliza: string;
  preExistencias?: string | null;
  notificacionEnviada: boolean;
  gestorAsignado?: string | null;
  hospital: string;
  asegurado?: {
    nombre: string;
    cedula: string;
  } | null;
}

// Generic fetcher with promise deduplication
const fetchCache = new Map<string, { promise: Promise<any> | null; data: any; timestamp: number }>();

async function deduplicatedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = fetchCache.get(key);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = fetcher().then(data => {
    fetchCache.set(key, { promise: null, data, timestamp: Date.now() });
    return data;
  }).catch(err => {
    const entry = fetchCache.get(key);
    if (entry) entry.promise = null;
    throw err;
  });

  fetchCache.set(key, { promise, data: cached?.data || [], timestamp: cached?.timestamp || 0 });
  return promise;
}

export async function getPolizas(): Promise<PolizaApiItem[]> {
  return deduplicatedFetch('polizas', async () => {
    const resp = await fetch(`${API_URL}/api/polizas`, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No fue posible cargar pólizas');
    const json = await resp.json();
    return json.data ?? json.polizas ?? [];
  });
}

export async function getHistorialCasos(): Promise<CasoHistoricoApiItem[]> {
  return deduplicatedFetch('historial', async () => {
    const resp = await fetch(`${API_URL}/api/historial`, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No fue posible cargar historial');
    const json = await resp.json();
    return json.data ?? json.casos ?? [];
  });
}

export interface ReporteDiarioApiItem {
  fecha: string;
  ingresos: number;
  validadas: number;
  enValidacion: number;
  invalidas: number;
  alertas: number;
  tiempo: string;
}

export async function getReporteDiario(params?: { from?: string; to?: string }): Promise<ReporteDiarioApiItem[]> {
  const query = new URLSearchParams();
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  const key = `reporte-${query.toString()}`;

  return deduplicatedFetch(key, async () => {
    const resp = await fetch(`${API_URL}/api/dashboard/metricas?${query.toString()}`, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No fue posible cargar reporte');
    const json = await resp.json();
    // Ajuste para el formato del backend
    if (json.data && json.data.totalAlertas !== undefined) {
      return [{
        fecha: new Date().toISOString().split('T')[0],
        ingresos: json.data.totalAlertas,
        validadas: json.data.totalAlertas - json.data.alertasCriticas,
        enValidacion: 0,
        invalidas: json.data.alertasCriticas,
        alertas: json.data.alertasActivas,
        tiempo: json.data.tiempoPromedio
      }];
    }
    return json.resumenDiario ?? [];
  });
}

export interface GestorApiItem {
  id: string;
  nombre: string;
  rol: string;
  correo: string;
  area: string;
  estado: 'Activo' | 'Inactivo';
  ultimoAcceso: { fecha: string; hora: string };
  avatar?: string | null;
}

export interface NotificacionGestorApiItem {
  fechaHora: string;
  paciente: { nombre: string; id: string };
  tipo: string;
  tipoColor: 'rojo' | 'naranja' | 'azul' | 'verde';
  canal: 'Sistema' | 'Email' | 'SMS';
  mensaje: string;
  enviadoPor: string;
  estado: 'Leído' | 'Pendiente' | 'Enviado';
}

export async function getGestoresData(): Promise<{ gestores: GestorApiItem[]; notificaciones: NotificacionGestorApiItem[] }> {
  return deduplicatedFetch('gestores', async () => {
    const resp = await fetch(`${API_URL}/api/gestores`, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No fue posible cargar gestores');
    const json = await resp.json();
    return { 
      gestores: json.data || json.gestores || [], 
      notificaciones: json.notificaciones || [] 
    };
  });
}

export async function getConfiguracion(): Promise<ConfiguracionSistema> {
  return deduplicatedFetch('config', async () => {
    const resp = await fetch(`${API_URL}/api/config`, { cache: 'no-store' });
    if (!resp.ok) throw new Error('No fue posible cargar configuración');
    const raw = await resp.json();
    const data = raw.data || raw;
    return {
      registrosPorPagina: data.registrosPorPagina ?? 10,
      formatoFecha: data.formatoFecha ?? 'DD/MM/YYYY',
      formatoHora: data.formatoHora ?? '12h',
      institucion: {
        nombre: data.institucionNombre ?? 'Hospital Central',
        direccion: data.institucionDireccion ?? '',
        telefono: data.institucionTelefono ?? '',
        correo: data.institucionCorreo ?? ''
      },
      validacionAutomatica: data.validacionAutomatica ?? true,
      cierreAutomaticoCasos: data.cierreAutomaticoCasos ?? true
    };
  });
}

export async function registrarAsegurado(payload: { nombre: string; cedula: string; email: string; plan?: string; preExistencias?: string }) {
  const resp = await fetch(`${API_URL}/api/asegurados/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ message: 'Error inesperado' }));
    throw new Error(error.message ?? 'Error registrando asegurado');
  }

  return resp.json();
}

export async function updateConfiguracion(config: ConfiguracionSistema): Promise<void> {
  const resp = await fetch(`${API_URL}/api/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!resp.ok) {
    throw new Error('No fue posible guardar configuración');
  }
  // Clear config cache
  fetchCache.delete('config');
}
