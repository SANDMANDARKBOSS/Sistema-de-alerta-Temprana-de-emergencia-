'use client';

import React, { memo, useEffect, useRef } from 'react';
import * as anime from 'animejs';
import { clsx } from 'clsx';
import { AlertTriangle, Clock, ShieldCheck, Zap } from 'lucide-react';

interface MetricAlertaCardProps {
  label: string;
  valor: number | string;
  subtexto: string;
  tipo: 'total' | 'en-validacion' | 'invalida' | 'notificada';
}

export const MetricAlertaCard: React.FC<MetricAlertaCardProps> = memo(({ label, valor, subtexto, tipo }) => {
  const countRef = useRef<HTMLSpanElement>(null);
  const isNumber = typeof valor === 'number' || !isNaN(Number(valor));

  useEffect(() => {
    if (isNumber && countRef.current) {
      const numValue = Number(valor);
      
      if (typeof anime === 'function') {
        anime({
          targets: countRef.current,
          innerHTML: [0, numValue],
          easing: 'easeOutExpo',
          duration: 1500,
          round: 1,
        });
      } else if ((anime as any)?.default) {
        (anime as any).default({
          targets: countRef.current,
          innerHTML: [0, numValue],
          easing: 'easeOutExpo',
          duration: 1500,
          round: 1,
        });
      }
    }
  }, [valor, isNumber]);

  const styles = {
    'total': {
      bg: 'bg-blue-50',
      iconColor: 'text-[#1565C0]',
      icon: <Clock size={24} />,
      valColor: 'text-[#111827]'
    },
    'en-validacion': {
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      icon: <Zap size={24} />,
      valColor: 'text-amber-700'
    },
    'invalida': {
      bg: 'bg-red-50',
      iconColor: 'text-red-600',
      icon: <AlertTriangle size={24} />,
      valColor: 'text-red-700'
    },
    'notificada': {
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
      icon: <ShieldCheck size={24} />,
      valColor: 'text-green-700'
    }
  }[tipo];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-shadow hover:shadow-md">
      <div className={clsx("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-50", styles.bg)}></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", styles.bg, styles.iconColor)}>
          {styles.icon}
        </div>
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">{label}</p>
      </div>
      
      <div className="relative z-10">
        <h3 className={clsx("text-4xl font-black mb-1 tracking-tight", styles.valColor)}>
          <span ref={isNumber ? countRef : null}>{isNumber ? '0' : valor}</span>
        </h3>
        <p className="text-xs font-semibold text-[#9CA3AF]">{subtexto}</p>
      </div>
    </div>
  );
});

MetricAlertaCard.displayName = 'MetricAlertaCard';
