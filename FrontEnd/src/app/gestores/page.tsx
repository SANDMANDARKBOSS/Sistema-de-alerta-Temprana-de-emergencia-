'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { getGestoresData, GestorApiItem, NotificacionGestorApiItem } from '../../services/api/client';
import { clsx } from 'clsx';
import { 
  Users, 
  Mail, 
  Bell, 
  Monitor, 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronRight,
  UserPlus,
  Shield,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ModalNuevoGestor({ onClose, onSuccess }: { onClose: () => void; onSuccess: (g: GestorApiItem) => void }) {
  const [formData, setFormData] = useState({ nombre: '', correo: '', rol: 'Supervisor Médico', area: 'Validación de Pólizas' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoGestor: GestorApiItem = {
      id: Math.random().toString(36).substring(7),
      nombre: formData.nombre,
      correo: formData.correo,
      rol: formData.rol,
      area: formData.area,
      estado: 'Activo',
      ultimoAcceso: { fecha: new Date().toLocaleDateString('es-CO'), hora: new Date().toLocaleTimeString('es-CO') }
    };
    onSuccess(nuevoGestor);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1565C0] text-white rounded-lg flex items-center justify-center shadow-md">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Nuevo Gestor</h3>
              <p className="text-sm text-gray-500 font-medium">Añadir usuario al sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
            <input required type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none transition-all" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Correo Electrónico</label>
            <input required type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none transition-all" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none transition-all" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                <option>Supervisor Médico</option>
                <option>Gestor de Casos</option>
                <option>Admin Sistema</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Área</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-[#1565C0] outline-none transition-all" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})}>
                <option>Validación de Pólizas</option>
                <option>Atención al Cliente</option>
                <option>Auditoría Médica</option>
              </select>
            </div>
          </div>
          <div className="pt-2">
            <button className="w-full bg-[#1565C0] text-white py-3 rounded-xl font-bold hover:bg-[#0D47A1] transition-all shadow-md hover:shadow-lg">
              Crear Gestor
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function GestoresPagina() {
  const [gestores, setGestores] = useState<GestorApiItem[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionGestorApiItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [apiDisponible, setApiDisponible] = useState(true);
  const [tabActivo, setTabActivo] = useState<'gestores' | 'notificaciones'>('gestores');
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [menuActivo, setMenuActivo] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      const data = await getGestoresData();
      setGestores(Array.isArray(data.gestores) ? data.gestores : []);
      setNotificaciones(Array.isArray(data.notificaciones) ? data.notificaciones : []);
      setApiDisponible(true);
    } catch (error) {
      console.error('Error cargando gestores:', error);
      setApiDisponible(false);
      setGestores([]);
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const metricas = useMemo(() => {
    const safeGestores = Array.isArray(gestores) ? gestores : [];
    const safeNotifs = Array.isArray(notificaciones) ? notificaciones : [];
    
    const gestoresActivos = safeGestores.filter(g => g && g.estado === 'Activo').length;
    const notificacionesHoy = safeNotifs.length;
    const pendientesLectura = safeNotifs.filter(n => n && n.estado === 'Pendiente').length;
    
    return { gestoresActivos, notificacionesHoy, pendientesLectura };
  }, [gestores, notificaciones]);

  const filteredGestores = useMemo(() => {
    const safeGestores = Array.isArray(gestores) ? gestores : [];
    if (!busqueda) return safeGestores;
    const low = busqueda.toLowerCase();
    return safeGestores.filter(g => 
      g && (
        g.nombre?.toLowerCase().includes(low) || 
        g.correo?.toLowerCase().includes(low) || 
        g.area?.toLowerCase().includes(low)
      )
    );
  }, [gestores, busqueda]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Gestores y Notificaciones</h1>
            <p className="text-[#6B7280] text-sm mt-1">Administración de usuarios gestores y registro de comunicaciones del sistema.</p>
          </div>
          <button 
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 bg-[#1565C0] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#0D47A1] transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Nuevo Gestor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            titulo="Gestores Activos" 
            valor={metricas.gestoresActivos} 
            subtexto="Usuarios con acceso al sistema" 
            icon={<Users size={28} className="text-[#1565C0]" />}
            iconoBgColor="#E3F2FD"
          />
          <MetricCard 
            titulo="Notificaciones Enviadas" 
            valor={metricas.notificacionesHoy} 
            subtexto="Total de comunicaciones" 
            icon={<Mail size={28} className="text-[#4CAF50]" />}
            iconoBgColor="#E8F5E9"
          />
          <MetricCard 
            titulo="Pendientes de Lectura" 
            valor={metricas.pendientesLectura} 
            subtexto="Requieren atención" 
            icon={<Bell size={28} className="text-[#F59E0B]" />}
            iconoBgColor="#FFF8E1"
          />
          <MetricCard 
            titulo="Canales Activos" 
            valor="3" 
            subtexto="Email, SMS, Sistema" 
            icon={<Monitor size={28} className="text-[#8B5CF6]" />}
            iconoBgColor="#F5F3FF"
          />
        </div>

        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setTabActivo('gestores')}
              className={clsx(
                "px-6 py-4 text-sm font-bold transition-colors relative",
                tabActivo === 'gestores' ? "text-[#1565C0]" : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              Lista de Gestores
              {tabActivo === 'gestores' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1565C0]"></div>}
            </button>
            <button 
              onClick={() => setTabActivo('notificaciones')}
              className={clsx(
                "px-6 py-4 text-sm font-bold transition-colors relative",
                tabActivo === 'notificaciones' ? "text-[#1565C0]" : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              Registro de Notificaciones
              {tabActivo === 'notificaciones' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1565C0]"></div>}
            </button>
          </div>

          <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre, correo o área..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1565C0] bg-white transition-colors"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-100 transition-colors bg-white">
              <Filter size={16} />
              Filtrar
            </button>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {cargando ? (
              <div className="p-20 text-center flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-500">Cargando datos en vivo...</p>
              </div>
            ) : tabActivo === 'gestores' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#6B7280] text-[11px] font-bold uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4">Gestor</th>
                    <th className="px-6 py-4">Rol / Área</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Último Acceso</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGestores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#6B7280]">No se encontraron gestores.</td>
                    </tr>
                  ) : filteredGestores.map((gestor) => (
                    <tr key={gestor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1565C0] font-bold text-sm shadow-sm">
                            {gestor.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#111827]">{gestor.nombre}</p>
                            <p className="text-[11px] text-[#6B7280]">{gestor.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{gestor.rol}</p>
                          <p className="text-[11px] text-[#6B7280]">{gestor.area}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold",
                          gestor.estado === 'Activo' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {gestor.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] text-[#374151]">
                          <p className="font-medium">{gestor.ultimoAcceso?.fecha || 'Nunca'}</p>
                          <p className="text-[#6B7280]">{gestor.ultimoAcceso?.hora || '--:--'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setMenuActivo(menuActivo === gestor.id ? null : gestor.id)}
                          className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        <AnimatePresence>
                          {menuActivo === gestor.id && (
                            <motion.div 
                              initial={{opacity: 0, y: -5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -5}}
                              className="absolute right-6 top-14 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 w-48 py-1"
                            >
                              <button 
                                onClick={() => {
                                  setGestores(gs => gs.map(g => g.id === gestor.id ? {...g, estado: g.estado === 'Activo' ? 'Inactivo' : 'Activo'} : g));
                                  setMenuActivo(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                              >
                                {gestor.estado === 'Activo' ? 'Suspender Acceso' : 'Activar Acceso'}
                              </button>
                              <button 
                                onClick={() => {
                                  setGestores(gs => gs.filter(g => g.id !== gestor.id));
                                  setMenuActivo(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                Eliminar Gestor
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificaciones.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-[#6B7280]">No hay registro de notificaciones.</div>
                ) : notificaciones.map((notif, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="flex gap-4">
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        notif.tipoColor === 'rojo' && "bg-red-50 text-red-500",
                        notif.tipoColor === 'naranja' && "bg-orange-50 text-orange-500",
                        notif.tipoColor === 'azul' && "bg-blue-50 text-blue-500",
                        notif.tipoColor === 'verde' && "bg-green-50 text-green-500"
                      )}>
                        {notif.canal === 'Email' ? <Mail size={20} /> : notif.canal === 'SMS' ? <Monitor size={20} /> : <Bell size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#111827]">{notif.tipo}</span>
                          <span className="text-[10px] text-[#6B7280]">•</span>
                          <span className="text-[10px] text-[#6B7280] font-medium">{notif.fechaHora}</span>
                        </div>
                        <p className="text-sm text-[#374151] mb-1">{notif.mensaje}</p>
                        <p className="text-[11px] text-[#6B7280]">
                          Paciente: <span className="font-bold text-[#111827]">{notif.paciente?.nombre}</span> ({notif.paciente?.id})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Enviado vía</p>
                        <p className="text-xs font-bold text-[#111827]">{notif.canal}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {modalAbierto && (
          <ModalNuevoGestor 
            onClose={() => setModalAbierto(false)} 
            onSuccess={(nuevoGestor) => {
              setGestores(prev => [nuevoGestor, ...prev]);
              setModalAbierto(false);
            }} 
          />
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
