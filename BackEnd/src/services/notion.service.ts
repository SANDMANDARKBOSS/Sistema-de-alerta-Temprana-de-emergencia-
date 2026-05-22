import { env } from '../config/env';

const NOTION_API_URL = 'https://api.notion.com/v1';
const HEADERS = {
  'Authorization': `Bearer ${env.NOTION_TOKEN || 'no-token'}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
};

const isNotionConfigured = () => !!env.NOTION_TOKEN && !!env.NOTION_ASEGURADOS_DB_ID;

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

async function notionFetch(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${NOTION_API_URL}${endpoint}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
}

export async function buscarAseguradoPorCedula(cedula: string): Promise<NotionAsegurado | null> {
  console.log(`[Notion] Buscando asegurado: ${cedula}`);
  if (!isNotionConfigured()) return null;
  
  try {
    const data = await notionFetch(`/databases/${env.NOTION_ASEGURADOS_DB_ID}/query`, 'POST', {
      filter: { property: 'Cedula', rich_text: { equals: cedula } }
    });

    if (data.results.length === 0) return null;

    const page = data.results[0];
    return {
      id: page.id,
      nombre: page.properties.Nombre?.title?.[0]?.plain_text || page.properties.Name?.title?.[0]?.plain_text || '',
      cedula: page.properties.Cedula?.rich_text?.[0]?.plain_text || '',
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      email: page.properties.Email?.rich_text?.[0]?.plain_text || page.properties.Email?.email || ''
    };
  } catch (error) {
    console.error(`[Notion] Error buscando asegurado:`, error);
    return null;
  }
}

export async function buscarPolizaPorId(polizaId: string): Promise<NotionPoliza | null> {
  if (!isNotionConfigured()) return null;
  try {
    const data = await notionFetch(`/databases/${env.NOTION_POLIZAS_DB_ID}/query`, 'POST', {
      filter: { property: 'Poliza_ID', rich_text: { equals: polizaId } }
    });

    if (data.results.length === 0) return null;

    const page = data.results[0];
    const estado = page.properties.Estado?.select?.name || '';
    
    return {
      id: page.id,
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      estado: estado,
      cobertura: page.properties.Cobertura?.rich_text?.[0]?.plain_text || '',
      preExistencias: page.properties.Pre_existencias?.rich_text?.[0]?.plain_text || '',
    };
  } catch (error) {
    console.error(`[Notion] Error buscando póliza:`, error);
    return null;
  }
}

export async function crearAlertaEmergencia(data: AlertaData): Promise<string | null> {
  console.log(`[Notion] Creando alerta para: ${data.cedulaPaciente}`);
  if (!isNotionConfigured()) return null;
  
  const nombreAlerta = `ALERTA-${data.cedulaPaciente}-${data.fechaIngreso.split('T')[0]}`;
  
  try {
    const properties = {
      Name: { title: [{ text: { content: nombreAlerta } }] },
      Estado_Poliza: { select: { name: data.estadoPoliza } },
      Pre_existencias: { rich_text: [{ text: { content: data.preExistencias ?? 'Sin registro' } }] },
      Notificacion_Enviada: { checkbox: data.notificacionEnviada },
      Gestor_Asignado: { rich_text: [{ text: { content: data.gestorAsignado ?? 'Laura Martínez' } }] },
      Hospital: { rich_text: [{ text: { content: data.hospital } }] }
    };

    const res = await notionFetch('/pages', 'POST', {
      parent: { database_id: env.NOTION_ALERTAS_DB_ID },
      properties
    });
    return res.id;
  } catch (error) {
    console.error(`[Notion] Error creando alerta:`, error);
    return null;
  }
}

export async function registrarAsegurado(data: { nombre: string; cedula: string; polizaId: string; email: string }) {
  if (!isNotionConfigured()) return null;
  try {
    const properties = {
      Nombre: { title: [{ text: { content: data.nombre } }] },
      Cedula: { rich_text: [{ text: { content: data.cedula } }] },
      Poliza_ID: { rich_text: [{ text: { content: data.polizaId } }] },
      Email: { email: data.email } // O rich_text si usas eso, Notion adapta email o fallback a texto.
    };

    const res = await notionFetch('/pages', 'POST', {
      parent: { database_id: env.NOTION_ASEGURADOS_DB_ID },
      properties
    });
    return res.id;
  } catch (error) {
    console.error(`[Notion] Error registrando asegurado:`, error);
    return null;
  }
}

export async function registrarPoliza(data: { polizaId: string; estado: string; cobertura: string; preExistencias: string }) {
  if (!isNotionConfigured()) return null;
  try {
    const properties = {
      Name: { title: [{ text: { content: `Póliza ${data.polizaId}` } }] },
      Poliza_ID: { rich_text: [{ text: { content: data.polizaId } }] },
      Estado: { select: { name: data.estado } },
      Cobertura: { rich_text: [{ text: { content: data.cobertura } }] },
      Pre_existencias: { rich_text: [{ text: { content: data.preExistencias } }] }
    };

    const res = await notionFetch('/pages', 'POST', {
      parent: { database_id: env.NOTION_POLIZAS_DB_ID },
      properties
    });
    return res.id;
  } catch (error) {
    console.error(`[Notion] Error registrando póliza:`, error);
    return null;
  }
}

export async function actualizarNotificacionAlerta(alertaId: string): Promise<boolean> {
  try {
    await notionFetch(`/pages/${alertaId}`, 'PATCH', {
      properties: { Notificacion_Enviada: { checkbox: true } }
    });
    return true;
  } catch (error) {
    console.error(`[Notion] Error actualizando alerta ${alertaId}:`, error);
    return false;
  }
}

export async function obtenerTodasLasAlertas() {
  if (!isNotionConfigured()) return [];
  try {
    const data = await notionFetch(`/databases/${env.NOTION_ALERTAS_DB_ID}/query`, 'POST');
    const asegurados = await obtenerTodosLosAsegurados();

    return data.results.map((page: any) => {
      const nombreAlerta = page.properties.Name?.title?.[0]?.plain_text || 'Alerta';
      // Extraer cedula del formato ALERTA-1712345678-2026-05-21
      const partes = nombreAlerta.split('-');
      const cedulaExtraida = partes.length > 1 ? partes[1] : '';
      const aseguradoMatch = asegurados.find((a: any) => a.cedula === cedulaExtraida);

      return {
        id: page.id,
        nombre: aseguradoMatch ? aseguradoMatch.nombre : nombreAlerta,
        paciente: aseguradoMatch ? aseguradoMatch.nombre : nombreAlerta,
        cedulaPaciente: cedulaExtraida,
        polizaId: aseguradoMatch ? aseguradoMatch.polizaId : '',
        fechaIngreso: page.created_time, // Usamos la de creación
        estadoPoliza: page.properties.Estado_Poliza?.select?.name || '',
        preExistencias: page.properties.Pre_existencias?.rich_text?.[0]?.plain_text || '',
        notificacionEnviada: page.properties.Notificacion_Enviada?.checkbox || false,
        gestorAsignado: page.properties.Gestor_Asignado?.rich_text?.[0]?.plain_text || '',
        hospital: page.properties.Hospital?.rich_text?.[0]?.plain_text || ''
      };
    });
  } catch (error) {
    console.error(`[Notion] Error obteniendo alertas:`, error);
    return [];
  }
}

export async function obtenerTodasLasPolizas() {
  if (!isNotionConfigured()) return [];
  try {
    const data = await notionFetch(`/databases/${env.NOTION_POLIZAS_DB_ID}/query`, 'POST');
    return data.results.map((page: any) => ({
      id: page.id,
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      estado: page.properties.Estado?.select?.name || '',
      cobertura: page.properties.Cobertura?.rich_text?.[0]?.plain_text || '',
      preExistencias: page.properties.Pre_existencias?.rich_text?.[0]?.plain_text || '',
    }));
  } catch (error) {
    console.error(`[Notion] Error obteniendo pólizas:`, error);
    return [];
  }
}

export async function obtenerTodosLosAsegurados() {
  if (!isNotionConfigured()) return [];
  try {
    const data = await notionFetch(`/databases/${env.NOTION_ASEGURADOS_DB_ID}/query`, 'POST');
    return data.results.map((page: any) => ({
      id: page.id,
      nombre: page.properties.Nombre?.title?.[0]?.plain_text || 'Sin Nombre',
      cedula: page.properties.Cedula?.rich_text?.[0]?.plain_text || '',
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      email: page.properties.Email?.rich_text?.[0]?.plain_text || page.properties.Email?.email || ''
    }));
  } catch (error) {
    console.error(`[Notion] Error obteniendo asegurados:`, error);
    return [];
  }
}

export async function actualizarAsegurado(id: string, data: Partial<NotionAsegurado>): Promise<boolean> {
  if (!isNotionConfigured()) return false;
  try {
    const properties: any = {};
    if (data.nombre) properties.Nombre = { title: [{ text: { content: data.nombre } }] };
    if (data.cedula) properties.Cedula = { rich_text: [{ text: { content: data.cedula } }] };
    if (data.polizaId) properties.Poliza_ID = { rich_text: [{ text: { content: data.polizaId } }] };
    if (data.email) properties.Email = { email: data.email };
    
    await notionFetch(`/pages/${id}`, 'PATCH', { properties });
    return true;
  } catch (error) {
    console.error(`[Notion] Error actualizando asegurado ${id}:`, error);
    return false;
  }
}

export async function actualizarPoliza(id: string, data: Partial<NotionPoliza>): Promise<boolean> {
  if (!isNotionConfigured()) return false;
  try {
    const properties: any = {};
    if (data.polizaId) properties.Poliza_ID = { rich_text: [{ text: { content: data.polizaId } }] };
    if (data.estado) properties.Estado = { select: { name: data.estado } };
    if (data.cobertura) properties.Cobertura = { rich_text: [{ text: { content: data.cobertura } }] };
    if (data.preExistencias) properties.Pre_existencias = { rich_text: [{ text: { content: data.preExistencias } }] };

    await notionFetch(`/pages/${id}`, 'PATCH', { properties });
    return true;
  } catch (error) {
    console.error(`[Notion] Error actualizando poliza ${id}:`, error);
    return false;
  }
}

export async function borrarRegistroNotion(id: string): Promise<boolean> {
  if (!isNotionConfigured()) return false;
  try {
    await notionFetch(`/pages/${id}`, 'PATCH', { archived: true });
    return true;
  } catch (error) {
    console.error(`[Notion] Error borrando/archivando registro ${id}:`, error);
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
