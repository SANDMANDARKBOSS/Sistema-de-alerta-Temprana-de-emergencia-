'use client';

import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

interface DistribucionChartProps {
  valida?: number;
  enValidacion?: number;
  invalida?: number;
  // Alertas variant
  sinCobertura?: number;
  pendientes?: number;
  enProceso?: number;
  modo?: 'polizas' | 'alertas';
}

export const DistribucionChart: React.FC<DistribucionChartProps> = memo(({ 
  valida = 0, 
  enValidacion = 0, 
  invalida = 0,
  sinCobertura = 0,
  pendientes = 0,
  enProceso = 0,
  modo = 'polizas'
}) => {
  const data = modo === 'polizas' ? [
    { name: 'Póliza Válida', value: valida, color: '#4CAF50' },
    { name: 'En Validación', value: enValidacion, color: '#FFC107' },
    { name: 'Póliza Inválida', value: invalida, color: '#F44336' },
  ] : [
    { name: 'Sin cobertura', value: sinCobertura, color: '#F44336' },
    { name: 'Pendientes', value: pendientes, color: '#FF9800' },
    { name: 'En proceso', value: enProceso, color: '#4CAF50' },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-center w-full">
      <div className="flex justify-between items-center w-full mb-6">
        <h3 className="text-sm font-bold text-[#111827]">
          {modo === 'polizas' ? 'Estado de Pólizas' : 'Alertas por Estado'}
        </h3>
        {modo === 'alertas' && (
          <select className="text-[10px] font-bold text-[#6B7280] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none">
            <option>Todos</option>
            <option>Críticas</option>
            <option>Moderadas</option>
          </select>
        )}
      </div>
      
      <div className="flex items-center gap-6 w-full justify-center">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1500} // Performance boost
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-[#111827]">{total}</span>
            <span className="text-[8px] text-[#6B7280] font-medium uppercase">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 max-w-[120px]">
          {data.map((item) => (
            <div key={item.name} className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[11px] text-[#6B7280] font-medium truncate max-w-[80px]">{item.name}</span>
                </div>
                <span className="text-[11px] font-bold text-[#111827]">{item.value}</span>
              </div>
              <span className="text-[9px] text-[#9CA3AF] ml-4">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

DistribucionChart.displayName = 'DistribucionChart';
