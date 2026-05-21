'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import * as LucideIcons from 'lucide-react';

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  subtexto: string;
  subtextoColor?: 'verde' | 'rojo' | 'gris';
  sparklineData?: { value: number }[];
  sparklineColor?: string;
  colorValor?: string;
  unidad?: string;
  icono?: keyof typeof LucideIcons;
  iconoColor?: string;
  iconoBgColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  subtexto,
  subtextoColor = 'gris',
  sparklineData,
  sparklineColor = '#1565C0',
  colorValor,
  unidad,
  icono,
  iconoColor = '#1565C0',
  iconoBgColor = '#E3F2FD'
}) => {
  const IconComponent = icono ? (LucideIcons[icono] as any) : null;

  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider mb-1">{titulo}</p>
            <h3 
              className="text-3xl font-bold flex items-baseline gap-1"
              style={{ color: colorValor || '#111827' }}
            >
              {valor}
              {unidad && <span className="text-xl font-semibold opacity-70">{unidad}</span>}
            </h3>
          </div>
          {sparklineData && !icono && (
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={sparklineColor} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <p className={clsx(
          "text-xs font-semibold",
          subtextoColor === 'verde' && "text-[#4CAF50]",
          subtextoColor === 'rojo' && "text-[#F44336]",
          subtextoColor === 'gris' && "text-[#6B7280]"
        )}>
          {subtexto}
        </p>
      </div>

      {icono && IconComponent && (
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 ml-4"
          style={{ backgroundColor: iconoBgColor }}
        >
          <IconComponent size={28} style={{ color: iconoColor }} />
        </div>
      )}
    </div>
  );
};
