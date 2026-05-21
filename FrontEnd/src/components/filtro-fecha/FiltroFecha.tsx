'use client';

import React, { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx } from 'clsx';

interface FiltroFechaProps {
  onFechaSeleccionada: (rango: { desde: Date; hasta: Date }) => void;
}

export const FiltroFecha: React.FC<FiltroFechaProps> = ({ onFechaSeleccionada }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('Hoy');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const options = [
    { label: 'Hoy', value: 'hoy' },
    { label: 'Ayer', value: 'ayer' },
    { label: 'Últimos 7 días', value: '7d' },
    { label: 'Últimos 30 días', value: '30d' },
    { label: 'Rango personalizado', value: 'custom' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg min-w-[180px] hover:border-gray-300 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-[#111827]">
          <Calendar size={16} className="text-[#6B7280]" />
          <span>{format(selectedDate, "dd 'de' MMMM, yyyy", { locale: es })}</span>
        </div>
        <ChevronDown size={16} className={clsx("text-[#6B7280] transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden py-1">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 text-sm text-[#374151] hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedLabel(option.label);
                setIsOpen(false);
                // logic for actual date range here
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
