'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { BuscadorPaciente } from '../../components/buscador-paciente/BuscadorPaciente';
import { TablaIngresosCompleta } from '../../components/tabla-ingresos-completa/TablaIngresosCompleta';
import { Paginacion } from '../../components/paginacion/Paginacion';
import { IngresoCompleto } from '../../shared/models';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, User, Hospital, FileText, ShieldCheck, Mail, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';
import { PanelLogsIA } from '../../components/panel-logs-ia/PanelLogsIA';

function ModalExito({ titulo, mensaje, onClose }: { titulo: string; mensaje: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{titulo}</h3>
        <p className="text-gray-500 mb-6">{mensaje}</p>
        <button onClick={onClose} className="w-full bg-[#1565C0] text-white py-3 rounded-xl font-bold hover:bg-[#0D47A1] transition-all">
          Entendido
        </button>
      </motion.div>
    </div>
  );
}

function ModalDetalles({ ingreso, onClose }: { ingreso: IngresoCompleto, onClose: () => void }) {
  if (!ingreso) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-[#1565C0] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity size={24} />
            <h3 className="text-xl font-bold">Detalles de Alerta y Análisis IA</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                <User size={14} />
                Paciente
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">{ingreso.paciente?.nombre}</p>
                <p className="text-sm text-[#6B7280]">Cédula: {ingreso.paciente?.id}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                <Hospital size={14} />
                Hospital
              </div>
              <p className="text-lg font-bold text-[#111827]">{ingreso.motivo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} />
                Estado Póliza
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  ingreso.poliza === 'Póliza Válida' || ingreso.poliza === 'VIGENTE' ? 'bg-green-500' : 
                  ingreso.poliza === 'Póliza Inválida' || ingreso.poliza === 'VENCIDA' || ingreso.poliza === 'SUSPENDIDA' ? 'bg-red-500' : 'bg-amber-500'
                }`}></div>
                <span className="font-bold text-[#111827]">{ingreso.poliza}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                <FileText size={14} />
                Número de Póliza
              </div>
              <p className="font-bold text-[#111827]">{ingreso.polizaNumero}</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-[#1565C0] p-6 rounded-r-xl">
            <p className="text-[#1565C0] font-bold text-sm mb-2 flex items-center gap-2">
              <Activity size={16} />
              Análisis IA
            </p>
            <p className="text-sm text-[#374151] leading-relaxed italic">
              "{ingreso.estadoSubtexto || 'Análisis de riesgo en proceso para este paciente.'}"
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-[#6B7280] hover:text-[#111827]">
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ModalRegistro({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [formData, setFormData] = useState({ nombre: '', cedula: '', email: '', plan: 'Cobertura Integral', preExistencias: '' });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const { registrarAsegurado } = await import('../../services/api/client');
      await registrarAsegurado(formData);
      onSuccess('El paciente ha sido registrado y su póliza está activa en el sistema.');
    } catch {
      alert('❌ Error registrando asegurado');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1565C0] text-white rounded-lg flex items-center justify-center shadow-md">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Nuevo Asegurado</h3>
              <p className="text-sm text-gray-500 font-medium">Registrar paciente en sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
            <input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Cédula</label>
              <input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Plan</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                <option>Cobertura Integral</option>
                <option>Cobertura Básica</option>
                <option>Premium Plus</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
            <input required type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Pre-existencias</label>
            <textarea className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none h-20" value={formData.preExistencias} onChange={e => setFormData({...formData, preExistencias: e.target.value})} />
          </div>
          <div className="pt-2">
            <button disabled={enviando} className="w-full bg-[#1565C0] text-white py-3 rounded-xl font-bold hover:bg-[#0D47A1] transition-all shadow-md hover:shadow-lg disabled:opacity-50">
              {enviando ? 'Guardando...' : 'Confirmar y Asegurar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function PanelSimulacion() {
  const [cedula, setCedula] = useState('');
  const [hospital, setHospital] = useState('Hospital Central');
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ok: boolean; msg: string} | null>(null);

  const simular = async () => {
    if (!cedula.trim() || !motivo.trim()) return;
    setEnviando(true);
    setResultado(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const resp = await fetch(`${apiUrl}/api/webhook/ingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: cedula.trim(), hospital, motivo: motivo.trim() })
      });
      const data = await resp.json();
      if (resp.ok) {
        setResultado({ 
          ok: true, 
          msg: `✅ Alerta enviada exitosamente. Revisa el chat IA abajo.` 
        });
        setTimeout(() => setResultado(null), 3000);
      } else {
        setResultado({ ok: false, msg: `❌ ${data.error || 'Error procesando'}` });
      }
    } catch {
      setResultado({ ok: false, msg: '❌ Error conectando con el backend' });
    } finally {
      setEnviando(false);
      setCedula('');
      setMotivo('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6 flex flex-col gap-4 overflow-hidden relative">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#1565C0] animate-pulse"></div>
        <h3 className="text-sm font-bold text-[#1565C0]">Disparar Webhook (Simulación de Ingreso)</h3>
      </div>
      
      <div className="flex gap-4 items-end flex-wrap relative z-10">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#6B7280] uppercase">Cédula del paciente</label>
          <input
            type="text"
            value={cedula}
            onChange={e => setCedula(e.target.value)}
            disabled={enviando}
            placeholder="Ej: 1712345678"
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] bg-white w-48 transition-all disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#6B7280] uppercase">Motivo o Síntomas</label>
          <input
            type="text"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            disabled={enviando}
            placeholder="Ej: Dolor de pecho agudo"
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] bg-white w-56 transition-all disabled:opacity-50"
          />
        </div>
        <button
          onClick={simular}
          disabled={enviando || !cedula.trim() || !motivo.trim()}
          className="px-6 py-2.5 bg-[#1565C0] text-white text-sm font-bold rounded-lg hover:bg-[#0D47A1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
        >
          {enviando ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando...</>
          ) : (
            '🚨 Enviar Alerta Webhook'
          )}
        </button>
        {resultado && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className={`text-xs font-bold px-4 py-2.5 rounded-lg flex items-center h-full ${resultado.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {resultado.msg}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function IngresosPagina() {
  const [ingresosApi, setIngresosApi] = useState<IngresoCompleto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState<IngresoCompleto | null>(null);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalExito, setModalExito] = useState<{abierto: boolean; msg: string}>({ abierto: false, msg: '' });
  const socketRef = useRef<Socket | null>(null);

  const mapAlertaToIngreso = (alerta: any): IngresoCompleto => {
    // Intentar extraer el análisis si viene concatenado de Notion
    const analisisMatch = alerta.preExistencias?.match(/\[Análisis IA\]: (.*)/s);
    const analisisExtraido = analisisMatch ? analisisMatch[1] : null;

    return {
      id: alerta.id,
      paciente: { id: alerta.cedulaPaciente, nombre: alerta.nombre || alerta.paciente || 'Paciente' },
      motivo: alerta.hospital,
      fecha: new Date(alerta.fechaIngreso).toLocaleTimeString('es-CO', { hour: '2-digit', minute:'2-digit', hour12: true }) + ' ' + new Date(alerta.fechaIngreso).toLocaleDateString('es-CO'),
      poliza: alerta.estadoPoliza,
      polizaNumero: alerta.polizaId,
      prioridad: alerta.estadoPoliza === 'VIGENTE' ? 'Baja' : 'Alta',
      estado: alerta.estadoPoliza === 'VIGENTE' ? 'Validada' : 'Requiere Revisión',
      estadoSubtexto: alerta.analisis?.resumen || analisisExtraido || alerta.preExistencias || 'Sin análisis IA disponible',
      tiempoEspera: '0 min'
    };
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/alertas`);
      const data = await response.json();
      const mapped = (data.data || []).map(mapAlertaToIngreso);
      setIngresosApi(mapped);
    } catch (e) {
      console.error("Error cargando alertas:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();

    // Socket.IO Setup
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    socketRef.current.on('nueva-alerta', (alerta) => {
      const nuevoIngreso = mapAlertaToIngreso(alerta);
      setIngresosApi(prev => [nuevoIngreso, ...prev]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [cargarDatos]);

  const ingresosFiltrados = useMemo(() => {
    const data = Array.isArray(ingresosApi) ? ingresosApi : [];
    if (!busqueda) return data;
    const lowerBusqueda = busqueda.toLowerCase();
    return data.filter(i =>
      i && (
        i.paciente?.nombre?.toLowerCase().includes(lowerBusqueda) ||
        i.paciente?.id?.includes(busqueda) ||
        i.polizaNumero?.includes(busqueda)
      )
    );
  }, [ingresosApi, busqueda]);

  const ingresosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    return ingresosFiltrados.slice(inicio, inicio + filasPorPagina);
  }, [ingresosFiltrados, paginaActual, filasPorPagina]);

  const stats = useMemo(() => {
    const data = Array.isArray(ingresosApi) ? ingresosApi : [];
    const total = data.length;
    const validadas = data.filter(i => i.poliza === 'VIGENTE').length;
    const invalidas = data.filter(i => i.poliza === 'VENCIDA' || i.poliza === 'SUSPENDIDA').length;
    const enValidacion = total - validadas - invalidas;
    return { total, validadas, enValidacion, invalidas };
  }, [ingresosApi]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 relative pb-20">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Ingresos en Tiempo Real</h1>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </div>
            </div>
            <p className="text-[#6B7280] text-sm">
              Monitorea los ingresos y estados de validación integrados con Notion e IA.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setModalRegistroAbierto(true)}
              className="px-4 py-2 bg-white border border-gray-200 text-[#1565C0] font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <UserPlus size={18} />
              Asegurar Paciente
            </button>
            <BuscadorPaciente onBusquedaCambiada={(t) => { setBusqueda(t); setPaginaActual(1); }} />
          </div>
        </div>

        <PanelSimulacion />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard titulo="Total Alertas" valor={stats.total} subtexto="Registros recibidos" subtextoColor="gris" colorValor="#111827" />
          <MetricCard titulo="Pólizas Vigentes" valor={stats.validadas} subtexto="Validación Aprobada" subtextoColor="verde" colorValor="#16A34A" />
          <MetricCard titulo="En Revisión" valor={stats.enValidacion} subtexto="Análisis IA pendiente" subtextoColor="gris" colorValor="#D97706" />
          <MetricCard titulo="Pólizas Inválidas" valor={stats.invalidas} subtexto="Atención requerida" subtextoColor="rojo" colorValor="#DC2626" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#6B7280] uppercase bg-gray-50 border-b border-gray-200 font-bold">
                <tr>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Póliza / Estado</th>
                  <th className="px-6 py-4">Hospital / Fecha</th>
                  <th className="px-6 py-4">Análisis IA</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {cargando ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-[#1565C0] border-t-transparent rounded-full animate-spin"></div>
                          Cargando datos...
                        </div>
                      </td>
                    </tr>
                  ) : ingresosPaginados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-medium italic">
                        No hay ingresos registrados
                      </td>
                    </tr>
                  ) : (
                    ingresosPaginados.map((ingreso, idx) => (
                      <motion.tr 
                        key={ingreso.id}
                        initial={{ opacity: 0, y: -20, backgroundColor: '#EFF6FF' }}
                        animate={{ opacity: 1, y: 0, backgroundColor: '#FFFFFF' }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#111827]">{ingreso.paciente?.nombre}</div>
                          <div className="text-xs text-gray-500">{ingreso.paciente?.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#111827]">{ingreso.polizaNumero}</div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                            ingreso.poliza === 'VIGENTE' ? 'bg-green-100 text-green-700' :
                            ingreso.poliza === 'VENCIDA' || ingreso.poliza === 'SUSPENDIDA' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {ingreso.poliza}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#374151]">{ingreso.motivo}</div>
                          <div className="text-xs text-gray-500">{ingreso.fecha}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600 max-w-xs truncate" title={ingreso.estadoSubtexto}>
                            {ingreso.estadoSubtexto}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setIngresoSeleccionado(ingreso)}
                            className="text-[#1565C0] hover:text-[#0D47A1] font-bold text-xs"
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <Paginacion
            paginaActual={paginaActual}
            totalItems={ingresosFiltrados.length}
            filasPorPagina={filasPorPagina}
            onPaginaCambiada={setPaginaActual}
            onFilasPorPaginaCambiadas={setFilasPorPagina}
          />
        </div>

        <AnimatePresence>
          {ingresoSeleccionado && (
            <ModalDetalles ingreso={ingresoSeleccionado} onClose={() => setIngresoSeleccionado(null)} />
          )}
          {modalRegistroAbierto && (
            <ModalRegistro 
              onClose={() => setModalRegistroAbierto(false)} 
              onSuccess={(msg) => {
                setModalRegistroAbierto(false);
                setModalExito({ abierto: true, msg });
                void cargarDatos(); // Recargar la tabla
              }}
            />
          )}
          {modalExito.abierto && (
            <ModalExito 
              titulo="¡Asegurado con Éxito!" 
              mensaje={modalExito.msg} 
              onClose={() => setModalExito({ abierto: false, msg: '' })} 
            />
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
