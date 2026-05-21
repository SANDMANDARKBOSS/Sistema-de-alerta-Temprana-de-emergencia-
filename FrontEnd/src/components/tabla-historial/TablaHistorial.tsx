'use client';

import React from 'react';
import { CasoHistorial } from '../../shared/models';
import { MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';

interface TablaHistorialProps {
  casos: CasoHistorial[];
  cargando?: boolean;
  onVerDetalles: (caso: CasoHistorial) => void;
  onAccionContextual: (caso: CasoHistorial, accion: string) => void;
}

export const TablaHistorial: React.FC<TablaHistorialProps> = ({
  casos,
  cargando = false,
  onVerDetalles,
  onAccionContextual
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        {[...Array(6)].map((_, i) => (
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
            <tr className="border-b border-gray-100 text-[#6B7280] text-[13px] font-medium uppercase tracking-wider">
              <th className="px-6 py-4">Caso</th>
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Fecha de Ingreso</th>
              <th className="px-6 py-4">Motivo</th>
              <th className="px-6 py-4">Estado del Caso</th>
              <th className="px-6 py-4">Gestor Asignado</th>
              <th className="px-6 py-4">Tiempo de Gestión</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {casos.map((caso) => (
              <tr key={caso.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-mono font-bold text-[#111827]">{caso.id}</p>
                    <p className="text-[11px] text-[#9CA3AF]">ID: {caso.pacienteId}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#1565C0] font-bold text-[10px]">
                      {caso.paciente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <p className="text-sm font-bold text-[#111827]">{caso.paciente.nombre}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{caso.fechaIngreso}</p>
                    <p className="text-[11px] text-[#6B7280]">{caso.horaIngreso}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#374151]">{caso.motivoIngreso}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        caso.estado === 'cerrado' && "bg-[#22C55E]",
                        caso.estado === 'en-proceso' && "bg-[#F59E0B]",
                        caso.estado === 'escalado' && "bg-[#EF4444]"
                      )}></div>
                      <span className={clsx(
                        "text-sm font-bold",
                        caso.estado === 'cerrado' && "text-[#16A34A]",
                        caso.estado === 'en-proceso' && "text-[#D97706]",
                        caso.estado === 'escalado' && "text-[#DC2626]"
                      )}>
                        {caso.estado === 'cerrado' ? 'Cerrado' : 
                         caso.estado === 'en-proceso' ? 'En Proceso' : 'Escalado'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6B7280] ml-4">{caso.estadoSubtexto}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[#6B7280] font-bold text-[10px]">
                      {caso.gestorAsignado.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <p className="text-sm text-[#374151]">{caso.gestorAsignado.nombre}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-[#374151] tabular-nums">
                  {caso.tiempoGestion}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onVerDetalles(caso)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-[#374151] hover:bg-gray-50 transition-colors"
                    >
                      Ver detalles
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
