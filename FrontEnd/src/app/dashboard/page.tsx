'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { IngresoTabla } from '../../components/ingreso-tabla/IngresoTabla';
import { DistribucionChart } from '../../components/distribucion-chart/DistribucionChart';
import { NotificacionesPanel } from '../../components/notificaciones-panel/NotificacionesPanel';
import { FlujoSistema } from '../../components/flujo-sistema/FlujoSistema';
import { MOCK_INGRESOS, MOCK_NOTIFICACIONES } from '../../services/mock-data';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const sparklineData = [
    { value: 18 }, { value: 20 }, { value: 19 }, { value: 22 }, { value: 21 }, { value: 24 }
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Bienvenida, Laura Martínez</h2>
            <p className="text-[#6B7280]">Aquí tienes el resumen de hoy para el Hospital Central.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#EF4444]" />
              <div>
                <p className="text-[10px] text-[#EF4444] font-bold uppercase">Alertas Activas</p>
                <p className="text-sm font-bold text-[#111827]">5 Emergencias</p>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#4CAF50]" />
              <div>
                <p className="text-[10px] text-[#4CAF50] font-bold uppercase">Sistema Operativo</p>
                <p className="text-sm font-bold text-[#111827]">100% Funcional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            titulo="Ingresos Hoy" 
            valor="24" 
            subtexto="+12% vs ayer" 
            subtextoColor="verde"
            sparklineData={sparklineData}
          />
          <MetricCard 
            titulo="Pólizas Validadas" 
            valor="20" 
            subtexto="83% del total" 
            subtextoColor="verde"
            sparklineData={sparklineData.map(d => ({ value: d.value - 4 }))}
            sparklineColor="#4CAF50"
          />
          <MetricCard 
            titulo="Tiempo de Respuesta" 
            valor="8.4 min" 
            subtexto="-15% vs ayer" 
            subtextoColor="verde"
            sparklineData={sparklineData.map(d => ({ value: 30 - d.value }))}
            sparklineColor="#FFC107"
          />
          <MetricCard 
            titulo="Validaciones Pendientes" 
            valor="3" 
            subtexto="Requiere atención" 
            subtextoColor="rojo"
          />
        </div>

        {/* Central Section: Table + Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IngresoTabla ingresos={MOCK_INGRESOS} />
          </div>
          <div className="flex flex-col gap-6">
            <DistribucionChart valida={20} enValidacion={3} invalida={1} />
            <NotificacionesPanel notificaciones={MOCK_NOTIFICACIONES} />
          </div>
        </div>

        {/* Bottom Section: Flow */}
        <FlujoSistema />
      </div>
    </MainLayout>
  );
}
