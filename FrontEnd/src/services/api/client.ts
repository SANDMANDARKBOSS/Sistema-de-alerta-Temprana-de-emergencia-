import { Ingreso } from '../../shared/models';

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
