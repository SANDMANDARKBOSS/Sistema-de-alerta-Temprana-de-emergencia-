'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Header = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time and start interval only on client
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          {time ? format(time, "HH:mm:ss") : '--:--:--'}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-[#6B7280]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] flex items-center justify-center rounded-full font-bold">
            3
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-[#111827]">Laura Martínez</p>
            <p className="text-[10px] text-[#6B7280] font-medium">Gestor de Casos</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1565C0] font-bold text-sm">
            LM
          </div>
        </div>
      </div>
    </header>
  );
};
