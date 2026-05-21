'use client';

import React from 'react';
import { PolizaCompleta } from '../../shared/models';
import { MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';

interface TablaPolizasProps {
  polizas: PolizaCompleta[];
  cargando?: boolean;
  onVerDetalles: (poliza: PolizaCompleta) => void;
  onAccionContextual: (poliza: PolizaCompleta, accion: string) => void;
}

export const TablaPolizas: React.FC<TablaPolizasProps> = ({
  polizas,
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
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Número de Póliza</th>
              <th className="px-6 py-4">Aseguradora</th>
              <th className="px-6 py-4">Estado de Validación</th>
              <th className="px-6 py-4">Fecha y Hora</th>
              <th className="px-6 py-4">Válida Hasta</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {polizas.map((poliza) => (
              <tr key={poliza.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1565C0] font-bold text-sm">
                      {poliza.paciente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{poliza.paciente.nombre}</p>
                      <p className="text-[11px] text-[#6B7280]">ID: {poliza.paciente.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-[#374151]">{poliza.numeroPoliza}</td>
                <td className="px-6 py-4 text-sm text-[#374151]">{poliza.aseguradora}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        poliza.estado === 'valida' && "bg-[#22C55E]",
                        poliza.estado === 'en-validacion' && "bg-[#F59E0B]",
                        poliza.estado === 'invalida' && "bg-[#EF4444]"
                      )}></div>
                      <span className={clsx(
                        "text-sm font-bold",
                        poliza.estado === 'valida' && "text-[#16A34A]",
                        poliza.estado === 'en-validacion' && "text-[#D97706]",
                        poliza.estado === 'invalida' && "text-[#DC2626]"
                      )}>
                        {poliza.estado === 'valida' ? 'Póliza Válida' : 
                         poliza.estado === 'en-validacion' ? 'En Validación' : 'Póliza Inválida'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6B7280] ml-4">{poliza.estadoSubtexto}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{poliza.fechaHora}</p>
                    <p className="text-[11px] text-[#6B7280]">{poliza.horaIngreso}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "text-sm",
                    poliza.validaHasta ? "text-[#374151]" : "text-[#9CA3AF] block text-center w-12"
                  )}>
                    {poliza.validaHasta || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onVerDetalles(poliza)}
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
