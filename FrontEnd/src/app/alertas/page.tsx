'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricAlertaCard } from '../../components/metric-alerta-card/MetricAlertaCard';
import { FiltroEstadoDropdown } from '../../components/filtro-estado-dropdown/FiltroEstadoDropdown';
import { BotonFiltros } from '../../components/boton-filtros/BotonFiltros';
import { TablaAlertas } from '../../components/tabla-alertas/TablaAlertas';
import { Paginacion } from '../../components/paginacion/Paginacion';
import { getAlertas } from '../../services/api/client';
import { MOCK_ALERTAS } from '../../services/mock-data';
import { AlertaActiva, Ingreso, ResumenAlertas } from '../../shared/models';
import { DetallesAlertaModal } from '../../components/tabla-alertas/DetallesAlertaModal';

function mapIngresoToAlerta(ingreso: Ingreso): AlertaActiva {
  const estado =
    ingreso.poliza === 'Póliza Inválida'
      ? 'invalida'
      : ingreso.estado === 'Pendiente'
        ? 'en-validacion'
        : 'notificada';

  return {
    id: ingreso.id,
    paciente: ingreso.paciente,
    motivoIngreso: ingreso.motivo,
    polizaNumero: `POL-${ingreso.paciente.id}`,
    polizaPlan: 'Plan estándar',
    estado,
    estadoSubtexto:
      estado === 'invalida'
        ? 'No cubierta'
        : estado === 'en-validacion'
          ? 'Pendiente de revisión'
          : 'En proceso',
    horaIngreso: new Date((ingreso as any).fechaIngresoOriginal || new Date()),
    horaIngresoTexto: ingreso.horaIngreso || '--:--'
  };
}

function resumir(alertas: AlertaActiva[]): ResumenAlertas {
  return {
    total: alertas.length,
    enValidacion: alertas.filter((a) => a.estado === 'en-validacion').length,
    invalidas: alertas.filter((a) => a.estado === 'invalida').length,
    notificadas: alertas.filter((a) => a.estado === 'notificada').length
  };
}

export default function AlertasPagina() {
  const [alertasFuente, setAlertasFuente] = useState<AlertaActiva[]>(MOCK_ALERTAS);
  const [apiDisponible, setApiDisponible] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaActiva | null>(null);

  const cargarAlertas = useCallback(async () => {
    try {
      const ingresos = await getAlertas();
      const mapped = ingresos.map(mapIngresoToAlerta);
      setAlertasFuente(mapped);
      setApiDisponible(true);
    } catch {
      setApiDisponible(false);
      setAlertasFuente(MOCK_ALERTAS);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarAlertas();
    const interval = setInterval(() => {
      void cargarAlertas();
    }, 15000);
    return () => clearInterval(interval);
  }, [cargarAlertas]);

  const alertas = alertasFuente.filter((a) => !estadoFiltro || a.estado === estadoFiltro);
  const resumen = resumir(alertasFuente);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#111827]">Alertas Activas</h1>
            <p className="text-[#6B7280] text-sm">
              Pacientes que requieren atención inmediata. Fuente: {apiDisponible ? 'API' : 'respaldo local'}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FiltroEstadoDropdown onEstadoSeleccionado={setEstadoFiltro} />
            <BotonFiltros onFiltrosAbiertos={() => console.log('Filtros avanzados')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricAlertaCard
            label="Total de Alertas Activas"
            valor={resumen.total}
            subtexto={cargando ? 'Sincronizando...' : 'Requieren atención inmediata'}
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

        <div className="flex flex-col">
          <TablaAlertas
            alertas={alertas}
            cargando={cargando}
            onVerDetalles={(a) => setAlertaSeleccionada(a)}
            onAccionContextual={(a, acc) => setAlertaSeleccionada(a)}
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

      <DetallesAlertaModal 
        alerta={alertaSeleccionada}
        onClose={() => setAlertaSeleccionada(null)}
        onMarcarGestionada={(id) => {
          // Por ahora solo cerramos, en un futuro se conecta con API
          setAlertaSeleccionada(null);
        }}
      />
    </MainLayout>
  );
}
