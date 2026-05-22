'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAlertas } from '../../services/api/client';
import { Ingreso } from '../../shared/models';
import Link from 'next/link';

export const Header = () => {
  const [time, setTime] = useState<Date | null>(null);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [formatoHora, setFormatoHora] = useState('12h');

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar count real de alertas pendientes
  useEffect(() => {
    const cargar = async () => {
      try {
        const [dataAlertas, dataConfig] = await Promise.all([
          getAlertas(),
          import('../../services/api/client').then(m => m.getConfiguracion())
        ]);
        setIngresos(dataAlertas);
        if (dataConfig?.formatoHora) {
          setFormatoHora(dataConfig.formatoHora);
        }
      } catch {
        // ignora si la API no responde
      }
    };
    void cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  const alertasCount = useMemo(() => {
    if (!Array.isArray(ingresos)) return 0;
    return ingresos.filter(i => i && i.estado === 'Pendiente').length;
  }, [ingresos]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 text-[#6B7280]">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span className="text-sm font-medium capitalize">
            {time ? format(time, "eeee, dd 'de' MMMM yyyy", { locale: es }) : '---'}
          </span>
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <span className="text-sm font-bold text-[#111827]">
          {time ? format(time, formatoHora === '24h' ? "HH:mm:ss" : "hh:mm:ss a") : '--:--:--'}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/alertas" className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
          <Bell size={20} className="text-[#6B7280]" />
          {alertasCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm">
              {alertasCount > 9 ? '9+' : alertasCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-[#111827]">Laura Martínez</p>
            <p className="text-[10px] text-[#6B7280] font-medium">Gestor de Alertas</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1565C0] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            LM
          </div>
        </div>
      </div>
    </header>
  );
};
