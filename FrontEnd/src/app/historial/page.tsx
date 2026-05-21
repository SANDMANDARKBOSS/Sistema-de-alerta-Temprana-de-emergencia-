'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { FiltroRangoFecha } from '../../components/filtro-rango-fecha/FiltroRangoFecha';
import { TablaHistorial } from '../../components/tabla-historial/TablaHistorial';
import { Paginacion } from '../../components/paginacion/Paginacion';
import { BuscadorPaciente } from '../../components/buscador-paciente/BuscadorPaciente';
import { MOCK_CASOS } from '../../services/mock-data';
import { CasoHistorial } from '../../shared/models';
import { subDays } from 'date-fns';

export default function HistorialPagina() {
  const [casos, setCasos] = useState<CasoHistorial[]>(MOCK_CASOS);
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [busqueda, setBusqueda] = useState('');
  const [rango, setRange] = useState({
    desde: subDays(new Date(), 7),
    hasta: new Date()
  });

  const sparklineData = [100, 110, 105, 120, 115, 128].map(v => ({ value: v }));

  const filtrarCasos = useCallback(() => {
    setCargando(true);
    setTimeout(() => {
      let filtered = [...MOCK_CASOS];

      if (busqueda) {
        filtered = filtered.filter(c => 
          c.paciente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.id.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.pacienteId.includes(busqueda)
        );
      }

      setCasos(filtered);
      setCargando(false);
    }, 300);
  }, [busqueda, rango]);

  useEffect(() => {
    filtrarCasos();
  }, [filtrarCasos]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#111827]">Historial de Casos</h1>
            <p className="text-[#6B7280] text-sm">Consulta el historial completo de ingresos y gestiones finalizadas.</p>
          </div>
          <div className="flex items-center gap-3">
            <FiltroRangoFecha onRangoCambiado={setRange} />
            <BuscadorPaciente 
              onBusquedaCambiada={setBusqueda} 
              placeholder="Buscar paciente, ID o número de caso..." 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard 
            titulo="Total Casos" 
            valor="128" 
            subtexto="En el periodo" 
            subtextoColor="gris"
            sparklineData={sparklineData}
          />
          <MetricCard 
            titulo="Cerrados" 
            valor="89" 
            subtexto="Póliza válida" 
            subtextoColor="verde"
            colorValor="#10B981"
            sparklineColor="#10B981"
            sparklineData={sparklineData.map(d => ({ value: d.value * 0.7 }))}
          />
          <MetricCard 
            titulo="En Proceso" 
            valor="29" 
            subtexto="Revisión activa" 
            subtextoColor="gris"
            colorValor="#F59E0B"
            sparklineColor="#F59E0B"
            sparklineData={sparklineData.map(d => ({ value: d.value * 0.2 }))}
          />
          <MetricCard 
            titulo="Escalados" 
            valor="10" 
            subtexto="Sin cobertura" 
            subtextoColor="rojo"
            colorValor="#EF4444"
            sparklineColor="#EF4444"
            sparklineData={sparklineData.map(d => ({ value: d.value * 0.1 }))}
          />
          <MetricCard 
            titulo="Tiempo Promedio" 
            valor="6.2" 
            unidad="min"
            subtexto="-12% vs mes ant." 
            subtextoColor="verde"
            colorValor="#8B5CF6"
            sparklineColor="#A78BFA"
            sparklineData={[8, 7.5, 7.8, 6.9, 6.5, 6.2].map(v => ({ value: v }))}
          />
        </div>

        <div className="card-tabla">
          <TablaHistorial 
            casos={casos} 
            cargando={cargando}
            onVerDetalles={(c) => console.log('Detalle', c)}
            onAccionContextual={(c, a) => console.log(a, c)}
          />
          <Paginacion 
            paginaActual={paginaActual}
            totalItems={128} // Simulated total
            filasPorPagina={filasPorPagina}
            onPaginaCambiada={setPaginaActual}
            onFilasPorPaginaCambiadas={setFilasPorPagina}
          />
        </div>
      </div>
    </MainLayout>
  );
}
