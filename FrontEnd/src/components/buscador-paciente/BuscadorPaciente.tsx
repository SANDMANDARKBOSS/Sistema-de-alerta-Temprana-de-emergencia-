'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface BuscadorPacienteProps {
  onBusquedaCambiada: (texto: string) => void;
}

export const BuscadorPaciente: React.FC<BuscadorPacienteProps> = ({ onBusquedaCambiada }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onBusquedaCambiada(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query, onBusquedaCambiada]);

  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Buscar paciente, ID o póliza..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1565C0] transition-colors shadow-sm"
      />
      <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
    </div>
  );
};
