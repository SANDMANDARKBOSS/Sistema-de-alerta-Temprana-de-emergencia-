'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DistribucionChartProps {
  valida: number;
  enValidacion: number;
  invalida: number;
}

export const DistribucionChart: React.FC<DistribucionChartProps> = ({ 
  valida, 
  enValidacion, 
  invalida 
}) => {
  const data = [
    { name: 'Póliza Válida', value: valida, color: '#4CAF50' },
    { name: 'En Validación', value: enValidacion, color: '#FFC107' },
    { name: 'Póliza Inválida', value: invalida, color: '#F44336' },
  ];

  const total = valida + enValidacion + invalida;

  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-center">
      <h3 className="text-sm font-bold text-[#111827] mb-6 w-full">Distribución de Pólizas</h3>
      
      <div className="relative w-48 h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-[#111827]">{total}</span>
          <span className="text-[10px] text-[#6B7280] font-medium uppercase">Total</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs text-[#6B7280] font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#111827]">{item.value}</span>
              <span className="text-[10px] text-[#6B7280] font-medium min-w-[30px]">
                ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
