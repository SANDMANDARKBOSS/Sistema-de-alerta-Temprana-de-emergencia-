'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  subtexto: string;
  subtextoColor?: 'verde' | 'rojo' | 'gris';
  sparklineData?: { value: number }[];
  sparklineColor?: string;
  colorValor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  subtexto,
  subtextoColor = 'gris',
  sparklineData,
  sparklineColor = '#1565C0',
  colorValor
}) => {
  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider mb-1">{titulo}</p>
          <h3 
            className="text-3xl font-bold"
            style={{ color: colorValor || '#111827' }}
          >
            {valor}
          </h3>
        </div>
        {sparklineData && (
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
  );
};
