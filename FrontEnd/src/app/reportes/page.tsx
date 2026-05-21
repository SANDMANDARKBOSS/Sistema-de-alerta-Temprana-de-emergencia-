'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { LineaChart } from '../../components/linea-chart/LineaChart';
import { DistribucionChart } from '../../components/distribucion-chart/DistribucionChart';
import { TablaPaginada, ColumnaConfig } from '../../components/tabla-paginada/TablaPaginada';
import { FiltroRangoFecha } from '../../components/filtro-rango-fecha/FiltroRangoFecha';
import { Download } from 'lucide-react';
import { MOCK_REPORTE_DIARIO } from '../../services/mock-data';
import { subDays } from 'date-fns';
import { getReporteDiario, ReporteDiarioApiItem } from '../../services/api/client';

export default function ReportesPagina() {
  const [rango, setRange] = useState({
    desde: subDays(new Date(), 7),
    hasta: new Date()
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [reporteDiario, setReporteDiario] = useState<ReporteDiarioApiItem[]>(MOCK_REPORTE_DIARIO);
  const [apiDisponible, setApiDisponible] = useState(true);

  const sparklineData = [15, 18, 17, 22, 20, 24].map(v => ({ value: v }));

  const columnas: ColumnaConfig[] = [
    { key: 'fecha', label: 'Fecha', cellClass: 'font-bold' },
    { key: 'ingresos', label: 'Ingresos' },
    { key: 'validadas', label: 'Pólizas Validadas' },
    { key: 'enValidacion', label: 'En Validación' },
    { key: 'invalidas', label: 'Inválidas' },
    { key: 'alertas', label: 'Alertas Generadas' },
    { key: 'tiempo', label: 'Tiempo Promedio' },
    { 
      key: 'acciones', 
      label: '', 
      headerClass: 'text-right',
      cellClass: 'text-right',
      render: () => (
        <button className="px-3 py-1 border border-[#1565C0] text-[#1565C0] rounded-md text-xs font-bold hover:bg-[#E3F2FD] transition-colors">
          Ver detalle
        </button>
      )
    }
  ];

  useEffect(() => {
    let activo = true;
    const from = rango.desde.toISOString();
    const to = rango.hasta.toISOString();

    const cargar = async () => {
      try {
        const data = await getReporteDiario({ from, to });
        if (!activo) return;
        setReporteDiario(data);
        setApiDisponible(true);
      } catch {
        if (!activo) return;
        setApiDisponible(false);
        setReporteDiario(MOCK_REPORTE_DIARIO);
      }
    };

    void cargar();
    return () => {
      activo = false;
    };
  }, [rango.desde, rango.hasta]);

  const metricas = useMemo(() => {
    const totalIngresos = reporteDiario.reduce((acc, r) => acc + (r.ingresos ?? 0), 0);
    const polizasValidadas = reporteDiario.reduce((acc, r) => acc + (r.validadas ?? 0), 0);
    const polizasInvalidas = reporteDiario.reduce((acc, r) => acc + (r.invalidas ?? 0), 0);
    const alertasGeneradas = reporteDiario.reduce((acc, r) => acc + (r.alertas ?? 0), 0);
    return { totalIngresos, polizasValidadas, polizasInvalidas, alertasGeneradas };
  }, [reporteDiario]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Reportes</h1>
            <p className="text-[#6B7280] text-sm mt-1">Análisis y estadísticas de la gestión de ingresos y alertas.</p>
          </div>
          <div className="flex items-center gap-3">
            <FiltroRangoFecha onRangoCambiado={setRange} />
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#1565C0] text-[#1565C0] rounded-lg text-sm font-bold hover:bg-[#E3F2FD] transition-colors shadow-sm">
              <span>Exportar Reporte</span>
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard 
            titulo="Total de Ingresos" 
            valor={String(metricas.totalIngresos)} 
            subtexto={apiDisponible ? 'Datos en vivo' : 'Modo respaldo'} 
            subtextoColor="verde"
            colorValor="#111827"
            sparklineColor="#1565C0"
            sparklineData={sparklineData}
          />
          <MetricCard 
            titulo="Pólizas Validadas" 
            valor={String(metricas.polizasValidadas)} 
            subtexto={apiDisponible ? 'Datos en vivo' : 'Modo respaldo'} 
            subtextoColor="verde"
            colorValor="#4CAF50"
            sparklineColor="#4CAF50"
            sparklineData={sparklineData.map(d => ({ value: d.value + 5 }))}
          />
          <MetricCard 
            titulo="Alertas Generadas" 
            valor={String(metricas.alertasGeneradas)} 
            subtexto={apiDisponible ? 'Datos en vivo' : 'Modo respaldo'} 
            subtextoColor="rojo"
            colorValor="#F59E0B"
            sparklineColor="#FFC107"
            sparklineData={sparklineData.map(d => ({ value: 30 - d.value }))}
          />
          <MetricCard 
            titulo="Pólizas Inválidas" 
            valor={String(metricas.polizasInvalidas)} 
            subtexto={apiDisponible ? 'Datos en vivo' : 'Modo respaldo'} 
            subtextoColor="verde"
            colorValor="#F44336"
            sparklineColor="#F44336"
            sparklineData={sparklineData.map(d => ({ value: d.value / 3 }))}
          />
          <MetricCard 
            titulo="Tiempo Promedio" 
            valor="6.2" 
            unidad="min"
            subtexto="-12% vs período anterior" 
            subtextoColor="verde"
            colorValor="#9C27B0"
            sparklineColor="#9C27B0"
            sparklineData={[8, 7.5, 7.8, 6.9, 6.5, 6.2].map(v => ({ value: v }))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <LineaChart 
              titulo="Ingresos por Día" 
              labels={['17/05','18/05','19/05','20/05','21/05','22/05','23/05','24/05']}
              datasets={[{
                label: 'Ingresos',
                data: [22, 18, 12, 15, 28, 20, 22, 24],
                color: '#1565C0'
              }]}
              filtroOpciones={["Todos", "Póliza Válida", "En Validación", "Inválida"]}
            />
          </div>
          <DistribucionChart valida={89} enValidacion={29} invalida={10} modo="polizas" />
          <DistribucionChart sinCobertura={10} pendientes={29} enProceso={17} modo="alertas" />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-[#111827]">Resumen Diario</h3>
          <TablaPaginada 
            columnas={columnas}
            datos={reporteDiario}
            totalRegistros={reporteDiario.length}
            paginaActual={paginaActual}
            filasPorPagina={filasPorPagina}
            onPaginaChange={setPaginaActual}
            onFilasChange={setFilasPorPagina}
          />
        </div>
      </div>
    </MainLayout>
  );
}
