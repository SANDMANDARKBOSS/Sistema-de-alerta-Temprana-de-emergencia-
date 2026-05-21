'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { LineaChart } from '../../components/linea-chart/LineaChart';
import { FiltroRangoFecha } from '../../components/filtro-rango-fecha/FiltroRangoFecha';
import { getReporteDiario, ReporteDiarioApiItem } from '../../services/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Download,
  Filter,
  X
} from 'lucide-react';

export default function ReportesPagina() {
  const [reporte, setReporte] = useState<ReporteDiarioApiItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [apiDisponible, setApiDisponible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      const data = await getReporteDiario();
      setReporte(data);
      setApiDisponible(true);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      setApiDisponible(false);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const totales = useMemo(() => {
    return (reporte || []).reduce((acc, curr) => ({
      ingresos: acc.ingresos + curr.ingresos,
      validadas: acc.validadas + curr.validadas,
      alertas: acc.alertas + curr.alertas
    }), { ingresos: 0, validadas: 0, alertas: 0 });
  }, [reporte]);

  const exportarCSV = () => {
    const cabeceras = ['Fecha', 'Ingresos', 'Validadas', 'Alertas'];
    const filas = reporte.map(r => `${r.fecha},${r.ingresos},${r.validadas},${r.alertas}`);
    const csvContent = [cabeceras.join(','), ...filas].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_alertas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Reportes Analíticos</h1>
            <p className="text-[#6B7280] text-sm mt-1">Análisis de tendencias, eficiencia de validación y volumen de alertas.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportarCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors bg-white shadow-sm">
              <Download size={18} />
              Exportar CSV
            </button>
            <button 
              onClick={() => setModalConfig(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1565C0] text-white rounded-lg text-sm font-bold hover:bg-[#0D47A1] transition-colors shadow-sm"
            >
              <Filter size={18} />
              Personalizar
            </button>
          </div>
        </div>

        <AnimatePresence>
          {modalConfig && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
              <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-[#1565C0] p-6 text-white flex justify-between items-center">
                  <h3 className="text-xl font-bold">Configuración de Reporte</h3>
                  <button onClick={() => setModalConfig(false)}><X size={24} /></button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Métricas a incluir</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Ingresos', 'Pólizas', 'Alertas', 'Tiempo IA', 'Gestores', 'Costos'].map(m => (
                        <div key={m} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-[#1565C0]" />
                          <span className="text-sm text-gray-600">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Formato de Gráfica</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none">
                      <option>Área Sombreada (Default)</option>
                      <option>Líneas Simples</option>
                      <option>Barras Comparativas</option>
                    </select>
                  </div>
                  <button onClick={() => setModalConfig(false)} className="w-full bg-[#1565C0] text-white py-3 rounded-xl font-bold">
                    Aplicar Cambios
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <FiltroRangoFecha onRangoCambiado={(r) => console.log('Rango:', r)} />
          <div className="flex items-center gap-4 text-xs font-medium text-[#6B7280]">
            <span>Última actualización: {mounted ? new Date().toLocaleTimeString() : '--:--:--'}</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-green-600 font-bold">En vivo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard 
            titulo="Total Ingresos" 
            valor={totales.ingresos} 
            subtexto="En el periodo" 
            icon={<TrendingUp size={28} className="text-[#1565C0]" />}
          />
          <MetricCard 
            titulo="Asegurados" 
            valor={totales.ingresos} 
            subtexto="Pacientes únicos" 
            icon={<Users size={28} className="text-[#10B981]" />}
            iconoBgColor="#ECFDF5"
          />
          <MetricCard 
            titulo="Validadas" 
            valor={totales.validadas} 
            subtexto="Pólizas aprobadas" 
            icon={<CheckCircle size={28} className="text-[#059669]" />}
            iconoBgColor="#D1FAE5"
          />
          <MetricCard 
            titulo="Alertas" 
            valor={totales.alertas} 
            subtexto="Casos críticos" 
            icon={<AlertTriangle size={28} className="text-[#EF4444]" />}
            iconoBgColor="#FEF2F2"
          />
          <MetricCard 
            titulo="T. Promedio" 
            valor="1.2s" 
            subtexto="Respuesta sistema" 
            icon={<Clock size={28} className="text-[#6366F1]" />}
            iconoBgColor="#EEF2FF"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-8 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Tendencia de Ingresos vs Validaciones</h3>
                <p className="text-sm text-[#6B7280]">Comparativa diaria del volumen de operación</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1565C0]"></div>
                  <span className="text-xs font-bold text-[#374151]">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                  <span className="text-xs font-bold text-[#374151]">Validadas</span>
                </div>
              </div>
            </div>
            <div className="h-[400px]">
              <LineaChart data={reporte} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
