'use client';

import React, { memo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface LineDataset {
  label: string;
  data: number[];
  color: string;
}

interface LineaChartProps {
  labels?: string[];
  datasets?: LineDataset[];
  data?: any[]; // Allow direct passing of recharts-ready data
  titulo?: string;
  filtroOpciones?: string[];
}

export const LineaChart: React.FC<LineaChartProps> = memo(({
  labels = [],
  datasets = [],
  data,
  titulo,
  filtroOpciones
}) => {
  // Transform data for Recharts if datasets are provided
  const chartData = data || labels.map((label, index) => {
    const dataPoint: any = { name: label };
    datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col h-full w-full">
      {(titulo || filtroOpciones) && (
        <div className="flex justify-between items-center mb-6">
          {titulo && <h3 className="text-sm font-bold text-[#111827]">{titulo}</h3>}
          {filtroOpciones && (
            <select className="text-xs font-medium text-[#6B7280] bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none">
              {filtroOpciones.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {datasets.length > 0 ? datasets.map((dataset, idx) => (
                <linearGradient key={idx} id={`colorGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dataset.color} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={dataset.color} stopOpacity={0}/>
                </linearGradient>
              )) : (
                <>
                  <linearGradient id="colorGradient0" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1565C0" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </>
              )}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis 
              dataKey={data ? "fecha" : "name"} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              dx={-10}
            />
            <Tooltip 
              isAnimationActive={true}
                animationDuration={1500}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
              }} 
            />
            {datasets.length > 0 ? datasets.map((dataset, idx) => (
              <Area 
                key={dataset.label}
                type="monotone" 
                dataKey={dataset.label} 
                stroke={dataset.color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#colorGradient${idx})`}
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1500}
              />
            )) : (
              <>
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#1565C0" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGradient0)"
                  isAnimationActive={true}
                animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="validadas" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGradient1)"
                  isAnimationActive={true}
                animationDuration={1500}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

LineaChart.displayName = 'LineaChart';
