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

function formatFechaCorta(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatFechaHora(date: Date): string {
  const fecha = formatFechaCorta(date);
  const hora = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
  return `${fecha} ${hora}`;
}

router.get('/reportes/diario', async (req, res) => {
  const fromStr = typeof req.query.from === 'string' ? req.query.from : undefined;
  const toStr = typeof req.query.to === 'string' ? req.query.to : undefined;

  const to = toStr ? new Date(toStr) : new Date();
  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return res.status(400).json({ message: 'Parámetros from/to inválidos (usa ISO: 2026-05-21T00:00:00.000Z)' });
  }

  const alertas = await prisma.alerta.findMany({
    where: {
      fechaIngreso: { gte: from, lte: to }
    },
    orderBy: { fechaIngreso: 'desc' }
  });

  const porDia = new Map<string, { ingresos: number; validadas: number; enValidacion: number; invalidas: number }>();
  for (const a of alertas) {
    const key = formatFechaCorta(a.fechaIngreso);
    const current = porDia.get(key) ?? { ingresos: 0, validadas: 0, enValidacion: 0, invalidas: 0 };
    current.ingresos += 1;
    if (a.estadoPoliza === 'VIGENTE') current.validadas += 1;
    else if (a.estadoPoliza === 'SUSPENDIDA') current.invalidas += 1;
    else current.enValidacion += 1; // VENCIDA u otro -> en validacion
    porDia.set(key, current);
  }

  const resumenDiario = Array.from(porDia.entries())
    .map(([fecha, v]) => ({
      fecha,
      ingresos: v.ingresos,
      validadas: v.validadas,
      enValidacion: v.enValidacion,
      invalidas: v.invalidas,
      alertas: v.enValidacion + v.invalidas,
      tiempo: '—'
    }))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  res.json({ resumenDiario });
});

router.get('/gestores', async (_, res) => {
  const polizas = await prisma.poliza.findMany({
    select: { gestorAsignado: true, gestorEmail: true }
  });

  const gestoresMap = new Map<string, { nombre: string; correo: string }>();
  for (const p of polizas) {
    const nombre = (p.gestorAsignado ?? '').trim();
    if (!nombre) continue;
    const correo = (p.gestorEmail ?? '').trim();
    if (!gestoresMap.has(nombre)) gestoresMap.set(nombre, { nombre, correo });
  }

  const fecha = formatFechaCorta(new Date());
  const hora = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date());

  const gestores = Array.from(gestoresMap.values()).map((g, idx) => ({
    id: `GEST-${String(idx + 1).padStart(3, '0')}`,
    nombre: g.nombre,
    rol: 'Gestor de Casos',
    correo: g.correo || `${g.nombre.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    area: 'Gestión de Casos',
    estado: 'Activo',
    ultimoAcceso: { fecha, hora },
    avatar: null
  }));

  const alertas = await prisma.alerta.findMany({
    include: { asegurado: true },
    orderBy: { fechaIngreso: 'desc' },
    take: 50
  });

  const notificaciones = alertas.map((a) => {
    const tipo =
      a.estadoPoliza === 'SUSPENDIDA'
        ? 'Póliza Inválida'
        : a.estadoPoliza === 'VIGENTE'
          ? 'Validación de Póliza'
          : 'Revisión Pendiente';

    const tipoColor =
      a.estadoPoliza === 'SUSPENDIDA' ? 'rojo' : a.estadoPoliza === 'VIGENTE' ? 'azul' : 'naranja';

    return {
      fechaHora: formatFechaHora(a.fechaIngreso),
      paciente: { nombre: a.asegurado.nombre, id: a.cedulaPaciente },
      tipo,
      tipoColor,
      canal: a.notificacionEnviada ? 'Email' : 'Sistema',
      mensaje: a.hospital ? `Ingreso a emergencia detectado en ${a.hospital}` : 'Ingreso a emergencia detectado',
      enviadoPor: a.gestorAsignado ?? 'Sistema',
      estado: a.notificacionEnviada ? 'Enviado' : 'Pendiente'
    };
  });

  res.json({ gestores, notificaciones });
});

export default router;
