'use client';

import React from 'react';
import { clsx } from 'clsx';

interface TabsPolizasProps {
  tabActivo: 'todas' | 'validadas' | 'en-validacion' | 'invalidas';
  onTabCambiado: (tab: 'todas' | 'validadas' | 'en-validacion' | 'invalidas') => void;
}

export const TabsPolizas: React.FC<TabsPolizasProps> = ({ tabActivo, onTabCambiado }) => {
  const tabs = [
    { id: 'todas', label: 'Todas' },
    { id: 'validadas', label: 'Validadas' },
    { id: 'en-validacion', label: 'En Validación' },
    { id: 'invalidas', label: 'Inválidas' },
  ];

  return (
    <div className="flex border-b-2 border-gray-200 w-full mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabCambiado(tab.id as any)}
          className={clsx(
            "px-6 py-3 text-sm font-semibold transition-all duration-200 relative -mb-[2px]",
            tabActivo === tab.id
              ? "text-[#1565C0] border-b-2 border-[#1565C0]"
              : "text-[#6B7280] hover:text-[#374151] border-b-2 border-transparent"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
