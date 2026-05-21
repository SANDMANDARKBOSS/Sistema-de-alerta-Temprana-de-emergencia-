'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { CasoHistoricoApiItem, getHistorialCasos } from '../../services/api/client';

export default function HistorialPage() {
  const [casos, setCasos] = useState<CasoHistoricoApiItem[]>([]);
  const [cargando, setCargando] = useState(true);

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
    return { total: data.length, notificados, pendientes };
  }, [casos]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Historial de Casos</h1>
          <p className="text-[#6B7280] text-sm">Seguimiento de ingresos procesados por el sistema.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard titulo="Total Casos" valor={String(stats.total)} subtexto={cargando ? 'Cargando...' : 'Procesados'} subtextoColor="gris" />
          <MetricCard titulo="Notificados" valor={String(stats.notificados)} subtexto="Con aviso enviado" subtextoColor="verde" />
          <MetricCard titulo="Pendientes" valor={String(stats.pendientes)} subtexto="Requieren gestión" subtextoColor="rojo" />
        </div>

        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Caso</th>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Hospital</th>
                  <th className="px-6 py-4">Estado Póliza</th>
                  <th className="px-6 py-4">Notificación</th>
                  <th className="px-6 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(casos.length === 0 && !cargando) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#6B7280]">No hay casos en historial.</td>
                  </tr>
                ) : (
                  casos.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-[#111827]">{c.nombre}</td>
                      <td className="px-6 py-4 text-sm text-[#111827]">{c.asegurado?.nombre ?? c.cedulaPaciente}</td>
                      <td className="px-6 py-4 text-sm text-[#111827]">{c.hospital}</td>
                      <td className="px-6 py-4 text-sm text-[#111827]">{c.estadoPoliza}</td>
                      <td className="px-6 py-4 text-sm text-[#111827]">{c.notificacionEnviada ? 'Enviada' : 'Pendiente'}</td>
                      <td className="px-6 py-4 text-sm text-[#111827]">{new Date(c.fechaIngreso).toLocaleString('es-CO')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
