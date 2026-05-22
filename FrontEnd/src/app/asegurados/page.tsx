'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { MetricCard } from '../../components/metric-card/MetricCard';
import { registrarAsegurado } from '../../services/api/client';
import { UserPlus, X, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function AseguradosPage() {
  const [asegurados, setAsegurados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Modal states
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentAsegurado, setCurrentAsegurado] = useState<any>(null);
  
  // Form states
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [newAsegurado, setNewAsegurado] = useState({
    nombre: '', cedula: '', email: '', polizaId: ''
  });

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/asegurados`);
      const result = await res.json();
      setAsegurados(result.data || []);
    } catch (error) {
      console.error('Error cargando asegurados:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const openEditModal = (asegurado: any) => {
    setCurrentAsegurado(asegurado);
    setEditNombre(asegurado.nombre);
    setEditEmail(asegurado.email || '');
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setCurrentAsegurado(null);
  };

  const saveEdit = async () => {
    if (!currentAsegurado) return;
    try {
      const res = await fetch(`${API_URL}/api/asegurados/${currentAsegurado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editNombre, email: editEmail })
      });
      if (res.ok) {
        closeEditModal();
        cargar();
      }
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrarAsegurado({
        nombre: newAsegurado.nombre,
        cedula: newAsegurado.cedula,
        email: newAsegurado.email,
        plan: newAsegurado.polizaId // Usamos el campo plan en la api para mandar el polizaId
      });
      setIsAdding(false);
      setNewAsegurado({ nombre: '', cedula: '', email: '', polizaId: '' });
      cargar();
    } catch (error) {
      console.error('Error creando asegurado:', error);
      alert('Error: ' + error);
    }
  };

  const deleteAsegurado = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este asegurado? Se borrará su póliza y alertas asociadas.')) return;
    try {
      const res = await fetch(`${API_URL}/api/asegurados/${id}`, { method: 'DELETE' });
      if (res.ok) cargar();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 relative">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">Gestión de Asegurados</h1>
            <p className="text-[#6B7280] text-sm mt-1">Administra la información de los pacientes registrados.</p>
          </div>
          <div className="flex gap-3">
            <a href="https://www.notion.so/36726cdda1ac80b480bdd3d5ec9450fa?v=36726cdda1ac809cbe1a000c6011d098&source=copy_link" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors shadow-sm">
              <Database size={18} className="text-[#1565C0]" />
              Verificar en Notion
            </a>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-[#1565C0] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#0D47A1] transition-colors shadow-sm"
            >
              <UserPlus size={18} />
              Nuevo Asegurado
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard titulo="Total Asegurados" valor={String(asegurados.length)} subtexto={cargando ? 'Cargando...' : 'Registrados'} subtextoColor="gris" />
        </div>

        <div className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Cédula</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Póliza ID</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {asegurados.length === 0 && !cargando && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#6B7280]">No hay asegurados registrados.</td>
                  </tr>
                )}
                {asegurados.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#111827]">{a.nombre}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{a.cedula}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{a.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{a.polizaId}</td>
                    <td className="px-6 py-4 text-sm text-right space-x-3">
                      <button onClick={() => openEditModal(a)} className="text-[#1565C0] hover:text-[#0D47A1] font-medium">Editar</button>
                      <button onClick={() => deleteAsegurado(a.id)} className="text-red-600 hover:text-red-800 font-medium">Eliminar</button>
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1565C0] text-white rounded-lg flex items-center justify-center shadow-md">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Nuevo Asegurado</h2>
                    <p className="text-sm text-gray-500 font-medium">Registrar nuevo paciente</p>
                  </div>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <input required type="text" value={newAsegurado.nombre} onChange={e => setNewAsegurado({...newAsegurado, nombre: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cédula</label>
                  <input required type="text" value={newAsegurado.cedula} onChange={e => setNewAsegurado({...newAsegurado, cedula: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                  <input required type="email" value={newAsegurado.email} onChange={e => setNewAsegurado({...newAsegurado, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Póliza Asignada</label>
                  <input type="text" placeholder="Ej: POL-001" value={newAsegurado.polizaId} onChange={e => setNewAsegurado({...newAsegurado, polizaId: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] outline-none" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#1565C0] text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-colors">
                    Registrar Asegurado
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1565C0] text-white rounded-lg flex items-center justify-center shadow-md">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Editar Asegurado</h2>
                    <p className="text-sm text-gray-500 font-medium">Modificar información personal</p>
                  </div>
                </div>
                <button onClick={closeEditModal} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={editNombre} 
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                  <input 
                    type="email" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] transition-all"
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={closeEditModal} className="px-5 py-2 font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={saveEdit} className="px-5 py-2 font-bold text-white bg-[#1565C0] hover:bg-blue-700 rounded-xl transition-colors shadow-md">
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
