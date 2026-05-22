'use client';

import React from 'react';

interface ToggleSwitchProps {
  activo: boolean;
  onCambio: (nuevoEstado: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  activo, 
  onCambio 
}) => {
  const toggle = () => {
    onCambio(!activo);
  };

  return (
    <button
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none 
        ${activo ? 'bg-[#1565C0]' : 'bg-gray-200'}
      `}
      onClick={toggle}
      type="button"
      role="switch"
      aria-checked={activo}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
          transition duration-200 ease-in-out
          ${activo ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};
