'use client';

import React from 'react';
import { Paginacion } from '../paginacion/Paginacion';
import { clsx } from 'clsx';

export interface ColumnaConfig {
  key: string;
  label: string;
  render?: (valor: any, item: any) => React.ReactNode;
  headerClass?: string;
  cellClass?: string;
}

interface TablaPaginadaProps {
  columnas: ColumnaConfig[];
  datos: any[];
  totalRegistros: number;
  filasPorPagina: number;
  paginaActual: number;
  onPaginaChange: (pagina: number) => void;
  onFilasChange: (filas: number) => void;
  cargando?: boolean;
}

export const TablaPaginada: React.FC<TablaPaginadaProps> = ({
  columnas,
  datos,
  totalRegistros,
  filasPorPagina,
  paginaActual,
  onPaginaChange,
  onFilasChange,
  cargando = false
}) => {
  return (
    <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
              {columnas.map((col) => (
                <th 
                  key={col.key} 
                  className={clsx(
                    "px-6 py-4 text-[13px] font-bold text-[#6B7280] uppercase tracking-wider",
                    col.headerClass
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {cargando ? (
              [...Array(filasPorPagina)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columnas.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="px-6 py-12 text-center text-[#9CA3AF]">
                  No se encontraron registros.
                </td>
              </tr>
            ) : (
              datos.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                  {columnas.map((col) => (
                    <td key={col.key} className={clsx("px-6 py-4 text-sm text-[#374151]", col.cellClass)}>
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <Paginacion 
        paginaActual={paginaActual}
        totalItems={totalRegistros}
        filasPorPagina={filasPorPagina}
        onPaginaCambiada={onPaginaChange}
        onFilasPorPaginaCambiadas={onFilasChange}
      />
    </div>
  );
};
