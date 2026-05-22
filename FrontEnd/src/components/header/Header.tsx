'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Clock, LogOut } from 'lucide-react';
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
    <header className="h-16 bg-white/92 border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center gap-4 text-[#64748B]">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span className="text-sm font-medium capitalize">
            {time ? format(time, "eeee, dd 'de' MMMM yyyy", { locale: es }) : '---'}
          </span>
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <span className="text-sm font-bold text-[#0F172A]">
          {time ? format(time, formatoHora === '24h' ? "HH:mm:ss" : "hh:mm:ss a") : '--:--:--'}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
        >
          <LogOut size={16} />
          Salir
        </Link>

        <Link href="/alertas" className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
          <Bell size={20} className="text-[#64748B]" />
          {alertasCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm">
              {alertasCount > 9 ? '9+' : alertasCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-[#0F172A]">Laura Martínez</p>
            <p className="text-[10px] text-[#64748B] font-medium">Gestor de Alertas</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#2563EB_100%)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            LM
          </div>
        </div>
      </div>
    </header>
  );
};
