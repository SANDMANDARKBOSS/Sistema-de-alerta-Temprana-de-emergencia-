'use client';

import React, { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { format, subDays, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx } from 'clsx';

interface FiltroRangoFechaProps {
  onRangoCambiado: (rango: { desde: Date; hasta: Date }) => void;
}

export const FiltroRangoFecha: React.FC<FiltroRangoFechaProps> = ({ onRangoCambiado }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('Últimos 7 días');
  const [range, setRange] = useState({
    desde: subDays(new Date(), 7),
    hasta: new Date()
  });

  const options = [
    { label: 'Últimos 7 días', value: '7d', getRange: () => ({ desde: subDays(new Date(), 7), hasta: new Date() }) },
    { label: 'Últimos 15 días', value: '15d', getRange: () => ({ desde: subDays(new Date(), 15), hasta: new Date() }) },
    { label: 'Últimos 30 días', value: '30d', getRange: () => ({ desde: subDays(new Date(), 30), hasta: new Date() }) },
    { label: 'Este mes', value: 'month', getRange: () => ({ desde: startOfMonth(new Date()), hasta: new Date() }) },
    { label: 'Rango personalizado', value: 'custom', getRange: () => null },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg min-w-[240px] hover:border-gray-300 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-[#111827]">
          <Calendar size={16} className="text-[#6B7280]" />
          <span>
            {format(range.desde, 'dd/MM/yyyy')} - {format(range.hasta, 'dd/MM/yyyy')}
          </span>
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
                const newRange = option.getRange();
                if (newRange) {
                  setRange(newRange);
                  setSelectedLabel(option.label);
                  onRangoCambiado(newRange);
                  setIsOpen(false);
                }
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
