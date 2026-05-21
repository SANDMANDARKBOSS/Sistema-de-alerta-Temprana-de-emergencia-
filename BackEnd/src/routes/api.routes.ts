import { Router } from 'express';
import { prisma } from '../config/database';
import { procesarIngresoEmergencia } from '../webhooks/emergencyWebhook';
import type { AlertasResponse, IngresoApiItem } from '../types/api';

const router = Router();

function formatHoraIngreso(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

function polizaTexto(estado: string): IngresoApiItem['poliza'] {
  if (estado === 'VIGENTE') return 'Póliza Válida';
  if (estado === 'SUSPENDIDA') return 'Póliza Inválida';
  return 'En Validación';
}

router.get('/health', (_, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

router.post('/webhook/ingreso', async (req, res) => {
  try {
    const { cedula, hospital } = req.body as { cedula?: string; hospital?: string };

    if (!cedula || !hospital) {
      return res.status(400).json({ message: 'cedula y hospital son obligatorios' });
    }

    const alerta = await procesarIngresoEmergencia({ cedula, hospital });

    return res.status(201).json({
      id: alerta.id,
      estadoPoliza: alerta.estadoPoliza,
      notificacionEnviada: alerta.notificacionEnviada,
      notionSyncId: alerta.notionSyncId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    const status = message.includes('no encontrado') ? 404 : 500;
    return res.status(status).json({ message });
  }
});

router.get('/alertas', async (_, res) => {
  const alertas = await prisma.alerta.findMany({
    include: { asegurado: true },
    orderBy: { fechaIngreso: 'desc' },
    take: 50
  });

  const ingresos: IngresoApiItem[] = alertas.map((alerta) => ({
    id: alerta.id,
    paciente: {
      nombre: alerta.asegurado.nombre,
      id: alerta.cedulaPaciente
    },
    motivo: alerta.hospital,
    poliza: polizaTexto(alerta.estadoPoliza),
    estado: alerta.notificacionEnviada ? 'Notificado' : 'Pendiente',
    horaIngreso: formatHoraIngreso(alerta.fechaIngreso)
  }));

  const response: AlertasResponse = { ingresos };
  res.json(response);
});

router.get('/alertas/:id', async (req, res) => {
  const alerta = await prisma.alerta.findUnique({
    where: { id: req.params.id },
    include: { asegurado: true }
  });

  if (!alerta) {
    return res.status(404).json({ message: 'Alerta no encontrada' });
  }

  res.json(alerta);
});

router.get('/asegurados/:cedula', async (req, res) => {
  const asegurado = await prisma.asegurado.findUnique({
    where: { cedula: req.params.cedula },
    include: { poliza: true }
  });

  if (!asegurado) {
    return res.status(404).json({ message: 'Asegurado no encontrado' });
  }

  res.json(asegurado);
});

router.get('/polizas/:id', async (req, res) => {
  const poliza = await prisma.poliza.findUnique({
    where: { polizaId: req.params.id }
  });

  if (!poliza) {
    return res.status(404).json({ message: 'Póliza no encontrada' });
  }

  res.json(poliza);
});

router.get('/polizas', async (_, res) => {
  const polizas = await prisma.poliza.findMany({
    include: {
      asegurado: true
    },
    orderBy: { actualizadoEn: 'desc' },
    take: 100
  });

  res.json({ polizas });
});

router.get('/historial-casos', async (_, res) => {
  const casos = await prisma.alerta.findMany({
    include: {
      asegurado: true
    },
    orderBy: { fechaIngreso: 'desc' },
    take: 200
  });

  res.json({ casos });
});

export default router;
