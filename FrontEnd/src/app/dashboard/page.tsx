'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { IngresoTabla } from '../../components/ingreso-tabla/IngresoTabla';
import { DistribucionChart } from '../../components/distribucion-chart/DistribucionChart';
import { NotificacionesPanel } from '../../components/notificaciones-panel/NotificacionesPanel';
import { FlujoSistema } from '../../components/flujo-sistema/FlujoSistema';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Ingreso, Notificacion } from '../../shared/models';
import { motion } from 'framer-motion';

// Estado inicial vacío — el dashboard se muestra de inmediato mientras la API carga
const METRICAS_INICIALES = {
  totalAlertas: 0,
  alertasCriticas: 0,
  alertasActivas: 0,
  tiempoPromedio: '-- s',
  historialReciente: [] as any[]
};

const sparklineBase = [
  { value: 18 }, { value: 20 }, { value: 19 }, { value: 22 }, { value: 21 }, { value: 24 }
];

export default function DashboardPage() {
  const [metricas, setMetricas] = useState(METRICAS_INICIALES);
  // 'idle' = sin iniciar, 'loading' = cargando API, 'done' = datos listos, 'error' = falló
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('--:--:--');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const cargarDatos = useCallback(async () => {
    setApiStatus('loading');
    setErrorMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

      // Timeout en el cliente para no esperar más de 12 segundos
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);

      const resp = await fetch(`${apiUrl}/api/dashboard/metricas`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      if (data.data) {
        setMetricas(data.data);
      }
      setApiStatus('done');
      setUltimaActualizacion(new Date().toLocaleTimeString('es-CO'));
    } catch (e: any) {
      const msg = e?.name === 'AbortError'
        ? 'El servidor tardó demasiado (>12s). Reintentando en 30s...'
        : 'No se pudo conectar con el servidor';
      console.error('Error cargando métricas:', e);
      setErrorMsg(msg);
      setApiStatus('error');
      // Mantener datos anteriores si los había
    }
  }, []);

  useEffect(() => {
    // Pequeño delay para que Next.js pinte el HTML antes de la llamada API
    const initialDelay = setTimeout(() => { void cargarDatos(); }, 50);
    const interval = setInterval(() => { void cargarDatos(); }, 30_000);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [cargarDatos]);

  const ingresosRecientes: Ingreso[] = useMemo(() =>
    (metricas.historialReciente || []).map(m => ({
      id: m.id,
      paciente: { id: m.cedulaPaciente, nombre: m.nombre || m.paciente || 'Paciente' },
      motivo: m.hospital,
      horaIngreso: m.fechaIngreso
        ? new Date(m.fechaIngreso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        : '--:--',
      poliza: m.estadoPoliza === 'VIGENTE'
        ? 'Póliza Válida'
        : m.estadoPoliza === 'VENCIDA' ? 'Póliza Inválida' : 'En Validación',
      estado: m.notificacionEnviada ? 'Notificado' : 'Pendiente'
    })),
    [metricas.historialReciente]
  );

  const notificaciones: Notificacion[] = useMemo(() =>
    ingresosRecientes.slice(0, 4).map(ingreso => ({
      tipo: ingreso.poliza === 'Póliza Válida' ? 'validada' : ingreso.poliza === 'En Validación' ? 'en-proceso' : 'invalida',
      descripcion: ingreso.poliza === 'Póliza Válida'
        ? 'Póliza validada correctamente'
        : ingreso.poliza === 'En Validación' ? 'Validación en proceso' : 'Póliza inválida',
      paciente: ingreso.paciente.nombre,
      hora: ingreso.horaIngreso || '--:--'
    })),
    [ingresosRecientes]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const isLoading = apiStatus === 'idle' || apiStatus === 'loading';

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* ── Encabezado ── */}
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Sistema de Alerta Temprana</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-[#6B7280]">
              <Clock size={14} />
              <span>
                {apiStatus === 'done'
                  ? `Última actualización: ${ultimaActualizacion} (auto-refresh 30s)`
                  : apiStatus === 'loading' ? 'Sincronizando datos...'
                  : apiStatus === 'error' ? errorMsg
                  : 'Iniciando...'}
              </span>
              {apiStatus === 'loading' && (
                <RefreshCw size={12} className="animate-spin text-blue-400" />
              )}
              {apiStatus === 'error' && (
                <button
                  onClick={() => void cargarDatos()}
                  className="ml-2 text-xs text-blue-500 underline hover:no-underline"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2 shadow-sm">
              <AlertTriangle size={18} className="text-[#EF4444]" />
              <div>
                <p className="text-[10px] text-[#EF4444] font-bold uppercase">Alertas Activas</p>
                <p className="text-sm font-bold text-[#111827]">
                  {isLoading ? (
                    <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse" />
                  ) : `${metricas.alertasActivas || 0} Emergencias`}
                </p>
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

        {/* ── Métricas ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              titulo: 'Total Alertas',
              valor: metricas.totalAlertas || 0,
              subtexto: isLoading ? 'Cargando...' : 'Historial completo',
              subtextoColor: 'verde' as const,
              sparklineData: sparklineBase,
            },
            {
              titulo: 'Alertas Activas',
              valor: metricas.alertasActivas || 0,
              subtexto: 'En seguimiento',
              subtextoColor: 'verde' as const,
              sparklineData: sparklineBase.map(d => ({ value: d.value - 4 })),
              sparklineColor: '#4CAF50',
            },
            {
              titulo: 'Alertas Críticas',
              valor: metricas.alertasCriticas || 0,
              subtexto: 'Pólizas vencidas/suspendidas',
              subtextoColor: 'rojo' as const,
              sparklineData: sparklineBase.map(d => ({ value: 30 - d.value })),
              sparklineColor: '#EF4444',
            },
            {
              titulo: 'Tiempo de Respuesta',
              valor: isLoading ? '--' : (metricas.tiempoPromedio || '0').replace('s', ''),
              unidad: 's',
              subtexto: 'Promedio de IA',
              subtextoColor: 'verde' as const,
            },
          ].map(card => (
            <motion.div key={card.titulo} variants={itemVariants}>
              <MetricCard {...card} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Tabla + Charts ── */}
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
