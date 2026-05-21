'use client';

import React from 'react';
import { 
  LineChart as ReChartsLine, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface LineDataset {
  label: string;
  data: number[];
  color: string;
}

interface LineaChartProps {
  labels: string[];
  datasets: LineDataset[];
  titulo: string;
  filtroOpciones?: string[];
}

export const LineaChart: React.FC<LineaChartProps> = ({
  labels,
  datasets,
  titulo,
  filtroOpciones
}) => {
  // Transform data for Recharts
  const chartData = labels.map((label, index) => {
    const dataPoint: any = { name: label };
    datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-[#111827]">{titulo}</h3>
        {filtroOpciones && (
          <select className="text-xs font-medium text-[#6B7280] bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none">
            {filtroOpciones.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {datasets.map((dataset, idx) => (
                <linearGradient key={idx} id={`colorGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dataset.color} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={dataset.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis 
              dataKey="name" 
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
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
              }} 
            />
            {datasets.map((dataset, idx) => (
              <Area 
                key={dataset.label}
                type="monotone" 
                dataKey={dataset.label} 
                stroke={dataset.color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#colorGradient${idx})`}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
