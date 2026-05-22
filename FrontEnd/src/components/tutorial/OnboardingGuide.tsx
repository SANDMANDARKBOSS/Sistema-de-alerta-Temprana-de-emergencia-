'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Webhook, ShieldCheck, FileSearch, Send, Brain, CheckCircle2, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';

const steps = [
  {
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-400',
    title: '¡Bienvenido al Sistema de Alerta Temprana!',
    subtitle: 'Monitoreo inteligente de emergencias médicas',
    description: 'Este sistema automatiza la verificación de pólizas de seguros cuando un paciente ingresa a emergencias, utilizando Inteligencia Artificial y notificaciones en tiempo real.',
    tip: 'El sistema se conecta directamente con Notion como base de datos y usa un agente IA (Groq/LLaMA) para analizar cada caso.'
  },
  {
    icon: Webhook,
    color: 'from-blue-600 to-blue-400',
    title: 'Paso 1: Ingreso del Paciente',
    subtitle: 'Webhook de emergencia',
    description: 'Cuando un paciente asegurado ingresa a la emergencia del hospital, se dispara un webhook que inicia el proceso automático. Puedes simular esto desde la pantalla "Ingresos en Tiempo Real".',
    tip: 'Ingresa la cédula del paciente, el hospital y los síntomas/motivo de ingreso para activar el flujo completo.'
  },
  {
    icon: ShieldCheck,
    color: 'from-green-600 to-emerald-400',
    title: 'Paso 2: Validación de Póliza',
    subtitle: 'Verificación instantánea',
    description: 'El sistema busca automáticamente al asegurado en la base de datos de Notion, verifica su identidad y consulta el estado de su póliza (VIGENTE, VENCIDA o SUSPENDIDA).',
    tip: 'Asegúrate de que el paciente esté registrado en "Asegurados" y tenga una póliza asociada en "Pólizas y Validaciones".'
  },
  {
    icon: FileSearch,
    color: 'from-amber-500 to-orange-400',
    title: 'Paso 3: Análisis IA de Pre-existencias',
    subtitle: 'Agente inteligente de auditoría',
    description: 'Un agente de Inteligencia Artificial analiza las pre-existencias del paciente, evalúa el nivel de riesgo y genera un dictamen de validación o rechazo con recomendaciones.',
    tip: 'El análisis de la IA se guarda permanentemente y puedes consultarlo en "Ver Detalles" de cada ingreso.'
  },
  {
    icon: Send,
    color: 'from-purple-600 to-violet-400',
    title: 'Paso 4: Notificación Simultánea',
    subtitle: 'Triple notificación automática',
    description: 'El sistema envía notificaciones por correo electrónico simultáneamente a 3 destinatarios: el departamento de admisiones del hospital, el gestor de casos del seguro y el paciente asegurado.',
    tip: 'Usa el botón "Verificar Correos" en la barra lateral para consultar los correos enviados vía Yopmail.'
  },
  {
    icon: CheckCircle2,
    color: 'from-teal-500 to-green-400',
    title: '¡Listo para usar!',
    subtitle: 'Sistema 100% operativo',
    description: 'El sistema está completamente configurado. Todas las alertas, reportes e historial se actualizan en tiempo real. El panel de Terminal IA (esquina inferior derecha) muestra cada paso del procesamiento en vivo.',
    tip: 'Explora las diferentes secciones: Dashboard, Ingresos, Alertas Activas, Pólizas, Reportes y Configuración.'
  }
];

export const OnboardingGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('onboarding-seen');
    if (!seen) {
      setHasSeenGuide(false);
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('onboarding-seen', 'true');
    setHasSeenGuide(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const step = steps[currentStep];

  return (
    <>
      {/* Help Button */}
      {hasSeenGuide && (
        <button
          onClick={() => { setIsOpen(true); setCurrentStep(0); }}
          className="fixed bottom-4 left-[236px] z-40 bg-gradient-to-r from-[#1565C0] to-[#3B82F6] text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-110"
          title="Guía del Sistema"
        >
          <HelpCircle size={20} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-br ${step.color} p-8 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>

                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                    <step.icon size={28} />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{step.title}</h2>
                  <p className="text-white/80 text-sm font-medium">{step.subtitle}</p>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-8">
                <motion.div
                  key={`content-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-[#374151] text-sm leading-relaxed mb-5">
                    {step.description}
                  </p>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-xs font-bold text-[#1565C0] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Brain size={14} /> Consejo
                    </p>
                    <p className="text-sm text-[#374151]">{step.tip}</p>
                  </div>
                </motion.div>

                {/* Progress + Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === currentStep ? 'bg-[#1565C0] w-6' : i < currentStep ? 'bg-blue-200 w-2' : 'bg-gray-200 w-2'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <button onClick={handlePrev} className="px-4 py-2 text-sm font-bold text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                        <ChevronLeft size={16} /> Atrás
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 bg-[#1565C0] text-white text-sm font-bold rounded-xl hover:bg-[#0D47A1] transition-colors shadow-md flex items-center gap-1.5"
                    >
                      {currentStep === steps.length - 1 ? (
                        <>¡Comenzar! <ArrowRight size={16} /></>
                      ) : (
                        <>Siguiente <ChevronRight size={16} /></>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-center text-[10px] text-gray-400 mt-4">
                  {currentStep + 1} de {steps.length} · Presiona el botón <span className="font-bold">?</span> para volver a ver esta guía
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
