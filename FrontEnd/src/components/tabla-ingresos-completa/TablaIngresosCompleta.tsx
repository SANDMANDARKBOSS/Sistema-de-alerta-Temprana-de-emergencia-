'use client';

import React from 'react';
import { IngresoCompleto } from '../../shared/models';
import { MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';

interface TablaIngresosCompletaProps {
  ingresos: IngresoCompleto[];
  cargando?: boolean;
  onVerDetalles: (ingreso: IngresoCompleto) => void;
  onAccionContextual: (ingreso: IngresoCompleto, accion: string) => void;
}

export const TablaIngresosCompleta: React.FC<TablaIngresosCompletaProps> = ({
  ingresos,
  cargando = false,
  onVerDetalles,
  onAccionContextual
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-12 bg-gray-50 border-b border-gray-100"></div>
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
            <tr className="border-b border-gray-100 text-[#6B7280] text-[13px] font-medium">
              <th className="px-6 py-4 uppercase">Paciente</th>
              <th className="px-6 py-4 uppercase">Motivo de Ingreso</th>
              <th className="px-6 py-4 uppercase">Póliza</th>
              <th className="px-6 py-4 uppercase">Estado de Póliza</th>
              <th className="px-6 py-4 uppercase">Ingreso</th>
              <th className="px-6 py-4 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ingresos.map((ingreso) => (
              <tr key={ingreso.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1565C0] font-bold text-sm">
                      {ingreso.paciente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{ingreso.paciente.nombre}</p>
                      <p className="text-[11px] text-[#6B7280]">ID: {ingreso.paciente.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#374151]">{ingreso.motivo}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{ingreso.polizaNumero}</p>
                    <p className="text-[11px] text-[#6B7280]">{ingreso.polizaPlan}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        ingreso.poliza === 'Póliza Válida' && "bg-[#16A34A]",
                        ingreso.poliza === 'En Validación' && "bg-[#D97706]",
                        ingreso.poliza === 'Póliza Inválida' && "bg-[#DC2626]"
                      )}></div>
                      <span className={clsx(
                        "text-sm font-bold",
                        ingreso.poliza === 'Póliza Válida' && "text-[#16A34A]",
                        ingreso.poliza === 'En Validación' && "text-[#D97706]",
                        ingreso.poliza === 'Póliza Inválida' && "text-[#DC2626]"
                      )}>
                        {ingreso.poliza}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6B7280] ml-4">{ingreso.estadoSubtexto}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{ingreso.horaIngreso}</p>
                    <p className="text-[11px] text-[#6B7280]">{ingreso.fecha}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onVerDetalles(ingreso)}
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
