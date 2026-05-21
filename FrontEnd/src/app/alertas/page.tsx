'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricAlertaCard } from '../../components/metric-alerta-card/MetricAlertaCard';
import { FiltroEstadoDropdown } from '../../components/filtro-estado-dropdown/FiltroEstadoDropdown';
import { BotonFiltros } from '../../components/boton-filtros/BotonFiltros';
import { TablaAlertas } from '../../components/tabla-alertas/TablaAlertas';
import { Paginacion } from '../../components/paginacion/Paginacion';
import { MOCK_ALERTAS, MOCK_RESUMEN_ALERTAS } from '../../services/mock-data';
import { AlertaActiva } from '../../shared/models';

export default function AlertasPagina() {
  const [resumen, setResumen] = useState(MOCK_RESUMEN_ALERTAS);
  const [alertas, setAlertas] = useState<AlertaActiva[]>(MOCK_ALERTAS);
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);

  const cargarAlertas = useCallback(() => {
    // In a real app, this would call a service with state params
    console.log('Cargando alertas con estado:', estadoFiltro);
    
    // Simulate filtering
    const filtered = MOCK_ALERTAS.filter(a => !estadoFiltro || a.estado === estadoFiltro);
    setAlertas(filtered);
  }, [estadoFiltro]);

  useEffect(() => {
    cargarAlertas();
    // Faster polling for alerts (15s)
    const interval = setInterval(cargarAlertas, 15000);
    return () => clearInterval(interval);
  }, [cargarAlertas]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Header and Controls */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#111827]">Alertas Activas</h1>
            <p className="text-[#6B7280] text-sm">Pacientes que requieren atención inmediata.</p>
          </div>
          <div className="flex items-center gap-3">
            <FiltroEstadoDropdown onEstadoSeleccionado={setEstadoFiltro} />
            <BotonFiltros onFiltrosAbiertos={() => console.log('Filtros avanzados')} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricAlertaCard 
            label="Total de Alertas Activas" 
            valor={resumen.total} 
            subtexto="Requieren atención inmediata"
            tipo="total"
          />
          <MetricAlertaCard 
            label="En Validación" 
            valor={resumen.enValidacion} 
            subtexto="Esperando respuesta"
            tipo="en-validacion"
          />
          <MetricAlertaCard 
            label="Pólizas Inválidas" 
            valor={resumen.invalidas} 
            subtexto="No cubiertas por seguro"
            tipo="invalida"
          />
          <MetricAlertaCard 
            label="Notificadas" 
            valor={resumen.notificadas} 
            subtexto="Gestor en camino"
            tipo="notificada"
          />
        </div>

        {/* Table Section */}
        <div className="flex flex-col">
          <TablaAlertas 
            alertas={alertas} 
            cargando={cargando}
            onVerDetalles={(a) => console.log('Ver alerta:', a)}
            onAccionContextual={(a, acc) => console.log('Accion:', acc, a)}
          />
          <Paginacion 
            paginaActual={paginaActual}
            totalItems={alertas.length}
            filasPorPagina={filasPorPagina}
            onPaginaCambiada={setPaginaActual}
            onFilasPorPaginaCambiadas={setFilasPorPagina}
          />
        </div>
      </div>
    </MainLayout>
  );
}
