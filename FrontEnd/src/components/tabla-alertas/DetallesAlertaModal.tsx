'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle, Clock, User, Shield, Stethoscope } from 'lucide-react';
import { AlertaActiva } from '../../shared/models';

interface DetallesAlertaModalProps {
  alerta: AlertaActiva | null;
  onClose: () => void;
  onMarcarGestionada?: (id: string) => void;
}

export const DetallesAlertaModal: React.FC<DetallesAlertaModalProps> = ({ alerta, onClose, onMarcarGestionada }) => {
  if (!alerta) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md text-white ${
              alerta.estado === 'notificada' ? 'bg-green-500' :
              alerta.estado === 'en-validacion' ? 'bg-amber-500' : 'bg-red-500'
            }`}>
              {alerta.estado === 'notificada' ? <CheckCircle size={20} /> :
               alerta.estado === 'en-validacion' ? <Clock size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalles de Alerta</h2>
              <p className="text-sm text-gray-500 font-medium">Información de ingreso</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1565C0] font-bold text-lg">
              {alerta.paciente.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{alerta.paciente.nombre}</h3>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <User size={14} /> Cédula: {alerta.paciente.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Shield size={12} /> Número Póliza
              </span>
              <p className="font-semibold text-gray-900">{alerta.polizaNumero}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} /> Hora de Ingreso
              </span>
              <p className="font-semibold text-gray-900">{alerta.horaIngresoTexto}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Stethoscope size={12} /> Motivo / Diagnóstico Preliminar
              </span>
              <p className="font-medium text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-100">
                {alerta.motivoIngreso}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <button 
            onClick={() => {
              if (onMarcarGestionada) onMarcarGestionada(alerta.id);
              onClose();
            }}
            className="px-5 py-2 font-bold text-white bg-[#1565C0] hover:bg-blue-700 rounded-xl transition-colors shadow-md"
          >
            Marcar como Gestionada
          </button>
        </div>

      </div>
    </div>
  );
};
