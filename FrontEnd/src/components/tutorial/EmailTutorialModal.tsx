'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Copy, Check, MailCheck } from 'lucide-react';
import Image from 'next/image';
import tutorialImg from '../../assets/Tutorial_Verificar_Correo.png';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface EmailTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailTutorialModal: React.FC<EmailTutorialModalProps> = ({ isOpen, onClose }) => {
  const [asegurados, setAsegurados] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Necesario para que createPortal solo corra en el cliente
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/api/asegurados`)
        .then(res => res.json())
        .then(data => {
          if (data.data) setAsegurados(data.data);
        })
        .catch(err => console.error('Error cargando asegurados', err));
    }
  }, [isOpen]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    /*
     * El portal monta este div directamente en document.body,
     * por fuera del Sidebar. Así el z-index y el inset-0
     * aplican sobre toda la ventana del navegador sin ser
     * recortados por el contexto de apilamiento del sidebar.
     */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
      onClick={onClose}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 backdrop-blur-[3px]" />

      {/* Panel del modal */}
      <div
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-[0_32px_80px_rgba(15,23,42,0.28)] overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1565C0] text-white rounded-lg flex items-center justify-center shadow-md">
              <MailCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verificar Correos</h2>
              <p className="text-sm text-gray-500 font-medium">Guía para revisar notificaciones enviadas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* ── Contenido desplazable ── */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-8">

            {/* Paso 1 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1565C0] text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <h3 className="text-lg font-bold text-gray-800">Entrar a Yopmail</h3>
              </div>
              <p className="text-gray-600 mb-4 pl-9">
                Abre el portal de correos temporales para verificar las notificaciones enviadas por el sistema.
              </p>
              <div className="pl-9">
                <a
                  href="https://yopmail.com/es/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1565C0] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  Abrir Yopmail.com <ExternalLink size={16} />
                </a>
              </div>
            </div>

            {/* Paso 2 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1565C0] text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <h3 className="text-lg font-bold text-gray-800">Pega el correo a consultar</h3>
              </div>
              <p className="text-gray-600 mb-4 pl-9">
                En Yopmail, debes colocar el correo del Hospital, de la Aseguradora o del Paciente para ver su bandeja de entrada.
              </p>

              <div className="pl-9 mb-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <Image
                    src={tutorialImg}
                    alt="Tutorial Yopmail"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className="pl-9">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-4">Selecciona un correo para copiar:</h4>

                  <div className="space-y-4">
                    {/* Correo Hospital */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Correo Hospital
                        </label>
                        <input
                          type="text"
                          readOnly
                          value="hospital_demo@yopmail.com"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleCopy('hospital_demo@yopmail.com', 'hosp')}
                        className="h-[46px] px-4 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shrink-0"
                        aria-label="Copiar correo hospital"
                      >
                        {copiedField === 'hosp' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                      </button>
                    </div>

                    {/* Correo Aseguradora */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Correo Aseguradora (Gestor)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value="seguro_demo@yopmail.com"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleCopy('seguro_demo@yopmail.com', 'seg')}
                        className="h-[46px] px-4 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shrink-0"
                        aria-label="Copiar correo aseguradora"
                      >
                        {copiedField === 'seg' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                      </button>
                    </div>

                    <div className="h-px bg-gray-200 w-full my-2" />

                    {/* Correo Paciente (dinámico) */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Correo de Pacientes (Asegurados)
                        </label>
                        <select
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                          value={selectedEmail}
                          onChange={e => setSelectedEmail(e.target.value)}
                        >
                          <option value="">-- Selecciona un paciente --</option>
                          {asegurados.map(a => (
                            <option key={a.id} value={a.email}>
                              {a.nombre} ({a.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedEmail, 'pac')}
                        disabled={!selectedEmail}
                        className="h-[46px] px-4 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Copiar correo paciente"
                      >
                        {copiedField === 'pac' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  // Montar en el body para escapar del contexto de apilamiento del sidebar
  return createPortal(modalContent, document.body);
};
