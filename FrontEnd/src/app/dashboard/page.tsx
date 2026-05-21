'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { IngresoTabla } from '../../components/ingreso-tabla/IngresoTabla';
import { DistribucionChart } from '../../components/distribucion-chart/DistribucionChart';
import { NotificacionesPanel } from '../../components/notificaciones-panel/NotificacionesPanel';
import { FlujoSistema } from '../../components/flujo-sistema/FlujoSistema';
import { MOCK_INGRESOS, MOCK_NOTIFICACIONES } from '../../services/mock-data';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getAlertas } from '../../services/api/client';
import { Ingreso, Notificacion } from '../../shared/models';

export default function DashboardPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>(MOCK_INGRESOS);
  const [cargandoApi, setCargandoApi] = useState(true);
  const [apiDisponible, setApiDisponible] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        setApiDisponible(true);
        const data = await getAlertas();
        if (activo) {
          setIngresos(data);
          setCargandoApi(false);
        }
      } catch {
        if (activo) {
          // mantiene mock para no romper UI en caso de caída del backend
          setApiDisponible(false);
          setCargandoApi(false);
        }
      }
    };

    void cargar();
    const interval = setInterval(cargar, 15000);

    return () => {
      activo = false;
      clearInterval(interval);
    };
  }, []);

  const sparklineData = [
    { value: 18 }, { value: 20 }, { value: 19 }, { value: 22 }, { value: 21 }, { value: 24 }
  ];

  const ingresosActivos = apiDisponible ? ingresos : MOCK_INGRESOS;

  const polizasValidadas = ingresosActivos.filter((i) => i.poliza === 'Póliza Válida').length;
  const enValidacion = ingresosActivos.filter((i) => i.poliza === 'En Validación').length;
  const invalidas = ingresosActivos.filter((i) => i.poliza === 'Póliza Inválida').length;

  const notificaciones: Notificacion[] = useMemo(() => {
    if (ingresosActivos.length === 0) {
      return MOCK_NOTIFICACIONES;
    }

    return ingresosActivos.slice(0, 4).map((ingreso) => ({
      tipo:
        ingreso.poliza === 'Póliza Válida'
          ? 'validada'
          : ingreso.poliza === 'En Validación'
            ? 'en-proceso'
            : 'invalida',
      descripcion:
        ingreso.poliza === 'Póliza Válida'
          ? 'Póliza validada correctamente'
          : ingreso.poliza === 'En Validación'
            ? 'Validación en proceso'
            : 'Póliza inválida',
      paciente: ingreso.paciente.nombre,
      hora: ingreso.horaIngreso
    }));
  }, [ingresosActivos]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
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
                <p className="text-sm font-bold text-[#111827]">{ingresosActivos.length} Emergencias</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            titulo="Ingresos Hoy"
            valor={String(ingresosActivos.length)}
            subtexto={cargandoApi ? 'Sincronizando...' : 'Actualizado en tiempo real'}
            subtextoColor="verde"
            sparklineData={sparklineData}
          />
          <MetricCard
            titulo="Pólizas Validadas"
            valor={String(polizasValidadas)}
            subtexto={`${ingresosActivos.length ? Math.round((polizasValidadas / ingresosActivos.length) * 100) : 0}% del total`}
            subtextoColor="verde"
            sparklineData={sparklineData.map((d) => ({ value: d.value - 4 }))}
            sparklineColor="#4CAF50"
          />
          <MetricCard
            titulo="Tiempo de Respuesta"
            valor="8.4 min"
            subtexto="-15% vs ayer"
            subtextoColor="verde"
            sparklineData={sparklineData.map((d) => ({ value: 30 - d.value }))}
            sparklineColor="#FFC107"
          />
          <MetricCard
            titulo="Validaciones Pendientes"
            valor={String(enValidacion + invalidas)}
            subtexto="Requiere atención"
            subtextoColor="rojo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IngresoTabla ingresos={ingresos} />
          </div>
          <div className="flex flex-col gap-6">
            <DistribucionChart valida={polizasValidadas} enValidacion={enValidacion} invalida={invalidas} />
            <NotificacionesPanel notificaciones={notificaciones} />
          </div>
        </div>

        <FlujoSistema />
      </div>
    </MainLayout>
  );
}
