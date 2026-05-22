import React, { memo } from 'react';
import { Ingreso } from '../../shared/models';
import { clsx } from 'clsx';
import Link from 'next/link';

interface IngresoTablaProps {
  ingresos: Ingreso[];
}

export const IngresoTabla: React.FC<IngresoTablaProps> = memo(({ ingresos }) => {
  return (
    <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden w-full">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#111827]">Ingresos en Tiempo Real</h3>
        <Link href="/ingresos" className="text-[#1565C0] text-sm font-semibold hover:underline">Ver todos</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Motivo</th>
              <th className="px-6 py-4">Póliza</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Ingreso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ingresos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#6B7280]">
                  No hay ingresos registrados todavía.
                </td>
              </tr>
            )}
            {ingresos.map((ingreso) => (
              <tr key={ingreso.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#1565C0] font-bold text-xs">
                      {ingreso.paciente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{ingreso.paciente.nombre}</p>
                      <p className="text-[10px] text-[#6B7280]">ID: {ingreso.paciente.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">{ingreso.motivo}</td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-bold",
                    ingreso.poliza === 'Póliza Válida' && "bg-[#E8F5E9] text-[#4CAF50]",
                    ingreso.poliza === 'En Validación' && "bg-[#FFF8E1] text-[#FFC107]",
                    ingreso.poliza === 'Póliza Inválida' && "bg-[#FFEBEE] text-[#F44336]"
                  )}>
                    {ingreso.poliza}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={clsx(
                      "w-2 h-2 rounded-full",
                      ingreso.estado === 'Notificado' ? "bg-[#4CAF50]" : "bg-[#FFC107]"
                    )}></div>
                    <span className="text-sm text-[#111827]">{ingreso.estado}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-[#111827]">
                  {ingreso.horaIngreso}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

IngresoTabla.displayName = 'IngresoTabla';
