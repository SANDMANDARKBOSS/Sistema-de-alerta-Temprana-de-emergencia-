'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { ToggleSwitch } from '../../components/toggle-switch/ToggleSwitch';
import { Settings, Building, Shield, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { ConfiguracionSistema } from '../../shared/models';
import { getConfiguracion, updateConfiguracion } from '../../services/api/client';

export default function ConfiguracionPagina() {
  const [config, setConfig] = useState<ConfiguracionSistema>({
    registrosPorPagina: 10,
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '12h',
    institucion: {
      nombre: 'Hospital Central',
      direccion: 'Av. 11 de Noviembre Riobamba - Chimborazo',
      telefono: '+593 999999999',
      correo: 'hospital_demo@yopmail.com'
    },
    validacionAutomatica: true,
    cierreAutomaticoCasos: true
  });

  const [guardado, setGuardado] = useState<{[k: string]: boolean}>({});

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const data = await getConfiguracion();
        if (activo) setConfig(data);
      } catch {
        // mantiene defaults locales si la API falla
      }
    };
    void cargar();
    return () => { activo = false; };
  }, []);

  const handleGuardar = (seccion: string) => {
    void updateConfiguracion(config).catch(() => {
      // si falla, no rompe la UI
    });
    setGuardado(prev => ({ ...prev, [seccion]: true }));
    setTimeout(() => {
      setGuardado(prev => ({ ...prev, [seccion]: false }));
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#111827]">Configuración</h1>
          <p className="text-[#6B7280] text-sm">Personaliza y administra las opciones del sistema.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARD: Parámetros Generales */}
          <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-[#111827]">Parámetros Generales</h3>
              <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center">
                <Settings size={20} className="text-[#1565C0]" />
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="form-group">
                <label>Registros por página</label>
                <select 
                  className="form-select" 
                  value={config.registrosPorPagina}
                  onChange={e => setConfig({...config, registrosPorPagina: Number(e.target.value)})}
                >
                  {[5, 10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Formato de fecha</label>
                <select 
                  className="form-select" 
                  value={config.formatoFecha}
                  onChange={e => setConfig({...config, formatoFecha: e.target.value as any})}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="form-group">
                <label>Formato de hora</label>
                <select 
                  className="form-select" 
                  value={config.formatoHora}
                  onChange={e => setConfig({...config, formatoHora: e.target.value as any})}
                >
                  <option value="12h">12 horas (hh:mm AM/PM)</option>
                  <option value="24h">24 horas (HH:mm)</option>
                </select>
              </div>
            </div>

            <button 
              className={clsx("btn-guardar font-bold", guardado['parametros'] && "success")} 
              onClick={() => handleGuardar('parametros')}
            >
              {guardado['parametros'] ? <span className="flex items-center gap-1"><Check size={16}/> Guardado</span> : 'Guardar cambios'}
            </button>
          </div>

          {/* CARD: Información de la Institución */}
          <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-[#111827]">Información de la Institución</h3>
              <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                <Building size={20} className="text-[#6B7280]" />
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={config.institucion.nombre}
                  onChange={e => setConfig({...config, institucion: {...config.institucion, nombre: e.target.value}})}
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={config.institucion.direccion}
                  onChange={e => setConfig({...config, institucion: {...config.institucion, direccion: e.target.value}})}
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  className="form-input" 
                  type="tel" 
                  value={config.institucion.telefono}
                  onChange={e => setConfig({...config, institucion: {...config.institucion, telefono: e.target.value}})}
                />
              </div>

              <div className="form-group">
                <label>Correo institucional</label>
                <input 
                  className="form-input" 
                  type="email" 
                  value={config.institucion.correo}
                  onChange={e => setConfig({...config, institucion: {...config.institucion, correo: e.target.value}})}
                />
              </div>
            </div>

            <button 
              className={clsx("btn-guardar font-bold", guardado['institucion'] && "success")} 
              onClick={() => handleGuardar('institucion')}
            >
              {guardado['institucion'] ? <span className="flex items-center gap-1"><Check size={16}/> Guardado</span> : 'Guardar cambios'}
            </button>
          </div>

          {/* CARD: Políticas del Sistema */}
          <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-[#111827]">Políticas del Sistema</h3>
              <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center">
                <Shield size={20} className="text-[#1565C0]" />
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="politica-row">
                <div className="politica-info">
                  <span className="politica-titulo">Validación automática de pólizas</span>
                  <span className="politica-desc">Habilitar validación automática al ingreso del paciente</span>
                </div>
                <ToggleSwitch 
                  activo={config.validacionAutomatica} 
                  onCambio={v => setConfig({...config, validacionAutomatica: v})} 
                />
              </div>

              <div className="politica-row">
                <div className="politica-info">
                  <span className="politica-titulo">Cierre automático de casos inactivos</span>
                  <span className="politica-desc">Cerrar casos sin actividad después de 30 días</span>
                </div>
                <ToggleSwitch 
                  activo={config.cierreAutomaticoCasos} 
                  onCambio={v => setConfig({...config, cierreAutomaticoCasos: v})} 
                />
              </div>
            </div>

            <button 
              className={clsx("btn-guardar font-bold", guardado['politicas'] && "success")} 
              onClick={() => handleGuardar('politicas')}
            >
              {guardado['politicas'] ? <span className="flex items-center gap-1"><Check size={16}/> Guardado</span> : 'Guardar cambios'}
            </button>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
