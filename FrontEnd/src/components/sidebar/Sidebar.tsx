'use client';

import React from 'react';
import { 
  Home, 
  TrendingUp, 
  Bell, 
  FileText, 
  FolderOpen, 
  BarChart2, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: TrendingUp, label: 'Ingresos en Tiempo Real', href: '/ingresos' },
  { icon: Bell, label: 'Alertas Activas', href: '/alertas' },
  { icon: FileText, label: 'Pólizas y Validaciones', href: '/polizas' },
  { icon: FolderOpen, label: 'Historial de Casos', href: '/historial' },
  { icon: BarChart2, label: 'Reportes', href: '#' },
  { icon: Users, label: 'Gestores y Notificaciones', href: '#' },
  { icon: Settings, label: 'Configuración', href: '#' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1565C0] rounded flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="h-4 w-0.5 bg-white"></div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="font-bold text-[#111827] text-sm leading-tight">Alertas Salud</h1>
            <p className="text-[#6B7280] text-[10px]">Sistema de Alerta Temprana</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  isActive 
                    ? "bg-[#E3F2FD] text-[#1565C0]" 
                    : "text-[#6B7280] hover:bg-gray-50"
                )}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="mb-4">
          <p className="text-[10px] text-[#6B7280] font-medium uppercase px-2">Hospital Central / Centro Médico</p>
          <div className="mt-2 flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">LM</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#111827]">Laura Martínez</p>
              <p className="text-[10px] text-[#6B7280]">Gestor de Casos</p>
            </div>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#111827] py-2">
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
