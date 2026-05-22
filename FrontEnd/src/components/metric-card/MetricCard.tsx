'use client';

import React, { memo, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import anime from 'animejs';

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  subtexto: string;
  subtextoColor?: 'verde' | 'rojo' | 'gris';
  sparklineData?: { value: number }[];
  sparklineColor?: string;
  colorValor?: string;
  unidad?: string;
  icon?: React.ReactNode;
  iconoColor?: string;
  iconoBgColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = memo(({
  titulo,
  valor,
  subtexto,
  subtextoColor = 'gris',
  sparklineData,
  sparklineColor = '#1565C0',
  colorValor,
  unidad,
  icon,
  iconoColor = '#1565C0',
  iconoBgColor = '#E3F2FD'
}) => {
  const countRef = useRef<HTMLSpanElement>(null);
  const isNumber = typeof valor === 'number' || !isNaN(Number(valor));

  useEffect(() => {
    if (isNumber && countRef.current) {
      const numValue = Number(valor);
      
      // Formateador de números (con o sin separador de miles)
      const formattedValue = (val: number) => {
        return Math.floor(val).toLocaleString('es-CO');
      };

      anime({
        targets: countRef.current,
        innerHTML: [0, numValue],
        easing: 'easeOutExpo',
        duration: 1500,
        round: 1,
        update: function(anim: any) {
          if (countRef.current) {
            const currentNum = parseInt(anim.animations[0].currentValue, 10);
            countRef.current.innerHTML = isNaN(currentNum) ? '0' : formattedValue(currentNum);
          }
        }
      });
    }
  }, [valor, isNumber]);

  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between transition-all duration-200 hover:shadow-md border border-gray-50">
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[#6B7280] text-[11px] font-bold uppercase tracking-wider mb-1">{titulo}</p>
            <h3 
              className="text-3xl font-bold flex items-baseline gap-1"
              style={{ color: colorValor || '#111827' }}
            >
              <span ref={isNumber ? countRef : null}>{isNumber ? '0' : valor}</span>
              {unidad && <span className="text-xl font-semibold opacity-70 ml-1">{unidad}</span>}
            </h3>
          </div>
          {sparklineData && !icon && (
            <div className="w-24 h-12" style={{ minWidth: '96px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={sparklineColor} 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={true} 
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <p className={clsx(
          "text-xs font-semibold",
          subtextoColor === 'verde' && "text-[#16A34A]",
          subtextoColor === 'rojo' && "text-[#DC2626]",
          subtextoColor === 'gris' && "text-[#6B7280]"
        )}>
          {subtexto}
        </p>
      </div>

      {icon && (
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 ml-4 shadow-inner"
          style={{ backgroundColor: iconoBgColor }}
        >
          {icon}
        </div>
      )}
    </div>
  );
});

MetricCard.displayName = 'MetricCard';
