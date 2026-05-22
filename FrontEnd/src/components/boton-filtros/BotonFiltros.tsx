'use client';

import React from 'react';
import { Filter } from 'lucide-react';

interface BotonFiltrosProps {
  onFiltrosAbiertos: () => void;
}

export const BotonFiltros: React.FC<BotonFiltrosProps> = ({ onFiltrosAbiertos }) => {
  return (
    <button
      onClick={onFiltrosAbiertos}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors shadow-sm"
    >
      <span>Filtros</span>
      <Filter size={16} className="text-[#6B7280]" />
    </button>
  );
};
