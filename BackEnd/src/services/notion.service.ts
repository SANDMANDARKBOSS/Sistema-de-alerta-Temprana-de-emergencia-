import { Client } from '@notionhq/client';
import { env } from '../config/env';

const notion = new Client({ auth: env.NOTION_TOKEN });

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

export async function buscarAseguradoPorCedula(cedula: string): Promise<NotionAsegurado | null> {
  console.log(`[Notion] Buscando asegurado: ${cedula}`);
  try {
    const response = await notion.databases.query({
      database_id: env.NOTION_ASEGURADOS_DB_ID,
      filter: {
        property: 'Cedula',
        rich_text: {
          equals: cedula,
        },
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0] as any;
    return {
      id: page.id,
      nombre: page.properties.Name?.title?.[0]?.plain_text || '',
      cedula: page.properties.Cedula?.rich_text?.[0]?.plain_text || '',
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      email: page.properties.Email?.rich_text?.[0]?.plain_text || '',
    };
  } catch (error) {
    console.error(`[Notion] Error buscando asegurado:`, error);
    return null;
  }
}

export async function buscarPolizaPorId(polizaId: string): Promise<NotionPoliza | null> {
  try {
    const response = await notion.databases.query({
      database_id: env.NOTION_POLIZAS_DB_ID,
      filter: {
        property: 'Poliza_ID',
        rich_text: {
          equals: polizaId,
        },
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0] as any;
    const estado = page.properties.Estado?.select?.name || '';
    console.log(`[Notion] Póliza encontrada: ${polizaId} Estado: ${estado}`);

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
  const nombreAlerta = `ALERTA-${data.cedulaPaciente}-${data.fechaIngreso.split('T')[0]}`;
  
  try {
    const response = await notion.pages.create({
      parent: { database_id: env.NOTION_ALERTAS_DB_ID },
      properties: {
        Name: { title: [{ text: { content: nombreAlerta } }] },
        Paciente_Nombre: { rich_text: [{ text: { content: data.nombre } }] },
        Cedula_Paciente: { rich_text: [{ text: { content: data.cedulaPaciente } }] },
        Poliza_ID: { rich_text: [{ text: { content: data.polizaId } }] },
        Fecha_Ingreso: { date: { start: data.fechaIngreso } },
        Estado_Poliza: { select: { name: data.estadoPoliza } },
        Pre_existencias: { rich_text: [{ text: { content: data.preExistencias ?? 'Sin registro' } }] },
        Notificacion_Enviada: { checkbox: data.notificacionEnviada },
        Gestor_Asignado: { rich_text: [{ text: { content: data.gestorAsignado ?? 'Sin asignar' } }] },
        Hospital: { rich_text: [{ text: { content: data.hospital } }] }
      }
    });
    return response.id;
  } catch (error) {
    console.error(`[Notion] Error creando alerta:`, error);
    return null;
  }
}

export async function registrarAsegurado(data: { nombre: string; cedula: string; polizaId: string; email: string }) {
  console.log(`[Notion] Registrando nuevo asegurado: ${data.cedula}`);
  try {
    const response = await notion.pages.create({
      parent: { database_id: env.NOTION_ASEGURADOS_DB_ID },
      properties: {
        Name: { title: [{ text: { content: data.nombre } }] },
        Cedula: { rich_text: [{ text: { content: data.cedula } }] },
        Poliza_ID: { rich_text: [{ text: { content: data.polizaId } }] },
        Email: { rich_text: [{ text: { content: data.email } }] }
      }
    });
    return response.id;
  } catch (error) {
    console.error(`[Notion] Error registrando asegurado:`, error);
    return null;
  }
}

export async function registrarPoliza(data: { polizaId: string; estado: string; cobertura: string; preExistencias: string }) {
  console.log(`[Notion] Registrando nueva póliza: ${data.polizaId}`);
  try {
    const response = await notion.pages.create({
      parent: { database_id: env.NOTION_POLIZAS_DB_ID },
      properties: {
        Poliza_ID: { title: [{ text: { content: data.polizaId } }] },
        Estado: { select: { name: data.estado } },
        Cobertura: { rich_text: [{ text: { content: data.cobertura } }] },
        Pre_existencias: { rich_text: [{ text: { content: data.preExistencias } }] }
      }
    });
    return response.id;
  } catch (error) {
    console.error(`[Notion] Error registrando póliza:`, error);
    return null;
  }
}

export async function actualizarNotificacionAlerta(alertaId: string): Promise<boolean> {
  try {
    await notion.pages.update({
      page_id: alertaId,
      properties: {
        Notificacion_Enviada: { checkbox: true }
      }
    });
    return true;
  } catch (error) {
    console.error(`[Notion] Error actualizando alerta ${alertaId}:`, error);
    return false;
  }
}

export async function obtenerTodasLasAlertas() {
  try {
    const response = await notion.databases.query({
      database_id: env.NOTION_ALERTAS_DB_ID,
      sorts: [{ property: 'Fecha_Ingreso', direction: 'descending' }]
    });
    return response.results.map((page: any) => ({
      id: page.id,
      nombre: page.properties.Name?.title?.[0]?.plain_text || '',
      paciente: page.properties.Paciente_Nombre?.rich_text?.[0]?.plain_text || '',
      cedulaPaciente: page.properties.Cedula_Paciente?.rich_text?.[0]?.plain_text || '',
      polizaId: page.properties.Poliza_ID?.rich_text?.[0]?.plain_text || '',
      fechaIngreso: page.properties.Fecha_Ingreso?.date?.start || '',
      estadoPoliza: page.properties.Estado_Poliza?.select?.name || '',
      preExistencias: page.properties.Pre_existencias?.rich_text?.[0]?.plain_text || '',
      notificacionEnviada: page.properties.Notificacion_Enviada?.checkbox || false,
      gestorAsignado: page.properties.Gestor_Asignado?.rich_text?.[0]?.plain_text || '',
      hospital: page.properties.Hospital?.rich_text?.[0]?.plain_text || ''
    }));
  } catch (error) {
    console.error(`[Notion] Error obteniendo alertas:`, error);
    return [];
  }
}

export async function obtenerTodasLasPolizas() {
  try {
    const response = await notion.databases.query({
      database_id: env.NOTION_POLIZAS_DB_ID
    });
    return response.results.map((page: any) => ({
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
