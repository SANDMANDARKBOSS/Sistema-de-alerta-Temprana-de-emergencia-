'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { TabsPolizas } from '../../components/tabs-polizas/TabsPolizas';
import { TablaPolizas } from '../../components/tabla-polizas/TablaPolizas';
import { Paginacion } from '../../components/paginacion/Paginacion';
import { BuscadorPaciente } from '../../components/buscador-paciente/BuscadorPaciente';
import { BotonFiltros } from '../../components/boton-filtros/BotonFiltros';
import { MOCK_POLIZAS } from '../../services/mock-data';
import { PolizaCompleta } from '../../shared/models';

export default function PolizasPagina() {
  const [polizas, setPolizas] = useState<PolizaCompleta[]>(MOCK_POLIZAS);
  const [cargando, setCargando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [tabActivo, setTabActivo] = useState<'todas' | 'validadas' | 'en-validacion' | 'invalidas'>('todas');
  const [busqueda, setBusqueda] = useState('');

  const sparklineData = [15, 18, 17, 22, 20, 24].map(v => ({ value: v }));

  const filtrarPolizas = useCallback(() => {
    setCargando(true);
    setTimeout(() => {
      let filtered = [...MOCK_POLIZAS];

      if (tabActivo !== 'todas') {
        const estadoMap = {
          'validadas': 'valida',
          'en-validacion': 'en-validacion',
          'invalidas': 'invalida'
        };
        filtered = filtered.filter(p => p.estado === estadoMap[tabActivo as keyof typeof estadoMap]);
      }

      if (busqueda) {
        filtered = filtered.filter(p => 
          p.paciente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.numeroPoliza.toLowerCase().includes(busqueda.toLowerCase())
        );
      }

      setPolizas(filtered);
      setCargando(false);
    }, 300);
  }, [tabActivo, busqueda]);

  useEffect(() => {
    filtrarPolizas();
  }, [filtrarPolizas]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#111827]">Pólizas y Validaciones</h1>
            <p className="text-[#6B7280] text-sm">Consulta y seguimiento de pólizas de seguros en tiempo real.</p>
          </div>
          <div className="flex items-center gap-3">
            <BuscadorPaciente onBusquedaCambiada={setBusqueda} />
            <BotonFiltros onFiltrosAbiertos={() => console.log('Filtros')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            titulo="Pólizas Validadas Hoy" 
            valor="42" 
            subtexto="+18% vs ayer" 
            subtextoColor="verde"
            colorValor="#10B981"
            sparklineColor="#10B981"
            sparklineData={sparklineData}
          />
          <MetricCard 
            titulo="En Validación" 
            valor="8" 
            subtexto="Revisión en curso" 
            subtextoColor="gris"
            colorValor="#F59E0B"
            sparklineColor="#F59E0B"
            sparklineData={sparklineData.map(d => ({ value: d.value / 2 }))}
          />
          <MetricCard 
            titulo="Pólizas Inválidas" 
            valor="3" 
            subtexto="Sin cobertura activa" 
            subtextoColor="rojo"
            colorValor="#EF4444"
            sparklineColor="#EF4444"
            sparklineData={sparklineData.map(d => ({ value: d.value / 4 }))}
          />
          <MetricCard 
            titulo="Tasa de Validación" 
            valor="95" 
            unidad="%"
            subtexto="Eficiencia del sistema" 
            subtextoColor="verde"
            colorValor="#1565C0"
            sparklineColor="#3B82F6"
            sparklineData={[80, 85, 90, 88, 92, 95].map(v => ({ value: v }))}
          />
        </div>

        <div className="flex flex-col">
          <TabsPolizas tabActivo={tabActivo} onTabCambiado={setTabActivo} />
          <div className="card-tabla">
            <TablaPolizas 
              polizas={polizas} 
              cargando={cargando}
              onVerDetalles={(p) => console.log('Detalle', p)}
              onAccionContextual={(p, a) => console.log(a, p)}
            />
            <Paginacion 
              paginaActual={paginaActual}
              totalItems={polizas.length}
              filasPorPagina={filasPorPagina}
              onPaginaCambiada={setPaginaActual}
              onFilasPorPaginaCambiadas={setFilasPorPagina}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
