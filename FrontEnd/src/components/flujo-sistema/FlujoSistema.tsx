import React from 'react';
import { Webhook, ShieldCheck, FileSearch, Send, ArrowRight } from 'lucide-react';

export const FlujoSistema = () => {
  const pasos = [
    { 
      icon: Webhook, 
      titulo: 'Webhook', 
      desc: 'Recepción de ingreso',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      icon: ShieldCheck, 
      titulo: 'Validación', 
      desc: 'Verificación de póliza',
      color: 'bg-green-100 text-green-600'
    },
    { 
      icon: FileSearch, 
      titulo: 'Evaluación', 
      desc: 'Historial y pre-existencias',
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      icon: Send, 
      titulo: 'Notificación', 
      desc: 'Envío a admisiones y gestor',
      color: 'bg-purple-100 text-purple-600'
    },
  ];

  return (
    <div className="bg-white p-8 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-[#111827]">Flujo del Sistema</h3>
        <button className="text-[#1565C0] text-sm font-semibold hover:underline flex items-center gap-1">
          Ver flujo completo <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-50 -translate-y-[40px] -z-0"></div>
        {pasos.map((paso, index) => (
          <React.Fragment key={paso.titulo}>
            <div className="flex flex-col items-center text-center relative z-10 bg-white px-4">
              <div className={`w-14 h-14 ${paso.color} rounded-full flex items-center justify-center mb-4 shadow-sm`}>
                <paso.icon size={24} />
              </div>
              <p className="text-sm font-bold text-[#111827] mb-1">{paso.titulo}</p>
              <p className="text-[10px] text-[#6B7280] max-w-[120px] leading-relaxed">
                {paso.desc}
              </p>
            </div>
            {index < pasos.length - 1 && (
              <div className="flex-1 flex justify-center text-gray-200 z-10 bg-white">
                <ArrowRight size={20} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
