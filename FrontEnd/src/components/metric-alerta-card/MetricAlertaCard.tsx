'use client';

import React from 'react';
import { AlertTriangle, Clock, XCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface MetricAlertaCardProps {
  label: string;
  valor: number;
  subtexto: string;
  tipo: 'total' | 'en-validacion' | 'invalida' | 'notificada';
}

const config = {
  total: {
    icon: AlertTriangle,
    bgColor: 'bg-[#FFF3CD]',
    iconColor: 'text-[#F59E0B]',
  },
  'en-validacion': {
    icon: Clock,
    bgColor: 'bg-[#FFF3CD]',
    iconColor: 'text-[#F59E0B]',
  },
  invalida: {
    icon: XCircle,
    bgColor: 'bg-[#FFE4E6]',
    iconColor: 'text-[#EF4444]',
  },
  notificada: {
    icon: CheckCircle,
    bgColor: 'bg-[#DCFCE7]',
    iconColor: 'text-[#22C55E]',
  },
};

export const MetricAlertaCard: React.FC<MetricAlertaCardProps> = ({
  label,
  valor,
  subtexto,
  tipo
}) => {
  const { icon: Icon, bgColor, iconColor } = config[tipo];

  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] text-[#6B7280] font-medium">{label}</span>
        <span className="text-3xl font-bold text-[#111827] leading-none">{valor}</span>
        <span className="text-xs text-[#9CA3AF]">{subtexto}</span>
      </div>
      <div className={clsx(
        "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
        bgColor
      )}>
        <Icon size={28} className={iconColor} />
      </div>
    </div>
  );
};
