import { env } from '../config/env';

interface NotionAlertaInput {
  nombre: string;
  cedulaPaciente: string;
  polizaId: string;
  fechaIngreso: string;
  estadoPoliza: 'VIGENTE' | 'VENCIDA' | 'SUSPENDIDA';
  preExistencias?: string | null;
  notificacionEnviada: boolean;
  gestorAsignado?: string | null;
  hospital: string;
}

function mapEstado(estado: 'VIGENTE' | 'VENCIDA' | 'SUSPENDIDA') {
  if (estado === 'VIGENTE') return 'Vigente';
  if (estado === 'VENCIDA') return 'Vencida';
  return 'Suspendida';
}

export async function crearAlertaEnNotion(data: NotionAlertaInput): Promise<string | null> {
  if (!env.notionToken || !env.notionAlertasDbId) {
    console.warn('[NotionService] NOTION_TOKEN o NOTION_ALERTAS_DB_ID no configurados.');
    return null;
  }

  try {
    const resp = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: env.notionAlertasDbId },
        properties: {
          Name: { title: [{ text: { content: data.nombre } }] },
          Cedula_Paciente: { rich_text: [{ text: { content: data.cedulaPaciente } }] },
          Poliza_ID: { rich_text: [{ text: { content: data.polizaId } }] },
          Fecha_Ingreso: { date: { start: data.fechaIngreso } },
          Estado_Poliza: { select: { name: mapEstado(data.estadoPoliza) } },
          Pre_existencias: { rich_text: [{ text: { content: data.preExistencias ?? 'Sin registro' } }] },
          Notificacion_Enviada: { checkbox: data.notificacionEnviada },
          Gestor_Asignado: { rich_text: [{ text: { content: data.gestorAsignado ?? 'Sin asignar' } }] },
          Hospital: { rich_text: [{ text: { content: data.hospital } }] }
        }
      })
    });

    if (!resp.ok) {
      const errorBody = await resp.json().catch(() => ({}));
      console.error('[NotionService] Error al crear página en Notion:', {
        status: resp.status,
        statusText: resp.statusText,
        errorBody
      });
      return null;
    }

    const json = (await resp.json()) as any;
    return json?.id ?? null;
  } catch (error) {
    console.error('[NotionService] Error inesperado:', error);
    return null;
  }
}
