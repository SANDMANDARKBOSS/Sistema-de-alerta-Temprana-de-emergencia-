'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { getPolizas, PolizaApiItem, registrarPoliza } from '../../services/api/client';
import { Plus, X, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PolizasPage() {
  const [polizas, setPolizas] = useState<PolizaApiItem[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal states
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPoliza, setCurrentPoliza] = useState<any>(null);
  
  const [editEstado, setEditEstado] = useState('');
  const [editCobertura, setEditCobertura] = useState('');
  const [editFechaInicio, setEditFechaInicio] = useState('');
  const [editFechaFin, setEditFechaFin] = useState('');
  
  // Form para nueva póliza
  const [newPoliza, setNewPoliza] = useState({
    polizaId: '', estado: 'VIGENTE', cobertura: '', preExistencias: '', fechaInicio: '', fechaFin: ''
  });

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await getPolizas();
        if (activo) setPolizas(data);
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargar();
  }, []);

  const openEditModal = (p: PolizaApiItem) => {
    setCurrentPoliza(p);
    setEditEstado(p.estado);
    setEditCobertura(p.cobertura);
    setEditFechaInicio(p.fechaInicio ? new Date(p.fechaInicio).toISOString().split('T')[0] : '');
    setEditFechaFin(p.fechaFin ? new Date(p.fechaFin).toISOString().split('T')[0] : '');
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setCurrentPoliza(null);
  };

  const saveEdit = async () => {
    if (!currentPoliza) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/polizas/${currentPoliza.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estado: editEstado, 
          cobertura: editCobertura,
          fechaInicio: editFechaInicio,
          fechaFin: editFechaFin
        })
      });
      if (res.ok) {
        closeEditModal();
        const data = await getPolizas();
        setPolizas(data);
      }
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrarPoliza(newPoliza);
      setIsAdding(false);
      setNewPoliza({ polizaId: '', estado: 'VIGENTE', cobertura: '', preExistencias: '', fechaInicio: '', fechaFin: '' });
      const data = await getPolizas();
      setPolizas(data);
    } catch (error) {
      console.error('Error creando póliza:', error);
    }
  };

  const vigentes = polizas.filter((p) => p.estado === 'VIGENTE').length;
  const vencidas = polizas.filter((p) => p.estado === 'VENCIDA').length;
  const suspendidas = polizas.filter((p) => p.estado === 'SUSPENDIDA').length;

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Pólizas y Validaciones</h1>
            <p className="text-[#6B7280] text-sm mt-1">Consulta de pólizas registradas y su vigencia actual.</p>
          </div>
          <div className="flex gap-3">
            <a href="https://www.notion.so/36726cdda1ac8043b7b5d7402d0b725d?v=36726cdda1ac80e28172000c2321a5ee&source=copy_link" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors shadow-sm">
              <Database size={18} className="text-[#1565C0]" />
              Verificar en Notion
            </a>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-[#1565C0] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#0D47A1] transition-colors shadow-sm"
            >
              <Plus size={18} />
              Nueva Póliza
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard titulo="Total Pólizas" valor={String(polizas.length)} subtexto={cargando ? 'Cargando...' : 'Registros activos'} subtextoColor="gris" />
          <MetricCard titulo="Vigentes" valor={String(vigentes)} subtexto="Cobertura disponible" subtextoColor="verde" />
          <MetricCard titulo="Vencidas" valor={String(vencidas)} subtexto="Requieren renovación" subtextoColor="rojo" />
          <MetricCard titulo="Suspendidas" valor={String(suspendidas)} subtexto="Revisión pendiente" subtextoColor="rojo" />
        </div>

        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Póliza</th>
                  <th className="px-6 py-4">Asegurado</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Cobertura</th>
                  <th className="px-6 py-4">Vigencia</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {polizas.length === 0 && !cargando && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#6B7280]">No hay pólizas registradas.</td>
                  </tr>
                )}
                {polizas.map((p) => (
                  <tr key={p.polizaId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#111827]">{p.polizaId}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{p.asegurado?.nombre ?? p.cedulaAsegurado}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{p.estado}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{p.cobertura}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">
                      {p.fechaInicio && p.fechaFin ? `${new Date(p.fechaInicio).toLocaleDateString('es-CO')} - ${new Date(p.fechaFin).toLocaleDateString('es-CO')}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button onClick={() => openEditModal(p)} className="text-[#1565C0] hover:text-[#0D47A1] font-medium">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-xl font-bold text-gray-900">Registrar Póliza</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Número de Póliza</label>
                  <input required type="text" value={newPoliza.polizaId} onChange={e => setNewPoliza({...newPoliza, polizaId: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1565C0] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                  <select value={newPoliza.estado} onChange={e => setNewPoliza({...newPoliza, estado: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1565C0] outline-none">
                    <option value="VIGENTE">VIGENTE</option>
                    <option value="VENCIDA">VENCIDA</option>
                    <option value="SUSPENDIDA">SUSPENDIDA</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Cobertura</label>
                  <input required type="text" placeholder="Ej: Full, Emergencias, etc." value={newPoliza.cobertura} onChange={e => setNewPoliza({...newPoliza, cobertura: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1565C0] outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Fecha Inicio</label>
                    <input type="date" value={newPoliza.fechaInicio} onChange={e => setNewPoliza({...newPoliza, fechaInicio: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1565C0] outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Fecha Fin</label>
                    <input type="date" value={newPoliza.fechaFin} onChange={e => setNewPoliza({...newPoliza, fechaFin: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1565C0] outline-none text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Pre-existencias Declaradas</label>
                  <textarea rows={2} value={newPoliza.preExistencias} onChange={e => setNewPoliza({...newPoliza, preExistencias: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1565C0] outline-none text-sm" placeholder="Ej: Diabetes, Hipertensión..."></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-[#1565C0] text-white py-2.5 rounded-lg font-bold hover:bg-[#0D47A1] shadow-md">Registrar Póliza</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">Editar Póliza: {currentPoliza?.polizaId}</h2>
                <button onClick={closeEditModal} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                  <select 
                    value={editEstado} 
                    onChange={(e) => setEditEstado(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] outline-none"
                  >
                    <option value="VIGENTE">VIGENTE</option>
                    <option value="VENCIDA">VENCIDA</option>
                    <option value="SUSPENDIDA">SUSPENDIDA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cobertura</label>
                  <input 
                    type="text" 
                    value={editCobertura} 
                    onChange={(e) => setEditCobertura(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Inicio</label>
                    <input 
                      type="date" 
                      value={editFechaInicio} 
                      onChange={(e) => setEditFechaInicio(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Fin</label>
                    <input 
                      type="date" 
                      value={editFechaFin} 
                      onChange={(e) => setEditFechaFin(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                <button onClick={closeEditModal} className="px-5 py-2 text-sm font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors">Cancelar</button>
                <button onClick={saveEdit} className="px-5 py-2 text-sm font-bold text-white bg-[#1565C0] hover:bg-[#0D47A1] rounded-xl shadow-md transition-colors">Guardar Cambios</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
