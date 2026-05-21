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
  const startItem = totalItems === 0 ? 0 : (paginaActual - 1) * filasPorPagina + 1;
  const endItem = Math.min(paginaActual * filasPorPagina, totalItems);

  const getPaginasVisibles = (): (number | '...')[] => {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    if (paginaActual <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPaginas];
    }

    if (paginaActual >= totalPaginas - 3) {
      return [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
    }

    return [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas];
  };

  const paginasVisibles = getPaginasVisibles();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
      <div className="text-sm text-[#6B7280]">
        Mostrando <span className="font-bold text-[#111827]">{startItem}</span> a <span className="font-bold text-[#111827]">{endItem}</span> de <span className="font-bold text-[#111827]">{totalItems}</span> registros
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
            disabled={paginaActual === 1 || totalPaginas === 0}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1">
            {paginasVisibles.map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === 'number' && onPaginaCambiada(p)}
                disabled={p === '...'}
                className={clsx(
                  "w-8 h-8 rounded-lg text-sm font-bold transition-colors",
                  p === '...' && "cursor-default text-gray-400",
                  p === paginaActual
                    ? "bg-[#1565C0] text-white"
                    : p !== '...' && "text-[#6B7280] hover:bg-gray-50"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPaginaCambiada(paginaActual + 1)}
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
