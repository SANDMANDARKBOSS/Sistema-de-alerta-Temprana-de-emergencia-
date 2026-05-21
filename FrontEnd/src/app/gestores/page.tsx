'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { TablaPaginada, ColumnaConfig } from '../../components/tabla-paginada/TablaPaginada';
import { MOCK_GESTORES, MOCK_NOTIFICACIONES_GESTOR } from '../../services/mock-data';
import { clsx } from 'clsx';
import { MoreVertical } from 'lucide-react';
import { getGestoresData, GestorApiItem, NotificacionGestorApiItem } from '../../services/api/client';

export default function GestoresPagina() {
  const [tabActivo, setTabActivo] = useState<'gestores' | 'notificaciones'>('gestores');
  const [gestores, setGestores] = useState<GestorApiItem[]>(MOCK_GESTORES);
  const [notificaciones, setNotificaciones] = useState<NotificacionGestorApiItem[]>(MOCK_NOTIFICACIONES_GESTOR);
  const [apiDisponible, setApiDisponible] = useState(true);
  
  const [paginaGestores, setPaginaGestores] = useState(1);
  const [filasGestores, setFilasGestores] = useState(10);

  const columnasGestores: ColumnaConfig[] = [
    { 
      key: 'nombre', 
      label: 'Nombre',
      render: (val, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1565C0] font-bold">
            {val.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
          </div>
          <div>
            <p className="font-bold text-[#111827]">{val}</p>
            <p className="text-[12px] text-[#6B7280]">ID: {item.id}</p>
          </div>
        </div>
      )
    },
    { key: 'rol', label: 'Rol' },
    { key: 'correo', label: 'Correo Electrónico' },
    { key: 'area', label: 'Área / Departamento' },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4CAF50]"></div>
          <span className="text-[#4CAF50] font-medium">{val}</span>
        </div>
      )
    },
    { 
      key: 'ultimoAcceso', 
      label: 'Último Acceso',
      render: (val) => (
        <div>
          <p className="text-[#111827]">{val.fecha}</p>
          <p className="text-[12px] text-[#6B7280]">{val.hora}</p>
        </div>
      )
    },
    { 
      key: 'acciones', 
      label: 'Acciones',
      headerClass: 'text-right',
      cellClass: 'text-right',
      render: () => (
        <div className="flex items-center justify-end gap-2">
          <button className="px-3 py-1.5 border border-[#1565C0] text-[#1565C0] rounded-md text-xs font-bold hover:bg-[#E3F2FD] transition-colors">
            Ver perfil
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md">
            <MoreVertical size={18} />
          </button>
        </div>
      )
    }
  ];

  const columnasNotificaciones: ColumnaConfig[] = [
    { 
      key: 'fechaHora', 
      label: 'Fecha y Hora',
      cellClass: 'font-medium'
    },
    { 
      key: 'paciente', 
      label: 'Paciente',
      render: (val) => (
        <div>
          <p className="font-bold text-[#111827]">{val.nombre}</p>
          <p className="text-[12px] text-[#6B7280]">ID: {val.id}</p>
        </div>
      )
    },
    { 
      key: 'tipo', 
      label: 'Tipo de Notificación',
      render: (val, item: any) => (
        <div className="flex items-center gap-2">
          <div className={clsx(
            "w-2 h-2 rounded-full",
            item.tipoColor === 'rojo' && "bg-[#EF4444]",
            item.tipoColor === 'naranja' && "bg-[#F59E0B]",
            item.tipoColor === 'azul' && "bg-[#3B82F6]"
          )}></div>
          <span className={clsx(
            "font-medium",
            item.tipoColor === 'rojo' && "text-[#EF4444]",
            item.tipoColor === 'naranja' && "text-[#F59E0B]",
            item.tipoColor === 'azul' && "text-[#3B82F6]"
          )}>{val}</span>
        </div>
      )
    },
    { key: 'canal', label: 'Canal' },
    { key: 'mensaje', label: 'Mensaje', cellClass: 'max-w-xs truncate' },
    { key: 'enviadoPor', label: 'Enviado por' },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className={clsx(
            "w-2 h-2 rounded-full",
            val === 'Leído' && "bg-[#4CAF50]",
            val === 'Pendiente' && "bg-[#FF9800]",
            val === 'Enviado' && "bg-[#1565C0]"
          )}></div>
          <span className={clsx(
            "font-medium",
            val === 'Leído' && "text-[#4CAF50]",
            val === 'Pendiente' && "text-[#FF9800]",
            val === 'Enviado' && "text-[#1565C0]"
          )}>{val}</span>
        </div>
      )
    }
  ];

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await getGestoresData();
        if (!activo) return;
        setGestores(data.gestores.length ? data.gestores : MOCK_GESTORES);
        setNotificaciones(data.notificaciones.length ? data.notificaciones : MOCK_NOTIFICACIONES_GESTOR);
        setApiDisponible(true);
      } catch {
        if (!activo) return;
        setApiDisponible(false);
        setGestores(MOCK_GESTORES);
        setNotificaciones(MOCK_NOTIFICACIONES_GESTOR);
      }
    };

    void cargar();
    const interval = setInterval(cargar, 15000);
    return () => {
      activo = false;
      clearInterval(interval);
    };
  }, []);

  const metricas = useMemo(() => {
    const gestoresActivos = gestores.filter((g) => g.estado === 'Activo').length;
    const notificacionesHoy = notificaciones.length;
    const pendientesLectura = notificaciones.filter((n) => n.estado === 'Pendiente').length;
    return { gestoresActivos, notificacionesHoy, pendientesLectura };
  }, [gestores, notificaciones]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Gestores y Notificaciones</h1>
          <p className="text-[#6B7280] text-sm mt-1">Administración de usuarios gestores y registro de comunicaciones del sistema. Fuente: {apiDisponible ? 'API' : 'respaldo'}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            titulo="Gestores Activos" 
            valor={String(metricas.gestoresActivos)} 
            subtexto="Usuarios con acceso al sistema" 
            icono="Users"
            iconoColor="#1565C0"
            iconoBgColor="#E3F2FD"
          />
          <MetricCard 
            titulo="Notificaciones Enviadas Hoy" 
            valor={String(metricas.notificacionesHoy)} 
            subtexto="Total de comunicaciones" 
            icono="Mail"
            iconoColor="#4CAF50"
            iconoBgColor="#E8F5E9"
          />
          <MetricCard 
            titulo="Pendientes de Lectura" 
            valor={String(metricas.pendientesLectura)} 
            subtexto="Requieren atención" 
            icono="Bell"
            iconoColor="#F59E0B"
            iconoBgColor="#FFF8E1"
          />
          <MetricCard 
            titulo="Canales Activos" 
            valor="3" 
            subtexto="Email, SMS, Sistema" 
            icono="Monitor"
            iconoColor="#8B5CF6"
            iconoBgColor="#F5F3FF"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex border-b-2 border-gray-200">
            <button 
              onClick={() => setTabActivo('gestores')}
              className={clsx(
                "px-6 py-3 text-sm font-semibold transition-all duration-200 relative -mb-[2px]",
                tabActivo === 'gestores' 
                  ? "text-[#1565C0] border-b-2 border-[#1565C0]" 
                  : "text-[#6B7280] hover:text-[#374151] border-b-2 border-transparent"
              )}
            >
              Gestores
            </button>
            <button 
              onClick={() => setTabActivo('notificaciones')}
              className={clsx(
                "px-6 py-3 text-sm font-semibold transition-all duration-200 relative -mb-[2px]",
                tabActivo === 'notificaciones' 
                  ? "text-[#1565C0] border-b-2 border-[#1565C0]" 
                  : "text-[#6B7280] hover:text-[#374151] border-b-2 border-transparent"
              )}
            >
              Notificaciones Recientes
            </button>
          </div>

          {tabActivo === 'gestores' ? (
            <TablaPaginada 
              columnas={columnasGestores}
              datos={gestores}
              totalRegistros={gestores.length}
              paginaActual={paginaGestores}
              filasPorPagina={filasGestores}
              onPaginaChange={setPaginaGestores}
              onFilasChange={setFilasGestores}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#111827]">Notificaciones Recientes</h3>
                <button className="text-[#1565C0] text-sm font-bold hover:underline">
                  Ver todas las notificaciones →
                </button>
              </div>
              <TablaPaginada 
                columnas={columnasNotificaciones}
                datos={notificaciones}
                totalRegistros={notificaciones.length}
                paginaActual={1}
                filasPorPagina={10}
                onPaginaChange={() => {}}
                onFilasChange={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
