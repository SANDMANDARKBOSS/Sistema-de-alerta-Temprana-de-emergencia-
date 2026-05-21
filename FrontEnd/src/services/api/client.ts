import { ConfiguracionSistema, Ingreso } from '../../shared/models';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface AlertasResponse {
  ingresos: Ingreso[];
}

export async function getAlertas(): Promise<Ingreso[]> {
  const resp = await fetch(`${API_URL}/api/alertas`, { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error('No fue posible cargar alertas');
  }

  const data = (await resp.json()) as AlertasResponse;
  return data.ingresos;
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

export async function getPolizas(): Promise<PolizaApiItem[]> {
  const resp = await fetch(`${API_URL}/api/polizas`, { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error('No fue posible cargar pólizas');
  }
  const data = (await resp.json()) as { polizas: PolizaApiItem[] };
  return data.polizas ?? [];
}

export async function getHistorialCasos(): Promise<CasoHistoricoApiItem[]> {
  const resp = await fetch(`${API_URL}/api/historial-casos`, { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error('No fue posible cargar historial');
  }
  const data = (await resp.json()) as { casos: CasoHistoricoApiItem[] };
  return data.casos ?? [];
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

  const resp = await fetch(`${API_URL}/api/reportes/diario?${query.toString()}`, { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error('No fue posible cargar reporte');
  }
  const data = (await resp.json()) as { resumenDiario: ReporteDiarioApiItem[] };
  return data.resumenDiario ?? [];
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
  const resp = await fetch(`${API_URL}/api/gestores`, { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error('No fue posible cargar gestores');
  }
  const data = (await resp.json()) as { gestores: GestorApiItem[]; notificaciones: NotificacionGestorApiItem[] };
  return { gestores: data.gestores ?? [], notificaciones: data.notificaciones ?? [] };
}

export async function getConfiguracion(): Promise<ConfiguracionSistema> {
  const resp = await fetch(`${API_URL}/api/configuracion`, { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error('No fue posible cargar configuración');
  }
  const raw = (await resp.json()) as any;
  return {
    registrosPorPagina: raw.registrosPorPagina ?? 10,
    formatoFecha: raw.formatoFecha ?? 'DD/MM/YYYY',
    formatoHora: raw.formatoHora ?? '12h',
    institucion: {
      nombre: raw.institucionNombre ?? 'Hospital Central',
      direccion: raw.institucionDireccion ?? '',
      telefono: raw.institucionTelefono ?? '',
      correo: raw.institucionCorreo ?? ''
    },
    validacionAutomatica: raw.validacionAutomatica ?? true,
    cierreAutomaticoCasos: raw.cierreAutomaticoCasos ?? true
  };
}

export async function updateConfiguracion(config: ConfiguracionSistema): Promise<void> {
  const resp = await fetch(`${API_URL}/api/configuracion`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!resp.ok) {
    throw new Error('No fue posible guardar configuración');
  }
}
