import { Request, Response } from 'express';
import { z } from 'zod';
import { io } from '../server';
import { buscarAseguradoPorCedula, buscarPolizaPorId, crearAlertaEmergencia, actualizarNotificacionAlerta, AlertaData } from '../services/notion.service';
import { analizarPoliza, DatosPoliza } from '../services/ai.service';
import { enviarNotificacionHospital, enviarNotificacionGestor, DatosNotificacion } from '../services/email.service';
import { prisma } from '../config/database';

const webhookSchema = z.object({
  cedula: z.string().min(1, "La cédula es requerida"),
  hospital: z.string().min(1, "El hospital es requerido")
});

function emitLog(tipo: 'inicio' | 'notion' | 'ia' | 'email' | 'error' | 'success', mensaje: string) {
  console.log(`[Webhook] ${mensaje}`);
  io.emit('log', { tipo, mensaje, timestamp: new Date().toISOString() });
}

export const emergencyWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validar payload
    const result = webhookSchema.safeParse(req.body);
    if (!result.success) {
      emitLog('error', `Payload inválido: ${result.error.message}`);
      res.status(400).json({ error: 'Datos inválidos', detalles: result.error.format() });
      return;
    }

    const { cedula, hospital } = result.data;
    emitLog('inicio', `Webhook recibido: cédula ${cedula} en ${hospital}`);

    // 2. Buscar asegurado en Notion
    let asegurado = await buscarAseguradoPorCedula(cedula);
    let poliza = null;

    if (!asegurado) {
      emitLog('notion', `Asegurado no encontrado en Notion, buscando en base local...`);
      const localAsegurado = await prisma.asegurado.findFirst({ where: { cedula } });
      
      if (localAsegurado) {
        asegurado = {
          id: localAsegurado.id,
          nombre: localAsegurado.nombre,
          cedula: localAsegurado.cedula,
          polizaId: localAsegurado.polizaId,
          email: localAsegurado.email
        };
        
        const localPoliza = await prisma.poliza.findFirst({ where: { polizaId: localAsegurado.polizaId } });
        if (localPoliza) {
          poliza = {
            id: localPoliza.id,
            polizaId: localPoliza.polizaId,
            estado: localPoliza.estado,
            cobertura: localPoliza.cobertura,
            preExistencias: localPoliza.preExistencias
          };
        }
      }
    } else {
      emitLog('notion', `Asegurado encontrado en Notion: ${asegurado.nombre}`);
      poliza = await buscarPolizaPorId(asegurado.polizaId);
    }

    if (!asegurado) {
      emitLog('error', `Asegurado no encontrado para la cédula ${cedula}`);
      res.status(404).json({ error: 'Asegurado no encontrado' });
      return;
    }

    // 3. Buscar póliza asociada
    if (!poliza) {
      emitLog('error', `Póliza no encontrada para el asegurado ${asegurado.nombre}`);
      res.status(404).json({ error: 'Póliza no encontrada' });
      return;
    }
    emitLog('notion', `Póliza validada: ${poliza.polizaId} - Estado: ${poliza.estado}`);

    // 4. Llamar agente IA
    emitLog('ia', 'Agente IA analizando póliza y pre-existencias...');
    const datosPoliza: DatosPoliza = {
      nombrePaciente: asegurado.nombre,
      estadoPoliza: poliza.estado,
      preExistencias: poliza.preExistencias,
      cobertura: poliza.cobertura,
      hospital: hospital
    };
    const analisisIA = await analizarPoliza(datosPoliza);
    emitLog('ia', `Análisis IA completado: Validación ${analisisIA.validacion}, Riesgo ${analisisIA.riesgo}`);

    // 5. Crear alerta en Notion
    const fechaHora = new Date().toISOString();
    const alertaData: AlertaData = {
      nombre: asegurado.nombre,
      cedulaPaciente: asegurado.cedula,
      polizaId: poliza.polizaId,
      fechaIngreso: fechaHora,
      estadoPoliza: poliza.estado,
      preExistencias: poliza.preExistencias,
      notificacionEnviada: false,
      hospital: hospital
    };
    const alertaId = await crearAlertaEmergencia(alertaData);
    
    // Guardar en Prisma localmente SIEMPRE para asegurar visibilidad inmediata
    try {
      await prisma.alerta.create({
        data: {
          nombre: asegurado.nombre,
          cedulaPaciente: asegurado.cedula,
          polizaId: poliza.polizaId,
          estadoPoliza: poliza.estado,
          hospital: hospital,
          notificacionEnviada: false,
          resumenIA: analisisIA.resumen,
          gestorAsignado: 'Laura Martínez',
          notionSyncId: alertaId || 'pending'
        }
      });
      emitLog('notion', `Alerta guardada en base local`);
    } catch (err) {
      console.error('Error Prisma:', err);
    }

    if (!alertaId) {
      emitLog('error', `Nota: Sincronización con Notion fallida, usando base local`);
    } else {
      emitLog('notion', `Alerta creada en Notion exitosamente`);
    }

    // 6. Enviar emails en paralelo
    const datosEmail: DatosNotificacion = {
      nombrePaciente: asegurado.nombre,
      cedula: asegurado.cedula,
      polizaId: poliza.polizaId,
      estadoPoliza: poliza.estado,
      preExistencias: poliza.preExistencias,
      cobertura: poliza.cobertura,
      hospital: hospital,
      analisis: analisisIA,
      fechaHora: new Date().toLocaleString('es-CO')
    };

    emitLog('email', 'Enviando notificaciones simultáneas al hospital y al gestor...');
    const [emailHospOk, emailGestorOk] = await Promise.all([
      enviarNotificacionHospital(datosEmail),
      enviarNotificacionGestor(datosEmail)
    ]);

    if (emailHospOk || emailGestorOk) {
      if (alertaId) await actualizarNotificacionAlerta(alertaId);
      
      // Actualizar en Prisma
      await prisma.alerta.updateMany({
        where: { cedulaPaciente: asegurado.cedula, polizaId: poliza.polizaId, hospital: hospital },
        data: { notificacionEnviada: true }
      });

      emitLog('success', `Notificaciones enviadas. Alerta actualizada.`);
    } else {
      emitLog('error', `Fallo el envío de emails de notificación.`);
    }

    // 7. Emitir evento global para el FrontEnd
    const alertaGlobal = {
      id: alertaId || `local-${Date.now()}`,
      ...alertaData,
      analisis: analisisIA
    };
    io.emit('nueva-alerta', alertaGlobal);
    emitLog('success', 'Flujo completado exitosamente.');

    // 8. Responder 200 con resumen
    res.status(200).json({
      mensaje: 'Procesamiento completado',
      alertaId: alertaId,
      paciente: asegurado.nombre,
      analisis: analisisIA,
      emailsEnviados: {
        hospital: emailHospOk,
        gestor: emailGestorOk
      }
    });

  } catch (error) {
    emitLog('error', `Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
