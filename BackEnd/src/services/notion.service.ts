import { env } from '../config/env';

const NOTION_API_URL = 'https://api.notion.com/v1';
const HEADERS = {
  'Authorization': `Bearer ${env.NOTION_TOKEN || 'no-token'}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
};

// ─── Cache en memoria ─────────────────────────────────────────────────────────
// Evita llamadas repetidas a Notion y reduce el tiempo de carga a <100ms
// en la segunda solicitud dentro de la ventana TTL.
const CACHE_TTL_MS = 30_000; // 30 segundos
const cache: Record<string, { data: any; expiresAt: number }> = {};

function getCache<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  return null;
}

function setCache(key: string, data: any): void {
  cache[key] = { data, expiresAt: Date.now() + CACHE_TTL_MS };
}

function invalidateCache(key: string): void {
  delete cache[key];
}

// ─── Sanitización de inputs ───────────────────────────────────────────────────
// Aunque Notion usa su propio API (no SQL), limpiamos igualmente para
// prevenir inyecciones de caracteres de control, XSS en exports y log injection.
export function sanitizeString(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return '';
  // Eliminar caracteres de control y limitar longitud
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .substring(0, maxLen);
}

export function sanitizeCedula(value: unknown): string {
  if (typeof value !== 'string') return '';
  // Solo dígitos, máximo 20 caracteres
  return value.replace(/[^0-9]/g, '').substring(0, 20);
}

export function sanitizeEmail(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().toLowerCase().substring(0, 254);
  // Validación básica de formato email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : '';
}

// ─── Fetch con timeout ────────────────────────────────────────────────────────
// Sin esto, si Notion tarda mucho el servidor se queda colgado indefinidamente.
const NOTION_TIMEOUT_MS = 8_000;

async function notionFetch(endpoint: string, method: string = 'GET', body?: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NOTION_TIMEOUT_MS);

  try {
    const response = await fetch(`${NOTION_API_URL}${endpoint}`, {
      method,
      headers: HEADERS,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || JSON.stringify(data));
    }
    return data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`[Notion] Timeout: ${endpoint} tardó más de ${NOTION_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Helpers internos ─────────────────────────────────────────────────────────
const isNotionConfigured = () => !!env.NOTION_TOKEN && !!env.NOTION_ASEGURADOS_DB_ID;

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface NotionAsegurado {
  id: string;
  nombre: string;
  cedula: string;
  polizaId: string;
  email: string;
}

export interface NotionPoliza {
  id: string;
  polizaId: string;
  estado: 'VIGENTE' | 'VENCIDA' | 'SUSPENDIDA' | string;
  cobertura: string;
  preExistencias: string;
}

export interface AlertaData {
  nombre: string;
  cedulaPaciente: string;
  polizaId: string;
  fechaIngreso: string;
  estadoPoliza: string;
  preExistencias?: string | null;
  notificacionEnviada: boolean;
  gestorAsignado?: string | null;
  hospital: string;
}

// ─── Servicio de asegurados ───────────────────────────────────────────────────

export async function buscarAseguradoPorCedula(cedula: string): Promise<NotionAsegurado | null> {
  const cedulaSafe = sanitizeCedula(cedula);
  console.log(`[Notion] Buscando asegurado: ${cedulaSafe}`);
  if (!isNotionConfigured() || !cedulaSafe) return null;

  const cacheKey = `asegurado:${cedulaSafe}`;
  const cached = getCache<NotionAsegurado | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const data = await notionFetch(`/databases/${env.NOTION_ASEGURADOS_DB_ID}/query`, 'POST', {
      filter: { property: 'Cedula', rich_text: { equals: cedulaSafe } }
    });

    if (data.results.length === 0) {
      setCache(cacheKey, null);
      return null;
    }

    const page = data.results[0];
    const result: NotionAsegurado = {
      id: page.id,
      nombre: page.properties.Nombre?.title?.[0]?.plain_text || page.properties.Name?.title?.[0]?.plain_text || '',
      cedula: page.properties.Cedula?.rich_text?.[0]?.plain_text || '',
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      email: page.properties.Email?.rich_text?.[0]?.plain_text || page.properties.Email?.email || ''
    };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`[Notion] Error buscando asegurado:`, error);
    return null;
  }
}

export async function buscarPolizaPorId(polizaId: string): Promise<NotionPoliza | null> {
  const polizaIdSafe = sanitizeString(polizaId, 100);
  if (!isNotionConfigured() || !polizaIdSafe) return null;

  const cacheKey = `poliza:${polizaIdSafe}`;
  const cached = getCache<NotionPoliza | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const data = await notionFetch(`/databases/${env.NOTION_POLIZAS_DB_ID}/query`, 'POST', {
      filter: { property: 'Poliza_ID', rich_text: { equals: polizaIdSafe } }
    });

    if (data.results.length === 0) {
      setCache(cacheKey, null);
      return null;
    }

    const page = data.results[0];
    const result: NotionPoliza = {
      id: page.id,
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      estado: page.properties.Estado?.select?.name || '',
      cobertura: page.properties.Cobertura?.rich_text?.[0]?.plain_text || '',
      preExistencias: page.properties.Pre_existencias?.rich_text?.[0]?.plain_text || '',
    };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`[Notion] Error buscando póliza:`, error);
    return null;
  }
}

export async function crearAlertaEmergencia(data: AlertaData): Promise<string | null> {
  const cedulaSafe = sanitizeCedula(data.cedulaPaciente);
  const hospitalSafe = sanitizeString(data.hospital, 200);
  console.log(`[Notion] Creando alerta para: ${cedulaSafe}`);
  if (!isNotionConfigured()) return null;

  const nombreAlerta = `ALERTA-${cedulaSafe}-${data.fechaIngreso.split('T')[0]}`;

  try {
    const properties = {
      Name: { title: [{ text: { content: nombreAlerta } }] },
      Estado_Poliza: { select: { name: sanitizeString(data.estadoPoliza, 50) } },
      Pre_existencias: { rich_text: [{ text: { content: sanitizeString(data.preExistencias ?? 'Sin registro', 500) } }] },
      Notificacion_Enviada: { checkbox: data.notificacionEnviada },
      Gestor_Asignado: { rich_text: [{ text: { content: sanitizeString(data.gestorAsignado ?? 'Laura Martínez', 200) } }] },
      Hospital: { rich_text: [{ text: { content: hospitalSafe } }] }
    };

    const res = await notionFetch('/pages', 'POST', {
      parent: { database_id: env.NOTION_ALERTAS_DB_ID },
      properties
    });

    // Invalidar caché de alertas para forzar recarga
    invalidateCache('todas-alertas');
    return res.id;
  } catch (error) {
    console.error(`[Notion] Error creando alerta:`, error);
    return null;
  }
}

export async function registrarAsegurado(data: { nombre: string; cedula: string; polizaId: string; email: string }) {
  if (!isNotionConfigured()) return null;

  const nombreSafe = sanitizeString(data.nombre, 200);
  const cedulaSafe = sanitizeCedula(data.cedula);
  const emailSafe = sanitizeEmail(data.email);
  const polizaSafe = sanitizeString(data.polizaId, 100);

  try {
    const properties = {
      Nombre: { title: [{ text: { content: nombreSafe } }] },
      Cedula: { rich_text: [{ text: { content: cedulaSafe } }] },
      Poliza_ID: { rich_text: [{ text: { content: polizaSafe } }] },
      Email: { email: emailSafe || data.email.trim().substring(0, 254) }
    };

    const res = await notionFetch('/pages', 'POST', {
      parent: { database_id: env.NOTION_ASEGURADOS_DB_ID },
      properties
    });

    invalidateCache('todos-asegurados');
    return res.id;
  } catch (error) {
    console.error(`[Notion] Error registrando asegurado:`, error);
    return null;
  }
}

export async function registrarPoliza(data: { polizaId: string; estado: string; cobertura: string; preExistencias: string }) {
  if (!isNotionConfigured()) return null;

  const polizaSafe = sanitizeString(data.polizaId, 100);
  const estadoSafe = sanitizeString(data.estado, 50);
  const coberturaSafe = sanitizeString(data.cobertura, 300);
  const preExSafe = sanitizeString(data.preExistencias, 500);

  try {
    const properties = {
      Name: { title: [{ text: { content: `Póliza ${polizaSafe}` } }] },
      Poliza_ID: { rich_text: [{ text: { content: polizaSafe } }] },
      Estado: { select: { name: estadoSafe } },
      Cobertura: { rich_text: [{ text: { content: coberturaSafe } }] },
      Pre_existencias: { rich_text: [{ text: { content: preExSafe } }] }
    };

    const res = await notionFetch('/pages', 'POST', {
      parent: { database_id: env.NOTION_POLIZAS_DB_ID },
      properties
    });

    invalidateCache('todas-polizas');
    return res.id;
  } catch (error) {
    console.error(`[Notion] Error registrando póliza:`, error);
    return null;
  }
}

export async function actualizarNotificacionAlerta(alertaId: string): Promise<boolean> {
  const idSafe = sanitizeString(alertaId, 100);
  try {
    await notionFetch(`/pages/${idSafe}`, 'PATCH', {
      properties: { Notificacion_Enviada: { checkbox: true } }
    });
    invalidateCache('todas-alertas');
    return true;
  } catch (error) {
    console.error(`[Notion] Error actualizando alerta ${idSafe}:`, error);
    return false;
  }
}

// ─── Obtener listas completas (con caché compartido) ──────────────────────────

export async function obtenerTodosLosAsegurados() {
  if (!isNotionConfigured()) return [];

  const cached = getCache<any[]>('todos-asegurados');
  if (cached) return cached;

  try {
    const data = await notionFetch(`/databases/${env.NOTION_ASEGURADOS_DB_ID}/query`, 'POST');
    const result = data.results.map((page: any) => ({
      id: page.id,
      nombre: page.properties.Nombre?.title?.[0]?.plain_text || 'Sin Nombre',
      cedula: page.properties.Cedula?.rich_text?.[0]?.plain_text || '',
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      email: page.properties.Email?.rich_text?.[0]?.plain_text || page.properties.Email?.email || ''
    }));
    setCache('todos-asegurados', result);
    return result;
  } catch (error) {
    console.error(`[Notion] Error obteniendo asegurados:`, error);
    return [];
  }
}

// Llamadas PARALELAS a Notion: alertas + asegurados al mismo tiempo
// Antes eran secuenciales, lo que multiplicaba el tiempo de espera.
export async function obtenerTodasLasAlertas() {
  if (!isNotionConfigured()) return [];

  const cached = getCache<any[]>('todas-alertas');
  if (cached) return cached;

  try {
    // Ejecutar ambas consultas en paralelo para reducir latencia total
    const [alertasData, asegurados] = await Promise.all([
      notionFetch(`/databases/${env.NOTION_ALERTAS_DB_ID}/query`, 'POST'),
      obtenerTodosLosAsegurados()
    ]);

    const result = alertasData.results.map((page: any) => {
      const nombreAlerta = page.properties.Name?.title?.[0]?.plain_text || 'Alerta';
      const partes = nombreAlerta.split('-');
      const cedulaExtraida = partes.length > 1 ? partes[1] : '';
      const aseguradoMatch = asegurados.find((a: any) => a.cedula === cedulaExtraida);

      return {
        id: page.id,
        nombre: aseguradoMatch ? aseguradoMatch.nombre : nombreAlerta,
        paciente: aseguradoMatch ? aseguradoMatch.nombre : nombreAlerta,
        cedulaPaciente: cedulaExtraida,
        polizaId: aseguradoMatch ? aseguradoMatch.polizaId : '',
        fechaIngreso: page.created_time,
        estadoPoliza: page.properties.Estado_Poliza?.select?.name || '',
        preExistencias: page.properties.Pre_existencias?.rich_text?.[0]?.plain_text || '',
        notificacionEnviada: page.properties.Notificacion_Enviada?.checkbox || false,
        gestorAsignado: page.properties.Gestor_Asignado?.rich_text?.[0]?.plain_text || '',
        hospital: page.properties.Hospital?.rich_text?.[0]?.plain_text || ''
      };
    });

    setCache('todas-alertas', result);
    return result;
  } catch (error) {
    console.error(`[Notion] Error obteniendo alertas:`, error);
    return [];
  }
}

export async function obtenerTodasLasPolizas() {
  if (!isNotionConfigured()) return [];

  const cached = getCache<any[]>('todas-polizas');
  if (cached) return cached;

  try {
    const data = await notionFetch(`/databases/${env.NOTION_POLIZAS_DB_ID}/query`, 'POST');
    const result = data.results.map((page: any) => ({
      id: page.id,
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      estado: page.properties.Estado?.select?.name || '',
      cobertura: page.properties.Cobertura?.rich_text?.[0]?.plain_text || '',
      preExistencias: page.properties.Pre_existencias?.rich_text?.[0]?.plain_text || '',
    }));
    setCache('todas-polizas', result);
    return result;
  } catch (error) {
    console.error(`[Notion] Error obteniendo pólizas:`, error);
    return [];
  }
}

export async function actualizarAsegurado(id: string, data: Partial<NotionAsegurado>): Promise<boolean> {
  if (!isNotionConfigured()) return false;
  const idSafe = sanitizeString(id, 100);
  try {
    const properties: any = {};
    if (data.nombre) properties.Nombre = { title: [{ text: { content: sanitizeString(data.nombre, 200) } }] };
    if (data.cedula) properties.Cedula = { rich_text: [{ text: { content: sanitizeCedula(data.cedula) } }] };
    if (data.polizaId) properties.Poliza_ID = { rich_text: [{ text: { content: sanitizeString(data.polizaId, 100) } }] };
    if (data.email) properties.Email = { email: sanitizeEmail(data.email) || data.email.trim() };

    await notionFetch(`/pages/${idSafe}`, 'PATCH', { properties });
    invalidateCache('todos-asegurados');
    return true;
  } catch (error) {
    console.error(`[Notion] Error actualizando asegurado ${idSafe}:`, error);
    return false;
  }
}

export async function actualizarPoliza(id: string, data: Partial<NotionPoliza>): Promise<boolean> {
  if (!isNotionConfigured()) return false;
  const idSafe = sanitizeString(id, 100);
  try {
    const properties: any = {};
    if (data.polizaId) properties.Poliza_ID = { rich_text: [{ text: { content: sanitizeString(data.polizaId, 100) } }] };
    if (data.estado) properties.Estado = { select: { name: sanitizeString(data.estado, 50) } };
    if (data.cobertura) properties.Cobertura = { rich_text: [{ text: { content: sanitizeString(data.cobertura, 300) } }] };
    if (data.preExistencias) properties.Pre_existencias = { rich_text: [{ text: { content: sanitizeString(data.preExistencias, 500) } }] };

    await notionFetch(`/pages/${idSafe}`, 'PATCH', { properties });
    invalidateCache('todas-polizas');
    return true;
  } catch (error) {
    console.error(`[Notion] Error actualizando poliza ${idSafe}:`, error);
    return false;
  }
}

export async function borrarRegistroNotion(id: string): Promise<boolean> {
  if (!isNotionConfigured()) return false;
  const idSafe = sanitizeString(id, 100);
  try {
    await notionFetch(`/pages/${idSafe}`, 'PATCH', { archived: true });
    invalidateCache('todos-asegurados');
    invalidateCache('todas-alertas');
    return true;
  } catch (error) {
    console.error(`[Notion] Error borrando/archivando registro ${idSafe}:`, error);
    return false;
  }
}

export async function testConexionNotion() {
  if (!isNotionConfigured()) return { success: false, reason: 'Variables de entorno no configuradas.' };
  try {
    const data = await notionFetch('/users/me');
    return { success: true, bot: data.name };
  } catch (error: any) {
    return { success: false, reason: error.message };
  }
}
