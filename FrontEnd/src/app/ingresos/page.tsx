'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { FiltroFecha } from '../../components/filtro-fecha/FiltroFecha';
import { BuscadorPaciente } from '../../components/buscador-paciente/BuscadorPaciente';
import { BotonFiltros } from '../../components/boton-filtros/BotonFiltros';
import { TablaIngresosCompleta } from '../../components/tabla-ingresos-completa/TablaIngresosCompleta';
import { Paginacion } from '../../components/paginacion/Paginacion';
import { MOCK_INGRESOS_COMPLETOS } from '../../services/mock-data';
import { IngresoCompleto } from '../../shared/models';

export default function IngresosPagina() {
  // Mock metrics state
  const [metricas, setMetricas] = useState({
    ingresosHoy: 24,
    ingresosChange: '+12% vs ayer',
    validadas: 20,
    validadasPercent: '83% del total',
    enValidacion: 3,
    enValidacionPercent: '12% del total',
    invalidas: 1,
    invalidasPercent: '5% del total',
  });

  const [ingresos, setIngresos] = useState<IngresoCompleto[]>(MOCK_INGRESOS_COMPLETOS);
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [totalItems, setTotalItems] = useState(24);

  // Memoize handlers to prevent unnecessary re-renders in children with useEffect
  const handleBusqueda = useCallback((texto: string) => {
    if (!texto) {
      setIngresos(MOCK_INGRESOS_COMPLETOS);
      return;
    }
    
    setCargando(true);
    // Simulate API call with a small delay
    const timer = setTimeout(() => {
      const filtered = MOCK_INGRESOS_COMPLETOS.filter(i => 
        i.paciente.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        i.paciente.id.includes(texto) ||
        i.polizaNumero.includes(texto)
      );
      setIngresos(filtered);
      setCargando(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleFecha = useCallback((rango: { desde: Date, hasta: Date }) => {
    console.log('Fecha cambiada:', rango);
    // Implement filter logic here if needed
  }, []);

  // Polling simulation (background update, doesn't trigger 'cargando' skeleton)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Background polling for new data...');
      // In a real app, this would update state silently if data changed
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Header and Controls */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#111827]">Ingresos en Tiempo Real</h1>
            <p className="text-[#6B7280] text-sm">Monitorea los ingresos y estados de validación de pólizas.</p>
          </div>
          <div className="flex items-center gap-3">
            <FiltroFecha onFechaSeleccionada={handleFecha} />
            <BuscadorPaciente onBusquedaCambiada={handleBusqueda} />
            <BotonFiltros onFiltrosAbiertos={() => console.log('Filtros abiertos')} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            titulo="Ingresos Hoy" 
            valor={metricas.ingresosHoy} 
            subtexto={metricas.ingresosChange} 
            subtextoColor="verde"
            colorValor="#111827"
          />
          <MetricCard 
            titulo="Pólizas Validadas" 
            valor={metricas.validadas} 
            subtexto={metricas.validadasPercent} 
            subtextoColor="verde"
            colorValor="#16A34A"
          />
          <MetricCard 
            titulo="En Validación" 
            valor={metricas.enValidacion} 
            subtexto={metricas.enValidacionPercent} 
            subtextoColor="gris"
            colorValor="#D97706"
          />
          <MetricCard 
            titulo="Pólizas Inválidas" 
            valor={metricas.invalidas} 
            subtexto={metricas.invalidasPercent} 
            subtextoColor="rojo"
            colorValor="#DC2626"
          />
        </div>

        {/* Table Section */}
        <div className="flex flex-col">
          <TablaIngresosCompleta 
            ingresos={ingresos} 
            cargando={cargando}
            onVerDetalles={(i) => console.log('Ver detalles:', i)}
            onAccionContextual={(i, a) => console.log('Accion:', a, i)}
          />
          <Paginacion 
            paginaActual={paginaActual}
            totalItems={totalItems}
            filasPorPagina={filasPorPagina}
            onPaginaCambiada={setPaginaActual}
            onFilasPorPaginaCambiadas={setFilasPorPagina}
          />
        </div>
      </div>
    </MainLayout>
  );
}
