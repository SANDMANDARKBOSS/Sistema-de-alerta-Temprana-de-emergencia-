'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertaActiva } from '../../shared/models';
import { MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';
import * as anime from 'animejs';

interface TablaAlertasProps {
  alertas: AlertaActiva[];
  cargando?: boolean;
  onVerDetalles: (alerta: AlertaActiva) => void;
  onAccionContextual: (alerta: AlertaActiva, accion: string) => void;
}

const Cronometro = ({ start }: { start: Date }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const calculate = () => {
      const diff = Math.floor((Date.now() - new Date(start).getTime()) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [start]);

  return <span className="font-mono tabular-nums tracking-wider text-[#111827] font-semibold">{elapsed}</span>;
};

// Componente para animar el punto (badge) con Anime.js
const StatusBadge = ({ estado }: { estado: string }) => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (estado === 'invalida' && dotRef.current) {
      if (typeof anime === 'function') {
        anime({
          targets: dotRef.current,
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
          duration: 1500,
          loop: true,
          easing: 'easeInOutSine'
        });
      } else if ((anime as any)?.default) {
        (anime as any).default({
          targets: dotRef.current,
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
          duration: 1500,
          loop: true,
          easing: 'easeInOutSine'
        });
      }
    }
  }, [estado]);

  return (
    <div className={clsx(
      "w-2.5 h-2.5 rounded-full flex-shrink-0",
      estado === 'notificada' && "bg-[#22C55E]",
      estado === 'en-validacion' && "bg-[#F59E0B]",
      estado === 'invalida' && "bg-[#EF4444]"
    )} ref={dotRef}></div>
  );
};

export const TablaAlertas: React.FC<TablaAlertasProps> = ({
  alertas,
  cargando = false,
  onVerDetalles,
  onAccionContextual
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 border-b border-gray-50 flex items-center px-6 gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              <div className="h-2 bg-gray-50 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-[#6B7280] text-[13px] font-bold uppercase tracking-wider bg-gray-50">
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Motivo de Ingreso</th>
              <th className="px-6 py-4">Póliza</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Tiempo Transcurrido</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alertas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-medium italic">
                  No se encontraron alertas
                </td>
              </tr>
            ) : (
              alertas.map((alerta) => (
                <tr key={alerta.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1565C0] font-bold text-sm">
                        {alerta.paciente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111827]">{alerta.paciente.nombre}</p>
                        <p className="text-[11px] text-[#6B7280]">ID: {alerta.paciente.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151]">{alerta.motivoIngreso}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{alerta.polizaNumero}</p>
                      <p className="text-[11px] text-[#6B7280]">{alerta.polizaPlan}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <StatusBadge estado={alerta.estado} />
                        <span className={clsx(
                          "text-sm font-bold",
                          alerta.estado === 'notificada' && "text-[#16A34A]",
                          alerta.estado === 'en-validacion' && "text-[#D97706]",
                          alerta.estado === 'invalida' && "text-[#DC2626]"
                        )}>
                          {alerta.estado === 'en-validacion' ? 'En Validación' : 
                           alerta.estado === 'invalida' ? 'Póliza Inválida / Vencida' : 'Notificada'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] ml-4 truncate max-w-[150px]" title={alerta.estadoSubtexto}>
                        {alerta.estadoSubtexto}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Cronometro start={alerta.horaIngreso} />
                      <span className="text-[11px] text-[#9CA3AF]">Ingresó a las {alerta.horaIngresoTexto}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onVerDetalles(alerta)}
                        className="px-3 py-1.5 border border-[#1565C0] text-[#1565C0] rounded-lg text-[13px] font-bold hover:bg-[#E3F2FD] transition-colors"
                      >
                        Ver detalles
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
