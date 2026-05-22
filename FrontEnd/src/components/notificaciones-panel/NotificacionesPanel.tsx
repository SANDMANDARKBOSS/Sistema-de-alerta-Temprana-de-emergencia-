import React from 'react';
import { Notificacion } from '../../shared/models';
import { clsx } from 'clsx';
import Link from 'next/link';

interface NotificacionesPanelProps {
  notificaciones: Notificacion[];
}

export const NotificacionesPanel: React.FC<NotificacionesPanelProps> = ({ notificaciones }) => {
  return (
    <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <h3 className="text-sm font-bold text-[#111827] mb-4">Notificaciones Recientes</h3>
      <div className="space-y-4">
        {notificaciones.map((notif, index) => (
          <div key={index} className="flex justify-between items-start group cursor-pointer">
            <div className="flex gap-3">
              <div className={clsx(
                "w-2 h-2 mt-1.5 rounded-full shrink-0",
                notif.tipo === 'validada' && "bg-[#4CAF50]",
                notif.tipo === 'en-proceso' && "bg-[#FFC107]",
                notif.tipo === 'invalida' && "bg-[#F44336]",
                notif.tipo === 'enviada' && "bg-[#1565C0]"
              )}></div>
              <div>
                <p className={clsx(
                  "text-[10px] font-bold uppercase tracking-wide mb-0.5",
                  notif.tipo === 'validada' && "text-[#4CAF50]",
                  notif.tipo === 'en-proceso' && "text-[#FFC107]",
                  notif.tipo === 'invalida' && "text-[#F44336]",
                  notif.tipo === 'enviada' && "text-[#1565C0]"
                )}>
                  {notif.descripcion}
                </p>
                <p className="text-sm font-bold text-[#111827] group-hover:text-[#1565C0] transition-colors">
                  {notif.paciente}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-[#6B7280]">{notif.hora}</span>
          </div>
        ))}
      </div>
      <Link href="/alertas" className="w-full mt-6 py-2 text-xs font-bold text-[#1565C0] border border-[#E3F2FD] rounded-lg hover:bg-[#E3F2FD] transition-colors flex justify-center text-center">
        Ver todas las notificaciones
      </Link>
    </div>
  );
};
