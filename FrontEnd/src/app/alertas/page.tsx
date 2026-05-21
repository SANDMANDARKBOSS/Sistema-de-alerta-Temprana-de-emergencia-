'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { IngresoTabla } from '../../components/ingreso-tabla/IngresoTabla';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { getAlertas } from '../../services/api/client';
import { MOCK_INGRESOS } from '../../services/mock-data';
import { Ingreso } from '../../shared/models';

export default function AlertasActivasPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [apiDisponible, setApiDisponible] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await getAlertas();
        if (!activo) return;
        setIngresos(data);
        setApiDisponible(true);
      } catch {
        if (!activo) return;
        setApiDisponible(false);
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargar();
    const interval = setInterval(cargar, 15000);

    return () => {
      activo = false;
      clearInterval(interval);
    };
  }, []);

  const fuente = apiDisponible ? ingresos : MOCK_INGRESOS;

  const alertasActivas = useMemo(
    () => fuente.filter((i) => i.estado === 'Pendiente' || i.poliza === 'Póliza Inválida'),
    [fuente]
  );

  const totalActivas = alertasActivas.length;
  const invalidas = alertasActivas.filter((i) => i.poliza === 'Póliza Inválida').length;
  const pendientes = alertasActivas.filter((i) => i.estado === 'Pendiente').length;

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Alertas Activas</h2>
            <p className="text-[#6B7280]">Casos que requieren seguimiento inmediato.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#EF4444]" />
              <div>
                <p className="text-[10px] text-[#EF4444] font-bold uppercase">Activas</p>
                <p className="text-sm font-bold text-[#111827]">{totalActivas} Casos</p>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#4CAF50]" />
              <div>
                <p className="text-[10px] text-[#4CAF50] font-bold uppercase">Origen</p>
                <p className="text-sm font-bold text-[#111827]">{apiDisponible ? 'API Activa' : 'Modo Respaldo'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            titulo="Total Alertas"
            valor={String(totalActivas)}
            subtexto={cargando ? 'Sincronizando...' : 'Últimos ingresos evaluados'}
            subtextoColor="rojo"
          />
          <MetricCard
            titulo="Pólizas Inválidas"
            valor={String(invalidas)}
            subtexto="Riesgo de cobertura"
            subtextoColor="rojo"
          />
          <MetricCard
            titulo="Pendientes"
            valor={String(pendientes)}
            subtexto="Esperando gestión"
            subtextoColor="gris"
          />
        </div>

        <IngresoTabla ingresos={alertasActivas} />
      </div>
    </MainLayout>
  );
}
