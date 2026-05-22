'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { CasoHistoricoApiItem, getHistorialCasos } from '../../services/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, CheckCircle, AlertTriangle, Clock, X, ShieldCheck, User, Hospital, FileText, Activity, Database } from 'lucide-react';

function ModalDetalleCaso({ caso, onClose }: { caso: CasoHistoricoApiItem; onClose: () => void }) {
  const analisisMatch = caso.preExistencias?.match(/\[Análisis IA\]: (.*)/s);
  const analisisTexto = analisisMatch ? analisisMatch[1] : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-[#1565C0] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FolderOpen size={24} />
            <h3 className="text-xl font-bold">Detalle del Caso</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                <User size={14} /> Paciente
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">{caso.nombre}</p>
                <p className="text-sm text-[#6B7280]">Cédula: {caso.cedulaPaciente}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                <Hospital size={14} /> Hospital
              </div>
              <p className="text-lg font-bold text-[#111827]">{caso.hospital}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} /> Estado Póliza
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  caso.estadoPoliza === 'VIGENTE' ? 'bg-green-500' :
                  caso.estadoPoliza === 'VENCIDA' || caso.estadoPoliza === 'SUSPENDIDA' ? 'bg-red-500' : 'bg-amber-500'
                }`}></div>
                <span className="font-bold text-[#111827]">{caso.estadoPoliza}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                <FileText size={14} /> Póliza
              </div>
              <p className="font-bold text-[#111827]">{caso.polizaId}</p>
            </div>
          </div>

          {analisisTexto && (
            <div className="bg-blue-50 border-l-4 border-[#1565C0] p-6 rounded-r-xl">
              <p className="text-[#1565C0] font-bold text-sm mb-2 flex items-center gap-2">
                <Activity size={16} /> Análisis IA
              </p>
              <p className="text-sm text-[#374151] leading-relaxed italic">
                "{analisisTexto}"
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-[#6B7280] hover:text-[#111827]">
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function HistorialPage() {
  const [casos, setCasos] = useState<CasoHistoricoApiItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [casoSeleccionado, setCasoSeleccionado] = useState<CasoHistoricoApiItem | null>(null);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await getHistorialCasos();
        if (activo) setCasos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando historial:", e);
        if (activo) setCasos([]);
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargar();
  }, []);

  const stats = useMemo(() => {
    const data = Array.isArray(casos) ? casos : [];
    const notificados = data.filter((c) => c && c.notificacionEnviada).length;
    const pendientes = data.length - notificados;
    const vigentes = data.filter(c => c.estadoPoliza === 'VIGENTE').length;
    return { total: data.length, notificados, pendientes, vigentes };
  }, [casos]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Historial de Casos</h1>
            <p className="text-[#6B7280] text-sm mt-1">Seguimiento completo de ingresos procesados por el sistema.</p>
          </div>
          <a href="https://www.notion.so/36726cdda1ac80bebb85cd3d17a8543c?v=36726cdda1ac80d9bf0e000c36628f07&source=copy_link" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors shadow-sm">
            <Database size={18} className="text-[#1565C0]" />
            Verificar en Notion
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard titulo="Total Casos" valor={stats.total} subtexto={cargando ? 'Cargando...' : 'Procesados'} subtextoColor="gris"
            icon={<FolderOpen size={28} className="text-[#1565C0]" />} iconoBgColor="#E3F2FD" />
          <MetricCard titulo="Notificados" valor={stats.notificados} subtexto="Con aviso enviado" subtextoColor="verde"
            icon={<CheckCircle size={28} className="text-[#059669]" />} iconoBgColor="#D1FAE5" />
          <MetricCard titulo="Pólizas Vigentes" valor={stats.vigentes} subtexto="Validadas correctamente" subtextoColor="verde"
            icon={<ShieldCheck size={28} className="text-[#10B981]" />} iconoBgColor="#ECFDF5" />
          <MetricCard titulo="Pendientes" valor={stats.pendientes} subtexto="Requieren gestión" subtextoColor="rojo"
            icon={<AlertTriangle size={28} className="text-[#EF4444]" />} iconoBgColor="#FEF2F2" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Hospital</th>
                  <th className="px-6 py-4">Póliza</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Notificación</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(casos.length === 0 && !cargando) ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#6B7280] italic">No hay casos en historial.</td>
                  </tr>
                ) : cargando ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#1565C0] border-t-transparent rounded-full animate-spin"></div>
                        Cargando historial...
                      </div>
                    </td>
                  </tr>
                ) : (
                  casos.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-[#111827]">{c.nombre}</div>
                        <div className="text-[11px] text-[#6B7280]">{c.cedulaPaciente}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">{c.hospital}</td>
                      <td className="px-6 py-4 text-sm font-medium text-[#111827]">{c.polizaId}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.estadoPoliza === 'VIGENTE' ? 'bg-green-100 text-green-700' :
                          c.estadoPoliza === 'VENCIDA' ? 'bg-red-100 text-red-700' :
                          c.estadoPoliza === 'SUSPENDIDA' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {c.estadoPoliza}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.notificacionEnviada ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {c.notificacionEnviada ? '✓ Enviada' : '⏳ Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">{new Date(c.fechaIngreso).toLocaleString('es-CO')}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setCasoSeleccionado(c)}
                          className="text-[#1565C0] hover:text-[#0D47A1] font-bold text-xs"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {casoSeleccionado && (
          <ModalDetalleCaso caso={casoSeleccionado} onClose={() => setCasoSeleccionado(null)} />
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
