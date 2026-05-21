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
