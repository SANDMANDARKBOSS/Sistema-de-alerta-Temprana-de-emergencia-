import { EstadoPoliza, type Alerta, type Asegurado, type Poliza } from '@prisma/client';
import { prisma } from '../config/database';
import { generarResumenIA } from '../services/ai.service';
import { enviarNotificacionesSimultaneas } from '../services/email.service';
import { crearAlertaEnNotion } from '../services/notion.service';

interface IngresoPayload {
  cedula: string;
  hospital: string;
}

function normalizarEstadoPoliza(poliza: Poliza): EstadoPoliza {
  const now = new Date();
  if (poliza.estado === EstadoPoliza.SUSPENDIDA) {
    return EstadoPoliza.SUSPENDIDA;
  }
  if (poliza.fechaFin < now || poliza.estado === EstadoPoliza.VENCIDA) {
    return EstadoPoliza.VENCIDA;
  }
  return EstadoPoliza.VIGENTE;
}

export async function procesarIngresoEmergencia(payload: IngresoPayload): Promise<Alerta & { asegurado: Asegurado; poliza: Poliza }> {
  const { cedula, hospital } = payload;

  const asegurado = await prisma.asegurado.findUnique({
    where: { cedula }
  });

  if (!asegurado) {
    throw new Error('Asegurado no encontrado');
  }

  const poliza = await prisma.poliza.findUnique({
    where: { polizaId: asegurado.polizaId }
  });

  if (!poliza) {
    throw new Error('Póliza no encontrada para el asegurado');
  }

  const estadoPoliza = normalizarEstadoPoliza(poliza);
  const resumenIA = await generarResumenIA({
    estadoPoliza,
    preExistencias: poliza.preExistencias,
    hospital
  });

  let alerta = await prisma.alerta.create({
    data: {
      nombre: `Ingreso ${asegurado.nombre} - ${new Date().toISOString()}`,
      cedulaPaciente: cedula,
      polizaId: poliza.polizaId,
      estadoPoliza,
      preExistencias: poliza.preExistencias,
      gestorAsignado: poliza.gestorAsignado,
      hospital,
      resumenIA,
      notificacionEnviada: false
    }
  });

  const notificacionEnviada = await enviarNotificacionesSimultaneas({
    hospital,
    cedula,
    nombrePaciente: asegurado.nombre,
    polizaId: poliza.polizaId,
    estadoPoliza,
    preExistencias: poliza.preExistencias,
    resumenIA,
    gestorEmail: poliza.gestorEmail
  }).catch(() => false);

  const notionSyncId = await crearAlertaEnNotion({
    nombre: alerta.nombre,
    cedulaPaciente: alerta.cedulaPaciente,
    polizaId: alerta.polizaId,
    fechaIngreso: alerta.fechaIngreso.toISOString(),
    estadoPoliza: alerta.estadoPoliza,
    preExistencias: alerta.preExistencias,
    notificacionEnviada,
    gestorAsignado: alerta.gestorAsignado,
    hospital: alerta.hospital
  });

  alerta = await prisma.alerta.update({
    where: { id: alerta.id },
    data: {
      notificacionEnviada,
      notionSyncId
    }
  });

  return {
    ...alerta,
    asegurado,
    poliza
  };
}
