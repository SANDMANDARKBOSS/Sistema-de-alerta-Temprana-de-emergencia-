import { Router } from 'express';
import { emergencyWebhook } from '../webhooks/emergencyWebhook';
import { registrarAsegurado, registrarPoliza, obtenerTodasLasAlertas, obtenerTodasLasPolizas, actualizarAsegurado, actualizarPoliza, testConexionNotion, buscarAseguradoPorCedula, borrarRegistroNotion, obtenerTodosLosAsegurados } from '../services/notion.service';
import { env } from '../config/env';

const router = Router();

// Webhook principal
router.post('/webhook/ingreso', emergencyWebhook);

// Registro de nuevos asegurados
router.post('/asegurados/registro', async (req, res) => {
  try {
    const { nombre, cedula, email, plan, preExistencias } = req.body;
    const polizaId = `POL-${cedula.substring(0, 4)}-${Math.floor(Math.random() * 1000)}`;
    
    // 1. Registrar en Notion exclusivamente
    const notionAseguradoId = await registrarAsegurado({ nombre, cedula, polizaId, email });
    const notionPolizaId = await registrarPoliza({ 
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
});

// Obtener todos los asegurados
router.get('/asegurados', async (req, res) => {
  try {
    const asegurados = await obtenerTodosLosAsegurados();
    res.json({ data: asegurados });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo asegurados' });
  }
});

// Actualizar un asegurado
router.put('/asegurados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;
    
    // El frontend ahora enviará el ID de Notion
    const actualizado = await actualizarAsegurado(id, { nombre, email });
    
    if (actualizado) {
      res.json({ success: true, data: { id, nombre, email } });
    } else {
      res.status(500).json({ error: 'Fallo al actualizar asegurado en Notion' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando asegurado' });
  }
});

// Eliminar un asegurado
router.delete('/asegurados/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

// Rutas solicitadas en Estado.md
router.get('/alertas', async (req, res) => {
  try {
    const alertas = await obtenerTodasLasAlertas();
    res.json({ data: alertas });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo alertas' });
  }
});

router.get('/polizas', async (req, res) => {
  try {
    const polizas = await obtenerTodasLasPolizas();
    res.json({ data: polizas });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo polizas' });
  }
});

// Crear nueva póliza
router.post('/polizas', async (req, res) => {
  try {
    const { polizaId, estado, cobertura, preExistencias } = req.body;
    const id = await registrarPoliza({
      polizaId: polizaId || `POL-${Math.floor(Math.random() * 10000)}`,
      estado: estado || 'VIGENTE',
      cobertura: cobertura || 'Cobertura Estándar',
      preExistencias: preExistencias || 'Ninguna'
    });
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error creando póliza:', error);
    res.status(500).json({ error: 'Error creando póliza' });
  }
});

// Actualizar una póliza
router.put('/polizas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, cobertura, preExistencias } = req.body;
    
    const actualizado = await actualizarPoliza(id, { estado, cobertura, preExistencias });
    
    if (actualizado) {
      res.json({ success: true, data: { id, estado, cobertura, preExistencias } });
    } else {
      res.status(500).json({ error: 'Error actualizando póliza en Notion' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando póliza' });
  }
});

router.get('/historial', async (req, res) => {
  try {
    const alertas = await obtenerTodasLasAlertas();
    res.json({ data: alertas });
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
    const criticas = alertas.filter((a: any) => a.estadoPoliza === 'VENCIDA' || a.estadoPoliza === 'SUSPENDIDA').length;
    const activas = total; // Asumimos todas activas para simplificar
    
    res.json({
      data: {
        totalAlertas: total,
        alertasCriticas: criticas,
        alertasActivas: activas,
        tiempoPromedio: "1.2s",
        historialReciente: alertas.slice(0, 5),
        todasLasAlertas: alertas
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo métricas' });
  }
});

let configData = {
  registrosPorPagina: 10,
  formatoFecha: 'DD/MM/YYYY',
  formatoHora: '12h',
  institucion: {
    nombre: 'Hospital Central',
    direccion: 'Av. Salud 1234, San Isidro, Lima, Perú',
    telefono: '+51 1 234 5678',
    correo: 'contacto@hospitalcentral.com'
  },
  validacionAutomatica: true,
  cierreAutomaticoCasos: true
};

router.get('/config', (req, res) => {
  res.json({ data: configData });
});

router.put('/config', (req, res) => {
  configData = { ...configData, ...req.body };
  res.json({ data: { success: true } });
});

router.get('/diagnostico', async (req, res) => {
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

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
