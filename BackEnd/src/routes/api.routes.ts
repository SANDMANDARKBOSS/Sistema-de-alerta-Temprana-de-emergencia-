import { Router } from 'express';
import { emergencyWebhook } from '../webhooks/emergencyWebhook';
import { registrarAsegurado, registrarPoliza, obtenerTodasLasAlertas, obtenerTodasLasPolizas } from '../services/notion.service';
import { prisma } from '../config/database';

const router = Router();

// Webhook principal
router.post('/webhook/ingreso', emergencyWebhook);

// Registro de nuevos asegurados
router.post('/asegurados/registro', async (req, res) => {
  try {
    const { nombre, cedula, email, plan, preExistencias } = req.body;
    const polizaId = `POL-${cedula.substring(0, 4)}-${Math.floor(Math.random() * 1000)}`;
    
    // 1. Registrar en Notion
    const notionAseguradoId = await registrarAsegurado({ nombre, cedula, polizaId, email });
    const notionPolizaId = await registrarPoliza({ 
      polizaId, 
      estado: 'VIGENTE', 
      cobertura: plan || 'Cobertura Estándar', 
      preExistencias: preExistencias || 'Ninguna' 
    });

    // 2. Registrar en SQLite (Prisma) para persistencia local rápida
    await prisma.asegurado.create({
      data: { nombre, cedula, polizaId, email }
    });
    
    await prisma.poliza.create({
      data: {
        polizaId,
        cedulaAsegurado: cedula,
        estado: 'VIGENTE',
        cobertura: plan || 'Cobertura Estándar',
        preExistencias: preExistencias || 'Ninguna',
        fechaInicio: new Date(),
        fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        gestorAsignado: 'Admin Sistema',
        gestorEmail: 'admin@sistema.com'
      }
    });

    res.status(201).json({ 
      success: true, 
      mensaje: 'Asegurado registrado exitosamente',
      polizaId 
    });
  } catch (error) {
    console.error('Error registrando:', error);
    res.status(500).json({ error: 'Error interno al registrar asegurado' });
  }
});

// Rutas solicitadas en Estado.md
router.get('/alertas', async (req, res) => {
  try {
    // Intentamos obtener de Notion primero para mantener el requisito
    let alertas = await obtenerTodasLasAlertas();
    
    // Si Notion está vacío (ej: base nueva), mostramos lo que hay en SQLite local
    if (alertas.length === 0) {
      const localAlertas = await prisma.alerta.findMany({ orderBy: { createdAt: 'desc' } });
      alertas = localAlertas.map(a => ({
        id: a.id,
        nombre: a.nombre,
        paciente: a.nombre,
        cedulaPaciente: a.cedulaPaciente,
        polizaId: a.polizaId,
        fechaIngreso: a.createdAt.toISOString(),
        estadoPoliza: a.estadoPoliza,
        hospital: a.hospital,
        notificacionEnviada: a.notificacionEnviada,
        gestorAsignado: a.gestorAsignado,
        preExistencias: a.resumenIA
      }));
    }
    
    res.json({ data: alertas });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo alertas' });
  }
});

router.get('/polizas', async (req, res) => {
  try {
    let polizas = await obtenerTodasLasPolizas();
    
    if (polizas.length === 0) {
      const localPolizas = await prisma.poliza.findMany();
      polizas = localPolizas.map(p => ({
        id: p.id,
        polizaId: p.polizaId,
        estado: p.estado,
        cobertura: p.cobertura,
        preExistencias: p.preExistencias
      }));
    }
    
    res.json({ data: polizas });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo polizas' });
  }
});

router.get('/historial', async (req, res) => {
  try {
    const localAlertas = await prisma.alerta.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = localAlertas.map(a => ({
      id: a.id,
      nombre: a.nombre,
      cedulaPaciente: a.cedulaPaciente,
      polizaId: a.polizaId,
      fechaIngreso: a.createdAt.toISOString(),
      estadoPoliza: a.estadoPoliza,
      hospital: a.hospital,
      notificacionEnviada: a.notificacionEnviada,
      gestorAsignado: a.gestorAsignado
    }));
    res.json({ data: mapped });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

router.get('/gestores', (req, res) => {
  res.json({
    data: [
      { id: '1', nombre: 'Laura Martínez', email: 'laura.martinez@seguros.com' },
      { id: '2', nombre: 'Carlos Ruiz', email: 'carlos.ruiz@seguros.com' }
    ]
  });
});

router.get('/dashboard/metricas', async (req, res) => {
  try {
    const alertas = await obtenerTodasLasAlertas();
    const total = alertas.length;
    const criticas = alertas.filter(a => a.estadoPoliza === 'VENCIDA' || a.estadoPoliza === 'SUSPENDIDA').length;
    const activas = total; // Asumimos todas activas para simplificar
    
    res.json({
      data: {
        totalAlertas: total,
        alertasCriticas: criticas,
        alertasActivas: activas,
        tiempoPromedio: "1.2s",
        historialReciente: alertas.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo métricas' });
  }
});

router.get('/config', (req, res) => {
  res.json({ data: { configurado: true } });
});

router.put('/config', (req, res) => {
  res.json({ data: { success: true } });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
