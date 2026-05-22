import { Router, Request, Response, NextFunction } from 'express';
import { emergencyWebhook } from '../webhooks/emergencyWebhook';
import {
  registrarAsegurado,
  registrarPoliza,
  obtenerTodasLasAlertas,
  obtenerTodasLasPolizas,
  actualizarAsegurado,
  actualizarPoliza,
  testConexionNotion,
  buscarAseguradoPorCedula,
  borrarRegistroNotion,
  obtenerTodosLosAsegurados,
  sanitizeString,
  sanitizeCedula,
  sanitizeEmail,
} from '../services/notion.service';
import { env } from '../config/env';

const router = Router();

// ─── Rate limiter simple en memoria ──────────────────────────────────────────
// Protege endpoints costosos sin dependencias externas.
const rateLimitStore: Record<string, { count: number; resetAt: number }> = {};

function rateLimit(maxPerMinute: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitStore[key];

    if (!entry || now > entry.resetAt) {
      rateLimitStore[key] = { count: 1, resetAt: now + 60_000 };
    } else {
      entry.count++;
      if (entry.count > maxPerMinute) {
        res.status(429).json({ error: 'Demasiadas solicitudes. Intenta en un momento.' });
        return;
      }
    }
    next();
  };
}

// ─── Validadores de campos ────────────────────────────────────────────────────
function requireFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || String(val).trim() === '';
    });
    if (missing.length > 0) {
      res.status(400).json({ error: `Campos requeridos faltantes: ${missing.join(', ')}` });
      return;
    }
    next();
  };
}

// ─── Webhook principal ────────────────────────────────────────────────────────
router.post('/webhook/ingreso', rateLimit(20), emergencyWebhook);

// ─── Asegurados ───────────────────────────────────────────────────────────────
router.post(
  '/asegurados/registro',
  rateLimit(10),
  requireFields(['nombre', 'cedula', 'email']),
  async (req: Request, res: Response) => {
    try {
      const nombre = sanitizeString(req.body.nombre, 200);
      const cedula = sanitizeCedula(req.body.cedula);
      const email = sanitizeEmail(req.body.email);
      const plan = sanitizeString(req.body.plan || '', 200);
      const preExistencias = sanitizeString(req.body.preExistencias || '', 500);

      if (!nombre || !cedula || !email) {
        res.status(400).json({ error: 'Nombre, cédula o email no son válidos.' });
        return;
      }

      const polizaId = `POL-${cedula.substring(0, 4)}-${Math.floor(Math.random() * 1000)}`;

      await registrarAsegurado({ nombre, cedula, polizaId, email });
      await registrarPoliza({
        polizaId,
        estado: 'VIGENTE',
        cobertura: plan || 'Cobertura Estándar',
        preExistencias: preExistencias || 'Ninguna'
      });

      res.status(201).json({
        success: true,
        mensaje: 'Asegurado registrado exitosamente en Notion',
        polizaId
      });
    } catch (error) {
      console.error('Error registrando:', error);
      res.status(500).json({ error: 'Error interno al registrar asegurado' });
    }
  }
);

router.get('/asegurados', rateLimit(60), async (_req: Request, res: Response) => {
  try {
    const asegurados = await obtenerTodosLosAsegurados();
    res.json({ data: asegurados });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo asegurados' });
  }
});

router.put('/asegurados/:id', rateLimit(30), async (req: Request, res: Response) => {
  try {
    const id = sanitizeString(req.params.id, 100);
    const nombre = sanitizeString(req.body.nombre || '', 200);
    const email = sanitizeEmail(req.body.email || '');

    if (!id) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const actualizado = await actualizarAsegurado(id, { nombre: nombre || undefined, email: email || undefined });

    if (actualizado) {
      res.json({ success: true, data: { id, nombre, email } });
    } else {
      res.status(500).json({ error: 'Fallo al actualizar asegurado en Notion' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando asegurado' });
  }
});

router.delete('/asegurados/:id', rateLimit(10), async (req: Request, res: Response) => {
  try {
    const id = sanitizeString(req.params.id, 100);
    if (!id) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const borrado = await borrarRegistroNotion(id);

    if (borrado) {
      res.json({ success: true, mensaje: 'Asegurado eliminado de Notion' });
    } else {
      res.status(500).json({ error: 'No se pudo eliminar en Notion' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando asegurado' });
  }
});

// ─── Alertas ──────────────────────────────────────────────────────────────────
router.get('/alertas', rateLimit(60), async (_req: Request, res: Response) => {
  try {
    const alertas = await obtenerTodasLasAlertas();
    res.json({ data: alertas });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo alertas' });
  }
});

// ─── Pólizas ──────────────────────────────────────────────────────────────────
router.get('/polizas', rateLimit(60), async (_req: Request, res: Response) => {
  try {
    const polizas = await obtenerTodasLasPolizas();
    res.json({ data: polizas });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo polizas' });
  }
});

router.post('/polizas', rateLimit(10), async (req: Request, res: Response) => {
  try {
    const polizaId = sanitizeString(req.body.polizaId || `POL-${Math.floor(Math.random() * 10000)}`, 100);
    const estado = sanitizeString(req.body.estado || 'VIGENTE', 50);
    const cobertura = sanitizeString(req.body.cobertura || 'Cobertura Estándar', 300);
    const preExistencias = sanitizeString(req.body.preExistencias || 'Ninguna', 500);

    const id = await registrarPoliza({ polizaId, estado, cobertura, preExistencias });
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error creando póliza:', error);
    res.status(500).json({ error: 'Error creando póliza' });
  }
});

router.put('/polizas/:id', rateLimit(30), async (req: Request, res: Response) => {
  try {
    const id = sanitizeString(req.params.id, 100);
    const estado = sanitizeString(req.body.estado || '', 50);
    const cobertura = sanitizeString(req.body.cobertura || '', 300);
    const preExistencias = sanitizeString(req.body.preExistencias || '', 500);

    if (!id) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const actualizado = await actualizarPoliza(id, {
      estado: estado || undefined,
      cobertura: cobertura || undefined,
      preExistencias: preExistencias || undefined
    });

    if (actualizado) {
      res.json({ success: true, data: { id, estado, cobertura, preExistencias } });
    } else {
      res.status(500).json({ error: 'Error actualizando póliza en Notion' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando póliza' });
  }
});

// ─── Historial ────────────────────────────────────────────────────────────────
router.get('/historial', rateLimit(60), async (_req: Request, res: Response) => {
  try {
    const alertas = await obtenerTodasLasAlertas();
    res.json({ data: alertas });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

// ─── Gestores ─────────────────────────────────────────────────────────────────
router.get('/gestores', rateLimit(60), (_req: Request, res: Response) => {
  res.json({
    data: [
      { id: '1', nombre: 'Laura Martínez', email: 'laura.martinez@seguros.com' },
      { id: '2', nombre: 'Carlos Ruiz', email: 'carlos.ruiz@seguros.com' }
    ]
  });
});

// ─── Dashboard métricas ───────────────────────────────────────────────────────
router.get('/dashboard/metricas', rateLimit(60), async (_req: Request, res: Response) => {
  try {
    const alertas = await obtenerTodasLasAlertas();
    const total = alertas.length;
    const criticas = alertas.filter((a: any) => a.estadoPoliza === 'VENCIDA' || a.estadoPoliza === 'SUSPENDIDA').length;
    const activas = total;

    res.json({
      data: {
        totalAlertas: total,
        alertasCriticas: criticas,
        alertasActivas: activas,
        tiempoPromedio: '1.2s',
        historialReciente: alertas.slice(0, 5),
        todasLasAlertas: alertas
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo métricas' });
  }
});

// ─── Configuración ────────────────────────────────────────────────────────────
let configData = {
  registrosPorPagina: 10,
  formatoFecha: 'DD/MM/YYYY',
  formatoHora: '12h',
  institucion: {
    nombre: 'Hospital Central',
    direccion: 'Av. 11 de Noviembre Riobamba - Chimborazo',
    telefono: '+593 9999999999',
    correo: 'hospital_demo@yopmail.com'
  },
  validacionAutomatica: true,
  cierreAutomaticoCasos: true
};

router.get('/config', rateLimit(60), (_req: Request, res: Response) => {
  res.json({ data: configData });
});

router.put('/config', rateLimit(10), (req: Request, res: Response) => {
  // Sanitizar configuración entrante
  const body = req.body;
  if (body.registrosPorPagina !== undefined) {
    const val = parseInt(body.registrosPorPagina, 10);
    if (!isNaN(val) && val > 0 && val <= 100) configData.registrosPorPagina = val;
  }
  if (body.formatoFecha) configData.formatoFecha = sanitizeString(body.formatoFecha, 20);
  if (body.formatoHora) configData.formatoHora = sanitizeString(body.formatoHora, 10);
  if (body.validacionAutomatica !== undefined) configData.validacionAutomatica = Boolean(body.validacionAutomatica);
  if (body.cierreAutomaticoCasos !== undefined) configData.cierreAutomaticoCasos = Boolean(body.cierreAutomaticoCasos);
  if (body.institucion && typeof body.institucion === 'object') {
    const inst = body.institucion;
    configData.institucion = {
      nombre: sanitizeString(inst.nombre || configData.institucion.nombre, 200),
      direccion: sanitizeString(inst.direccion || configData.institucion.direccion, 300),
      telefono: sanitizeString(inst.telefono || configData.institucion.telefono, 50),
      correo: sanitizeEmail(inst.correo || '') || configData.institucion.correo
    };
  }
  res.json({ data: { success: true } });
});

// ─── Diagnóstico y salud ──────────────────────────────────────────────────────
router.get('/diagnostico', rateLimit(10), async (_req: Request, res: Response) => {
  const notionStatus = await testConexionNotion();
  res.json({
    data: {
      notion: notionStatus,
      email: {
        configurado: !!env.SMTP_USER,
        fallbackEthereal: !env.SMTP_USER,
        destinoHospital: env.DESTINATION_HOSPITAL || 'No configurado (usará fallback)',
        destinoGestor: env.DESTINATION_INSURANCE || 'No configurado (usará fallback)'
      }
    }
  });
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
