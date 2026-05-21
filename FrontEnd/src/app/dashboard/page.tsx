'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { IngresoTabla } from '../../components/ingreso-tabla/IngresoTabla';
import { DistribucionChart } from '../../components/distribucion-chart/DistribucionChart';
import { NotificacionesPanel } from '../../components/notificaciones-panel/NotificacionesPanel';
import { FlujoSistema } from '../../components/flujo-sistema/FlujoSistema';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Ingreso, Notificacion } from '../../shared/models';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [metricas, setMetricas] = useState({
    totalAlertas: 0,
    alertasCriticas: 0,
    alertasActivas: 0,
    tiempoPromedio: '0 min',
    historialReciente: [] as any[]
  });
  const [cargandoApi, setCargandoApi] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('--:--:--');

  const cargarDatos = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const resp = await fetch(`${apiUrl}/api/dashboard/metricas`);
      const data = await resp.json();
      if (data.data) {
        setMetricas(data.data);
      }
    } catch (e) {
      console.error('Error cargando métricas:', e);
    } finally {
      setCargandoApi(false);
      setUltimaActualizacion(new Date().toLocaleTimeString('es-CO'));
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  const sparklineData = [
    { value: 18 }, { value: 20 }, { value: 19 }, { value: 22 }, { value: 21 }, { value: 24 }
  ];

  const ingresosRecientes: Ingreso[] = (metricas.historialReciente || []).map(m => ({
    id: m.id,
    paciente: { id: m.cedulaPaciente, nombre: m.nombre || m.paciente || 'Paciente' },
    motivo: m.hospital,
    horaIngreso: new Date(m.fechaIngreso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    poliza: m.estadoPoliza === 'VIGENTE' ? 'Póliza Válida' : m.estadoPoliza === 'VENCIDA' ? 'Póliza Inválida' : 'En Validación',
    estado: m.notificacionEnviada ? 'Notificada' : 'Pendiente'
  }));

  const notificaciones: Notificacion[] = ingresosRecientes.slice(0, 4).map((ingreso) => ({
    tipo: ingreso.poliza === 'Póliza Válida' ? 'validada' : ingreso.poliza === 'En Validación' ? 'en-proceso' : 'invalida',
    descripcion: ingreso.poliza === 'Póliza Válida' ? 'Póliza validada correctamente' : ingreso.poliza === 'En Validación' ? 'Validación en proceso' : 'Póliza inválida',
    paciente: ingreso.paciente.nombre,
    hora: ingreso.horaIngreso
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Sistema de Alerta Temprana</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-[#6B7280]">
              <Clock size={14} />
              <span>Última actualización: {ultimaActualizacion} (auto-refresh 30s)</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2 shadow-sm">
              <AlertTriangle size={18} className="text-[#EF4444]" />
              <div>
                <p className="text-[10px] text-[#EF4444] font-bold uppercase">Alertas Activas</p>
                <p className="text-sm font-bold text-[#111827]">{metricas.alertasActivas || 0} Emergencias</p>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex items-center gap-2 shadow-sm">
              <CheckCircle2 size={18} className="text-[#4CAF50]" />
              <div>
                <p className="text-[10px] text-[#4CAF50] font-bold uppercase">Sistema Operativo</p>
                <p className="text-sm font-bold text-[#111827]">100% Funcional</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <MetricCard
              titulo="Total Alertas"
              valor={metricas.totalAlertas || 0}
              subtexto={cargandoApi ? 'Sincronizando...' : 'Historial completo'}
              subtextoColor="verde"
              sparklineData={sparklineData}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              titulo="Alertas Activas"
              valor={metricas.alertasActivas || 0}
              subtexto="En seguimiento"
              subtextoColor="verde"
              sparklineData={sparklineData.map((d) => ({ value: d.value - 4 }))}
              sparklineColor="#4CAF50"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              titulo="Alertas Críticas"
              valor={metricas.alertasCriticas || 0}
              subtexto="Pólizas vencidas/suspendidas"
              subtextoColor="rojo"
              sparklineData={sparklineData.map((d) => ({ value: 30 - d.value }))}
              sparklineColor="#EF4444"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard
              titulo="Tiempo de Respuesta"
              valor={(metricas.tiempoPromedio || '0').replace('s', '')}
              unidad="s"
              subtexto="Promedio de IA"
              subtextoColor="verde"
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IngresoTabla ingresos={ingresosRecientes} />
          </div>
          <div className="flex flex-col gap-6">
            <DistribucionChart 
              valida={(metricas.totalAlertas || 0) - (metricas.alertasCriticas || 0)} 
              enValidacion={0} 
              invalida={metricas.alertasCriticas || 0} 
            />
            <NotificacionesPanel notificaciones={notificaciones} />
          </div>
        </div>

        <FlujoSistema />
      </div>
    </MainLayout>
  );
}
