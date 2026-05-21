'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface FiltroEstadoDropdownProps {
  onEstadoSeleccionado: (estado: string | null) => void;
}

export const FiltroEstadoDropdown: React.FC<FiltroEstadoDropdownProps> = ({ onEstadoSeleccionado }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('Todos los estados');

  const options = [
    { label: 'Todos los estados', value: null },
    { label: 'En Validación', value: 'en-validacion' },
    { label: 'Póliza Inválida', value: 'invalida' },
    { label: 'Notificada', value: 'notificada' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg w-[200px] hover:border-gray-300 transition-colors shadow-sm"
      >
        <span className="text-sm font-medium text-[#111827] truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={clsx("text-[#6B7280] transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden py-1">
          {options.map((option) => (
            <div
              key={option.label}
              className="px-4 py-2 text-sm text-[#374151] hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedLabel(option.label);
                onEstadoSeleccionado(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
