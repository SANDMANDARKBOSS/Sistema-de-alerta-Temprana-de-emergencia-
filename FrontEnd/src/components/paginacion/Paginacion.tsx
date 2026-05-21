'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginacionProps {
  paginaActual: number;
  totalItems: number;
  filasPorPagina: number;
  onPaginaCambiada: (pagina: number) => void;
  onFilasPorPaginaCambiadas: (filas: number) => void;
}

export const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalItems,
  filasPorPagina,
  onPaginaCambiada,
  onFilasPorPaginaCambiadas
}) => {
  const totalPaginas = Math.ceil(totalItems / filasPorPagina);
  const startItem = (paginaActual - 1) * filasPorPagina + 1;
  const endItem = Math.min(paginaActual * filasPorPagina, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
      <div className="text-sm text-[#6B7280]">
        Mostrando <span className="font-bold text-[#111827]">{startItem}</span> a <span className="font-bold text-[#111827]">{endItem}</span> de <span className="font-bold text-[#111827]">{totalItems}</span> ingresos
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B7280]">Filas por página:</span>
          <select
            value={filasPorPagina}
            onChange={(e) => onFilasPorPaginaCambiadas(Number(e.target.value))}
            className="text-sm font-bold text-[#111827] bg-transparent border-none focus:ring-0 cursor-pointer"
          >
            {[10, 25, 50].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPaginaCambiada(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onPaginaCambiada(i + 1)}
                className={clsx(
                  "w-8 h-8 rounded-lg text-sm font-bold transition-colors",
                  paginaActual === i + 1
                    ? "bg-[#1565C0] text-white"
                    : "text-[#6B7280] hover:bg-gray-50"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPaginaCambiada(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
