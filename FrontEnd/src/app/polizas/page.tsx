'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { getPolizas, PolizaApiItem } from '../../services/api/client';

export default function PolizasPage() {
  const [polizas, setPolizas] = useState<PolizaApiItem[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await getPolizas();
        if (activo) setPolizas(data);
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargar();
  }, []);

  const vigentes = polizas.filter((p) => p.estado === 'VIGENTE').length;
  const vencidas = polizas.filter((p) => p.estado === 'VENCIDA').length;
  const suspendidas = polizas.filter((p) => p.estado === 'SUSPENDIDA').length;

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Pólizas y Validaciones</h1>
          <p className="text-[#6B7280] text-sm">Consulta de pólizas registradas y su estado actual.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard titulo="Total Pólizas" valor={String(polizas.length)} subtexto={cargando ? 'Cargando...' : 'Registros activos'} subtextoColor="gris" />
          <MetricCard titulo="Vigentes" valor={String(vigentes)} subtexto="Cobertura disponible" subtextoColor="verde" />
          <MetricCard titulo="Vencidas" valor={String(vencidas)} subtexto="Requieren renovación" subtextoColor="rojo" />
          <MetricCard titulo="Suspendidas" valor={String(suspendidas)} subtexto="Revisión pendiente" subtextoColor="rojo" />
        </div>

        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Póliza</th>
                  <th className="px-6 py-4">Asegurado</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Cobertura</th>
                  <th className="px-6 py-4">Vigencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {polizas.length === 0 && !cargando && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#6B7280]">No hay pólizas registradas.</td>
                  </tr>
                )}
                {polizas.map((p) => (
                  <tr key={p.polizaId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#111827]">{p.polizaId}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{p.asegurado?.nombre ?? p.cedulaAsegurado}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{p.estado}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{p.cobertura}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{new Date(p.fechaInicio).toLocaleDateString('es-CO')} - {new Date(p.fechaFin).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
