'use client';

import React, { useEffect, useState } from 'react';
import { 
  Home, 
  TrendingUp, 
  Bell, 
  FileText, 
  FolderOpen, 
  BarChart2, 
  Users, 
  Settings,
  Activity,
  MailCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EmailTutorialModal } from '../tutorial/EmailTutorialModal';

const menuItems = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: TrendingUp, label: 'Ingresos en Tiempo Real', href: '/ingresos' },
  { icon: Bell, label: 'Alertas Activas', href: '/alertas' },
  { icon: FileText, label: 'Pólizas y Validaciones', href: '/polizas' },
  { icon: Users, label: 'Asegurados', href: '/asegurados' },
  { icon: FolderOpen, label: 'Historial de Casos', href: '/historial' },
  { icon: BarChart2, label: 'Reportes', href: '/reportes' },
  { icon: Users, label: 'Gestores', href: '/gestores' },
  { icon: Settings, label: 'Configuración', href: '/config' },
  { icon: Activity, label: 'Diagnóstico', href: '/diagnostico' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Prefetch all routes on mount
  useEffect(() => {
    menuItems.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  // Clear navigating state when pathname changes
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      setNavigatingTo(href);
      router.push(href);
    }
  };

  return (
    <div className="w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1565C0] rounded flex items-center justify-center shadow-md">
            <div className="w-6 h-6 border-2 border-white relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="h-4 w-0.5 bg-white"></div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="font-bold text-[#111827] text-sm leading-tight tracking-tight">Alertas Salud</h1>
            <p className="text-[#6B7280] text-[10px] font-medium">Sistema Temprano</p>
          </div>
        </div>

        <nav className="space-y-1 relative">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isNavigating = navigatingTo === item.href;
            
            return (
              <div key={item.label} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-[#E3F2FD] rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 relative z-10",
                    isActive ? "text-[#1565C0] shadow-sm" : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
                  )}
                >
                  <item.icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
                  <span className={clsx("text-[14px] flex-1 text-left", isActive ? "font-bold" : "font-semibold")}>
                    {item.label}
                  </span>
                  
                  {isNavigating && (
                    <div className="w-3.5 h-3.5 border-2 border-[#1565C0] border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 bg-gradient-to-r from-[#1565C0] to-[#3B82F6] text-white hover:shadow-md mb-4"
        >
          <MailCheck size={20} className="stroke-2" />
          <span className="text-[14px] flex-1 text-left font-bold">
            Verificar Correos
          </span>
        </button>

        <div className="border-t border-gray-100 pt-4">
          <div className="mb-2">
          <p className="text-[10px] text-[#6B7280] font-bold uppercase px-2 tracking-wider">Sistema Demo</p>
          <div className="mt-3 flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1565C0] to-[#3B82F6] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              LM
            </div>
            <div>
              <p className="text-xs font-bold text-[#111827]">Laura Martínez</p>
              <p className="text-[10px] text-[#6B7280] font-medium">Gestor de Alertas</p>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      <EmailTutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
    </div>
  );
};
